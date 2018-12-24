
"use strict"

const functions = require('firebase-functions')
const request = require("request")
const responses = require("./responses")
const converters = require("./converters")
const { dialogflow, SimpleResponse, Permission } = require('actions-on-google')
const app = dialogflow({
    debug: false,
})

app.intent("Default Welcome Intent", (conv, params) => {
    if (conv.user.last.seen) {
        conv.ask("Välkommen tillbaka till Vackert Väder, fråga mig om vädret!")
    }
    else {
        conv.ask(new Permission({
            context: "Hej och välkommen till Vackert Väder! Här använder vi väderinfo från både SMHI och YR för att kunna ge dig en så exakt prognos som möjligt. För att veta hur vädret är där du är just nu",
            permissions: "DEVICE_PRECISE_LOCATION"
        }))
    }
})

app.intent('actions_intent_PERMISSION', async (conv, granted) => {
    if (granted) {
        const { longitude, latitude } = conv.device.location.coordinates
        const city = await converters.coordinatesToCity(latitude, longitude)
        conv.user.storage.city = city
        getWeatherForecast(conv, conv.parameters)
    } else {
        conv.ask(`Okej, ingen fara.`)
    }
})

app.intent("sunset_or_sunrise", (conv, params) => {

    const sun = params.sun
    const city = params.city || conv.user.storage.city
    const dateTime = getDateTime(params)
    const day = converters.dateToDay(dateTime.start)

    const api = getApi(city, dateTime)
    const promiseToGetApiData = apiData(api, dateTime)

    //when the promise is fulfilled use the api data to compose a weather forecast and then return it
    const sunForecast = promiseToGetApiData
        .then((weatherData) => composeSunForecast(weatherData, city, sun, day))
        .then((forecastResponse) => conv.ask(forecastResponse))

    return sunForecast
})

function composeSunForecast(weatherData, city, sun, day) {

    let sunForecast

    if (sun === "Solnedgång") {
        sunForecast = responses.sunsetForecast(city, weatherData, day)
    }
    else {
        sunForecast = responses.sunriseForecast(city, weatherData, day)
    }

    return new SimpleResponse({ speech: sunForecast.speech, text: sunForecast.text })
}

app.intent("weather - yes", (conv, params) => getFollowUpForecast(conv, conv.contexts.get("weather-followup").parameters))

function getFollowUpForecast(conv, params) {

    const city = params.city || conv.user.storage.city
    const dateTime = getDateTime(params)
    const originalDateTime = converters.getOriginalDateTime(dateTime)
    if (originalDateTime === "eftermiddag") {

        const api = getApi(city, dateTime)
        const promiseToGetApiData = apiData(api, dateTime)

        //when the promise is fulfilled use the api data to compose a weather forecast and then return it
        const weatherForecast = promiseToGetApiData
            .then((evening) => composeFollowUpForecast(city, evening))
            .then((forecastResponse) => conv.ask(forecastResponse))

        return weatherForecast
    }
    else {
        let dateTimeAfternoon = dateTime
        let dateTimeEvening = dateTime
        dateTimeAfternoon.start.setHours(12)
        dateTimeEvening.start.setHours(17)


        const api = getApi(city, dateTimeAfternoon)
        const promiseToGetApiData = apiFollowUpData(api, dateTimeAfternoon, dateTimeEvening)

        //when the promise is fulfilled use the api data to compose a weather forecast and then return it
        const weatherForecast = promiseToGetApiData
            .then((weatherData) => composeFollowUpForecast(city, weatherData.evening, weatherData.afternoon))
            .then((forecastResponse) => conv.ask(forecastResponse))

        return weatherForecast

    }
    
}

function composeFollowUpForecast(city, evening, afternoon) {

    let weatherForecast

    if (afternoon) {
        weatherForecast = responses.restOfTheDayForecast(city, evening, afternoon)
    }

    else {
        weatherForecast = responses.nextTwoDaysForecast(city, "kväll", evening)

    }


    return new SimpleResponse({ speech: weatherForecast.speech, text: weatherForecast.text })

}

app.intent("weather", (conv, params) => getWeatherForecast(conv, params))

