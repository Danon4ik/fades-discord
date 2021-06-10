module.exports = {
  name: "ping",
  description: "Тестовая команда, которая проверяет задержку.",
  category: "Разное",
  execute(message) {
    message.channel.send("Проверяем задержку...").then(msg => {
      const ping = msg.createdTimestamp - message.createdTimestamp;
      msg.edit(`Задержка между сообщениями - ${ping} мс.`);
    }).catch(console.error);
  },
};
