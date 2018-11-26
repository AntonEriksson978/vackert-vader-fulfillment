"use strict"

//Return a day string
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

module.exports = {
    dateToDay: dateToDay,
    translateWeather: translateWeather,
    translateWind: translateWind
}