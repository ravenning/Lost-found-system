const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lost-found');
    console.log('Connected to DB');

    // Check if demo user exists
    const existing = await User.findOne({ email: 'demo@example.com' });
    if (existing) {
      await User.deleteOne({ email: 'demo@example.com' });
    }

    // Create verified demo user
    const user = new User({
      email: 'demo@example.com',
      password: 'password123',
      role: 'admin',
      isVerified: true // Important: Bypass the email verification requirement
    });
    
    await user.save();
    console.log('Demo user created successfully!');
    console.log('Email: demo@example.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
