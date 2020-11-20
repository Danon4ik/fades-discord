const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'notify',
	description: 'Команда для выдачи ролей для уведомлений.',
	async execute(message) {
        if (!message.author.hasPermission(['ADMINISTRATOR'])) return;
        await message.delete();

        let notify = require('../notify.json');
        let text = "";

        for (let i = 0; i < notify.reactions.length; i++) {
            const el = notify.reactions[i];
            text = await text.concat([el.text + "\n"]);
        }

        const embed = new Discord.MessageEmbed()
            .setTitle("<:fadethonk:777211533310427137> Выдача ролей")
            .setDescription(text)
            .setColor(0xa1a1a1);

        await message.channel.send({embed})
            .then(async (m) => {
                notify.notifyMessageID = `${m.id}`;
                
                await fs.writeFile("./notify.json", JSON.stringify(notify), (err) => {
                    if (err) console.log(err);
                });
                
                for (let i = 0; i < notify.reactions.length; i++) {
                    const el = notify.reactions[i];
                    await m.react(el.emoji);
                }
            })
            .catch(console.error);
	},
}