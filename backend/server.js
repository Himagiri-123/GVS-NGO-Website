const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const initiativeRoutes = require('./routes/initiativeRoutes');
app.use('/api/initiatives', initiativeRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);

const staffRoutes = require('./routes/staffRoutes');
app.use('/api/staff', staffRoutes);

const homeRoutes = require('./routes/homeRoutes');
app.use('/api/home', homeRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const studentRoutes = require('./routes/studentRoutes');
app.use('/api/students', studentRoutes);

const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contact', contactRoutes);

const accountRoutes = require('./routes/accountRoutes');
app.use('/api/accounts', accountRoutes);

const chikkiStockRoutes = require('./routes/chikkiStockRoutes');
app.use('/api/chikki-stock', chikkiStockRoutes);

const mainOfficeStockRoutes = require('./routes/mainOfficeStockRoutes');
app.use('/api/main-office-stock', mainOfficeStockRoutes);

const successStoryRoutes = require('./routes/successStoryRoutes');
app.use('/api/success-stories', successStoryRoutes);

const bankDetailRoutes = require('./routes/bankDetailRoutes');
app.use('/api/bank-details', bankDetailRoutes);

const newsRoutes = require('./routes/newsRoutes');
app.use('/api/news', newsRoutes);

// For volunteer applications (recently added)
const volunteerRoutes = require('./routes/volunteerRoutes');
app.use('/api/volunteers', volunteerRoutes);

const teamMemberRoutes = require('./routes/teamMemberRoutes');
app.use('/api/team', teamMemberRoutes);

const contactInfoRoutes = require('./routes/contactInfoRoutes');
app.use('/api/contact-info', contactInfoRoutes);

app.get('/', (req, res) => {
  res.send("GVS Backend Server is Running Perfectly!");
});

const PORT = process.env.PORT || 5000;
const URL = process.env.MONGO_URI;

mongoose.connect(URL)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB database!");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}...`);
    });
  })
  .catch((error) => {
    console.log("❌ MongoDB connection failed: ", error.message);
  });