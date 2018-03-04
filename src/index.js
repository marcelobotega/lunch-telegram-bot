require('dotenv').config();
const moment = require('moment');
const Telegraf = require('telegraf');
const FB = require('fb');
const express = require('express');
const expressApp = express();

const API_TOKEN = process.env.BOT_TOKEN || '';
const PORT = process.env.PORT || 3000;
const URL = process.env.URL || 'https://aondevaiseroalmocobot.herokuapp.com';
const bot = new Telegraf(API_TOKEN);

FB.setAccessToken(process.env.GRAPH_TOKEN);
bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
expressApp.use(bot.webhookCallback(`/bot${API_TOKEN}`));

bot.command('welcome', (ctx) => ctx.reply('Hello!'));

bot.hears(/bot angelicos/i, (ctx) => {

    getAngelicosData().then(res => {
        ctx.reply(handleData(res.data));
    }).catch(error => {
        console.log(error);
        ctx.reply(!error ? 'error occurred' : error.error);
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


function getAngelicosData() {
    return FB.api('/angelicosbomretiro/posts');
}

function handleData(data) {
    let repeatTimes = 3;

    for (let i = 0; i < repeatTimes; i++) {
        let item = data[i];
        if (item.message.indexOf("CARDÁPIO") > -1 && moment(item.created_time).isSame(moment(), "day")) {
            return item.message;
        }
    }
    return "Cardápio de hoje não encontrado!";
}
