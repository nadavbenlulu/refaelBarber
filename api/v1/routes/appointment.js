const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// פונקציית עזר למשיכת שעות הפעילות (מנסה מה-DB, אם אין - מחזירה ברירת מחדל)
async function getWorkingHours() {
    try {
        // אנחנו מחפשים רשומה שבה isClosed לא קיים (זו רשומת ההגדרות שלנו)
        // או שתצור מודל Settings ייעודי. כרגע נשתמש ב-Availability כמאגר הגדרות פשוט.
        const settings = await Availability.findOne({ isSettings: true });
        if (settings && settings.workingHours) {
            return settings.workingHours;
        }
    } catch (e) {
        console.log("Error fetching settings:", e);
    }
    return { open: "09:00", close: "20:00" }; // ברירת מחדל
}

// בדיקת שעות תפוסות וזמינות יום
router.get('/busy/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const currentWorkingHours = await getWorkingHours();

        // 1. בדיקה האם היום סגור או שיש שעות חסומות
        let isClosed = false;
        let manualBusySlots = [];
        
        const dayStatus = await Availability.findOne({ date, isSettings: { $ne: true } });
        if (dayStatus) {
            if (dayStatus.isClosed) isClosed = true;
            if (dayStatus.closedSlots) manualBusySlots = dayStatus.closedSlots;
        }

        if (isClosed) {
            return res.json({ 
                isClosed: true, 
                busyTimes: [], 
                workingHours: currentWorkingHours 
            });
        }

        // 2. משיכת תורים קיימים
        const appointments = await Appointment.find({ date }, 'time');
        const bookedTimes = appointments.map(app => app.time);
        
        // 3. איחוד חסימות
        const allBusyTimes = [...new Set([...bookedTimes, ...manualBusySlots])];
        
        res.json({ 
            isClosed: false, 
            busyTimes: allBusyTimes,
            workingHours: currentWorkingHours 
        });

    } catch (err) {
        console.error("Error in /busy/:date :", err);
        res.json({ isClosed: false, busyTimes: [], workingHours: { open: "09:00", close: "20:00" } });
    }
});

// קביעת תור
router.post('/book', async (req, res) => {
    try {
        const { clientName, clientPhone, date, time, service } = req.body;

        const dayStatus = await Availability.findOne({ date, isSettings: { $ne: true } });
        if (dayStatus) {
            if (dayStatus.isClosed || (dayStatus.closedSlots && dayStatus.closedSlots.includes(time))) {
                return res.status(400).json({ error: 'מצטערים, השעה אינה זמינת' });
            }
        }

        const newAppointment = new Appointment({ clientName, clientPhone, date, time, service });
        await newAppointment.save();
        res.status(201).json({ message: 'התור נקבע בהצלחה!' });

    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'השעה כבר נתפסה' });
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});

module.exports = router;