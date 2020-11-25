const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'notify',
	description: 'Команда для выдачи ролей для уведомлений.',
	execute(message) {
        const permissions = message.channel.permissionsFor(message.client.user);
        if (!permissions.has("ADMINISTRATOR")) return;

        message.delete();

        let notify = require('../notify.json');
        let description = '';

        for (let i = 0; i < notify.reactions.length; i++) {
            const el = notify.reactions[i];
            description = description.concat([el.text + '\n']);
        }

        const embed = new MessageEmbed()
            .setTitle('<:fadethonk:777211533310427137> Выдача ролей')
            .setDescription(description)
            .setColor('#A1A1A1');

        message.channel.send({embed})
            .then(m => {
                notify.notifyMessageID = `${m.id}`;
                
                fs.writeFile('./notify.json', JSON.stringify(notify), err => {
                    if (err) console.error(err);
                });
                
                for (let i = 0; i < notify.reactions.length; i++) {
                    const el = notify.reactions[i];
                    m.react(el.emoji).catch(console.error);
                }
            })
            .catch(console.error);
	},
}