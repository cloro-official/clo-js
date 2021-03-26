// kuroro.js - CLORO
/* KURORO-CHAN MAIN CLASS
 * 
 */
const Pastebin = require('pastebin-js');
const Discord = require('discord.js');
const FilSys = require('fs-extra');
const DAT = require('date-and-time');

const Log = require('./log.js');
const fsJSON = require('./fsJSON.js');
const Dispatcher = require('./events.js');
const Getter = require('./getter.js');

const Unirealm = require('./unirealm.js');
const Genshin = require('./genshin.js');

const database = './database';

// Local Function
function GetTime() {
    const now = new Date();
    const ymd = DAT.format(now, DAT.compile('MMM-D-YYYY'));
    const hms = DAT.format(now, DAT.compile('HH-mm-ss'));

    return ymd, hms;
}

class KURORO extends Discord.Client {
    constructor(identity, static_client, trackers) {
        super();

        this.events = new Dispatcher();
        this.trackers = trackers;

        this.identity = identity;
        this.info = static_client;

        this.commands = {};
        this.behavior = {};

        this.pastebin = new Pastebin({
            'api_dev_key': identity["pastebin-api"][0],
            'api_user_name': identity["pastebin-api"][1],
            'api_user_password': identity["pastebin-api"][2],
        });

        // assign modules
        this.webhook = require('./webhook.js');
        this.format = require('./format.js');
        this.voice = require('./voice.js');
        this.log = require('./log.js');

        this.fsJSON = fsJSON;
        this.getter = Getter;

        this.cooldowns = {};
        // Info events
        const Handler = this.events;

        // Emit Update Handler
        this.info['json-event-listen'].forEach(string => {
            this.on(string, data => {
                Handler.emit("onUpdateInfo", data);
            })
        })


    };

    start(commands, behavior, databases) {
        // create KURORO Classes
        this.KUROROEmbed = class KUROROEmbed extends Discord.MessageEmbed {
            constructor() {
                super();

                this.color = "#E2EBF5";
                this.setFooter(`KURORO by CLORO`);
                this.setTimestamp();
            }
        }; 

        this.GenshinEmbed = class GenshinEmbed extends Discord.MessageEmbed {
            constructor() {
                super();

                this.color = "#384184";
                this.setFooter(`Genshin Gacha • KURORO by CLORO`);
                this.setTimestamp();
            }
        }

        this.UnirealmEmbed = class UnirealmEmbed extends Discord.MessageEmbed {
            constructor() {
                super();

                this.color = "#2D2D30";
                this.setFooter(`UNIREALM • KURORO by CLORO`);
                this.setTimestamp()
            }
        }

        this.genshin = new Genshin(this);
        this.unirealm = new Unirealm(this);

        this.commands = commands;
        this.behavior = behavior;
        this.databases = databases;
    };

    categorize(client) {
        var Categories = [];

        Object.keys(this.commands).forEach(async function (key) {
            if (Categories[client.commands[key].category]) {
                if (client.commands[key].nsfw)
                    Categories[client.commands[key].category].push(key + "*");
                else
                    Categories[client.commands[key].category].push(key);

                console.log(Categories[client.commands[key].category]);
            }
            else if (Categories[client.commands[key].category] == null && client.commands[key].category != "Internal" || client.commands[key].hidden != true) {
                Categories[client.commands[key].category] = [];
                if (client.commands[key].nsfw)
                    Categories[client.commands[key].category].push(key + "*");
                else
                    Categories[client.commands[key].category].push(key);

                console.log(client.commands[key].category + ` ${client.commands[key].category}`);
            }
        })

        return Categories;
    };

    update() {
        this.guilds.cache.tap(collection => collection.size == this.info['guilds-joined']);
        this.users.cache.tap(collection => collection.size == this.info['all-users']);

        FilSys.writeFile('./json/static_client.json', JSON.stringify(this.info, null, '\t'));

        this.updatePresence();
        this.track();
    };

