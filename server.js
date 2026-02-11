const http = require('http');
const app = require('./app'); // ייבוא האפליקציה שיצרנו בקובץ app.js

// Render מגדיר את הפורט במשתנה סביבה. אם הוא לא קיים, נשתמש ב-3000 לוקאלית.
const port = process.env.PORT || 3000;

const srv = http.createServer(app);

// הוספנו '0.0.0.0' כדי ש-Render יוכל לגשת לשרת מבחוץ
srv.listen(port, '0.0.0.0', () => {
    console.log(`Server is listening on port ${port}...`);
});