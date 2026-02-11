const mongoose=require('mongoose');
const Category=require('../models/category');

const obj={
getALLcategory:(req,res)=>{
   Category.find().then((data)=>{
      return res.status(200).json(data);
   })
    },
    addNewcategory:
 (req, res) => {
  const cid = req.body.cid;
//לפני הוספת מוצר חדש נבדוק האם קיים מוצר אם אותו קוד מוצר
  Category.find({ cid: cid }).then((data) => {
    if (data.length > 0) {
      return res
        .status(200)
        .json({ message: `category id ${cid} already exist` });
    } else {
      Category.insertOne(req.body).then((cat) => {
        return res.status(200).json(cat);
      });
    }
  });

    },
    addcategoryById:  (req,res)=>{
 const cid=req.params.id;
      Category.insertOne(req.body).then((cat)=>{
         return res.status(200).json(cat);
      });
    },    
    updatecategoryById: (req,res)=>
 {
        const cid=req.params.id;
              Category.updateOne({cid},req.body).then((cat)=>{
                 return res.status(200).json(cat);
              })   
},
deletecategoryById: (req,res)=>{
    const cid=req.params.id;
          Category.deleteOne({cid}).then((cat)=>{
             return res.status(200).json(cat);
          });
    } ,
    getcategorybyid: (req,res)=>{
     const id=req.params.id;
          Category.find({cid:id}).then((cat)=>{
             return res.status(200).json(cat);
          })
      
    } ,
}
module.exports=obj