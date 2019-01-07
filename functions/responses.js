
"use strict"

const rightNow = (city, weatherData) => (weatherData.smhi.temp === 1 || weatherData.smhi.temp === -1) 
    ? `I ${city} är det just nu ${weatherData.smhi.temp} grad, ${weatherData.smhi.weather} och ${weatherData.smhi.wind}.`
    : `I ${city} är det just nu ${weatherData.smhi.temp} grader, ${weatherData.smhi.weather} och ${weatherData.smhi.wind}.`
const later = (city, originalDateTime, weatherData) => (weatherData.smhi.temp === 1 || weatherData.smhi.temp === -1) 
    ? `I ${originalDateTime} i ${city} blir det ${weatherData.smhi.temp} grad, ${weatherData.smhi.weather} och ${weatherData.smhi.wind}.`
    : `I ${originalDateTime} i ${city} blir det ${weatherData.smhi.temp} grader, ${weatherData.smhi.weather} och ${weatherData.smhi.wind}.`
const laterYR = "YR tror att det blir "
const tenDay = (city, weatherData, day) => (weatherData.smhi.maxTemp === 1 || weatherData.smhi.maxTemp === -1) 
    ? `Det blir ${weatherData.smhi.weather} och ${weatherData.smhi.wind} i ${city} på ${day}. Temperaturer mellan ${weatherData.smhi.minTemp} och ${weatherData.smhi.maxTemp} grad.`
    : `Det blir ${weatherData.smhi.weather} och ${weatherData.smhi.wind} i ${city} på ${day}. Temperaturer mellan ${weatherData.smhi.minTemp} och ${weatherData.smhi.maxTemp} grader.`
const sunrise = (weatherData) => ` Solen går upp klockan ${weatherData.sunrise}.`
const sunset = (weatherData) => ` Solen går ner klockan ${weatherData.sunset}.`
const tempYr = (weatherData) => (weatherData.yr.temp === 1 || weatherData.yr.temp === -1) 
    ? `${weatherData.yr.temp} grad` 
    : `${weatherData.yr.temp} grader`
const weatherYr = (weatherData) => `${weatherData.yr.weather}`
const windYr = (weatherData) => `${weatherData.yr.wind}`
const minMaxTempYr = (weatherData) => `temperaturer mellan ${weatherData.yr.minTemp} och ${weatherData.yr.maxTemp}`
const cityAndDay = (city, day) => ` i ${city} på ${day}`
const restOfTheDay = " Vill du veta hur det blir resten av dagen?"
const evening = " Vill du veta hur det blir ikväll?"



function smhiAndYrDifferances(weatherData) {

    let differances

    const isWeatherDiff = weatherData.smhi.weather !== weatherData.yr.weather
    const isWindDiff = weatherData.smhi.wind !== weatherData.yr.wind
    const isTempDiff = weatherData.smhi.temp ? weatherData.smhi.temp !== weatherData.yr.temp : false
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
    const sunriseDate = new Date(weatherData.sunriseRaw);
    const sunsetDate = new Date(weatherData.sunsetRaw);
    

    if (originalDateTime === "denna morgon") {
        if (sunriseDate.getTime() <= dateTime.getTime()) { //time has passed sunrise
            text = rightNow(city, weatherData) + restOfTheDay
        }
        else {
            text = rightNow(city, weatherData) + sunrise(weatherData) + restOfTheDay
        }
    }
    else if (originalDateTime === "eftermiddag") {

        
        if ((sunsetDate.getTime() <= dateTime.getTime()) || sunsetDate.getHours() >= 16) {// time has passed sunset or sunset is in the evening
            text = rightNow(city, weatherData) + evening
        }
        else {
            text = rightNow(city, weatherData) + sunset(weatherData) + evening
        }
    }
    else if (originalDateTime === "kväll") {
        if (sunsetDate.getTime() <= dateTime.getTime()) { // time has passed sunset or sunset is in the evening
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

function restOfTheDayForecast(city, afternoon, evening) {
    let text = later(city, "eftermiddag", afternoon) + " " + smhiAndYrDifferances(afternoon) + " " + later(city, "kväll", evening) + " " + smhiAndYrDifferances(evening) + sunset(evening)
    return {
        speech: `<speak><par><media begin='2s'><speak>${text}</speak></media><media fadeOutDur='2s'><audio src='${afternoon.sound}' clipEnd='12s'/></media></par></speak>`,
        text: text
    }
}


function nextTwoDaysForecast(city, originalDateTime, weatherData) {
    let text = later(city, originalDateTime, weatherData) + " " + smhiAndYrDifferances(weatherData)
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
    let text = sunrise(weatherData).replace(".", "") + cityAndDay(city, day) 
    return {
        speech: text,
        text: text
    }
} 

function sunsetForecast(city, weatherData, day) {
    let text = sunset(weatherData).replace(".", "")  + cityAndDay(city, day) 
    return {
        speech: text,
        text: text
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