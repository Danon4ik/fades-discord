const fs = require('fs')
const { MessageEmbed } = require('discord.js')
const { notify_roles } = require('../../config.json')

module.exports = {
  name: 'notify',
  description: 'Команда для выдачи ролей для уведомлений. Только для админов.',
  category: 'Выдача ролей',
  example: 'Команда без аргументов.',
  execute(message) {
    const author = message.guild.members.cache.get(message.author.id)
    if (!author.hasPermission(['ADMINISTRATOR'])) {
      message.reply('У вас нет прав на использование этой команды.')
      return
    }

    message.delete()

    let description = ''
    for (let i = 0; i < notify_roles.length; i++) {
      const el = notify_roles[i]
      description = description.concat([el.text + '\n'])
    }

    const embed = new MessageEmbed()
      .setTitle('<:fadethonk:777211533310427137> Выдача ролей')
      .setDescription(description)
      .setColor('#A1A1A1')

    message.channel.send(embed)
      .then(m => {
        let notifyMessageID = `${m.id}`
        fs.writeFile('./notify.json', JSON.stringify(notifyMessageID), err => {
          if (err) console.error(err)
        })
        
        for (let i = 0; i < notify_roles.length; i++) {
          const el = notify_roles[i]
          m.react(el.emoji).catch(console.error)
        }
      })
      .catch(console.error)
  },
}