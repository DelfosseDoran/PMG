import knex ,{Knex} from 'knex'
require('dotenv').config();

const db = knex({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT?parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    log: {
        warn(message) { console.warn(message)},
        error(message) { console.error(message) },
        deprecate(message) { console.log(message)},
        debug(message) { console.debug(message)},
    },
})

export default db