module.exports = {
	name: 'ping',
	description: 'Тестовая команда, которая проверяет задержку.',
	async execute(message) {
		await message.channel.send("Проверяем задержку...").then(async m =>{
            var ping = await m.createdTimestamp - message.createdTimestamp;
            await m.edit(`Задержка между сообщениями - ${ping} мс.`);
        });
	},
};