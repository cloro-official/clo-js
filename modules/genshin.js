// genshin.js - CLORO
const FilSys = require('fs-extra');
const fsJSON = require('./fsJSON.js');

const { Menu } = require('discord.js-menu');
const random = require('weighted-random');
const stringSimilarity = require('string-similarity');

const database = './database/user'

class Genshin {
    constructor(client) {
        this.client = client;

        this.characters = require('../genshin/characters.json');
        this.weapons = require('../genshin/weapons.json');
        this.meta = require('../genshin/meta.json');

        this.all = fsJSON.mergeJSON(this.characters, this.weapons);

        this.pullCost = 0;
        this.dailyMora = 0;
    }

    ensureData(user) {
        let json = JSON.stringify({
            rank: 1,
            exp: 0,
            masterlessStardust: 0,
            masterlessStarglitter: 0,
            acquaintFate: 10,
            intertwinedFate: 10,
            lastClaimedDailies: 0,
            characters: [],
            weapons: [],
            artifacts: [],
            primogems: 1600,
            mora: 1000000
        }, null, '\t')

        FilSys.writeFileSync(`${database}/genshin/${user.id}.json`, json);

        this.client.log.Log(`[GENSHIN IMPACT] Data wrote finally for: ${user.id}`);
    }

    makeList(message, array, page, title, type) {
        if (array.length == 0)
            channel.send(new this.client.GenshinEmbed()
                .setTitle(title)
                .setDescription(`**You don't have anything!**`));
        else {
            let pageArray = [];

            let currentItem = page+1;
            let currentPage = {};
            array.forEach(object => {
                if (currentItem <= page) {
                    if (type == "char")
                        currentPage.content.addField(`${object.name} - ${this.makeStars(object.rarity)}`, `**Element:** \`${object.element}\`\n**Weapon:** \`${object.weapon}\``);
                    else if (type == "weap")
                        currentPage.content.addField(`${object.name} - ${this.makeStars(object.rarity)}`, `**h**`);

                    currentItem++;
                } else {
                    let newPage = {
                        name: `page${pageArray.length + 1}`,
                        content: new this.client.GenshinEmbed()
                            .setTitle(title)
                    }

                    let length = pageArray.push(newPage);
                    currentPage = pageArray[length - 1];
                    if (pageArray.length == 1)
                        currentPage.reactions = {
                            "▶": "next",
                            "❎": "delete"
                        }
                    else
                        currentPage.reactions = {
                            "◀": "previous",
                            "▶": "next",
                            "❎": "delete"
                        }

                    if (type == "char")
                        currentPage.content.addField(`${object.name} - ${this.makeStars(object.rarity)}`, `**Element:** \`${object.element}\`\n**Weapon:** \`${object.weapon}\``);
                    else if (type == "weap")
                        currentPage.content.addField(`${object.name} - ${this.makeStars(object.rarity)}`, `**h**`);


                    currentItem = 0;
                }
            })

            let menu = new Menu(message.channel, message.author.id, pageArray);
            menu.start();
        }
    }

    makeStars(rarity) {
        let str = "";

        for (let i = 1; i <= 5; i++) {
            if (i <= rarity) {
                str = str + "★";
            } else {
                str = str + "☆";
            }
        }

        return str;
    }

    async search(name) {
        if (!name) { return };
        let bestMatch = stringSimilarity.findBestMatch(name, Object.keys(this.all));
        let all = this.all;

        if (bestMatch.bestMatch.rating >= 0.25) {
            let found = await (async function () {
                let found;

                Object.keys(all).forEach(key => {
                    let value = all[key];

                    if (name.toLowerCase() == key) {
                        found = all[key];
                    }
                })

                if (!found) {
                    found = all[bestMatch.bestMatch.target];
                }

                return found;
            })();

            return found;
        } else
            return;
    }

    makeObjectDescription(object) {
        let str = "";
        let embed = new this.client.GenshinEmbed();

        Object.keys(object).forEach(key => {
            let value = object[key];

            switch (key.toLowerCase()) {
                case "percentage":
                    break;

                case "icon":
                    embed.setThumbnail(value);

                    break;
                case "name":
                    embed.title = value;
                    break;

                case "rarity":
                    break;
                    
                default:
                    str = str + `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${value}\n`
                    break;
            }
        })

        str = `**Rarity:** ${this.makeStars(object.rarity)}\n` + str;
        embed.description = str;
        return embed;
    }

    saveData(user, data) {
        FilSys.writeFileSync(`${database}/genshin/${user.id}.json`, JSON.stringify(data, null, '\t'));
    }
}

module.exports = Genshin;