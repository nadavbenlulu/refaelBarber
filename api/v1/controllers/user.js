const user = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // <--- הוספנו את הספרייה

const obj = {
    getALLuser: (req, res) => {
        user.find().then((data) => {
            return res.status(200).json(data);
        });
    },

    addNewuser: (req, res) => {
        const uid = req.body.uid;
        user.find({ uid: uid }).then((data) => {
            if (data.length > 0) {
                return res.status(200).json({ message: `user id ${uid} already exist` });
            } else {
                user.create(req.body).then((use) => {
                    return res.status(200).json(use);
                });
            }
        });
    },

    adduserById: (req, res) => {
        user.create(req.body).then((use) => {
            return res.status(200).json(use);
        });
    },

    updateuserById: (req, res) => {
        const uid = req.params.id;
        user.updateOne({ uid }, req.body).then((use) => {
            return res.status(200).json(use);
        });
    },

    deleteuserById: (req, res) => {
        const uid = req.params.id;
        user.deleteOne({ uid }).then((use) => {
            return res.status(200).json(use);
        });
    },

    getuserbyid: (req, res) => {
        const id = req.params.id;
        user.find({ uid: id }).then((use) => {
            return res.status(200).json(use);
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;

        user.findOne({ email: email }).then((userData) => {
            if (!userData) {
                return res.status(401).json({ message: "משתמש לא קיים במערכת" });
            }

            bcrypt.compare(password, userData.password).then((isMatch) => {
                if (!isMatch) {
                    return res.status(401).json({ message: "סיסמה שגויה" });
                }

                // --- יצירת הטוקן לפי ההסבר של ירון לפידות ---
                const token = jwt.sign(
                    { email: userData.email, fullname: userData.fullname }, // תוכן להצפנה
                    process.env.PRIVATE_KEY, // מפתח פרטי מה-env
                    { expiresIn: '1h' } // אובייקט אפשרויות (תוקף לשעה)
                );

                // מחזירים את הטוקן למשתמש (במקום ה-redirect שהיה קודם)
                return res.status(200).json({
                    message: "התחברת בהצלחה!",
                    token: token
                });
                // ------------------------------------------
            });
        }).catch(err => res.status(500).json(err));
    },

    register: (req, res) => {
        const { email, password, fullname } = req.body;

        user.findOne({ email: email }).then((data) => {
            if (data) {
                return res.status(400).json({ message: "האימייל כבר רשום במערכת" });
            } else {
                bcrypt.hash(password, 10).then((hashPass) => {
                    const newUser = new user({
                        email: email,
                        password: hashPass,
                        fullname: fullname
                    });

                    newUser.save().then((savedUser) => {
                        return res.status(201).send("<h1>ההרשמה הצליחה!</h1><p>המשתמש נשמר בהצלחה.</p><a href='/'>חזור לדף הבית</a>");
                    });
                });
            }
        }).catch(err => res.status(500).json(err));
    },
}

module.exports = obj;