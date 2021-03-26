// ensureGuild.js - CLORO
const FilSys = require('fs-extra');
const Path = require('path');

const database = './database';

module.exports = async function (KURORO) {
    var entries = 0;
    KURORO.log.Log("Ensuring guild data...");

    // FilSys.readdir(`${database}/guild`, {encoding: 'utf8'}, (msg, file) => {console.log(file)})

    KURORO.guilds.cache.each(async function(guild) {
        KURORO.log.Log(`Checking data for: ${guild.id}`)
        await FilSys.access(Path.join(`${database}/guild/`, `${guild.id}.json`), FilSys.constants.F_OK | FilSys.constants.W_OK | FilSys.constants.R_OK)
            .catch(error => {
                if (error) {
                    KURORO.log.Log(`Data for ${guild.id} does not exist, creating...`);
                    const Data = KURORO.ensureGuild(guild);

                    entries++;
                }
            });
    })

    KURORO.log.Log(`Created guild data for ${entries} entries.`);
}