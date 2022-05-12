const postgres = require("postgres")

const sql = postgres({ host:"127.0.0.1",port:5432,database:"postgres",user:"postgres",pass:"password" })


module.exports = sql