const { addLevel } = require('../../utils/mysql_queries');

module.exports = {
  name: 'addlevel',
  description: 'Выдача уровня.',
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

    addLevel(user.id, arg);
    message.reply(`Вы успешно добавили ${mention} ${arg} к уровню!`).catch(console.error);
  }
};