    track() {
        if (this.trackers['last-update'] != this.identity.version[0])
            this.channels.cache.get(this.identity['update-channel-id']).send(new Discord.MessageEmbed()
                .setTitle(`${this.identity.version[0]} Patch Notes`)
                .setDescription(this.identity.version[1]))
                .then(message => {
                    this.trackers['last-update'] = this.identity.version[0];
                    FilSys.writeFile('./json/trackers.json', JSON.stringify(this.trackers, null, '\t'));
                });

        Object.keys(this.trackers.public).forEach(key => {
            const value = this.info[key];
            const information = this.trackers.public[key];

            if (value) {
                const channel = this.channels.cache.get(information.id);

                if (channel && channel.type == "voice") 
                    channel.edit({ name: `${information.text} ${value}`})
            }
        })
    };

    updatePresence() {
        const type = this.info['dynamic-presence-type'];

        switch (type) {
            case "guilds":
                this.user.setActivity(`with ${this.guilds.cache.size} servers`);

                break

            case "users":
                this.user.setActivity(`with ${this.users.cache.size} people`)

            default:
                break
        }
    };

    ifWhitelist(id) {
        const has = this.identity["whitelisted"].find(fid => fid === id);

        return has && true || false;
    }

    getCooldownType(cmd, message) {
        switch (cmd.cooldown_type) {
            case ('guild'):
                return message.guild.id;

            case ('user'):
                return message.author.id;

            case ('channel'):
                return message.channel.id;

            default:
                return message.channel.id;
        }
    }

    getReactionFilter(emojis, message) {
        return (reaction, user) => { return emojis.indexOf(reaction._emoji.name) && user.id === message.author.id; }
    }

    convertFromAttachments(attachments) {
        let converted = [];

        attachments.forEach(attachment => {
            converted.push(attachment.url)
        })

        return converted;
    }

    async makeHelp(prefix, key, value) {
        const embed = new this.KUROROEmbed()
            .setTitle(`${prefix}${key}`)
            .setDescription(`**Arguments: \`${value.arguments.length > 0 && value.arguments.join(", ") || "none"}\`**\n**Permissions: \`${value.required_permissions.length > 0 && value.required_permissions.join(", ") || "none"}\`**\n**Cooldown: \`${value.cooldown} seconds\ (${value.cooldown_type})\`**\n**NSFW**: ${value.nsfw && "Yes" || "No"}\n\n${value.description}`);

        return embed
    }

    async getGuild(guild) {
        const data = await FilSys.readJson(`${database}/guild/${guild.id}.json`);

        return data;
    }

    async writeToGuild(guild, data) {
        await FilSys.access(`${database}/guild/${guild.id}.json`, FilSys.constants.F_OK || FilSys.constants.W_OK || FilSys.constants.R_OK)
            .then(() => {
                FilSys.writeFile(`${database}/guild/${guild.id}.json`, JSON.stringify(data, null, '\t'))
            });
    }

    async getPrefix(guild) {
        let data;

        if (guild) {
            data = await FilSys.readJson(`${database}/guild/${guild.id}.json`);
            return data.prefix;
        } else
            return this.identity['default-prefix'];
    }

    // ensure Guild JSON
    async ensureGuild(guild) {
        const path = `${database}/guild/${guild.id}.json`
        // await FilSys.copy(`${data_defaults}/guild.json`, `${database}/guild/${guild.id}.json`)

        FilSys.ensureFile(path)
            .then(() => {
                let time = GetTime();

                let object = {};

                object['id'] = guild.id;
                object['kuroro-realm-id'] = parseFloat(guild.id) / 24;

                object['first-owner'] = guild.ownerID;
                object['first-name'] = guild.name;

                object['prefix'] = this.identity['default-prefix'];
                //object['name-history'] = [guild.name, time];
                //object['owner-history'] = [guild.ownerID, time];

                FilSys.writeFile(path, JSON.stringify(object, null, '\t'))
                console.log(`[clo-js] Data wrote finally for: ${guild.id}`)
            })
    }
}

// Export
module.exports = {
    KURORO: KURORO
}