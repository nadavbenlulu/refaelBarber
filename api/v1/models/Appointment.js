const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },
    date: { type: String, required: true }, // פורמט YYYY-MM-DD
    time: { type: String, required: true }  // פורמט HH:mm
});

// יצירת אינדקס ייחודי כדי למנוע כפל תורים באותה שעה ואותו יום
appointmentSchema.index({ date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);