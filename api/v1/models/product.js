const mongoose=require('mongoose');

const Schema= new mongoose.Schema({
    pid:Number,
    price:Number,
    pname:String,
    picname:String
});
module.exports=mongoose.model('product',Schema)

// const Product= new mongoose.model('products',productSchema);
// //מבצעים חיפושים של כל המוצרים בטבלת מוצרים ומדפיסים אותם 
// Product.find({pid:{$gt:3}},{pid:1,price:1,_id:0}).then( (product)=>{
//     console.log(product);
// });