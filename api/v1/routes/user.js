const express=require('express');
const router = express.Router();
const usercontroller=require('../controllers/user');
const auth = require('../middelwares/auth');
// const{login,register}=require('../controllers/user');
const{getALLuser,
    addNewuser,
    getuserbyid,
    updateuserById,
    deleteuserById,
    login,
    register
    
}=require('../controllers/user');

// נקודת קצה לשליפת כל המוצרים 
router.get('/',usercontroller.getALLuser);   //הגדרת נקודת קצה שאמורה להחזיר את כל המוצרים
router.get('/:id',usercontroller.adduserById);
//נקודת קצה להוספת מוצר חדש
router.post("/",usercontroller.addNewuser); 
// נקודת קצה לעדכון מוצר קיים 
router.put('/',usercontroller.updateuserById);
   router.delete('/',usercontroller.deleteuserById);
   router.post('/login',login);//נקודת קצה להתחברות 
   router.post('/register',register);//נקודת קצה להרשמה 


    module.exports=router;