
"use strict"

const rightNow = (city, weatherData) => `I ${city} är det just nu ${weatherData.smhi.temp} grader, ${weatherData.smhi.weather} och ${weatherData.smhi.wind}.`
const later = (originalDateTime, weatherData) =>  `I ${originalDateTime} blir det ${weatherData.smhi.temp} grader, ${weatherData.smhi.weather} och ${weatherData.smhi.wind}.`
const laterYR = "YR tror att det blir "
const tenDay = (city, weatherData, day) => `Det blir ${weatherData.smhi.weather} och ${weatherData.smhi.wind} i ${city} på ${day}. Temperaturer mellan ${weatherData.smhi.minTemp} och ${weatherData.smhi.maxTemp} grader.`
const sunrise = (weatherData) => ` Solen går upp klockan ${weatherData.sunrise}.`
const sunset = (weatherData) => ` Solen går ner klockan ${weatherData.sunset}.`
const tempYr = (weatherData) => `${weatherData.yr.temp} grader`
const weatherYr = (weatherData) => `${weatherData.yr.weather}`
const windYr = (weatherData) => `${weatherData.yr.wind}`
const minMaxTempYr = (weatherData) => `temperaturer mellan ${weatherData.yr.minTemp} och ${weatherData.yr.maxTemp}`
//const minMaxTemp = `temperaturer mellan ${afternoon.minTemp} och ${afternoon.maxTemp} grader`
const restOfTheDay = " Vill du veta hur det blir resten av dagen?"
const evening = " Vill du veta hur det blir ikväll?"



function smhiAndYrDifferances(weatherData) {

    let differances

    const isWeatherDiff = weatherData.smhi.weather !== weatherData.yr.weather
    const isWindDiff = weatherData.smhi.wind !== weatherData.yr.wind
    const isTempDiff = weatherData.smhi.temp ? weatherData.smhi.temp !== weatherData.yr.weather : false
    const isMinMaxTempDiff = weatherData.smhi.minTemp !== weatherData.yr.minTemp || weatherData.smhi.maxTemp !== weatherData.yr.maxTemp

    const isWeatherWindDiff = isWeatherDiff && isWindDiff
    const isWeatherTempDiff = isWeatherDiff && isTempDiff
    const isWindTempDiff = isWindDiff && isTempDiff

    const isWeatherMinMaxTempDiff = isWeatherDiff && isMinMaxTempDiff
    const isWindMinMaxTempDiff = isWindDiff && isMinMaxTempDiff

    const isAllDiff = isWeatherDiff && isWindDiff && isTempDiff
    const isAllMinMaxDiff = isWeatherDiff && isWindDiff && isMinMaxTempDiff

    switch (true) {
        case isAllDiff:
            differances = laterYR + weatherYr(weatherData) + ", " + windYr(weatherData) + " och " + tempYr(weatherData) + "."
            break
        case isAllMinMaxDiff:
            differances = laterYR + weatherYr(weatherData) + ", " + windYr(weatherData) + " och " + minMaxTempYr(weatherData) + "."
            break
        case isWeatherWindDiff:
            differances = laterYR + weatherYr(weatherData) + " och " + windYr(weatherData) + "."
            break
        case isWeatherTempDiff:
            differances = laterYR + weatherYr(weatherData) + " och " + tempYr(weatherData) + "."
            break
        case isWeatherMinMaxTempDiff:
            differances = laterYR + weatherYr(weatherData) + " och " + minMaxTempYr(weatherData) + "."
            break
        case isWindTempDiff:
            differances = laterYR + windYr(weatherData) + " och " + tempYr(weatherData) + "."
            break
        case isWindMinMaxTempDiff:
            differances = laterYR + windYr(weatherData) + " och " + minMaxTempYr(weatherData) + "."
            break
        case isWeatherDiff:
            differances = laterYR + weatherYr(weatherData) + "."
            break
        case isWindDiff:
            differances = laterYR + windYr(weatherData) + "."
            break
        case isTempDiff:
            differances = laterYR + tempYr(weatherData) + "."
            break
        case isMinMaxTempDiff:
            differances = laterYR + minMaxTempYr(weatherData) + "."
            break
        default:
            console.log("Smhi and Yr forecasts were identical")
            differances = ""
    }

    return differances
}

function rightNowForecast(city, originalDateTime, dateTime, weatherData) {
    let text

    if (originalDateTime === "denna morgon") {
        if (weatherData.sunriseRaw <= dateTime.start) { //time has passed sunrise
            text = rightNow(city, weatherData) + restOfTheDay
        }
        else {
            text = rightNow(city, weatherData) + sunrise(weatherData) + restOfTheDay
        }
    }
    else if (originalDateTime === "eftermiddag") {

        if (weatherData.sunsetRaw <= dateTime.start || weatherData.sunsetRaw.substr(11, 13) > 16) {// time has passed sunset or sunset is in the evening
            text = rightNow(city, weatherData) + evening
        }
        else {
            text = rightNow(city, weatherData) + sunset(weatherData) + evening
        }
    }
    else if (originalDateTime === "kväll") {
        if (weatherData.sunsetRaw <= dateTime.start) { // time has passed sunset or sunset is in the evening
            text = rightNow(city, weatherData)
        }
        else {
            text = rightNow(city, weatherData) + sunset(weatherData)
        }
    }
    else {
        text = rightNow(city, weatherData)
    }

    return {
        speech: `<speak><par><media begin='2s'><speak>${text}</speak></media><media fadeOutDur='2s'><audio src='${weatherData.sound}' clipEnd='12s'/></media></par></speak>`,
        text: text
    }
}

function restOfTheDayForecast(city, evening, afternoon) {
    let text = later("eftermiddag", afternoon) + smhiAndYrDifferances(afternoon) + later("kväll", evening) + smhiAndYrDifferances(evening) + sunset(weatherData)
    return {
        speech: `<speak><par><media begin='2s'><speak>${text}</speak></media><media fadeOutDur='2s'><audio src='${weatherData.sound}' clipEnd='12s'/></media></par></speak>`,
        text: text
    }
}


function nextTwoDaysForecast(city, originalDateTime, weatherData) {
    let text = later(originalDateTime, weatherData) + " " + smhiAndYrDifferances(weatherData)
    return {
        speech: `<speak><par><media begin='2s'><speak>${text}</speak></media><media fadeOutDur='2s'><audio src='${weatherData.sound}' clipEnd='12s'/></media></par></speak>`,
        text: text
    }
}


function tenDayForecast(city, weatherData, day) {
    let text = tenDay(city, weatherData, day) + " " + smhiAndYrDifferances(weatherData)
    return {
        speech: `<speak><par><media begin='2s'><speak>${text}</speak></media><media fadeOutDur='2s'><audio src='${weatherData.sound}' clipEnd='12s'/></media></par></speak>`,
        text: text
    }
}

function sunriseForecast(city, weatherData, day) {
    return {
        speech: `Solen går upp klockan ${weatherData.sunrise} i ${city} på ${day}.`

    }
}

function sunsetForecast(city, weatherData, day) {
    return {
        speech: `Solen går ner klockan ${weatherData.sunset} i ${city} på ${day}.`

    }
}

module.exports = {
    rightNowForecast: rightNowForecast,
    restOfTheDayForecast: restOfTheDayForecast,
    nextTwoDaysForecast: nextTwoDaysForecast,
    tenDayForecast: tenDayForecast,
    sunriseForecast: sunriseForecast,
    sunsetForecast: sunsetForecast
}