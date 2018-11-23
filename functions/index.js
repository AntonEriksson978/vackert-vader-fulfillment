const functions = require('firebase-functions')
const request = require("request")
const { dialogflow, SimpleResponse } = require('actions-on-google')
const app = dialogflow()

app.intent("weather", (conv, params) => {
    const city = params.city
    const date = params["date-time"].toString().substr(0, 10)
    const day = dateToDay(date)
    const API = Api(city, date)

    return ApiData(API).then((data) => {
        
        let simpleResponse
        if (API.name === "now") {
            let nowSSML = `<speak><par><media begin='2s'><speak>I ${city} är det just nu ${data.temp} grader, ${data.weather} och ${data.wind}<break strength='weak'/>, enligt SMHI.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`

            let nowText = `I ${city} är det just nu ${data.temp} grader, ${data.weather} och ${data.wind}, enligt SMHI.`

            simpleResponse = new SimpleResponse({ speech: nowSSML, text: nowText })
            conv.ask(simpleResponse)
        }

        else if (API.name === "ten_day") {
            let tenDaySSML = `<speak><par><media begin='2s'><speak>Det blir ${data.weather} och ${data.wind} i ${city} på ${day}, enligt SMHI. Temperatur mellan ${data.minTemp} och ${data.maxTemp} grader.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`

            let tenDayText = `Det blir ${data.weather} och ${data.wind} i ${city} på ${day}, enligt SMHI. Temperatur mellan ${data.minTemp} och ${data.maxTemp} grader.`

            simpleResponse = new SimpleResponse({ speech: tenDaySSML, text: tenDayText })
            conv.ask(simpleResponse)
        }
        return simpleResponse
    })
})

exports.vackertVader = functions.https.onRequest(app)

function dateToDay(date) {

    const weekday = new Array(7);
    weekday[0] = "Söndag";
    weekday[1] = "Måndag";
    weekday[2] = "Tisdag";
    weekday[3] = "Onsdag";
    weekday[4] = "Torsdag";
    weekday[5] = "Fredag";
    weekday[6] = "Lördag";
    let d = new Date(date)
    let day = weekday[d.getDay()]
    return day
}

function ApiData(Api) {

    var weatherData = {
        temp: null,
        weather: null,
        wind: null,
        maxTemp: null,
        minTemp: null
    }
    return new Promise((resolve, reject) => {
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
        return weather = translateWeather(body.smhi.symbol).toString().toLowerCase();
    }
    else {
        return weather = translateWeather(body["weather_symbol"]).toString().toLowerCase();
    }
}

function getWind(body) {

    if (body.smhi !== undefined) {
        return wind = translateWind(body.smhi.wind.mps).toString().toLowerCase();
    }
    else {
        return wind = translateWind(body["wind_speed"]).toString().toLowerCase()
    }
}

function translateWind(mps) {

    let wind
    let windSpeed = parseFloat(mps)

    switch (true) {
        case windSpeed < 0.2:
            wind = "Vindstilla"
            break

        case windSpeed < 1.5:
            wind = "Nästan vindstilla"
            break

        case (windSpeed < 3.3):
            wind = "Lätt vind"
            break

        case windSpeed < 7.9:
            wind = "Lite blåsigt"
            break

        case (windSpeed < 13.8):
            wind = "Ganska blåsigt"
            break

        case (windSpeed < 20.7):
            wind = "Riktigt blåsigt"
            break

        case (windSpeed < 24.4):
            wind = "Stormigt"
            break

        case (windSpeed < 28.4):
            wind = "Storm"
            break

        case (windSpeed < 32.6):
            wind = "Svår storm"
            break

        case (windSpeed > 32.6):
            wind = "Orkan"
            break
    }

    return wind
}

function translateWeather(weatherCode) {

    let weather
    switch (weatherCode.toString().substr(0, 2)) {
        case "01":
            weather = "Soligt"
            break
        case "02":
            weather = "Soligt med moln"
            break
        case "03":
            weather = "Soligt med moln"
            break
        case "04":
            weather = "Molnigt"
            break
        case "05":
            weather = "Regnskurar"
            break
        case "06":
            weather = "Regnskurar och åska"
            break
        case "07":
            weather = "Skurar av snöblandat regn"
            break
        case "08":
            weather = "Snö"
            break
        case "09":
            weather = "Regn"
            break
        case "10":
            weather = "Kraftigt regn"
            break
        case "11":
            weather = "Regn och åska"
            break
        case "12":
            weather = "Snöblandat regn"
            break
        case "13":
            weather = "Snö"
            break
        case "14":
            weather = "Snö och åska"
            break
        case "15":
            weather = "Dimma"
            break
        case "16":
            weather = "Soligt"
            break
        case "17":
            weather = "Soligt med moln"
            break
        case "18":
            weather = "Regnskurar"
            break
        case "19":
            weather = "Snö"
            break
        case "20":
            weather = "Snö och åska"
            break
        case "21":
            weather = "snö och åska"
            break
        case "22":
            weather = "Regn och åska"
            break
        case "23":
            weather = "Snö och åska"
            break
        case "90":
            weather = "Åska"
            break
        case "91":
            weather = "Blåsigt"
            break
    }

    return weather
}


