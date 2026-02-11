const bcrypt=require('bcrypt');

const pass="abc123";
const saltRounds=10;
bcrypt.hash(pass.saltRounds).then((hashPass)=>{
    console.log(hashPass);
});

// const hashPass=
// bcrypt.compare(pass,hashPass).then((status)=>{
//     console.log(status);
// });
/// עדיין לא השתמשתיי