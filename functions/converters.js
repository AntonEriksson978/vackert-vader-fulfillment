
"use strict"

var googleMapsClient = require("@google/maps").createClient({
    key: 'AIzaSyCk6Nm1XjZnk7S332S-Bf3T7VIkj6H5zSo'
})

function dateTimeObject(date, dateTime) {
    //if no there is no date or dateTime given, assume user asks for today
    if (date === undefined && dateTime === undefined && dateTime.end === undefined) {
        return { start: new Date(), end: "" }
    }
    else {
        if (date !== undefined) {
            return { start: new Date(date), end: "" }
        }
        else {
            return dateTime
        }
    }
}
//Return a day string
function dateToDay(dateTime) {

    const weekday = new Array(7)
    weekday[0] = "söndag"
    weekday[1] = "måndag"
    weekday[2] = "tisdag"
    weekday[3] = "onsdag"
    weekday[4] = "torsdag"
    weekday[5] = "fredag"
    weekday[6] = "lördag"

    let date = new Date(dateTime)
    let day = weekday[date.getDay()]
    return day
}

function getOriginalDateTime(dateTime) {
    const { isNow, isThisMorning, isThisAfternoon, isTonight, isToday, isTomorrowMorning, isTomorrowAfternoon, isTomorrowNight, isDayAfterTomorrowMorning, isDayAfterTomorrowAfternoon, isDayAfterTomorrowNight, isOtherDay } = timeOfDay(dateTime)

    switch (true) {
        case isThisMorning:
            return "denna morgon"

        case isThisAfternoon:
            return "eftermiddag"

        case isTonight:
            return "kväll"

        case isToday:
            return "dag"

        case isTomorrowMorning:
            return "morgon"

        case isTomorrowAfternoon:
            return "morgon eftermiddag"

        case isTomorrowNight:
            return "morgon kväll"

        case isDayAfterTomorrowMorning:
            return "övermorgon"

        case isDayAfterTomorrowAfternoon:
            return "övermorgon eftermiddag"

        case isDayAfterTomorrowNight:
            return "övermorgon kväll"
        
        case isOtherDay:
            return "en annan dag"

        default:
            console.error("OriginalDateTime couldn't be translated probably because date was out of range...")
            return null
    }
}

function translateDateTime(dateTime) {
    const { isNow, isThisMorning, isThisAfternoon, isTonight, isToday, isTomorrowMorning, isTomorrowAfternoon, isTomorrowNight, isDayAfterTomorrowMorning, isDayAfterTomorrowAfternoon, isDayAfterTomorrowNight, isOtherDay } = timeOfDay(dateTime)

    switch (true) {

        case isNow:
            return { name: "isNow", type: "nextTwoDays" }

        case isThisMorning:
            return { name: "isThisMorning", type: "nextTwoDays" }

        case isThisAfternoon:
            return { name: "isThisAfternoon", type: "nextTwoDays" }

        case isTonight:
            return { name: "isTonight", type: "nextTwoDays" }

        case isToday:
            return { name: "isToday", type: "nextTwoDays" }

        case isTomorrowMorning:
            return { name: "isTomorrowMorning", type: "nextTwoDays" }

        case isTomorrowAfternoon:
            return { name: "isTomorrowAfternoon", type: "nextTwoDays" }

        case isTomorrowNight:
            return { name: "isTomorrowNight", type: "nextTwoDays" }

        case isDayAfterTomorrowMorning:
            return { name: "isDayAfterTomorrowMorning", type: "nextTwoDays" }

        case isDayAfterTomorrowAfternoon:
            return { name: "isDayAfterTomorrowAfternoon", type: "nextTwoDays" }

        case isDayAfterTomorrowNight:
            return { name: "isDayAfterTomorrowNight", type: "nextTwoDays" }

        case isOtherDay:
            return { name: "isOtherDay", type: "tenDay" }

        default:
            console.error("DateTime couldn't be translated probably because date was out of range...")
            return null
    }
}

function timeOfDay(dateTime) {
    const dT = new Date(dateTime)
    const todaysDate = new Date()
    const morningTime = 4
    const afternoonTime = 11
    const eveningTime = 16
    const tomorrowsDate = new Date()
    tomorrowsDate.setTime(tomorrowsDate.getTime() + (1000 * 3600 * 24))
    const dayAfterTomorrowsDate = new Date() 
    dayAfterTomorrowsDate.setTime(dayAfterTomorrowsDate.getTime() + (1000 * 3600 * 24 * 2)) 
    const nineDaysFromTodaysDate = new Date() 
    nineDaysFromTodaysDate.setTime(nineDaysFromTodaysDate.getTime() + (1000 * 3600 * 24 * 9)) 
    const isMorning = dT.getHours() < afternoonTime
        && dT.getHours() > morningTime 
    const isAfternoon = dT.getHours() >= afternoonTime
        && dT.getHours() < eveningTime 
    const isEvening = dT.getHours() >= eveningTime
        && todaysDate.getHours() <= eveningTime 
    const isToday = dT.toDateString() === todaysDate.toDateString() || dateTime === "" 
    const isNow = dT.getMinutes() <= todaysDate.getMinutes()
        && dT.getMinutes() + 3 > todaysDate.getMinutes()
        && isToday 
    const isThisMorning = isToday && isMorning 
    const isThisAfternoon = isToday && isAfternoon 
    const isTonight = isToday && isEvening 
    const isTomorrow = dT.getFullYear() === tomorrowsDate.getFullYear()
        && dT.getMonth() === tomorrowsDate.getMonth()
        && dT.getDate() === tomorrowsDate.getDate() 
    const isTomorrowMorning = isTomorrow && isMorning 
    const isTomorrowAfternoon = isTomorrow && isAfternoon 
    const isTomorrowNight = isTomorrow && isEvening 
    const isDayAfterTomorrow = dT.getFullYear() === dayAfterTomorrowsDate.getFullYear()
        && dT.getMonth() === dayAfterTomorrowsDate.getMonth()
        && dT.getDate() === dayAfterTomorrowsDate.getDate() 
    const isDayAfterTomorrowMorning = isDayAfterTomorrow && isMorning 
    const isDayAfterTomorrowAfternoon = isDayAfterTomorrow && isAfternoon 
    const isDayAfterTomorrowNight = isDayAfterTomorrow && isEvening 
    const isOtherDay = !isToday && dT.valueOf() <= nineDaysFromTodaysDate.valueOf()
    /* && dT.getFullYear() <= nineDaysFromTodaysDate.getFullYear()
     && dT.getMonth() <= nineDaysFromTodaysDate.getMonth()
     && dT.getDate() <= nineDaysFromTodaysDate.getDate() */

    return { isNow, isThisMorning, isThisAfternoon, isTonight, isToday, isTomorrowMorning, isTomorrowAfternoon, isTomorrowNight, isDayAfterTomorrowMorning, isDayAfterTomorrowAfternoon, isDayAfterTomorrowNight, isOtherDay } 

}