function getWeatherForecast(conv, params) {
    //Constants which are going to be used in the response

    const city = params.city || conv.user.storage.city
    const dateTime = getDateTime(params)
    const originalDateTime = converters.getOriginalDateTime(dateTime)
    const day = converters.dateToDay(dateTime.start)
    const api = getApi(city, dateTime)
    const promiseToGetApiData = apiData(api, dateTime)

    //when the promise is fulfilled use the api data to compose a weather forecast and then return it
    const weatherForecast = promiseToGetApiData
        .then((weatherData) => composeWeatherForecast(weatherData, city, day, api, originalDateTime, dateTime))
        .then((forecastResponse) => conv.ask(forecastResponse))

    return weatherForecast
}

function composeWeatherForecast(weatherData, city, day, api, originalDateTime, dateTime) {

    let weatherForecast

    if (api.type === "nextTwoDays") {
        if (api.name === "isNow") {
            weatherForecast = responses.rightNowForecast(city, originalDateTime, dateTime, weatherData)
        }

        else {
            weatherForecast = responses.nextTwoDaysForecast(city, originalDateTime, weatherData)

        }
    }

    else if (api.type === "tenDay") {
        weatherForecast = responses.tenDayForecast(city, weatherData, day)

    }


    return new SimpleResponse({ speech: weatherForecast.speech, text: weatherForecast.text })

}
//Send this project to firebase-functions
module.exports.vackertVader = functions.https.onRequest(app)

function apiData(api, dateTime) {
    //Create the weather object

    return new Promise((resolve, reject) => {
        //Make a GET request to the API and sort it into the weather object 
        request({ url: api.url, json: true, encoding: null }, (error, resp, body) => {

            if (error) {
                weatherData = null
                console.log(error)
                reject(error)
            }
            else {

                if (api.type === "nextTwoDays") {

                    let nextTwoDaysForecast = getNextTwoDaysForecast(body.forecast, dateTime)
                    let weatherData = {
                        yr: {
                            temp: Math.round(nextTwoDaysForecast.temperature),
                            weather: getWeather(nextTwoDaysForecast),
                            wind: getWind(nextTwoDaysForecast)
                        },
                        smhi: {
                            temp: Math.round(nextTwoDaysForecast.temperature),
                            weather: getWeather(nextTwoDaysForecast),
                            wind: getWind(nextTwoDaysForecast)
                        },
                        sunrise: getSunTime(body["sun_data"]["civil_sunrise"]),
                        sunriseRaw: body["sun_data"]["civil_sunrise"],
                        sunset: getSunTime(body["sun_data"]["civil_sunset"]),
                        sunsetRaw: body["sun_data"]["civil_sunset"],
                        sound: getWeatherSound(nextTwoDaysForecast)
                    }
                    resolve(weatherData)

                }
                else if (api.type === "tenDay") {

                    let weatherData = {
                        yr: {
                            weather: getWeather(body.yr),
                            wind: getWind(body.yr),
                            maxTemp: Math.round(body.yr.temperature.max),
                            minTemp: Math.round(body.yr.temperature.min)
                        },
                        smhi: {
                            weather: getWeather(body.smhi),
                            wind: getWind(body.smhi),
                            maxTemp: Math.round(body.smhi.temperature.max),
                            minTemp: Math.round(body.smhi.temperature.min)

                        },
                        sound: getWeatherSound(body.smhi),
                        sunrise: getSunTime(body["sun_data"]["civil_sunrise"]),
                        sunset: getSunTime(body["sun_data"]["civil_sunset"])
                    }
                    resolve(weatherData)
                }
            }
        })
    })
}

