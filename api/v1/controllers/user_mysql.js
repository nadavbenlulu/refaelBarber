//const { use } = require("react");
const user = require("../models/user");
const mysql = require('mysql2');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'nadav',
  password : '1234',
  database : 'ecommdb'
});
 
connection.connect((err)=>{
    if (err==null)
        console.log('good MySql connection')
    else
        console.log(err);
});
const obj={
getALLuser:(req,res)=>{
      let sql="select* from t_user ";
connection.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);
      });
    },
    addNewuser:(req,res)=>{
     const uid = req.body.uid;
  let sql = `INSERT INTO t_user (uid, username, password)
             VALUES ('${use.uid}', '${use.username}', '${use.password}')`;
  connection.promise()
    .query(sql)
    .then((results) => {
      return res.status(200).json(results[0]);
         });
       },
    adduserById:  (req,res)=>{
 const uid=req.params.id;
      User.insertOne(req.body).then((use)=>{
         return res.status(200).json(use);
      });
    },    
    updateuserById: (req,res)=>{
        const uid=req.params.id;
               const use=req.body;
       let sql=`update t_user set uid='${use.uid}',username= ${use.username},password'${use.password} where pid=${pid}`;
connection.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);;
             });

},
deleteuserById: (req,res)=>{
     const uid=req.params.id;
           let sql=`delete  from t_user where pid=${pid} `;
connection.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);
          });
      
    } ,
    getuserbyid: (req,res)=>{
      const id=req.params.id;
        let sql=`select* from t_user where pid=${pid} `;
   connection.promise().query(sql).then((results)=>{
         return res.status(200).json(results[0]);
          });
    
    } ,
}
module.exports=obj