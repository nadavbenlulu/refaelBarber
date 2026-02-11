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
        const appointments = await Appointment.find().sort({ date: 1, time: 1 }).lean() || [];
        
        let availability = [];
        try {
            // מושך את כל הגדרות הזמינות (גם ימים סגורים וגם שעות חסומות)
            availability = await Availability.find().sort({ date: 1 }).lean() || [];
        } catch (e) {
            console.log("Availability table issue:", e);
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

// חסימת או פתיחת יום עבודה מלא
router.post('/toggle-day', isAdmin, async (req, res) => {
    const { date } = req.body;
    if (!date) return res.status(400).send('תאריך חסר');

    try {
        const existingDay = await Availability.findOne({ date });

        if (existingDay) {
            // אם היה קיים, נמחק אותו (זה יפתח גם את היום וגם ינקה שעות חסומות ביום זה)
            await Availability.deleteOne({ date });
        } else {
            // אם לא קיים, נחסום את כל היום
            await Availability.create({ date, isClosed: true, closedSlots: [] });
        }

        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Toggle Day Error:", err);
        res.status(500).send('שגיאה בעדכון הזמינות');
    }
});

// חסימת או פתיחת שעה ספציפית - חדש!
router.post('/toggle-slot', isAdmin, async (req, res) => {
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).send('נתונים חסרים');

    try {
        let day = await Availability.findOne({ date });

        if (day) {
            // אם השעה כבר חסומה - נסיר אותה מהרשימה
            if (day.closedSlots.includes(time)) {
                day.closedSlots = day.closedSlots.filter(slot => slot !== time);
            } else {
                // אם השעה לא חסומה - נוסיף אותה
                day.closedSlots.push(time);
            }
            
            // אם היום לא סגור לגמרי וגם אין יותר שעות חסומות, אפשר למחוק את הרשומה
            if (!day.isClosed && day.closedSlots.length === 0) {
                await Availability.deleteOne({ _id: day._id });
            } else {
                await day.save();
            }
        } else {
            // אם היום לא קיים בטבלה, ניצור רשומה חדשה עם השעה החסומה
            await Availability.create({ 
                date, 
                isClosed: false, 
                closedSlots: [time] 
            });
        }

        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Toggle Slot Error:", err);
        res.status(500).send('שגיאה בעדכון השעה');
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