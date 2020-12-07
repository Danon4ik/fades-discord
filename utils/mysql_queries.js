const { lvl_base_xp, lvl_xp_step } = require('../config.json');
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME 
});

if (pool) console.log('Успешное создание пула соединений MySQL!');

const createTables = `
  CREATE TABLE IF NOT EXISTS \`level_system\` (
    \`discord_id\` bigint(20) NOT NULL,
    \`lvl\` int(10) DEFAULT 1,
    \`max_xp\` int(10) DEFAULT 1,
    \`user_xp\` int(10) DEFAULT 0,
    PRIMARY KEY (\`discord_id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

function Init() {
  pool.query(createTables, err => {
    if (err) throw err;
    console.log('Таблицы в базе данных были успешно созданы!');
  });
}

function initUser(discord_id) {
  let query = `
    INSERT INTO level_system (discord_id, max_xp)
    VALUES(${discord_id}, ${lvl_base_xp})
    ON DUPLICATE KEY UPDATE discord_id = discord_id;
  `;

  pool.query(query, err => {
    if (err) throw err;
    console.log(`Участник '${discord_id}' был добавлен в базу данных!`);
  });
}

function initUsers(discord_ids) {
  let query = 'INSERT INTO level_system (discord_id, max_xp) VALUES ';
  for (let i = 0; i < discord_ids.length; i++) {
    const id = discord_ids[i];
    
    const comma = (i < discord_ids.length - 1) ? ',' : ' ON DUPLICATE KEY UPDATE discord_id = discord_id;';
    query = query.concat([`(${id}, ${lvl_base_xp})${comma}`]);
  }

  pool.query(query, err => {
    if (err) throw err;
  });
}

function addLevel(discord_id, add) {
  pool.query(`SELECT * FROM level_system WHERE discord_id = ${discord_id}`, (err, rows) => {
    if (err) throw err;

    if (rows.length === 0) {
      initUser(discord_id);
    } else {
      let add_lvl = rows[0].lvl + add;
      let lvl = add_lvl > 1 ? add_lvl : 1;
      let max_xp = lvl_base_xp + lvl_xp_step * (lvl - 1);

      let query = `
        UPDATE level_system
        SET lvl = ${lvl},
            max_xp = ${max_xp},
            user_xp = 0
        WHERE discord_id = ${discord_id};
      `;

      pool.query(query, err => {
        if (err) throw err;
      });
    }
  });
}

function addXP(discord_id, add, callback) {
  pool.query(`SELECT * FROM level_system WHERE discord_id = ${discord_id}`, (err, rows) => {
    if (err) throw err;

    if (rows.length === 0) {
      initUser(discord_id);
    } else {
      let add_xp = rows[0].user_xp + add;
      let user_xp = add_xp > 0 ? add_xp : 0;
      let lvl = rows[0].lvl;
      let max_xp = rows[0].max_xp;

      if (add_xp >= max_xp) {
        user_xp = 0;
        lvl = rows[0].lvl + 1;
        max_xp = lvl_base_xp + lvl_xp_step * (lvl - 1);
        callback(lvl, max_xp, user_xp);
      }

      let query = `
        UPDATE level_system
        SET user_xp = ${user_xp},
            lvl = ${lvl},
            max_xp = ${max_xp}
        WHERE discord_id = ${discord_id};
      `;

      pool.query(query, err => {
        if (err) throw err;
      });
    }
  });
}

function getUserLevel(discord_id, callback) {
  let data = { discord_id: discord_id, lvl: 1, max_xp: lvl_base_xp, user_xp: 0 };

  pool.query(`SELECT * FROM level_system WHERE discord_id = ${discord_id}`, (err, rows) => {
    if (err) throw err;

    if (rows.length === 0) {
      initUser(discord_id);
    } else {
      data.lvl = rows[0].lvl;
      data.max_xp = rows[0].max_xp;
      data.user_xp = rows[0].user_xp;
    }

    callback(data);
  });
}

module.exports = {
  Init: Init,
  initUser: initUser,
  initUsers: initUsers,
  addLevel: addLevel,
  addXP: addXP,
  getUserLevel: getUserLevel
}