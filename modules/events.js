"use strict";
// events.js - CLORO
/*
 * CUSTOM EVENT DISPATCHER
 * CLORO
 * 
 */
class Event {
	constructor(eventName) {
		this.name = eventName;
		this.callbacks = [];
	}

	addCallback(callback) {
		this.callbacks.push(callback)
	}

	removeCallback(callback) {
		const index = this.callbacks.indexOf(callback);

		if (index > -1) 
			this.callbacks.splice(index, 1);
	}

	fire(args) {
		this.callbacks.forEach(callback => {
			callback(args);
		});
	}
}

class Dispatcher {
	constructor() {
		this.events = {};
	}

	ensure(eventName) {
		const event = this.events[eventName];

		if (!event) {
			this.events[eventName] = new Event();
		}

		return this.events[eventName];
    }

	emit(eventName, data) {
		const event = this.ensure(eventName);

		if (event) {
			event.fire(data)
		} else {
			this.ensure(eventName);
        }
	}

	on(eventName, func) {
		const event = this.ensure(eventName);

		if (event) {
			event.addCallback(func)
		}
	}

	off(eventName, func) {
		const event = this.ensure(eventName);

		if (event && event.callbacks.indexOf(func) > -1) {
			event.removeCallback(func)

			if (event.callbacks.length == 0) {
				delete this.events[eventName];
            }
		}
	}
}

module.exports = Dispatcher