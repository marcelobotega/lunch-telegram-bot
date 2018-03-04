require('dotenv').config();
const moment = require('moment');
const Telegraf = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);
const FB = require('fb');
FB.setAccessToken(process.env.GRAPH_TOKEN);

bot.telegram.setWebhook("https://aondevaiseroalmocobot.herokuapp.com");

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
