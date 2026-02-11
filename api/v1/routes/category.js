const express=require('express');
const router = express.Router();
const categoryconteoller=require('../controllers/category');
const{getALLcategory,
    addNewcategory,
    getcategorybyid,
    updatecategoryById,
    deletecategoryById
    
}=require('../controllers/category');

// נקודת קצה לשליפת כל המוצרים 
router.get('/',categoryconteoller.getALLcategory);   //הגדרת נקודת קצה שאמורה להחזיר את כל המוצרים
router.get('/:id',categoryconteoller.addcategoryById);
//נקודת קצה להוספת מוצר חדש
router.post("/",categoryconteoller.addNewcategory); 
// נקודת קצה לעדכון מוצר קיים 
router.put('/',categoryconteoller.updatecategoryById);
   router.delete('/',categoryconteoller.deletecategoryById);


    module.exports=router;