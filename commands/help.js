// help.js - CLORO
const Discord = require('discord.js');
const { Menu } = require('discord.js-menu');

const Command = require('../modules/command.js');
const stringSimilarity = require('string-similarity');
const DAT = require('date-and-time');

class Instance extends Command {
    constructor() {
        super();

        this.category = "About";
        this.arguments = ["<command>"];
        this.description = "Documents everything about KURORO.\nWhen supplied with a command, it will display its documentation. If this command doesn't exist, it will find the nearest matching command.";
        this.cooldown = 30;
        this.cooldown_type = "guild";
    }

    async init (client, message, args) {
        var length = args.length;
        var prefix = await client.getPrefix(message.guild);

        if (length == 0) {
            var Categories = client.categorize(client);

            const Embed1 = new client.KUROROEmbed()
                .setTitle("KURORO")
                .setDescription("**KURORO** is your ultimate waifu bot!\n\n**KURORO** is **CLORO's personal assistant**, working for CLORO below minimum wage under a vessel of a young teenage girl.\n\n**This bot comes with many features and games:**")
                .addField("Booru", "KURORO's **original intended use**, coming with **better search indexing** providing you the best content from a pletora of imageboards!")
                .addField("Genshin", "An integrated **Genshin feature** that allows you to do rolls, search characters and weapons--without paying anything!")
                .addField("And many more!", "Translation, currency conversion, search indexing! And more features to come!")

            const Commands = new client.KUROROEmbed()
                .setTitle("COMMANDS")
                .setDescription(`The prefix for this server is \`${prefix}\`\nYou can do \`${prefix}help [command]\` to see its description.\n\nHere are a list of commands available for KURORO (* - NSFW):`);

            Object.keys(Categories).forEach(function (key) {
                let cmds = Categories[key];

                Commands.addField(key, `\`${cmds.join(', ')}\``)
            });

            const About = new client.KUROROEmbed()
                .setTitle("ABOUT")
                .setDescription(`**KURORO** by **CLORO**.\n\nCreated with clo-js.\nIf you want to support the bot, please donate to our [PayPal](https://paypal.me/CloroSphere).\n\nVersion: \`${client.identity.version[0]}\`\nSee \`${prefix}patchnotes\` for release notes.\n\n[Invite KURORO to your server!](https://discord.com/oauth2/authorize?client_id=768814237526130688&permissions=0&scope=bot)\n\n**Support CLORO:**\n[Twitter](https://twitter.com/cloro_2nd)\n[YouTube](https://youtube.com/c/CLOROYT)\n[GitHub](https://github.com/cloro-official/)`)

            const Disclaimer = new client.KUROROEmbed()
                .setTitle("DISCLAIMER")
                .setDescription(`**KURORO** is hosted on **CLORO's** computer, meaning that it only runs while **CLORO's** computer is turned on.\n\n**If ever the bot becomes successful, it will soon be hosted on a cloud service so it will run 24/7.**\n**Please support us through our [PayPal](https://paypal.me/CloroSphere) to help KURORO evolve to a cloud-hosted Discord bot!**`)

            try {
                message.react('✅');
                message.channel.send(`<@${message.author.id}> **Check your DMs!**`)
                    .then(msg => setTimeout(() => { msg.delete(); }, 1000 * 5));

                message.author.send(Embed1);
                message.author.send(Commands);
                message.author.send(About);
                message.author.send(Disclaimer);
            } catch (error) {
                message.channel.send(`<@${message.author.id}> **I can't send the documentation in your DMs, is it enabled?**`)
                    .then(msg => setTimeout(() => { msg.delete(); }, 1000 * 5));
            }
        }
        else if (length > 0) {
            let toFind = args[0].trim().toLowerCase();

            let bestMatch = stringSimilarity.findBestMatch(toFind, Object.keys(client.commands));
            let hasFind = false;

            await Object.keys(client.commands).forEach(async function (key) {
                let value = client.commands[key];

                if (toFind == key.toLowerCase() && !value.hidden) {
                    const embed = await client.makeHelp(prefix, key, value);

                    message.channel.send(embed);
                    hasFind = true;
                }
            })

            if (!hasFind) {
                message.channel.send(`<@${message.author.id}> Sorry, I couldn't find the command \`${toFind}\` in the list of commands.`)
                    .then(message1 => {
                        if (bestMatch && bestMatch.bestMatch.rating >= .2) {
                            let content = message1.content;

                            const value = client.commands[bestMatch.bestMatch.target];
                            if (value.category == 'Internal') {
                                message1.edit(message1.content + `\n\n**I also couldn't find anything that's similar to \`${toFind}\`.**`);
                                return;
                            }

                            message1.delete()
                            client.makeHelp(prefix, bestMatch.bestMatch.target, value)
                                .then(embed => {
                                    let menu = new Menu(message.channel, message.author.id, [
                                        {
                                            name: 'main',
                                            content: content + `\n\n**Did you mean \`${bestMatch.bestMatch.target}?\`** (react to the emoji to see its description.)`,
                                            reactions: {
                                                "🤔": "help"
                                            }
                                        },
                                        {
                                            name: 'help',
                                            content: "**Loading help menu...**",
                                            reactions: {}
                                        }
                                    ], 300000);

                                    menu.on('pageChange', destination => {
                                        if (destination.name == "help") {
                                            message.channel.send(embed);
                                            menu.delete();
                                        }
                                    })

                                    menu.start();
                                });
                        } else {
                            message1.edit(message1.content + `\n\n**I also couldn't find anything that's similar to \`${toFind}\`.**`)
                        }
                    })
            }
        }
    }
}

exports.class = Instance;