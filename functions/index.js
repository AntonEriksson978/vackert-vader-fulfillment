"use strict"

const functions = require('firebase-functions')
const request = require("request")
const converters = require("./converters")
const { dialogflow, SimpleResponse, Permission } = require('actions-on-google')
const app = dialogflow()

app.intent("Default Welcome Intent", (conv) => {
    if (conv.user.last.seen) {
        conv.ask(`Välkommen tillbaka till Vackert Väder. Vad kan jag hjälpa dig med idag?`)
    }
    else {
        conv.ask("Hej och välkommen till Vackert Väder! Här använder vi väderinfo från både SMHI och YR för att kunna ge dig en så exakt prognos som möjligt. Vill du veta hur vädret är där du är nu?")
    }
})

function requestLocationPermission(conv) {
    // If the request comes from a phone, we can't use coarse location.
    conv.data.requestedPermission =
        conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')
            ? 'DEVICE_PRECISE_LOCATION'
            : 'DEVICE_COARSE_LOCATION'

    if (!conv.user.storage.location) {
        let permissionAsk = conv.ask(new Permission({
            context: 'För att hämta väderprognosen',
            permissions: conv.data.requestedPermission
        }))
        console.log(permissionAsk)
        return permissionAsk
    }
    else {
        return "Kiruna"
    }
}

/*app.intent("handleLocationPermission", (conv) => {

    if (!permissionGranted) {
        throw new Error('Permission not granted');
    }
    if (requestedPermission === 'DEVICE_COARSE_LOCATION') {
        // If we requested coarse location, it means that we're on a speaker device.
        conv.user.storage.location = conv.device.location.city;
        conv.ask("is this the correct location? " + conv.user.storage.location)
    }
    if (requestedPermission === 'DEVICE_PRECISE_LOCATION') {
        // If we requested precise location, it means that we're on a phone.
        // Because we will get only latitude and longitude, we need to
        // reverse geocode to get the city.
        const { coordinates } = conv.device.location;
        let promiseToGetCity = converters.coordinatesToCity(coordinates.latitude, coordinates.longitude)

        promiseToGetCity.then((city) => {
            conv.user.storage.location = city
            return city
        }).catch((reason) => { conv.ask("smthing went wrong " + reason)})
    }
    return conv.user.storage.location
})*/

app.intent("weather", (conv, params) => {
    //Constants which are going to be used in the composing of the weatherforecast
    let city
    try {
        if (params.city) {
            city = params.city
        }
        else {
           // requestLocationPermission(conv)
        }
        
    } catch (error) {
        console.log("weather err: " + error)
    }
    const date = params["date-time"].toString().substr(0, 10)
    const day = converters.dateToDay(date)
    const API = Api(city, date)
    let promiseToGetApiData = ApiData(API)
    //when the promise is fulfilled use the api data to compose a weather forecast and then return it
    let weatherForecast = promiseToGetApiData.then((data) => composeWeatherForecast(data, conv, city, day, API))
    
    return weatherForecast
})

function composeWeatherForecast(data, conv, city, day, API) {
    let simpleResponse
    //Compose the weather forecast for a specific day
    if (API.name === "ten_day") {
        let tenDaySSML = `<speak><par><media begin='2s'><speak>Det blir ${data.weather} och ${data.wind} i ${city} på ${day}, enligt SMHI. Temperatur mellan ${data.minTemp} och ${data.maxTemp} grader.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`

        let tenDayText = `Det blir ${data.weather} och ${data.wind} i ${city} på ${day}, enligt SMHI. Temperatur mellan ${data.minTemp} och ${data.maxTemp} grader.`

        simpleResponse = new SimpleResponse({ speech: tenDaySSML, text: tenDayText })
        conv.ask(simpleResponse)
    }
    //Compose the weather forecast for the next two days...
    else if (API.name === "next_two_days") {
        let nTDSSML = `<speak><par><media begin='2s'><speak>I ${city} är det just nu ${data.temp} grader, ${data.weather} och ${data.wind}<break strength='weak'/>, enligt SMHI.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`

        let nTDText = `I ${city} är det just nu ${data.temp} grader, ${data.weather} och ${data.wind}, enligt tvådagars rapporten från SMHI.`

        simpleResponse = new SimpleResponse({ speech: nTDSSML, text: nTDText })
        conv.ask(simpleResponse)
    }
    //Compose the weather forecast for right now
    else if (API.name === "now") {
        let nowSSML = `<speak><par><media begin='2s'><speak>I ${city} är det just nu ${data.temp} grader, ${data.weather} och ${data.wind}<break strength='weak'/>, enligt SMHI.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`

        let nowText = `I ${city} är det just nu ${data.temp} grader, ${data.weather} och ${data.wind}, enligt SMHI.`

        simpleResponse = new SimpleResponse({ speech: nowSSML, text: nowText })
        conv.ask(simpleResponse)
    }
    return simpleResponse
}

