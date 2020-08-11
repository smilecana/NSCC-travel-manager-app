let sqlite3 = require('sqlite3');
let knex = require('knex')({
    client: "sqlite3",
    connection: {
      filename: path.join('app', 'data/winedb.db')
    },
    useNullAsDefault: true
  });