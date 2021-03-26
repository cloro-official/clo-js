// fsJSON.js - CLORO
/*
 * JSON Write-Append-Clear Module
 * 
 */
const FilSys = require('fs-extra');

module.exports = {
    mergeJSON: function () {
        let merged = {};

        for (json in arguments) {
            let js = arguments[json];

            Object.assign(merged, js);
        }

        return merged;
    },

    appendJSON: async function (json, values) {
        FilSys.readFile(json, 'utf8')
            .then(data => {
                const tParsed = JSON.parse(data);
                tParsed.push(values);

                const final = JSON.stringify(tParsed);
                FilSys.writeFile(json, final, 'utf8')
                    .catch(error => console.error)
            })
            .catch(error => console.error);
    },

    clearJSON: async function (json) {
        FilSys.readFile(json, 'utf8')
            .then(data => {
                FilSys.writeFile(json, '{}', 'utf8');
            })
            .catch(error => console.error);
    },

    writeJSON: async function (json, parsedJSON) {
        FilSys.readFile(json, 'utf8')
            .then(data => {
                FilSys.writeFile(json, JSON.stringify(parsedJSON), 'utf8')
            })
            .catch(error => console.error);
    },

    updateJSON: async function (json, entry, value) {
        FilSys.readFile(json, 'utf8')
            .then(data => {

            })
            .catch(error => console.error);
    },

    ensureJSON: async function (json) {
        FilSys.access(json)
            .then(error => {
                if (!error)
                    FilSys.writeFile(json, '{\n}')
                else
                    return true
            })
    },

    requireJSON: async function (json) {
        FilSys.access(json)
            .then(error => {
                if (error) {
                    try {
                        return require(json);
                    } catch (error) {
                        console.error(error);
                    }
                }
            });
    },

    copyJSON: async function (json, path) {
        FilSys.access(json, FilSys.constants.F_OK | FilSys.constants.R_OK)
            .then(error => {
                console.log(error)
                if (!error) {
                    FilSys.copy(json, path)
                        .then(() => {
                            return require(path);
                        })
                        .catch(error => console.error);
                }
            });
    }
}