//Send this project to firebase-functions
module.exports.vackertVader = functions.https.onRequest(app)

//Makes a promise to get the data from the API
function ApiData(Api) {
    //Create the weather object
    var weatherData = {
        source: null,
        temp: null,
        weather: null,
        wind: null,
        maxTemp: null,
        minTemp: null
    }

    //Make a GET request to the API and put it into the weather object 
    return new Promise((resolve, reject) => {
        request({ url: Api.url, json: true, encoding: null }, (error, resp, body) => {

            if (!error) {
                try {
                    if (Api.name === "now") {
                        weatherData = {
                            source: body.source,
                            weather: getWeather(body.forecast[0], Api.name),
                            wind: getWind(body.forecast[0], Api.name),
                            temp: body.forecast[0].temperature
                        }
                    }
                    else if (Api.name === "ten_day") {
                        weatherData = {
                            weather: getWeather(body, Api.name),
                            wind: getWind(body, Api.name),
                            maxTemp: body.smhi.temperature.max,
                            minTemp: body.smhi.temperature.min
                        }
                    }
                    else if (Api.name === "next_two_days") {
                        weatherData = {
                            source: body.source,
                            weather: getWeather(body.forecast[0], Api.name),
                            wind: getWind(body.forecast[0], Api.name),
                            temp: body.forecast[0].temperature
                        }
                    }

                    resolve(weatherData)
                } catch (err) {
                    console.log ("Promise Try: " + err)
                }
                
                
            }
            else {
                weatherData = null
                console.log("promise: " + error)
                reject(error)
            }
        })
    })
}

//Format the API URL
function Api(city, date) {

    const host = "http://apier.vackertvader.se"
    const path = {
        nextTwoDays: ":2052/talk/next_two_days?location=",
        tenDay: ":2052/talk/ten_day?location=",
        tenDayDate: "&date="
    }

    let isTenDay = date !== "" && city !== ""
    let isNextTwoDays = date === "" && city !== ""
    let isNow = isNextTwoDays

    if (isTenDay) {

        let Api = {
            url: encodeURI(host + path.tenDay + city + path.tenDayDate + date),
            name: "ten_day"
        }
        return Api
    }
    else if (isNow) {

        let Api = {
            url: encodeURI(host + path.nextTwoDays + city),
            name: "now"
        }
        return Api
    }
    else if (isNextTwoDays) {

        let Api = {
            url: encodeURI(host + path.nextTwoDays + city),
            name: "next_two_days"
        }
        return Api
    }
    else {

        console.log("No conversation parameters found")
        return null
    }
}

function getWeather(body, apiName) {


    if (apiName === "ten_day") {
        let weather = converters.translateWeather(body.smhi.symbol).description.toString().toLowerCase()
        return weather
    }
    else if (apiName === "next_two_days") {
        let weather = converters.translateWeather(body.symbol).description.toString().toLowerCase()
        return weather
    }
    else if (apiName === "now") {
        let weather = converters.translateWeather(body.symbol).description.toString().toLowerCase()
        return weather
    }
    else {
        throw new Error("Could not get the weather description")
    }
}
function getWind(body, apiName) {

    if (apiName === "ten_day") {
        let wind = converters.translateWind(body.smhi.wind.mps).toString().toLowerCase()
        return wind
    }
    else if (apiName === "next_two_days") {
        let wind = converters.translateWind(body.wind.mps).toString().toLowerCase()
        return wind
    }
    else if (apiName === "now") {
        let wind = converters.translateWind(body.wind.mps).toString().toLowerCase()
        return wind
    }
    else {
        throw new Error("Could not get the wind description")
    }
}




