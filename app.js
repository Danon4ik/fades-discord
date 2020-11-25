const config = require('./config.json');

const fs = require('fs');
const fetch = require('node-fetch');
const Discord = require('discord.js');

const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

bot.commands = new Discord.Collection();
bot.prefix = config.prefix;

const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./cmds/${file}`);
	bot.commands.set(command.name, command);
}

bot.on('ready', () => {
	bot.user.setPresence({ activity: { name: 'fades.pw', type: 'WATCHING' }, status: 'online' });
	console.log(`Бот запущен как ${bot.user.tag}`);

	setInterval(() => {
		let commits_msg = require('./commits_msg.json');

		fetch('https://commits.facepunch.com/r/sbox?format=json').then(res => {
			if (!res.ok) throw Error(res.statusText);
			return res;
		}).then(res => {
			return res.json();
		}).then(data => {
			const commits_channel = bot.channels.cache.get(config.sbox_commits_channel_id);
			if (!commits_channel) return;

			const commits_data = data.results;
			for (let i = commits_data.length - 1; i >= 0; i--) {
				const commit = commits_data[i];
				if (commits_msg.sbox_commits.includes(commit.id)) continue;

				const embed = new Discord.MessageEmbed()
					.setColor('#85107f')
					.setTitle(`${commit.repo}/${commit.branch}#${commit.changeset}`)
					.setAuthor(`${commit.user.name}`, `${commit.user.avatar}`)
					.setURL(`https://commits.facepunch.com/${commit.id}`)
					.setDescription(`\`\`\`${commit.message}\`\`\``)
					.setTimestamp();

				commits_channel.send({embed});
				commits_msg.sbox_commits.push(commit.id);
			}

			fs.writeFile('./commits_msg.json', JSON.stringify(commits_msg), err => {
				if (err) console.log(err);
			});
		}).catch(console.error);
	}, 30000);
});

bot.on('message', message => {
	if (!message.content.startsWith(bot.prefix) || message.author.bot) return;

	const args = message.content.slice(bot.prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!bot.commands.has(command)) return
	try {
		bot.commands.get(command).execute(message, args);
	} catch (err) {
		message.reply('Произошла ошибка при обработке команды!');
		console.error(err);
	}
});

bot.on('guildMemberAdd', member => {  
	const channel = member.guild.channels.cache.get(config.novices_channel_id);
	if (!channel) return

	const phrase = config.phrases_join[Math.floor(Math.random() * config.phrases_join.length)];
	const embed = new Discord.MessageEmbed()
		.setTitle('<:fadewow:559185624209293324> Присоединение на сервер')
		.setDescription(`${member} ${phrase}`)  
		.setColor('#32F032')
		.setTimestamp();

	channel.send({embed});
});

bot.on('guildMemberAdd', member => {  
	const channel = member.guild.channels.cache.get(config.members_channel_id);
	if (!channel) return

	channel.setName(`Участники: ${member.guild.memberCount}`);
});

bot.on('guildMemberRemove', member => {  
	const channel = member.guild.channels.cache.get(config.members_channel_id);
	if (!channel) return

	channel.setName(`Участники: ${member.guild.memberCount}`);
});

bot.on('messageReactionAdd', async (reaction, user) => {
	if (user.bot) return

	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (err) {
			console.error('Что-то пошло не так при получении сообщения', err);
			return;
		}
	}

	const message = reaction.message;

	let { notifyMessageID, reactions } = require('./notify.json');
	if (notifyMessageID === '') return;
	if (notifyMessageID !== message.id) return;
	
	let temp_reactions = []
	for (let i = 0; i < reactions.length; i++) {
		const el = reactions[i];
		temp_reactions.push(el.emoji);
	}

	if (temp_reactions.includes(reaction.emoji.id) || temp_reactions.includes(reaction.emoji.name)) {
		if (!message.guild) return
		let userToRole = message.guild.members.cache.find(member => member.id === user.id);

		let notify_role;
		for (let i = 0; i < reactions.length; i++) {
			const el = reactions[i];
			if (el.emoji === reaction.emoji.name || el.emoji === reaction.emoji.id) {
				notify_role = message.guild.roles.cache.find(role => role.name === el.role_name);
				break;
			}
		}

		if (!notify_role) return;
		
		try {
			if (userToRole.roles.cache.some(role => role.name === notify_role.name)) {
				await userToRole.roles.remove(notify_role);
				await userToRole.send(`:x: Вы отписались от ${notify_role.name}`);
			} else {
				await userToRole.roles.add(notify_role);
				await userToRole.send(`:white_check_mark: Вы подписались на ${notify_role.name}`);
			}
		} catch (err) {
			console.error('Что-то пошло не так при выдачи роли', err);
		}

		await reaction.users.remove(user.id);
	}
});

bot.login(config.token);