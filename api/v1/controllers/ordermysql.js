//const mongoose=require('mongoose');
const order = require('../models/order');
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
getALLorder:(req,res)=>{
    let sql="select* from t_order ";
connection.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);
      });  
    },
    addNeworder:(req,res)=>{
     const pid = req.body;
  let sql = `INSERT INTO t_order (pname, totalprice, odate)
             VALUES ('${ord.pname}', '${ord.totalprice}', '${ord.odate}')`;

  connection.promise()
    .query(sql)
    .then((results) => {
      return res.status(200).json(results[0]);
         });
       },
    
    addorderById:  (req,res)=>{
 const pid=req.params.id;
      order.insertOne(req.body).then((ord)=>{
         return res.status(200).json(ord);
      });
    },    

    updateorderById: (req,res)=>{
   const pid=req.params.id;
        const ord=req.body;
       let sql=`update t_order set pname='${ord.pname}',totalprice= ${ord.totalprice} where pid=${pid}`;
connection.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);
          });
},

deleteorderById: (req,res)=>{
      const pid=req.params.id;
                let sql=`delete  from t_order where pid=${pid} `;
connection.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);
          });
    } ,

    getorderbyid: (req,res)=>{
       const id=req.params.id;
      let sql=`select* from t_order where pid=${pid} `;
   connection.promise().query(sql).then((results)=>{
         return res.status(200).json(results[0]);
          });
     
    } ,
}
module.exports=obj