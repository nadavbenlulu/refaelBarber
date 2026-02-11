const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// --- משתנה גלובלי זמני לשעות פעילות (מומלץ בעתיד להעביר למסד נתונים) ---
let globalWorkingHours = { open: "09:00", close: "20:00" };

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
            availability = await Availability.find().sort({ date: 1 }).lean() || [];
        } catch (e) {
            console.log("Availability table issue:", e);
        }

        res.render('admin-dashboard', { 
            appointments, 
            availability,
            workingHours: globalWorkingHours, // שליחת שעות הפעילות לדף
            layout: 'main'
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).send('שגיאת שרת בטעינת הנתונים');
    }
});

// עדכון שעות פתיחה וסגירה קבועות
router.post('/update-working-hours', isAdmin, (req, res) => {
    const { openTime, closeTime } = req.body;
    if (openTime && closeTime) {
        globalWorkingHours.open = openTime;
        globalWorkingHours.close = closeTime;
    }
    res.redirect('/admin/dashboard');
});

// חסימת טווח שעות (חדש!)
router.post('/block-range', isAdmin, async (req, res) => {
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) return res.status(400).send('נתונים חסרים');

    try {
        // פונקציה ליצירת חצאי שעות בטווח
        const generateSlots = (start, end) => {
            const slots = [];
            let curr = new Date(`2024-01-01 ${start}`);
            const stop = new Date(`2024-01-01 ${end}`);
            
            while (curr < stop) {
                slots.push(curr.toLocaleTimeString('he-IL', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: false 
                }));
                curr.setMinutes(curr.getMinutes() + 30);
            }
            return slots;
        };

        const slotsToBlock = generateSlots(startTime, endTime);

        await Availability.findOneAndUpdate(
            { date: date },
            { $addToSet: { closedSlots: { $each: slotsToBlock } } }, // מוסיף רק שעות שלא קיימות
            { upsert: true }
        );

        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Block Range Error:", err);
        res.status(500).send('שגיאה בחסימת הטווח');
    }
});

// חסימת או פתיחת יום עבודה מלא
router.post('/toggle-day', isAdmin, async (req, res) => {
    const { date } = req.body;
    if (!date) return res.status(400).send('תאריך חסר');

    try {
        const existingDay = await Availability.findOne({ date });
        if (existingDay && existingDay.isClosed) {
            await Availability.deleteOne({ date });
        } else {
            // אם היה קיים רק כשעות חסומות, נעדכן אותו ליום סגור מלא
            await Availability.findOneAndUpdate(
                { date }, 
                { isClosed: true, closedSlots: [] }, 
                { upsert: true }
            );
        }
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Toggle Day Error:", err);
        res.status(500).send('שגיאה בעדכון הזמינות');
    }
});

// מחיקת תור (סיום טיפול)
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