const coordinatesToCity = (latitude, longitude) => {
    const latlng = [latitude, longitude] 
    return new Promise((resolve, reject) => googleMapsClient.reverseGeocode({ latlng },
        (e, response) => {
            if (e) {
                return reject(e) 
            }
            const { results } = response.json 
            const components = results[0].address_components 
            for (const component of components) {
                for (const type of component.types) {
                    if (type === 'locality' || type === 'postal_town') {
                        return resolve(component.long_name) 
                    }
                }
            }
            reject(new Error('Could not parse city name from Google Maps results')) 
        })
    ) 
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
    let sound
    const weatherSounds = {
        thunder: "https://www.talkingtome.se/wp-content/uploads/2018/12/aska.mp3",
        heaveyRain: "https://www.talkingtome.se/wp-content/uploads/2018/12/asregn.mp3",
        fog: "https://www.talkingtome.se/wp-content/uploads/2018/12/dimma.mp3",
        lightRain: "https://www.talkingtome.se/wp-content/uploads/2018/12/lite_regn.mp3",
        rainAndThunder: "https://www.talkingtome.se/wp-content/uploads/2018/12/regnochaska.mp3",
        snow: "https://www.talkingtome.se/wp-content/uploads/2018/12/snow.mp3",
        sun: "https://www.talkingtome.se/wp-content/uploads/2018/12/sun.mp3",
        wind: "https://www.talkingtome.se/wp-content/uploads/2018/12/vind.mp3"
    }

    switch (weatherCode.toString().substr(0, 2)) {
        case "01":
            weather = "Soligt"
            sound = weatherSounds.sun
            break
        case "02":
            weather = "Soligt med moln"
            sound = weatherSounds.sun
            break
        case "03":
            weather = "Soligt med moln"
            sound = weatherSounds.sun
            break
        case "04":
            weather = "Molnigt"
            sound = null
            break
        case "05":
            weather = "Regnskurar"
            sound = weatherSounds.heaveyRain
            break
        case "06":
            weather = "Regnskurar och åska"
            sound = weatherSounds.rainAndThunder
            break
        case "07":
            weather = "Skurar av snöblandat regn"
            sound = weatherSounds.heaveyRain
            break
        case "08":
            weather = "Snö"
            sound = weatherSounds.snow
            break
        case "09":
            weather = "Regn"
            sound = weatherSounds.lightRain
            break
        case "10":
            weather = "Kraftigt regn"
            sound = weatherSounds.heaveyRain
            break
        case "11":
            weather = "Regn och åska"
            sound = weatherSounds.rainAndThunder
            break
        case "12":
            weather = "Snöblandat regn"
            sound = weatherSounds.lightRain
            break
        case "13":
            weather = "Snö"
            sound = weatherSounds.snow
            break
        case "14":
            weather = "Snö och åska"
            sound = weatherSounds.thunder
            break
        case "15":
            weather = "Dimma"
            sound = weatherSounds.fog
            break
        case "16":
            weather = "Soligt"
            sound = weatherSounds.sun
            break
        case "17":
            weather = "Soligt med moln"
            sound = weatherSounds.sun
            break
        case "18":
            weather = "Regnskurar"
            sound = weatherSounds.lightRain
            break
        case "19":
            weather = "Snö"
            sound = weatherSounds.snow
            break
        case "20":
            weather = "Snö och åska"
            sound = weatherSounds.thunder
            break
        case "21":
            weather = "snö och åska"
            sound = weatherSounds.thunder
            break
        case "22":
            weather = "Regn och åska"
            sound = weatherSounds.rainAndThunder
            break
        case "23":
            weather = "Snö och åska"
            sound = weatherSounds.thunder
            break
        case "90":
            weather = "Åska"
            sound = weatherSounds.thunder
            break
        case "91":
            weather = "Blåsigt"
            sound = weatherSounds.wind
            break
    }

    return { weather, sound }
}

module.exports = {
    dateToDay: dateToDay,
    getOriginalDateTime: getOriginalDateTime,
    translateWeather: translateWeather,
    translateWind: translateWind,
    dateTimeObject: dateTimeObject,
    translateDateTime: translateDateTime,
    coordinatesToCity: coordinatesToCity
}