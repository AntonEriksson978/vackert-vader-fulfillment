
"use strict"

const functions = require('firebase-functions')
const request = require("request")
const responses = require("./responses")
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
    const dateTime = converters.dateTimeObject(params["date-time"]["date_time"], 
    {
        start: params["date-time"].startDateTime,
        end: params["date-time"].endDateTime
    })
    const day = converters.dateToDay(dateTime.start)
    const api = getApi(city, dateTime)
    const promiseToGetApiData = apiData(api, dateTime)

    //when the promise is fulfilled use the api data to compose a weather forecast and then return it
    const weatherForecast = promiseToGetApiData
        .then((weatherData) => composeWeatherForecast(weatherData, city, day, api))
        .then((forecastResponse) => conv.ask(forecastResponse))

    return weatherForecast
})

function composeWeatherForecast(weatherData, city, day, api) {

    if (api.type === "nextTwoDays") {

        if (api.name === "isNowOrToday") {
            let weatherForecast = responses.nowForecast(city, weatherData)
            return new SimpleResponse({ speech: weatherForecast.speech, text: weatherForecast.text })

        }
        else if (api.name === "isThisAfternoon") {
            
            let weatherForecast = responses.afternoonForecast(city, weatherData)
            return new SimpleResponse({ speech: weatherForecast.speech, text: weatherForecast.text })
        }
        else if (api.name === "isTonight") {
            
            let weatherForecast = responses.eveningForecast(city, weatherData)
            return new SimpleResponse({ speech: weatherForecast.speech, text: weatherForecast.text })
        }
    }

    else if (api.type === "tenDay") {
        
        if (isYrAndSmhiEqual(weatherData.smhi, weatherData.yr)) {
            let weatherForecast = responses.tenDayForecast(weatherData.smhi, city, day)
            return new SimpleResponse({ speech: weatherForecast.speech, text: weatherForecast.text })
        }
        else {
            let weatherForecast = responses.tenDayForecastExpanded(weatherData.smhi, weatherData.yr, city, day)
            return new SimpleResponse({ speech: weatherForecast.speech, text: weatherForecast.text })
        }

    }

}
function isYrAndSmhiEqual(smhi, yr) {
    const weather = smhi.weather === yr.weather
    const wind = smhi.wind === yr.wind
    const maxTemp = smhi.maxTemp === yr.maxTemp
    const minTemp = smhi.minTemp === yr.minTemp
    if (weather && wind && maxTemp && minTemp) {
        console.log("yooyoy")
        return true
    }
    else {
        return false 
    }
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

                    let forecast = getNextTwoDaysForecast(body.forecast, dateTime)
                    let weatherData = {
                        temp: Math.round(forecast.temperature),
                        weather: getWeather(forecast),
                        wind: getWind(forecast),
                        darkTime: getDarkTime(body["sun_data"]["civil_sunset"])
                    }
                    resolve(weatherData)

                }
                else if (api.type === "tenDay") {

                    console.log(body.location)
                    let weatherData = {
                        yr: {
                            weather: getWeather(body.yr),
                            wind: getWind(body.yr),
                            maxTemp: Math.round(body.yr.temperature.max),
                            minTemp: Math.round(body.yr.temperature.min),
                            darkTime: getDarkTime(body["sun_data"]["civil_sunset"])
                        },
                        smhi: {
                            weather: getWeather(body.smhi),
                            wind: getWind(body.smhi),
                            maxTemp: Math.round(body.smhi.temperature.max),
                            minTemp: Math.round(body.smhi.temperature.min),
                            darkTime: getDarkTime(body["sun_data"]["civil_sunset"])
                        }
                    }
                    resolve(weatherData)
                }
            }
        })
    })
}

function getNextTwoDaysForecast(forecast, dateTime) {

    const paramsDate = new Date(dateTime.start)

    for (let i = 0; i < forecast.length; i++) {

        let time = new Date(forecast[i].time)
        if (time.getHours() > paramsDate.getHours() && time.getDate() === paramsDate.getDate()) {
            console.log(forecast[i])
            return forecast[i]
        }

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
console.log(dateTime)
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


    console.log(api)
    return api
}

function getDarkTime (darkTime) {

    let dark = new Date(darkTime)
    console.log(`${dark.getHours()}:${dark.getMinutes()}`)
    return `${dark.getHours()}:${dark.getMinutes()}`
}

function getWeather(forecast) {

    let weather = converters.translateWeather(forecast.symbol).toString().toLowerCase()
    return weather
}

function getWind(forecast) {

    let wind = converters.translateWind(forecast.wind.mps).toString().toLowerCase();
    return wind
}




