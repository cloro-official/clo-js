// format.js - CLORO
module.exports = {
    msToTime: function (ms) {
        let days = Math.floor(ms / 86400000); // 24*60*60*1000
        let daysms = ms % 86400000; // 24*60*60*1000
        let hours = Math.floor(daysms / 3600000); // 60*60*1000
        let hoursms = ms % 3600000; // 60*60*1000
        let minutes = Math.floor(hoursms / 60000); // 60*1000
        let minutesms = ms % 60000; // 60*1000
        let sec = Math.floor(minutesms / 1000);

        let str = "";
        if (days) str = str + days + "d";
        if (hours) str = str + hours + "h";
        if (minutes) str = str + minutes + "m";
        if (sec) str = str + sec + "s";

        return str;
    },

    convToTags: async function (tags) {
        let joined = tags.join(' ')

        if (joined.match(/([\+]+)/)) {
            converted = joined.split(/([\+]+)/);

            let nconv = [];
            converted.forEach(element => {
                if (!element.match(/([\+]+)/))
                    nconv.push(element);
            });

            converted = nconv
        } else
            converted = joined.split(", ");

        let toReturn = [];

        converted.forEach(string => {
            let formatted = string.trim().toLowerCase().replace(/\s+/g, "_");

            toReturn.push(formatted);
        })

        return toReturn;
    }
} 