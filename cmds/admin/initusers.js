const { initUsers } = require('../../utils/mysql_queries')

module.exports = {
  name: 'initusers',
  description: 'Добавление всех участников на сервере в базу данных. Только для админов.',
  category: 'Разное',
  example: 'Команда без аргументов.',
  execute(message) {
    const members = message.guild.members
    const author = members.cache.get(message.author.id)

    if (!author.hasPermission(['ADMINISTRATOR'])) {
      message.reply('У вас нет прав на использование этой команды.')
      return
    }

    let membersID = []
    members.cache.map(member => {
      if (member.user.bot) return
      membersID.push(member.id)
    })
    
    initUsers(membersID)

    message.channel.send('Все участники были успешно добавлены в базу данных!').catch(console.error)
  }
};