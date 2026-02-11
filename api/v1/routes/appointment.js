const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability'); // הוספנו את מודל הזמינות

// בדיקת שעות תפוסות וזמינות יום
router.get('/busy/:date', async (req, res) => {
    try {
        const { date } = req.params;

        // 1. בדיקה האם רפאל סימן את היום הזה כסגור לגמרי
        const dayStatus = await Availability.findOne({ date });
        if (dayStatus && dayStatus.isClosed) {
            // מחזירים אובייקט שמציין שהיום סגור
            return res.json({ isClosed: true, busyTimes: [] });
        }

        // 2. אם היום פתוח, מושכים את התורים הקיימים
        const appointments = await Appointment.find({ date }, 'time');
        const busyTimes = appointments.map(app => app.time);
        
        // מחזירים שהיום פתוח ואת השעות התפוסות
        res.json({ isClosed: false, busyTimes });
    } catch (err) {
        res.status(500).json({ error: 'שגיאה במשיכת נתונים' });
    }
});

// קביעת תור
router.post('/book', async (req, res) => {
    try {
        const { clientName, clientPhone, date, time } = req.body;

        // בדיקה נוספת ברגע ההזמנה שהיום לא נסגר בינתיים
        const dayStatus = await Availability.findOne({ date });
        if (dayStatus && dayStatus.isClosed) {
            return res.status(400).json({ error: 'מצטערים, המספרה סגורה בתאריך זה' });
        }

        const newAppointment = new Appointment({ clientName, clientPhone, date, time });
        await newAppointment.save();
        res.status(201).json({ message: 'התור נקבע בהצלחה!' });
    } catch (err) {
        // קוד 11000 אומר שיש כבר תור על אותו תאריך ושעה (Unique Index)
        if (err.code === 11000) return res.status(400).json({ error: 'השעה הזו כבר נתפסה, נסה שעה אחרת' });
        res.status(500).json({ error: 'שגיאת שרת' });
    }
});

module.exports = router;