require('dotenv').config()

const config = require('./config.json')
const query = require('./utils/mysql_queries')
const { randomInt } = require('./utils/functions')

const fs = require('fs')
const { join } = require('path')
const fetch = require('node-fetch')
const { Client, Collection, MessageEmbed } = require('discord.js')

const bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

bot.commands = new Collection()
bot.prefix = config.prefix

const cmds = fs.readdirSync('./cmds')
const cmdFiles = cmds.filter(item => item.endsWith('.js'))
const cmdFolders = cmds.filter(item => {
  const path = join(__dirname, `cmds/${item}`)
  return fs.lstatSync(path).isDirectory()
})

for (const file of cmdFiles) {
  const path = join(__dirname, `cmds/${file}`)
  const cmd = require(path)

  bot.commands.set(cmd.name, cmd)
  console.log(`Команда '${cmd.name}' загружена успешно!`)
}

for (const folder of cmdFolders) {
  const path = join(__dirname, `cmds/${folder}`)
  const cmdFolder = fs.readdirSync(path).filter(file => file.endsWith('.js'))

  for (const file of cmdFolder) {
    const cmdPath = join(path, file)
    const cmd = require(cmdPath)

    bot.commands.set(cmd.name, cmd)
    console.log(`Команда '${folder}/${cmd.name}' загружена успешно!`)
  }
}

bot.on('ready', () => {
  bot.user.setPresence({ activity: { name: 'fades.pw', type: 'WATCHING' }, status: 'online' })
  console.log(`Бот запущен как ${bot.user.tag}`)

  query.Init()
  
  if (config.commits_enabled) {
    setInterval(() => {
      const commits_msg = require('./commits_msg.json')

      fetch('https://commits.facepunch.com/r/sbox?format=json').then(res => {
        if (!res.ok) throw Error(res.statusText)
        return res
      }).then(res => {
        return res.json()
      }).then(data => {
        const commits_channel = bot.channels.cache.get(config.sbox_commits_channel_id)
        if (!commits_channel) return

        const commits_data = data.results
        for (let i = commits_data.length - 1; i >= 0; i--) {
          const commit = commits_data[i]
          if (commits_msg.sbox_commits.includes(commit.id)) continue

          const embed = new MessageEmbed()
            .setColor('#85107f')
            .setTitle(`${commit.repo}/${commit.branch}#${commit.changeset}`)
            .setAuthor(`${commit.user.name}`, `${commit.user.avatar}`)
            .setURL(`https://commits.facepunch.com/${commit.id}`)
            .setDescription(`\`\`\`${commit.message}\`\`\``)
            .setTimestamp()

          commits_channel.send({embed})
        }

        const temp_sbox_commits = []
        for (let i = 0; i < commits_data.length; i++) {
          const commit = commits_data[i]
          temp_sbox_commits[i] = commit.id
        }

        if (temp_sbox_commits !== commits_msg.sbox_commits) {
          commits_msg.sbox_commits = temp_sbox_commits
          fs.writeFile('./commits_msg.json', JSON.stringify(commits_msg), err => {
            if (err) console.log(err)
          })
        }
      }).catch(console.error)
    }, config.commits_delay * 1000)
  }
})

bot.on('message', msg => {
  if (!msg.content.startsWith(bot.prefix) || msg.author.bot) return

  const args = msg.content.slice(bot.prefix.length).trim().split(/ +/)
  const command = args.shift().toLowerCase()

  if (!bot.commands.has(command)) return
  try {
    bot.commands.get(command).execute(msg, args)
  } catch (err) {
    msg.reply('Произошла ошибка при обработке команды!')
    console.error(err)
  }
})

bot.on('message', msg => {
  if (msg.content.startsWith(bot.prefix) || msg.author.bot) return

  const random = randomInt(1, 3)
  query.addXP(msg.author.id, random, (lvl, max_xp, user_xp) => {
    const desc = `Новый уровень: ${lvl}\n`
      + `Ваш опыт: ${user_xp} / ${max_xp} xp\n`
      + `До следующего уровня: ${max_xp - user_xp} xp`

    const embed = new MessageEmbed()
      .setTitle(':tada: Вы поднялись на новый уровень!')
      .setColor('#85107F')
      .setDescription(desc)

    msg.author.send(embed).catch(console.error)
  })
})

bot.on('guildMemberAdd', member => {  
  const channel = bot.channels.cache.get(config.novices_channel_id)
  if (!channel) return

  const phrase = config.phrases_join[Math.floor(Math.random() * config.phrases_join.length)]
  const embed = new MessageEmbed()
    .setTitle('<:fadewow:559185624209293324> Присоединение на сервер')
    .setDescription(`${member} ${phrase}`)  
    .setColor('#32F032')
    .setTimestamp()

  channel.send({embed})
})

bot.on('guildMemberAdd', member => {
  const channel = bot.channels.cache.get(config.members_channel_id)
  if (!channel) return
  
  query.initUser(member.id)
  channel.setName(`Участники: ${member.guild.memberCount}`)
})

bot.on('guildMemberRemove', member => {  
  const channel = bot.channels.cache.get(config.members_channel_id)
  if (!channel) return

  channel.setName(`Участники: ${member.guild.memberCount}`)
})

bot.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return

  if (reaction.partial) {
    try {
      await reaction.fetch()
    } catch (err) {
      console.error('Что-то пошло не так при получении сообщения', err)
      return
    }
  }

  const message = reaction.message

  const notifyMessageID = require('./notify.json')
  if (notifyMessageID === '') return
  if (notifyMessageID !== message.id) return
  
  const temp_reactions = []
  for (let i = 0; i < config.notify_roles.length; i++) {
    const el = config.notify_roles[i]
    temp_reactions.push(el.emoji)
  }

  if (temp_reactions.includes(reaction.emoji.id) || temp_reactions.includes(reaction.emoji.name)) {
    if (!message.guild) return
    const userToRole = message.guild.members.cache.find(member => member.id === user.id)

    let notify_role
    for (let i = 0; i < config.notify_roles.length; i++) {
      const el = config.notify_roles[i]
      if (el.emoji === reaction.emoji.name || el.emoji === reaction.emoji.id) {
        notify_role = message.guild.roles.cache.find(role => role.name === el.role_name)
        break
      }
    }

    if (!notify_role) return
    
    try {
      if (userToRole.roles.cache.some(role => role.name === notify_role.name)) {
        await userToRole.roles.remove(notify_role)
        await userToRole.send(`:x: Вы отписались от ${notify_role.name}`)
      } else {
        await userToRole.roles.add(notify_role)
        await userToRole.send(`:white_check_mark: Вы подписались на ${notify_role.name}`)
      }
    } catch (err) {
      console.error('Что-то пошло не так при выдачи роли', err)
    }

    await reaction.users.remove(user.id)
  }
})

bot.login(process.env.BOT_TOKEN)
