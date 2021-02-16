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
- `commits_delay` -> Задерка проверки коммитов в секундах.

- `lvl_base_xp` -> Начальный максимальный опыт у первого уровня.
- `lvl_xp_step` -> Поднятие максимального опыта по мере повышения уровней.

- `members_channel_id` -> ID канала дискорда для счётчика людей на сервере.
- `novices_channel_id` -> ID канала дискорда для приветствия новых участников.
- `sbox_commits_channel_id` -> ID канала дискорда для отправки коммитов по S&box.

# Присоединяйтесь к нам!
Присоединяйтесь к нашему сообществу на Discord сервере [Fades](https://discord.gg/ETrKUWmCN4)!