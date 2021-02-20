const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'help',
  description: 'Отображает все команды с их описаниями.',
  category: 'Разное',
  example: 'help - отображает все команды\nhelp \'наименование команды\' - отображает пример использования команды',
  execute(message, args) {
    const commands = message.client.commands.array()
    const arg = args[0] || false

    if (!arg) {
      const fields = {}
      const embed = new MessageEmbed()
        .setTitle('Список всех команд')
        .setColor('#85107F')
        .setDescription('Ниже приведен список всех команд с их описаниями.')

      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i]

        if (!fields[cmd.category]) fields[cmd.category] = ''
        fields[cmd.category] = fields[cmd.category].concat([`\`${cmd.name}\` - ${cmd.description}\n`])
      }
      
      Object.entries(fields).forEach(([key, value]) => embed.addField(key, value))
      message.channel.send(embed).catch(console.error)
    } else {
      let command
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i]
        if (cmd.name === arg) {
          command = cmd
          break
        }
      }

      if (!command) {
        message.reply('Такой команды не существует!')
      }

      const embed = new MessageEmbed()
        .setTitle(`Команда - ${command.name}`)
        .setColor('#85107F')
        .setDescription(`Описание: ${command.description}\nПример: \`${command.example}\``)

      message.channel.send(embed).catch(console.error)
    }
  }
};