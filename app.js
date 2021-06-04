const fs = require("fs");
const { join } = require("path");
const fetch = require("node-fetch");
const { Client, Collection, MessageEmbed } = require("discord.js");

const consola = require("consola");

const bot = new Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"] });

bot.config = require("./config.json");
bot.commands = new Collection();

const cmds = fs.readdirSync("./cmds");
const cmdFiles = cmds.filter(file => file.endsWith(".js"));
const cmdFolders = cmds.filter(folder => {
  const path = join(__dirname, `cmds/${folder}`);
  return fs.lstatSync(path).isDirectory();
});

for (const file of cmdFiles) {
  const path = join(__dirname, `cmds/${file}`);
  const cmd = require(path);

  bot.commands.set(cmd.name, cmd);
  consola.success(`Команда '${cmd.name}' загружена успешно!`);
}

for (const folder of cmdFolders) {
  const path = join(__dirname, `cmds/${folder}`);
  const cmdFolder = fs.readdirSync(path).filter(file => file.endsWith(".js"));

  for (const file of cmdFolder) {
    const cmdPath = join(path, file);
    const cmd = require(cmdPath);

    bot.commands.set(cmd.name, cmd);
    consola.success(`Команда '${folder}/${cmd.name}' загружена успешно!`);
  }
}

bot.on("ready", () => {
  bot.user.setPresence({ activity: { name: "fades.pw", type: "WATCHING" }, status: "online" });
  consola.ready({ message: `Бот запущен как ${bot.user.tag}`, badge: true });

  if (bot.config.commitsEnabled) {
    setInterval(() => {
      const commits = require("./commits.json");

      fetch("https://commits.facepunch.com/r/sbox?format=json").then(res => {
        if (!res.ok) throw Error(res.statusText);
        return res;
      }).then(res => {
        return res.json();
      }).then(data => {
        const commitsChannel = bot.channels.cache.get(bot.config.sboxCommitsChannelId);
        if (!commitsChannel) return;

        const commitsData = data.results;
        for (let i = commitsData.length - 1; i >= 0; i--) {
          const commit = commitsData[i];
          if (commits.sbox.includes(commit.id)) continue;

          const embed = new MessageEmbed()
            .setColor("#85107f")
            .setTitle(`${commit.repo}/${commit.branch}#${commit.changeset}`)
            .setAuthor(`${commit.user.name}`, `${commit.user.avatar}`)
            .setURL(`https://commits.facepunch.com/${commit.id}`)
            .setDescription(`\`\`\`${commit.message}\`\`\``)
            .setTimestamp();

          commitsChannel.send({embed});
        }

        const tempSboxCommits = [];
        for (let i = 0; i < commitsData.length; i++) {
          const commit = commitsData[i];
          tempSboxCommits[i] = commit.id;
        }

        if (tempSboxCommits !== commits.sbox) {
          commits.sbox = tempSboxCommits;
          fs.writeFile("./commits.json", JSON.stringify(commits), err => {
            if (err) console.error(err);
          });
        }
      }).catch(console.error);
    }, bot.config.commitsDelay * 1000);
  }
});

bot.on("message", msg => {
  if (!msg.content.startsWith(bot.config.prefix) || msg.author.bot) return;

  const args = msg.content.slice(bot.config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (!bot.commands.has(command)) return;
  try {
    bot.commands.get(command).execute(msg, args);
  } catch (err) {
    msg.reply("Произошла ошибка при обработке команды!");
    console.error(err).bind(console, "Ошибка при обработке команды");
  }
});

bot.on("guildMemberAdd", member => {
  const channel = bot.channels.cache.get(bot.config.membersChannelId);
  if (!channel) return;

  channel.setName(`Участники: ${member.guild.memberCount}`);
});

bot.on("guildMemberRemove", member => {
  const channel = bot.channels.cache.get(bot.config.membersChannelId);
  if (!channel) return;

  channel.setName(`Участники: ${member.guild.memberCount}`);
});

bot.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error(err).bind(console, "Ошибка при получении сообщения:");
      return;
    }
  }

  const message = reaction.message;
  if (!message.guild) return;

  if (bot.config.notify.messageId !== message.id) return;

  const reactions = [];
  for (let i = 0; i < bot.config.notify.roles.length; i++) {
    const item = bot.config.notify.roles[i];
    reactions.push(item.emoji);
  }

  if (reactions.includes(reaction.emoji.id) || reactions.includes(reaction.emoji.name)) {
    const userToRole = message.guild.members.cache.find(member => member.id === user.id);

    let notifyRole;
    for (let i = 0; i < bot.config.notify.roles.length; i++) {
      const item = bot.config.notify.roles[i];
      if (item.emoji === reaction.emoji.name || item.emoji === reaction.emoji.id) {
        notifyRole = message.guild.roles.cache.find(role => role.name === item.role);
        break;
      }
    }

    if (!notifyRole) return;

    try {
      if (userToRole.roles.cache.some(role => role.name === notifyRole.name)) {
        await userToRole.roles.remove(notifyRole);
        await userToRole.send(`:x: Вы отписались от ${notifyRole.name}`);
      } else {
        await userToRole.roles.add(notifyRole);
        await userToRole.send(`:white_check_mark: Вы подписались на ${notifyRole.name}`);
      }
    } catch (err) {
      console.error(err).bind(console, "Ошибка при выдачи роли:");
    }

    await reaction.users.remove(user.id);
  }
});

bot.login(bot.config.token);
