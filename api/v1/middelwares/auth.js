const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // 1. חילוץ הטוקן מה-Header של הבקשה
        //   Bearer <TOKEN>
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: "לא נשלח טוקן, הגישה חסומה" });
        }

        // פיצול המחרוזת כדי לקחת רק את הטוקן (החלק השני אחרי הרווח)
        const token = authHeader.split(' ')[1];

        // 2. אימות הטוקן באמצעות המפתח הסודי שלנו
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY);

        // 3. שמירת פרטי המשתמש המפוענחים בתוך האובייקט req לשימוש בהמשך
        req.user = decoded;

        next();

    } catch (error) {
        // אם הטוקן לא תקין או פג תוקפו, תתבצע קפיצה לכאן
        return res.status(401).json({ message: "אימות נכשל: טוקן לא תקין" });
    }
};