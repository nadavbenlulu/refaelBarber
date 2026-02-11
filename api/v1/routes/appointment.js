const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// בדיקת שעות תפוסות וזמינות יום
router.get('/busy/:date', async (req, res) => {
    try {
        const { date } = req.params;

        // 1. בדיקה האם היום סגור או שיש שעות חסומות
        let isClosed = false;
        let manualBusySlots = [];
        
        try {
            const dayStatus = await Availability.findOne({ date });
            if (dayStatus) {
                if (dayStatus.isClosed) {
                    isClosed = true;
                }
                // מוסיף את השעות שחסמת ידנית לרשימה
                if (dayStatus.closedSlots && dayStatus.closedSlots.length > 0) {
                    manualBusySlots = dayStatus.closedSlots;
                }
            }
        } catch (dbErr) {
            console.log("Availability check issue:", dbErr);
        }

        if (isClosed) {
            return res.json({ isClosed: true, busyTimes: [] });
        }

        // 2. משיכת תורים קיימים של לקוחות
        const appointments = await Appointment.find({ date }, 'time');
        const bookedTimes = appointments.map(app => app.time);
        
        // 3. איחוד של תורים קיימים + שעות שחסמת ידנית
        const allBusyTimes = [...new Set([...bookedTimes, ...manualBusySlots])];
        
        res.json({ isClosed: false, busyTimes: allBusyTimes });

    } catch (err) {
        console.error("Error in /busy/:date :", err);
        res.json({ isClosed: false, busyTimes: [] });
    }
});

// קביעת תור
router.post('/book', async (req, res) => {
    try {
        const { clientName, clientPhone, date, time, service } = req.body;

        // הגנה נוספת: בדיקה שהשעה לא חסומה ידנית רגע לפני השמירה
        const dayStatus = await Availability.findOne({ date });
        if (dayStatus) {
            if (dayStatus.isClosed || (dayStatus.closedSlots && dayStatus.closedSlots.includes(time))) {
                return res.status(400).json({ error: 'מצטערים, השעה או היום אינם זמינים יותר' });
            }
        }

        const newAppointment = new Appointment({ 
            clientName, 
            clientPhone, 
            date, 
            time,
            service 
        });

        await newAppointment.save();
        res.status(201).json({ message: 'התור נקבע בהצלחה!' });

    } catch (err) {
        console.error("Booking error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'השעה הזו כבר נתפסה' });
        }
        res.status(500).json({ error: 'שגיאת שרת בקביעת התור' });
    }
});

module.exports = router;