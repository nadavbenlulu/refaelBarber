// const mongoose=require('mongoose');
const Product=require('../models/product');
const mySqlDB=require('../modules/mySql');
const obj={
getALLProduct:(req,res)=>{
   let sql="select* from t_product ";
mySqlDB.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);
});
   },
  addNewProduct: (req, res) => {
  const prod = req.body;

  let sql = `INSERT INTO t_product (pname, price, pdesc, picname)
             VALUES ('${prod.pname}', '${prod.price}', '${prod.pdesc}', '${prod.picname}')`;

  mySqlDB.promise()
    .query(sql)
    .then((results) => {
      return res.status(200).json(results[0]);
    });
},

    addProductById:  (req,res)=>{
       const pid=req.params.id;
   Product.insertOne(req.body).then((prod)=>{
            return res.status(200).json(prod);
      });
    },   
    
    

    updateProductById:(req,res)=>{
      const pid=req.params.id;
      const prod=req.body;
       let sql=`update t_product set pname='${prod.pname}',price= ${prod.price} where pid=${pid}`;
mySqlDB.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);
      });
        
   },

//חדש
deleteProductById:(req,res)=>{
      const pid=req.params.id;
         let sql=`delete  from t_product where pid=${pid} `;
mySqlDB.promise().query(sql).then((results)=>{
    return res.status(200).json(results[0]);
      })
    } ,

    //חדש קוד 
    getproductbyid: (req,res)=>{
      const id=req.params.id;
   let sql=`select* from t_product where pid=${pid} `;
   mySqlDB.promise().query(sql).then((results)=>{
         return res.status(200).json(results[0]);
      });
    },
  }

module.exports=obj