const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// --- שלב 1: אבטחה והתחברות ---

// Middleware שבודק אם המנהל מחובר
const isAdmin = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        next(); // המנהל מחובר, המשך הלאה
    } else {
        res.redirect('/admin/login'); // לא מחובר? לך לדף התחברות
    }
};

// דף ההתחברות (יוצג כשנבנה את שלב 2)
router.get('/login', (req, res) => {
    res.render('admin-login', { layout: 'main' });
});

// בדיקת הסיסמה של רפאל
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

// --- שלב 2: ניהול היומן (מוגן עכשיו ב-isAdmin) ---

// דף הניהול הראשי - רק למנהל מחובר
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ date: 1, time: 1 });
        const availability = await Availability.find();
        res.render('admin-dashboard', { appointments, availability });
    } catch (err) {
        console.error(err);
        res.status(500).send('שגיאת שרת בטעינת הדאשבורד');
    }
});

// חסימת או פתיחת יום עבודה (מוגן)
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

// מחיקת תור (מוגן)
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