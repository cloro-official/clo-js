// command.js - CLORO
/* KURORO Command Main Class
 * 
 */
const Discord = require('discord.js');

class Command {
    constructor() {
        this.category = "";
        this.arguments = [];
        this.description = "";
        this.nsfw = false;
        this.hidden = false;
        this.required_permissions = [];
        this.cooldown = 8;
        this.cooldown_type = "user";
        this.cooldowns = {};
    }

    async init() {

    }
}

module.exports = Command