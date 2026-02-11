const express=require('express');
const router = express.Router();
const ordercontroller=require('../controllers/order');
const{getALLorder,
    addNeworder,
    getorderbyid,
    updateorderById,
    deleteorderById
    
}=require('../controllers/order');

// נקודת קצה לשליפת כל המוצרים 
router.get('/',ordercontroller.getALLorder);   //הגדרת נקודת קצה שאמורה להחזיר את כל המוצרים
router.get('/:id',ordercontroller.addorderById);
//נקודת קצה להוספת מוצר חדש
router.post("/",ordercontroller.addNeworder); 
// נקודת קצה לעדכון מוצר קיים 
router.put('/',ordercontroller.updateorderById);
   router.delete('/',ordercontroller.deleteorderById);


    module.exports=router;
