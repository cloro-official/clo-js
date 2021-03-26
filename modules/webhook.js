// webhook.js - CLORO
const Discord = require('discord.js');
const FilSys = require('fs-extra');

const Validate = require('./core/http-valid.js');
const Log = require('./log.js');

const isImage = require('is-image');

class Body {
    constructor() {
        this['attachments'] = [];
    }

    Username(Name = "Webhook") {
        this['username'] = Name
    }

    Attach(Pretext = "No pretext provided.", Color = "#F0F", Footer_Icon, Footer, Timestamp) {
        if (this[0] == null)
            this[0] = {};

        this[0] = {
            'pretext': Pretext,
            'color': Color,
            'footer_icon': Footer_Icon,
            'footer': Footer,
            'ts': Timestamp
        };
    }

    Publish() {
        let body = {};

        // rebuild body class
        Object.keys(this).forEach(key => {
            let value = this[key];

            if (typeof (value) != "function")
                body[key] = value;
        });

        return body;
    }
}

class Webhook extends Discord.Webhook {
    constructor(Channel, Name = "Webhook", Options = { avatar, reason }) {
        super();

        this.self = Channel.createWebhook(Name, Options)
            .then(console.log)
            .catch(console.log)
    }

    Send(Message, Options) {
        this.self.send(Message, Options)
    }

    SendRaw(Body) {
        this.self.sendSlackMessage(Body);
    }

    Delete() {
        this.self.delete();
    }

    ChangeAvatarURL(url) {
        if (!Validate(url))
            Log.Error(`This is not a valid URL: ${url}`); return 

        if (isImage(url)) 
            this.self.user.avatar = url;
    }
}

//
module.exports = {
    class: Webhook,
    body: Body
};