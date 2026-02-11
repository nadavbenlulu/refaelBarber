require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const hbs = require('express-handlebars');
const path = require('path');
const session = require('express-session'); // ייבוא הסשן

// ייבוא הראוטרים
const appointmentRouter = require('./api/v1/routes/appointment');
const adminRouter = require('./api/v1/routes/admin');

// הגדרת מנוע התצוגה Handlebars
app.set('views', path.join(__dirname, 'api/v1/views'));
app.engine('handlebars', hbs.engine({
    layoutsDir: path.join(__dirname, 'api/v1/views/layouts'),
    partialsDir: path.join(__dirname, 'api/v1/views/partials'),
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// --- Middlewares ---
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// הגדרת סשן (חובה בשביל ה-Login של רפאל)
app.use(session({
    secret: process.env.SESSION_SECRET || 'refael_barber_secret_key', // מפתח הצפנה
    resave: false,
    saveUninitialized: false, // לא שומר סשן ריק
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // הסשן תקף ל-24 שעות
        secure: false // במצב פיתוח (HTTP) נשאיר false
    }
}));

// הגדרת תיקיות סטטיות
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// --- Routes ---

// דף הבית
app.get('/', (req, res) => {
    res.render('index', { title: 'קביעת תור לרפאל כהן' }); 
});

// ראוטרים לפעולות המערכת
app.use('/appointments', appointmentRouter);
app.use('/admin', adminRouter);

// --- טיפול בשגיאות ---

app.use((req, res, next) => {
    const error = new Error('הדף לא נמצא');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// --- התחברות ל-MongoDB ---
const mongoUser = process.env.MONGO_USER;
const mongoPass = process.env.MONGO_PASS;
const mongoServer = process.env.MONGO_SERVER;

const mongoConstr = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoServer}/barber_shop`;

mongoose.connect(mongoConstr).then(() => {
    console.log("✅ Connected to MongoDB - Barber Shop Project");
}).catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
});

module.exports = app;