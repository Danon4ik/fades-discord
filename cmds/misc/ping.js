module.exports = {
  name: 'ping',
  description: 'Тестовая команда, которая проверяет задержку.',
  category: 'Разное',
  example: 'Команда без аргументов.',
  execute(message) {
    message.channel.send('Проверяем задержку...').then(m => {
      const ping = m.createdTimestamp - message.createdTimestamp
      m.edit(`Задержка между сообщениями - ${ping} мс.`)
    }).catch(console.error)
  },
};