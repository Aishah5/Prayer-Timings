function getDate() {
    let params = {
        "address": "SA",
    }
    axios.get('http://api.aladhan.com/v1/timingsByAddress', {
        params: params,
    })
        .then(function (response) {
            const dayNum = response.data.data.date.hijri.day
            const maonthName = response.data.data.date.hijri.month.ar
            const yearNum = response.data.data.date.hijri.year

            const nowDateHijri = dayNum + " " + maonthName + " " + yearNum
            const nowDateEnglish = moment().format('LL')
            document.getElementById("date").innerHTML = nowDateHijri + ` | ${nowDateEnglish}`

            let dayName = moment().format('dddd')
            document.getElementById("day_name").innerHTML = dayName
        })
        .catch(function (error) {
            console.log(error)
        })
}
getDate()

let cities = [
    {
        arName: "الرياض",
        enName: "Riyadh"
    },
    {
        arName: "الباحة",
        enName: "Al Bāḩah"
    },
    {
        arName: "الخبر",
        enName: "Al khobar"
    },
    {
        arName: "الدمام",
        enName: "Dammam"
    },
    {
        arName: "القصيم",
        enName: "Al Qassim"
    },
    {
        arName: "المدينة المنورة",
        enName: "AL Madinah AL Munawwarah"
    },
    {
        arName: "الهفوف",
        enName: "Al Hofuf"
    },
    {
        arName: "تبوك",
        enName: "Tabūk"
    },
    {
        arName: "جدة",
        enName: "Jeddah "
    },
    {
        arName: "حايل",
        enName: "Ḩā'il"
    },
    {
        arName: "أبها",
        enName: "Abha"
    },
    {
        arName: "مكة المكرمة",
        enName: "Makkah"
    }
]

for (let city of cities) {
    let content = `<option> ${city.arName} </option>`

    document.getElementById("select_city").innerHTML += content
}

document.getElementById("select_city").addEventListener("change", function () {
    document.getElementById("city_name").innerHTML = this.value

    let cityName = ""
    for (let city of cities) {
        if (city.arName == this.value) {
            cityName = city.enName
        }
    }
    getPrayerTiming(cityName)
})
let timer
function getPrayerTiming(cityName) {
    let params = {
        "country": "SA",
        "city": cityName, //"Al Ahsa Governorate"
        "method": 4
    }
    axios.get('http://api.aladhan.com/v1/timingsByCity', {
        params: params,
    })
        .then(function (response) {
            const timings = response.data.data.timings

            FillTimeForPrayer("fajr_time", timings.Fajr)
            FillTimeForPrayer("sunrise_time", timings.Sunrise)
            FillTimeForPrayer("dhuhr_time", timings.Dhuhr)
            FillTimeForPrayer("asr_time", timings.Asr)
            FillTimeForPrayer("maghrib_time", timings.Maghrib)
            FillTimeForPrayer("isha_time", timings.Isha)

            document.getElementById("fajr_remaining_time").innerHTML = ""
            document.getElementById("sunrise_remaining_time").innerHTML = ""
            document.getElementById("dhuhr_remaining_time").innerHTML = ""
            document.getElementById("asr_remaining_time").innerHTML = ""
            document.getElementById("maghrib_remaining_time").innerHTML = ""
            document.getElementById("isha_remaining_time").innerHTML = ""
            
            clearInterval(timer)
            let remainingTime = () => {
                let currentTime = moment()
                let fajr = moment(timings.Fajr, "hh:mm")
                let dhuhr = moment(timings.Dhuhr, "hh:mm")
                let asr = moment(timings.Asr, "hh:mm")
                let maghrib = moment(timings.Maghrib, "hh:mm")
                let isha = moment(timings.Isha, "hh:mm")

                if (currentTime.isAfter(fajr) && currentTime.isBefore(dhuhr)) {
                    FillRemainingTimeForPrayerExceptFajr("dhuhr_remaining_time", dhuhr)
                }
                else if (currentTime.isAfter(dhuhr) && currentTime.isBefore(asr)) {
                    FillRemainingTimeForPrayerExceptFajr("asr_remaining_time", asr)
                }
                else if (currentTime.isAfter(asr) && currentTime.isBefore(maghrib)) {
                    FillRemainingTimeForPrayerExceptFajr("maghrib_remaining_time", maghrib)
                }
                else if (currentTime.isAfter(maghrib) && currentTime.isBefore(isha)) {
                    FillRemainingTimeForPrayerExceptFajr("isha_remaining_time", isha)
                }
                else {
                    FillRemainingTimeForFajrPrayer("fajr_remaining_time", fajr)
                }
            }
            timer = setInterval(remainingTime, 1000)
        })
        .catch(function (error) {
            console.log(error)
        })
}
getPrayerTiming("Riyadh")

function FillTimeForPrayer(id, time) {
    let t = moment(time, "hh:mm")
    document.getElementById(id).innerHTML = t.format('hh:mm a')
}

function FillRemainingTimeForPrayerExceptFajr(id, prayer) {
    let currentTime = moment()
    let nextPrayer = prayer
    let remainingTime = nextPrayer.diff(currentTime)
    let durationRemainingTime = moment.duration(remainingTime)

    let hours = durationRemainingTime.hours()
    let minutes = durationRemainingTime.minutes()
    let seconds = durationRemainingTime.seconds()
    let content = timeFormat(hours, minutes, seconds)
    document.getElementById(id).innerHTML = content + " -"
    hideTimer(content, id)
}

function FillRemainingTimeForFajrPrayer(id, prayer) {
    let currentTime = moment()
    let nextPrayer = prayer
    let remainingTime = nextPrayer.diff(currentTime)
    let durationRemainingTime = moment.duration(remainingTime)

    let hours = durationRemainingTime.hours()
    let minutes = durationRemainingTime.minutes()
    let seconds = durationRemainingTime.seconds()

    if (hours >= 0 && hours <= 7) {
        let content = timeFormat(hours, minutes, seconds)
        document.getElementById(id).innerHTML = content + " -"
        hideTimer(content, id)
    }
    else {
        let hoursString = (hours + 23).toString()
        let minutesString = (minutes + 59).toString()
        let secondsString = (seconds + 59).toString()

        if (hoursString.length < 2) {
            hoursString = '0' + (hours + 23)
        } else {
            hoursString = (hours + 23)
        }

        if (minutesString.length < 2) {
            minutesString = '0' + (minutes + 59)
        } else {
            minutesString = (minutes + 59)
        }

        if (secondsString.length < 2) {
            secondsString = '0' + (seconds + 59)
        } else {
            secondsString = (seconds + 59)
        }

        let content = hoursString + ":" + minutesString + ":" + secondsString
        document.getElementById(id).innerHTML = content + " -"
        hideTimer(content, id)
    }
}

function timeFormat(h, m, s) {
    let hoursString = h.toString()
    let minutesString = m.toString()
    let secondsString = s.toString()

    if (hoursString.length < 2) {
        hoursString = '0' + h
    } else {
        hoursString = h
    }

    if (minutesString.length < 2) {
        minutesString = '0' + m
    } else {
        minutesString = m
    }

    if (secondsString.length < 2) {
        secondsString = '0' + s
    } else {
        secondsString = s
    }

    let content = hoursString + ":" + minutesString + ":" + secondsString
    return content
}

function hideTimer(timer, id){
    let isDone = false
    console.log(isDone)
    if(timer === "00:00:00"){
        isDone = true
        console.log(isDone)
        console.log(typeof timer)
        document.getElementById(id).style.display = "none"
    }
}