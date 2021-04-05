# Fades Discord Bot
Простой бот, написанный при помощи DiscordJS.
Автоматически проверяет [коммиты S&box](https://commits.facepunch.com/r/sbox) и отправляет на канал.

# Для просмотра всех команд:
- `!help` -> Отображает все команды с их описаниями. 
- `!help 'команда'` -> Отображает описание и пример использования команды.

# Установка
Установите [node.js](https://nodejs.org/en/download/) или воспользуйтесь [Node Version Manager](https://github.com/nvm-sh/nvm).

Запустите команду `npm install` в папке с ботом и убедитесь, что она сработала.

Переименуйте файл `.env.example` в `.env` и настройте его, после чего настройте `config.json`.

Запустите команду `npm start` или `node app.js` для проверки бота!

# Немного о конфиге
- `commits_enabled` -> Включить/выключить проверку коммитов. (true/false).
- `commits_delay` -> Задержка проверки коммитов в секундах.

- `members_channel_id` -> ID канала дискорда для счётчика людей на сервере.
- `sbox_commits_channel_id` -> ID канала дискорда для отправки коммитов по S&box.

- `notify_roles` -> Роли, которые будут выдаваться при нажатии на эмодзи. Пример:
```json
"notify_roles": [
  {
    "emoji": "📰",
    "role_name": "general-news",
    "text": "📰 - Получить роль для обычных новостей."
  },
  {
    "emoji": "123456789012345678",
    "role_name": "sbox-news",
    "text": "<:emodji:123456789012345678> - Получить роль для новостей, связанных с S&box."
  }
]
```

# Присоединяйтесь к нам!
Присоединяйтесь к нашему сообществу на Discord сервере [Fades](https://discord.gg/ETrKUWmCN4)!