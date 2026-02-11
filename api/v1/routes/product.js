const express=require('express');
const router = express.Router();
const prodcutsconteoller=require('../controllers/product');
// const{getALLProduct,
//     addNewProduct,
//     getproductbyid,
//     updateProductById,
//     deleteProductById
    
// }=require('../controllers/product');

// נקודת קצה לשליפת כל המוצרים 
router.get('/',prodcutsconteoller.getALLProduct);   //הגדרת נקודת קצה שאמורה להחזיר את כל המוצרים
router.get('/:id',prodcutsconteoller. getproductbyid);
//נקודת קצה להוספת מוצר חדש
router.post("/",prodcutsconteoller.addNewProduct); 
// נקודת קצה לעדכון מוצר קיים 
router.put('/',prodcutsconteoller.updateProductById);
   router.delete('/',prodcutsconteoller.deleteProductById);


    module.exports=router;