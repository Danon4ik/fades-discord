module.exports = {
	name: 'ping',
	description: 'Тестовая команда, которая проверяет задержку.',
	execute(message) {
		message.channel.send('Проверяем задержку...').then(m => {
			var ping = m.createdTimestamp - message.createdTimestamp;
			m.edit(`Задержка между сообщениями - ${ping} мс.`);
		});
	},
};