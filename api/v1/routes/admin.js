const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// --- שלב 1: אבטחה והתחברות ---

const isAdmin = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

router.get('/login', (req, res) => {
    res.render('admin-login', { layout: 'main' });
});

router.post('/login', (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = "1234"; 

    if (password === ADMIN_PASSWORD) {
        req.session.isLoggedIn = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin-login', { error: 'סיסמה שגויה, נסה שוב', layout: 'main' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// --- שלב 2: ניהול היומן ---

router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        // הוספנו .lean() כדי שהנתונים יוצגו ב-Handlebars
        const appointments = await Appointment.find().sort({ date: 1, time: 1 }).lean() || [];
        
        let availability = [];
        try {
            availability = await Availability.find().lean() || [];
        } catch (e) {
            console.log("Availability table empty or not found");
        }

        res.render('admin-dashboard', { 
            appointments, 
            availability,
            layout: 'main'
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).send('שגיאת שרת בטעינת הנתונים');
    }
});

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