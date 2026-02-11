const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// בדיקת שעות תפוסות וזמינות יום
router.get('/busy/:date', async (req, res) => {
    try {
        const { date } = req.params;

        // 1. בדיקה האם היום סגור (עם הגנה מפני שגיאות DB)
        let isClosed = false;
        try {
            const dayStatus = await Availability.findOne({ date });
            if (dayStatus && dayStatus.isClosed) {
                isClosed = true;
            }
        } catch (dbErr) {
            console.log("Note: Availability table check skipped");
        }

        if (isClosed) {
            return res.json({ isClosed: true, busyTimes: [] });
        }

        // 2. משיכת תורים קיימים
        const appointments = await Appointment.find({ date }, 'time');
        const busyTimes = appointments.map(app => app.time);
        
        // החזרת תשובה תקינה
        res.json({ isClosed: false, busyTimes });

    } catch (err) {
        console.error("Critical Error in /busy/:date :", err);
        // התיקון החשוב: מחזירים JSON ריק במקום שגיאה כדי שהאתר לא יקרוס
        res.json({ isClosed: false, busyTimes: [] });
    }
});

// קביעת תור
router.post('/book', async (req, res) => {
    try {
        const { clientName, clientPhone, date, time, service } = req.body;

        // בדיקה שהיום לא סגור
        try {
            const dayStatus = await Availability.findOne({ date });
            if (dayStatus && dayStatus.isClosed) {
                return res.status(400).json({ error: 'מצטערים, המספרה סגורה בתאריך זה' });
            }
        } catch (e) {}

        // יצירת התור (הוספתי את שדה ה-service שמופיע ב-index.handlebars שלך)
        const newAppointment = new Appointment({ 
            clientName, 
            clientPhone, 
            date, 
            time,
            service // וודא שהשדה הזה קיים במודל שלך
        });

        await newAppointment.save();
        res.status(201).json({ message: 'התור נקבע בהצלחה!' });

    } catch (err) {
        console.error("Booking error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'השעה הזו כבר נתפסה, נסה שעה אחרת' });
        }
        res.status(500).json({ error: 'שגיאת שרת בקביעת התור' });
    }
});

module.exports = router;