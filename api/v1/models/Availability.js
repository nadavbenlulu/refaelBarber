const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // פורמט YYYY-MM-DD
    isClosed: { type: Boolean, default: false },        // האם המספרה סגורה ביום זה
    closedSlots: [String]                               // שעות ספציפיות שאתה רוצה לחסום
});

module.exports = mongoose.model('Availability', availabilitySchema);