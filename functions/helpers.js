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

module.exports = {dateToDay}