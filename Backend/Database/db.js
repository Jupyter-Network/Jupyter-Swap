const postgres = require("postgres")
const CONST = require("./CONST.json")
const sql = postgres({ host:CONST.DATABASE,port:5432,database:"postgres",user:"postgres",pass:"password" })


module.exports = sql