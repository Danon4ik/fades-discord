const { addXP } = require('../../utils/mysql_queries');

module.exports = {
  name: 'addxp',
  description: 'Выдача опыта.',
  execute(message, args) {
    const author = message.author;
    const mention = message.mentions.users.first();

    const user = mention ? mention : author;
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