"use strict"

const maps = require("@google/maps")
const client = maps.createClient({ key: "AIzaSyBi8el8pNAtWDRKBHE6e-J2xGpY8sD3-_I" });

/**
 * Gets the city name from results returned by Google Maps reverse geocoding
 * from coordinates.
 * @param {number} latitude
 * @param {number} longitude
 * @return {Promise<string>}
 * */
const coordinatesToCity = (latitude, longitude) => {

    const latlng = [latitude, longitude]

    return new Promise((resolve, reject) =>
        client.reverseGeocode({ latlng }, (err, response) => {

            if (err) {
                reject(err)
            }

            const { results } = response.json
            const components = results[0].address_components

            for (const component of components) {
                for (const type of component.types) {
                    if (type === 'locality') {
                        resolve(component.long_name)
                    }
                }
            }

            //reject(new Error('Could not parse city name from Google Maps results'))
        })
    )
}

/** 
 * 
 * @param {Date} date
 * @returns A day string
 * */
function dateToDay(date) {

    const weekday = new Array(7);
    weekday[0] = "söndag";
    weekday[1] = "måndag";
    weekday[2] = "tisdag";
    weekday[3] = "onsdag";
    weekday[4] = "torsdag";
    weekday[5] = "fredag";
    weekday[6] = "lördag";
    let d = new Date(date)
    let day = weekday[d.getDay()]
    return day
}

//Return a wind description
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

//Return a weather description
function translateWeather(weatherCode) {

    let weather = {
        description: "",
        soundURL: ""
    }
    switch (weatherCode.toString().substr(0, 2)) {
        case "01":
            weather.description = "Soligt"
            weather.soundURL = "https://actions.google.com/sounds/v1/ambiences/summer_forest.ogg"
            break
        case "02":
            weather.description = "Soligt med moln"
            weather.soundURL = "https://actions.google.com/sounds/v1/ambiences/summer_forest.ogg"
            break
        case "03":
            weather.description = "Soligt med moln"
            weather.soundURL = "https://actions.google.com/sounds/v1/ambiences/summer_forest.ogg"
            break
        case "04":
            weather.description = "Molnigt"
            weather.soundURL = "https://actions.google.com/sounds/v1/ambiences/summer_forest.ogg"
            break
        case "05":
            weather.description = "Regnskurar"
            weather.soundURL = "https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg"
            break
        case "06":
            weather.description = "Regnskurar och åska"
            weather.soundURL = "https://actions.google.com/sounds/v1/weather/rain_on_car_heavy.ogg"
            break
        case "07":
            weather.description = "Skurar av snöblandat regn"
            break
        case "08":
            weather.description = "Snö"
            break
        case "09":
            weather.description = "Regn"
            break
        case "10":
            weather.description = "Kraftigt regn"
            break
        case "11":
            weather.description = "Regn och åska"
            weather.soundURL = "https://actions.google.com/sounds/v1/weather/rain_on_car_heavy.ogg"
            break
        case "12":
            weather.description = "Snöblandat regn"
            break
        case "13":
            weather.description = "Snö"
            break
        case "14":
            weather.description = "Snö och åska"
            break
        case "15":
            weather.description = "Dimma"
            break
        case "16":
            weather.description = "Soligt"
            weather.soundURL = "https://actions.google.com/sounds/v1/ambiences/summer_forest.ogg"
            break
        case "17":
            weather.description = "Soligt med moln"
            weather.soundURL = "https://actions.google.com/sounds/v1/ambiences/summer_forest.ogg"
            break
        case "18":
            weather.description = "Regnskurar"
            weather.soundURL = "https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg"
            break
        case "19":
            weather.description = "Snö"
            break
        case "20":
            weather.description = "Snö och åska"
            break
        case "21":
            weather.description = "snö och åska"
            break
        case "22":
            weather.description = "Regn och åska"
            break
        case "23":
            weather.description = "Snö och åska"
            break
        case "90":
            weather.description = "Åska"
            break
        case "91":
            weather.description = "Blåsigt"
            break
    }

    return weather
}


module.exports = {
    dateToDay: dateToDay,
    translateWeather: translateWeather,
    translateWind: translateWind,
    coordinatesToCity: coordinatesToCity
}