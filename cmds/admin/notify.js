const fs = require("fs");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "notify",
  description: "Команда для выдачи ролей для уведомлений. Только для админов.",
  category: "Выдача ролей",
  execute(message) {
    const config = message.client.config;

    const author = message.guild.members.cache.get(message.author.id);
    if (!author.hasPermission(["ADMINISTRATOR"])) {
      message.reply("У вас нет прав на использование этой команды.");
      return;
    }

    message.delete();

    let description = "";
    for (let i = 0; i < config.notify.roles.length; i++) {
      const el = config.notify.roles[i];
      description += (el.text + "\n");
    }

    const embed = new MessageEmbed()
      .setTitle(`${config.notify.titleEmoji ? config.notify.titleEmoji + " " : ""}` + this.category)
      .setDescription(description)
      .setColor("#A1A1A1");

    message.channel.send(embed)
      .then(msg => {
        message.client.config.notify.messageId = msg.id;
        fs.writeFile("./config.json", JSON.stringify(message.client.config, null, "\t"), err => {
          if (err) console.error(err);
        });

        for (let i = 0; i < config.notify.roles.length; i++) {
          const el = config.notify.roles[i];
          msg.react(el.emoji).catch(console.error);
        }
      })
      .catch(console.error);
  },
};
