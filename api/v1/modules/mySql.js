const mysql = require('mysql2');
const pool = mysql.createPool({//יצירת אובייקט של מספר חיבורים לבסיס הנתונים בדומה לרכזיה עם מספר קווים 
  host     : process.env.MYSQL_SERVER,
  user     : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASS,
  database : process.env.MYSQL_DB,
  waitForConnections:true,
  connectionLimit:10,
  queueLimit:0
});
// connection.connect((err)=>{
//     if (err==null)
//         console.log('good MySql connection')
//     else
//         console.log(err);
// });
module.exports= pool;