function apiFollowUpData(api, dateTimeAfternoon, dateTimeEvening) {
    //Create the weather object

    return new Promise((resolve, reject) => {
        //Make a GET request to the API and sort it into the weather object 
        request({ url: api.url, json: true, encoding: null }, (error, resp, body) => {

            if (error) {
                weatherData = null
                console.log(error)
                reject(error)
            }
            else {

                let afternoonForecast = getNextTwoDaysForecast(body.forecast, dateTimeAfternoon)
                let eveningForecast = getNextTwoDaysForecast(body.forecast, dateTimeEvening)
                let weatherData = {
                    afternoon: {
                        yr: {
                            temp: Math.round(afternoonForecast.temperature),
                            weather: getWeather(afternoonForecast),
                            wind: getWind(afternoonForecast)
                        },
                        smhi: {
                            temp: Math.round(afternoonForecast.temperature),
                            weather: getWeather(afternoonForecast),
                            wind: getWind(afternoonForecast)
                        },
                        sunrise: getSunTime(body["sun_data"]["civil_sunrise"]),
                        sunriseRaw: body["sun_data"]["civil_sunrise"],
                        sunset: getSunTime(body["sun_data"]["civil_sunset"]),
                        sunsetRaw: body["sun_data"]["civil_sunset"],
                        sound: getWeatherSound(afternoonForecast)
                    },
                    evening: {
                        yr: {
                            temp: Math.round(eveningForecast.temperature),
                            weather: getWeather(eveningForecast),
                            wind: getWind(eveningForecast)
                        },
                        smhi: {
                            temp: Math.round(eveningForecast.temperature),
                            weather: getWeather(eveningForecast),
                            wind: getWind(eveningForecast)
                        },
                        sunrise: getSunTime(body["sun_data"]["civil_sunrise"]),
                        sunriseRaw: body["sun_data"]["civil_sunrise"],
                        sunset: getSunTime(body["sun_data"]["civil_sunset"]),
                        sunsetRaw: body["sun_data"]["civil_sunset"],
                        sound: getWeatherSound(eveningForecast)

                    }
                }
                resolve(weatherData)

            }
        })
    })
}

function getNextTwoDaysForecast(forecast, dateTime) {

    const paramsDate = new Date(dateTime.start)
    if (forecast) {
        for (let i = 0; i < forecast.length; i++) {

            let time = new Date(forecast[i].time)
            if (time.getHours() >= paramsDate.getHours() && time.getDate() === paramsDate.getDate()) {
                return forecast[i]
            }

        }
        return null
    }
    else {
        console.error("next_two_days api didn't respond")
        return null
    }

}
//Format the API URL
function getApi(city, dateTime) {

    const host = "http://apier.vackertvader.se"
    const path = {
        nextTwoDays: ":2052/talk/next_two_days?location=",
        tenDay: ":2052/talk/ten_day?location=",
        tenDayDate: "&date="
    }
    let api = {
        name: converters.translateDateTime(dateTime).name,
        type: converters.translateDateTime(dateTime).type,
        url: ""
    }
    if (api.type === "nextTwoDays") {
        api.url = encodeURI(host + path.nextTwoDays + city)
    }
    else if (api.type === "tenDay") {
        api.url = encodeURI(host + path.tenDay + city + path.tenDayDate + dateTime.start.toString().substr(0, 10))
    }
    return api
}

function getDateTime(params) {

    let dateTime
    if (params["date-time"]) {
        dateTime = converters.dateTimeObject(params["date-time"]["date_time"], {
            start: params["date-time"].startDateTime,
            end: params["date-time"].endDateTime
        })
    }
    else {
        dateTime = { start: new Date(), end: "" }
    }
    return dateTime
}

function getSunTime(sunTime) {

    let sun = new Date(sunTime)
    return `${sun.getHours()}:${sun.getMinutes()}`
}

function getWeather(forecast) {
    if (forecast) {
        let weather = converters.translateWeather(forecast.symbol).weather.toString().toLowerCase()
        return weather
    }
    else {
        console.error("weather could not be acquired")
        return null
    }
}

function getWeatherSound(forecast) {


    if (forecast) {
        let weatherSound = converters.translateWeather(forecast.symbol).sound
        return weatherSound
    }
    else {
        console.error("weather sound could not be acquired")
        return null
    }
}

function getWind(forecast) {

    if (forecast) {
        let wind = converters.translateWind(forecast.wind.mps).toString().toLowerCase()
        return wind
    }
    else {
        console.error("wind could not be acquired")
        return null
    }
}




