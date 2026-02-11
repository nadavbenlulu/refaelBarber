const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    // הורדנו את ה-unique ואת ה-required כדי לאפשר רשומות הגדרות
    date: { 
        type: String 
    }, 
    isClosed: { 
        type: Boolean, 
        default: false 
    },
    closedSlots: { 
        type: [String], 
        default: [] 
    },
    // שדה חדש לזיהוי רשומת הגדרות
    isSettings: { 
        type: Boolean, 
        default: false 
    },
    // שדה חדש לשמירת שעות הפעילות
    workingHours: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "21:00" }
    }
});

// מוודא שחיפושים יהיו מהירים
availabilitySchema.index({ date: 1 });
availabilitySchema.index({ isSettings: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);