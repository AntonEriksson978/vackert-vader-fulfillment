
"use strict"


function nowForecast(city, weatherData) {
    return {
        speech: `<speak><par><media begin='2s'><speak>I ${city} är det ${weatherData.temp} grader, ${weatherData.weather} och ${weatherData.wind}<break strength='weak'/>, enligt SMHI.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`,

        text: `I ${city} är det just nu ${weatherData.temp} grader, ${weatherData.weather} och ${weatherData.wind}.`
    }
}
function restOfTheDayForecast(afternoon, evening) {
    return {
        speech: "",
        text:`I eftermiddag blir det ${afternoon.weather} och ${afternoon.wind}, temperaturer mellan ${afternoon.minTemp} och ${afternoon.maxTemp} grader. I kväll ${evening.weather} och ${evening.wind}. Temperaturer mellan ${evening.minTemp} och ${evening.maxTemp} grader. Det blir mörkt klockan ${evening.darkTime}.`
    }
}

function afternoonForecast(city, weatherData) {
    return {
        speech: "",
        text: `I eftermiddag blir det ${weatherData.weather} och ${weatherData.wind} i ${city}. Temperaturer kring ${weatherData.temp} grader. Det blir mörkt klockan ${weatherData.darkTime}.`
    }
}

function eveningForecast(city, weatherData) {
    return {
        speech: "",
        text: `I kväll blir det ${weatherData.weather} och ${weatherData.wind} i ${city}. Temperaturer kring ${weatherData.temp}. Det blir mörkt klockan ${weatherData.darkTime}.`
    }
}


function tenDayForecast(weatherData, city, day) {
    return {
        speech:  `<speak><par><media begin='2s'><speak>Det blir ${weatherData.weather} och ${weatherData.wind} i ${city} på ${day}, enligt både SMHI och Yr. Temperatur mellan ${weatherData.minTemp} och ${weatherData.maxTemp} grader.</speak></media><media fadeOutDur='2s'><audio src='https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' clipEnd='12s'/></media></par></speak>`,
        text: `Det blir ${weatherData.weather} och ${weatherData.wind} i ${city} på ${day}, enligt SMHI. Temperatur mellan ${weatherData.minTemp} och ${weatherData.maxTemp} grader.`
    }
}

function tenDayForecastExpanded (smhi, yr, city, day) {
    return {
        speech: "",
        text: `Det blir ${smhi.weather} och ${smhi.wind} i ${city} på ${day}, enligt SMHI. Temperatur mellan ${smhi.minTemp} och ${smhi.maxTemp} grader. YR tror att det blir ${yr.weather}, ${yr.wind} och tempratur mellan ${yr.minTemp} och ${yr.maxTemp}.`
    }
}

module.exports = {
    nowForecast: nowForecast,
    restOfTheDayForecast: restOfTheDayForecast,
    afternoonForecast: afternoonForecast,
    eveningForecast: eveningForecast,
    tenDayForecast: tenDayForecast,
    tenDayForecastExpanded: tenDayForecastExpanded
}