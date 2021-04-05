const fs = require('fs')
const { MessageEmbed } = require('discord.js')
const { notify_title_emoji, notify_roles } = require('../../config.json')

module.exports = {
  name: 'notify',
  description: 'Команда для выдачи ролей для уведомлений. Только для админов.',
  category: 'Выдача ролей',
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
      description += (el.text + '\n')
    }

    const embed = new MessageEmbed()
      .setTitle(`${notify_title_emoji ? notify_title_emoji + ' ' : ''}` + this.category)
      .setDescription(description)
      .setColor('#A1A1A1')

    message.channel.send(embed)
      .then(m => {
        const notifyMessageID = `${m.id}`
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
