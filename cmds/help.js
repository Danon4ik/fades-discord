const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Отображает все команды с их описаниями.',
  category: 'Разное',
  example: 'help - отображает все команды\nhelp `наименование команды` - отображает пример использования команды',
  execute(message) {
    const commands = message.client.commands.array();

    let description = '';
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      description = description.concat([`**${cmd.name}** - ${cmd.description}\n`]);
    }

    const embed = new MessageEmbed()
      .setTitle('Список всех команд')
      .setColor('#85107F')
      .setDescription(description);

    message.channel.send(embed).catch(console.error);
  }
};