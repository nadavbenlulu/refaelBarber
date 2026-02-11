const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');

// --- הגדרות ברירת מחדל (יוחלפו על ידי האדמין) ---
// הערה: אם globalWorkingHours מוגדר בקובץ אחר, מומלץ להעביר אותו למודל ב-DB או לקובץ הגדרות משותף.
let workingHours = { open: "09:00", close: "20:00" };

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
                if (dayStatus.closedSlots && dayStatus.closedSlots.length > 0) {
                    manualBusySlots = dayStatus.closedSlots;
                }
            }
        } catch (dbErr) {
            console.log("Availability check issue:", dbErr);
        }

        // גם אם היום סגור, אנחנו שולחים את workingHours כדי שהעיצוב בדף הבית לא יישבר
        if (isClosed) {
            return res.json({ 
                isClosed: true, 
                busyTimes: [], 
                workingHours: workingHours // שליחת השעות המעודכנות
            });
        }

        // 2. משיכת תורים קיימים של לקוחות
        const appointments = await Appointment.find({ date }, 'time');
        const bookedTimes = appointments.map(app => app.time);
        
        // 3. איחוד של תורים קיימים + שעות שחסמת ידנית
        const allBusyTimes = [...new Set([...bookedTimes, ...manualBusySlots])];
        
        // 4. החזרת המידע כולל שעות הפעילות המעודכנות
        res.json({ 
            isClosed: false, 
            busyTimes: allBusyTimes,
            workingHours: workingHours // כאן קורה הקסם: הלקוח מקבל את הטווח שקבעת
        });

    } catch (err) {
        console.error("Error in /busy/:date :", err);
        res.json({ isClosed: false, busyTimes: [], workingHours: workingHours });
    }
});

// קביעת תור
router.post('/book', async (req, res) => {
    try {
        const { clientName, clientPhone, date, time, service } = req.body;

        // הגנה נוספת
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