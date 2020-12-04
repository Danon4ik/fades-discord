const { addXP } = require('../../utils/mysql_queries');

module.exports = {
  name: 'addxp',
  description: 'Админ | Выдача опыта.',
  category: 'Система уровней',
  example: 'addxp @user 10 - дать @user 10 опыта\naddxp @user -10 - забрать у @user 10 опыта',
  execute(message, args) {
    const members = message.guild.members;
    const author = members.cache.get(message.author.id);

    if (!author.hasPermission(['ADMINISTRATOR'])) {
      message.reply('У вас нет прав на использование этой команды.')
      return;
    }

    const mention = message.mentions.users.first();
    const user = mention ? mention : message.author;
    const arg = Number(args[1]) || false;

    if (!mention || args[0] === mention) {
      message.reply('Сначала необходимо упомянуть человека!').catch(console.error);
      return;
    }

    if (!arg) {
      message.reply('Необходимо ввести число после упоминания!').catch(console.error);
      return;
    }

    addXP(user.id, arg, () => {});
    message.reply(`Вы успешно добавили ${mention} ${arg} xp к опыту!`).catch(console.error);
  }
};