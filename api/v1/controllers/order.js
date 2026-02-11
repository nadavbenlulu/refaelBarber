const mongoose=require('mongoose');
const order = require('../models/order');
const obj={
getALLorder:(req,res)=>{
   order.find().then((data)=>{
         return res.status(200).json(data);
      });
       
    },
    addNeworder:(req,res)=>{
     const pid = req.body.pid;
     order.find({ pid: pid }).then((data) => {
       if (data.length > 0) {
         return res
           .status(200)
           .json({ message: `order id ${pid} already exist` });
       } else {
         order.insertOne(req.body).then((ord) => {
           return res.status(200).json(ord);
         });
       }
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
          order.updateOne({pid},req.body).then((ord)=>{
             return res.status(200).json(ord);
          });
},

deleteorderById: (req,res)=>{
      const pid=req.params.id;
          order.deleteOne({pid}).then((ord)=>{
             return res.status(200).json(ord);
          });
    } ,

    getorderbyid: (req,res)=>{
       const id=req.params.id;
          order.find({pid:id}).then((ord)=>{
             return res.status(200).json(ord);
          });
     
    } ,
}
module.exports=obj