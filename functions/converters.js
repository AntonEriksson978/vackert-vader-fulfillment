
"use strict"

function dateTimeObject(date, dateTime) {
    //if no there is no date or dateTime given, assume user asks for today
    console.log(date)
    console.log(dateTime)
    if (date === undefined && dateTime.start === undefined && dateTime.end === undefined) {
        return { start: new Date(), end: "" }
    }
    else {
        if (date !== undefined) {
            return { start: date, end: "" }
        }
        else {
            return dateTime
        }
    }
}

function translateDateTime(dateTime) {

    const dT = new Date(dateTime.start)
    const todaysDate = new Date()
    const morningTime = 5
    const afternoonTime = 12
    const eveningTime = 17
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
        && todaysDate.getHours() <= afternoonTime
        && todaysDate.getHours() > eveningTime
    const isEvening = dT.getHours() >= eveningTime
        && todaysDate.getHours() <= eveningTime

    const isNowOrToday = dT.toDateString() === todaysDate.toDateString() || dateTime.start === ""
    const isThisMorning = isNowOrToday && isMorning
    const isThisAfternoon = isNowOrToday && isAfternoon
    const isTonight = isNowOrToday && isEvening
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
    const isOtherDay = !isNowOrToday
        && dT.getFullYear() <= nineDaysFromTodaysDate.getFullYear()
        && dT.getMonth() <= nineDaysFromTodaysDate.getMonth()
        && dT.getDate() <= nineDaysFromTodaysDate.getDate()

    switch (true) {

        case isThisAfternoon:
            return { name: "isThisAfternoon", type: "nextTwoDays" }

        case isTonight:
            return { name: "isTonight", type: "nextTwoDays" }

        case isNowOrToday:
            return { name: "isNowOrToday", type: "nextTwoDays" }

        case isOtherDay:
            return { name: "isOtherDay", type: "tenDay" }


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
    translateWind: translateWind,
    dateTimeObject: dateTimeObject,
    translateDateTime: translateDateTime
}