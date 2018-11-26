"use strict"

const functions = require('firebase-functions')
const request = require("request")
const converters = require("./converters")
const { dialogflow, SimpleResponse } = require('actions-on-google')
const app = dialogflow()

app.intent("Default Welcome Intent", (conv) => {
    if (conv.user.last.seen) {
        conv.ask(`Välkommen tillbaka till Vackert Väder. Vad kan jag hjälpa dig med idag?`);
    }
    else {
        conv.ask("Hej och välkommen till Vackert Väder! Här använder vi väderinfo från både SMHI och YR för att kunna ge dig en så exakt prognos som möjligt. Vill du veta hur vädret är där du är nu?")
    }
})

app.intent("weather", (conv, params) => {
    //Constants which are going to be used in the simpleResonses
    const city = params.city
    const date = params["date-time"].toString().substr(0, 10)
    const day = converters.dateToDay(date)
    const API = Api(city, date)

    return ApiData(API).then((data) => {
        //Compose the weather forecast for today
        let simpleResponse
        if (API.name === "now") {
            let nowSSML = `<speak><par><media begin='2s'><speak>I ${city} är det just nu ${data.temp} grader, ${data.weather} och ${data.wind}<break strength='weak'/>, enligt SMHI.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`

            let nowText = `I ${city} är det just nu ${data.temp} grader, ${data.weather} och ${data.wind}, enligt SMHI.`

            simpleResponse = new SimpleResponse({ speech: nowSSML, text: nowText })
            conv.ask(simpleResponse)
        }
        //Compose the weather forecase for a specific day
        else if (API.name === "ten_day") {
            let tenDaySSML = `<speak><par><media begin='2s'><speak>Det blir ${data.weather} och ${data.wind} i ${city} på ${day}, enligt SMHI. Temperatur mellan ${data.minTemp} och ${data.maxTemp} grader.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`

            let tenDayText = `Det blir ${data.weather} och ${data.wind} i ${city} på ${day}, enligt SMHI. Temperatur mellan ${data.minTemp} och ${data.maxTemp} grader.`

            simpleResponse = new SimpleResponse({ speech: tenDaySSML, text: tenDayText })
            conv.ask(simpleResponse)
        }
        return simpleResponse
    })
})

//Send this project to firebase-functions
module.exports.vackertVader = functions.https.onRequest(app)

function ApiData(Api) {
    //Create the weather object
    var weatherData = {
        temp: null,
        weather: null,
        wind: null,
        maxTemp: null,
        minTemp: null
    }

    return new Promise((resolve, reject) => {
        //Make a GET request to the API and sort it into the weather object 
        request({ url: Api.url, json: true, encoding: null }, (error, resp, body) => {
            if (!error) {
                if (Api.name === "now") {
                    weatherData = {
                        temp: body.temperature,
                        weather: getWeather(body),
                        wind: getWind(body)
                    }
                }
                else if (Api.name === "ten_day") {
                    weatherData = {
                        weather: getWeather(body),
                        wind: getWind(body),
                        maxTemp: body.smhi.temperature.max,
                        minTemp: body.smhi.temperature.min
                    }
                }
                resolve(weatherData)
            }
            else {
                weatherData = null
                console.log(error)
                reject(error)
            }
        })
    })
}


//Format the API URL
function Api(city, date) {

    const host = "http://apier.vackertvader.se"
    const path = {
        now: ":2052/talk/now?location=",
        tenDay: ":2052/talk/ten_day?location=",
        tenDayDate: "&date="
    }
    if (date !== "" && city !== "") {

        let Api = {
            url: encodeURI(host + path.tenDay + city + path.tenDayDate + date),
            name: "ten_day"
        }
        return Api
    }
    else if (date === "" && city !== "") {

        let Api = {
            url: encodeURI(host + path.now + city),
            name: "now"
        }
        return Api
    }
    else {
        console.log("No conversation parameters found")
        return null
    }
}

function getWeather(body) {

    if (body.smhi !== undefined) {
        let weather = converters.translateWeather(body.smhi.symbol).toString().toLowerCase()
        return weather
    }
    else {
        let weather = converters.translateWeather(body["weather_symbol"]).toString().toLowerCase()
        return weather
    }
}

function getWind(body) {

    if (body.smhi !== undefined) {
        let wind = converters.translateWind(body.smhi.wind.mps).toString().toLowerCase();
        return wind
    }
    else {
        let wind = converters.translateWind(body["wind_speed"]).toString().toLowerCase()
        return wind
    }
}




