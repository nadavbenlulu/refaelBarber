const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// --- שלב 1: אבטחה והתחברות ---

// Middleware שבודק אם המנהל מחובר
const isAdmin = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// דף ההתחברות
router.get('/login', (req, res) => {
    res.render('admin-login', { layout: 'main' });
});

// בדיקת הסיסמה
router.post('/login', (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = "1234"; // רפאל, כאן תשנה לסיסמה שאתה רוצה

    if (password === ADMIN_PASSWORD) {
        req.session.isLoggedIn = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin-login', { error: 'סיסמה שגויה, נסה שוב', layout: 'main' });
    }
});

// יציאה מהמערכת
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// --- שלב 2: ניהול היומן ---

// דף הניהול הראשי - מתוקן
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        // משיכת תורים - אם אין תורים מחזיר מערך ריק []
        const appointments = await Appointment.find().sort({ date: 1, time: 1 }) || [];
        
        // משיכת זמינות - הגנה למקרה שהטבלה לא קיימת
        let availability = [];
        try {
            availability = await Availability.find() || [];
        } catch (e) {
            console.log("Availability table empty or not found");
        }

        res.render('admin-dashboard', { 
            appointments, 
            availability,
            layout: 'main' // וודא שזה השם של ה-layout שלך
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        // במקום לשלוח שגיאה 500, נציג דף ריק עם הודעה
        res.status(500).send('שגיאת שרת: וודא שכל המודלים מוגדרים נכון ב-Database');
    }
});

// חסימת או פתיחת יום עבודה
router.post('/toggle-day', isAdmin, async (req, res) => {
    const { date } = req.body;
    if (!date) return res.status(400).send('תאריך חסר');

    try {
        let day = await Availability.findOne({ date });
        if (day) {
            day.isClosed = !day.isClosed;
            await day.save();
        } else {
            await Availability.create({ date, isClosed: true });
        }
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('שגיאה בעדכון הזמינות');
    }
});

// מחיקת תור
router.post('/delete-appointment/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Appointment.findByIdAndDelete(id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('שגיאה במחיקת התור');
    }
});

module.exports = router;