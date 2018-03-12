require('dotenv').config();
const moment = require('moment');
const Telegraf = require('telegraf');
const FB = require('fb');
const express = require('express');
const expressApp = express();
const http = require("http");

const API_TOKEN = process.env.BOT_TOKEN || '';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'http://aondevaiseroalmocobot.herokuapp.com';
const bot = new Telegraf(API_TOKEN);
const restaurants = JSON.parse(process.env.RESTAURANTS);
bot.telegram.setWebhook();
FB.setAccessToken(process.env.GRAPH_TOKEN);

bot.command('welcome', (ctx) => ctx.reply('Hello!'));

bot.hears(/^bot help$/i, (ctx) => {
    let reply = "Restaurantes disponíveis:\n";

    Object.keys(restaurants).forEach(function(key) {
        let item = restaurants[key];
        reply += item.name+" => "+item.command+"\n";
    });

    ctx.reply(reply);
});

Object.keys(restaurants).forEach(function(key) {
    let item = restaurants[key];
    let re = new RegExp("^"+item.command+"$", "i");

    bot.hears(re, (ctx) => {
        getData(item).then(res => {
            ctx.reply(handleData(res.data, item));
        }).catch(error => {
            console.log(error);
            ctx.reply(!error ? 'error occurred' : error.error);
        });
    });
});

bot.hears(/bot todos/i, (ctx) => ctx.reply('todos'));

bot.startPolling();

expressApp.get('/', (req, res) => {
    res.send('Hello World!');
});
expressApp.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

setInterval(function() {
    http.get(URL);
}, 300000);

function getData(restaurant) {
    return FB.api(restaurant.api);
}

function handleData(data, restaurant) {
    let repeatTimes = 3;

    for (let i = 0; i < repeatTimes; i++) {
        let item = data[i];
        if (item.message.indexOf(restaurant.filter) > -1 && moment(item.created_time).isSame(moment(), "day")) {
            return item.message;
        }
    }
    return "Cardápio de hoje não encontrado!";
}
