const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  description: "Отображает все команды с их описаниями.",
  category: "Разное",
  args: [
    { name: "command", description: "Команда, о которой вы хотите посмотреть подробную информацию.", required: false }
  ],
  execute(message, args) {
    const commands = message.client.commands.array();
    const arg = args[0] ?? false;

    if (!arg) {
      const fields = {};
      const embed = new MessageEmbed()
        .setTitle("Список всех команд")
        .setColor("#85107F")
        .setDescription("Ниже приведен список всех команд с их описаниями.");

      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];

        if (!fields[cmd.category]) fields[cmd.category] = "";
        fields[cmd.category] += `\`${cmd.name}\` - ${cmd.description}\n`;
      }

      Object.entries(fields).forEach(([key, value]) => embed.addField(key, value));
      message.channel.send(embed).catch(console.error);

      return;
    }

    let command;
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (cmd.name === arg) {
        command = cmd;
        break;
      }
    }

    if (!command) {
      message.reply("Такой команды не существует!");
      return;
    }

    let desc = `**Описание:** ${command.description}`;
    if (command.args && command.args.length > 0) {
      desc += `\n**Аргументы:**\n`;
      command.args.map((arg, index) => { desc += `${index + 1}. \`${arg.name}\` - ${arg.description}`; });
    } else {
      desc += "\n**У команды нет аргументов.**";
    }

    const embed = new MessageEmbed()
      .setTitle(`Команда - ${command.name}`)
      .setColor("#85107F")
      .setDescription(desc);

    message.channel.send(embed).catch(console.error);
  }
};
