const { MessageEmbed } = require('discord.js');
const { getUserLevel } = require('../../utils/mysql_queries');

module.exports = {
  name: 'level',
  description: 'Отображает информацию об уровне.',
  category: 'Разное',
  example: 'Команда без аргументов.',
  execute(message) {
    const author = message.author;
    const mention = message.mentions.users.first();

    const user = mention ? mention : author;
    getUserLevel(user.id, data => {
      const desc = `Уровень: ${data.lvl}\n`
        + `Опыт: ${data.user_xp} / ${data.max_xp} xp\n`
        + `До следующего уровня: ${data.max_xp - data.user_xp} xp`;

      const embed = new MessageEmbed()
        .setTitle(`Информация об уровне ${user.tag}`)
        .setColor('#85107F')
        .setDescription(desc)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }));

      message.reply(embed).catch(console.error);
    });
  }
};