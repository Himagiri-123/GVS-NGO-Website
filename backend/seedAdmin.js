const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const createAdmin = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database Connected for Seeding!");

    // Check whether an admin account already exists
    const adminExists = await User.findOne({ email: 'admin@gvs.com' });

    if (adminExists) {
      console.log("⚠️ Admin account already exists!");
      process.exit();
    }

    // Update with your real details here
    // Note: this is not the MongoDB password — use a different strong password (change it after logging in)
    const admin = await User.create({
      name: 'GVS Admin', 
      email: 'grameenavikassangamsrikakulam@gmail.com', // the email ID you'll log in with
      password: 'AdminPassword123', // change this password after the first login
      role: 'admin',
      status: 'active'
    });

    console.log("🎉 Admin account created successfully!");
    console.log(`Your login email: ${admin.email}`);
    console.log(`Your password: AdminPassword123`);
    
    // Closes automatically once done
    process.exit();
  } catch (error) {
    console.log("❌ An error occurred: ", error);
    process.exit(1);
  }
};

createAdmin();