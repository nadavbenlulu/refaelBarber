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
        
        // שליפת חסימות - מחפש כל מה שאינו הגדרות (isSettings לא true)
        const availabilityData = await Availability.find({ isSettings: { $ne: true } }).sort({ date: 1 }).lean();
        
        // עיבוד הנתונים לתצוגה חלקה ב-Handlebars
        const availability = availabilityData.map(item => ({
            _id: item._id,
            date: item.date,
            isClosed: item.isClosed || false,
            closedSlots: item.closedSlots || []
        }));

        console.log("Found Availabilities to display:", availability.length);

        // מושך את הגדרות שעות הפעילות
        const settings = await Availability.findOne({ isSettings: true }).lean();
        const workingHours = settings ? settings.workingHours : { open: "09:00", close: "20:00" };

        res.render('admin-dashboard', { 
            appointments, 
            availability, 
            workingHours, 
            layout: 'main'
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).send('שגיאת שרת בטעינת הנתונים');
    }
});

// אישור תור
router.post('/confirm-appointment/:id', isAdmin, async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, { status: 'confirmed' });
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Confirm Appointment Error:", err);
        res.status(500).send("שגיאה באישור התור");
    }
});

// עדכון שעות פתיחה וסגירה קבועות
router.post('/update-working-hours', isAdmin, async (req, res) => {
    const { openTime, closeTime } = req.body;
    try {
        await Availability.findOneAndUpdate(
            { isSettings: true }, 
            { workingHours: { open: openTime, close: closeTime }, isSettings: true }, 
            { upsert: true, new: true }
        );
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Update Hours Error:", err);
        res.status(500).send("שגיאה בעדכון השעות");
    }
});

// חסימת טווח שעות
router.post('/block-range', isAdmin, async (req, res) => {
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) return res.status(400).send('נתונים חסרים');

    try {
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

        // עדכון/יצירה של חסימה עם הגדרה מפורשת שזה לא רשומת הגדרות
        await Availability.findOneAndUpdate(
            { date: date, isSettings: { $ne: true } },
            { 
                $addToSet: { closedSlots: { $each: slotsToBlock } },
                $set: { isSettings: false } // מבטיח שזה יופיע ברשימה
            },
            { upsert: true, new: true }
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
    try {
        const existingDay = await Availability.findOne({ date, isSettings: { $ne: true } });
        
        if (existingDay && existingDay.isClosed) {
            // אם היום כבר סגור - פותחים אותו (מוחקים את החסימה)
            await Availability.deleteOne({ _id: existingDay._id });
        } else {
            // אם לא סגור - סוגרים אותו
            await Availability.findOneAndUpdate(
                { date, isSettings: { $ne: true } }, 
                { isClosed: true, closedSlots: [], isSettings: false }, 
                { upsert: true, new: true }
            );
        }
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Toggle Day Error:", err);
        res.status(500).send('שגיאה בעדכון הזמינות');
    }
});

// מחיקת חסימה (כפתור הפח ברשימה)
router.post('/delete-availability/:id', isAdmin, async (req, res) => {
    try {
        await Availability.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error("Delete Availability Error:", err);
        res.status(500).send("שגיאה במחיקת החסימה");
    }
});

// מחיקת תור
router.post('/delete-appointment/:id', isAdmin, async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.status(500).send('שגיאה במחיקת התור');
    }
});

module.exports = router;