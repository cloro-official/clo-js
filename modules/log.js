// log.js - CLORO
const DAT = require('date-and-time');
const Colors = require('colors');

function GetTime() {
	const now = new Date();
	const ymd = DAT.format(now, DAT.compile('MMM-D-YYYY'));
	const hms = DAT.format(now, DAT.compile('HH-mm-ss'));

	return ymd, hms;
}

// Export
const logTextInit = `[KURORO] `.bold.yellow

module.exports = {
	Error: function (message) {
		let ymd, hms = GetTime();

		console.log(logTextInit + `[${hms}] `.yellow + `ERROR: `.bold.red + `${message}`);
	},

	Warn: function (message) {
		let ymd, hms = GetTime();

		console.log(logTextInit + `[${hms}] `.yellow + `WARN: `.red + `${message}`);
	},

	Log: function (message) {
		let ymd, hms = GetTime();

		console.log(logTextInit + `[${hms}] `.yellow + `LOG: `.grey + `${message}`);
	},

	log: module.exports.Log,
	error: module.exports.Error,
	warn: module.exports.Warn
}