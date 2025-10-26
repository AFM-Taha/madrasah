/**
 * Setup Script: Create Initial Principal User
 * 
 * This script creates the first Principal user account in your MongoDB Atlas database.
 * Run this script after setting up your MongoDB Atlas connection.
 * 
 * Usage: node scripts/setup-principal.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Import the User model
const User = require('../models/User.ts').default;

async function createPrincipalUser() {
  try {
    // Connect to MongoDB Atlas
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Check if a principal already exists
    const existingPrincipal = await User.findOne({ role: 'principal' });
    if (existingPrincipal) {
      console.log('⚠️  A Principal user already exists:');
      console.log(`   Email: ${existingPrincipal.email}`);
      console.log('   If you want to create a new principal, please delete the existing one first.');
      return;
    }

    // Principal user data
    const principalData = {
      firstName: 'Admin',
      lastName: 'Principal',
      email: 'admin@madrasah.edu',
      phone: '+1234567890',
      password: 'admin123', // Change this to a secure password
      role: 'principal',
      isActive: true
    };

    // Hash the password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    principalData.password = await bcrypt.hash(principalData.password, saltRounds);

    // Create the principal user
    console.log('👤 Creating Principal user...');
    const principal = new User(principalData);
    await principal.save();

    console.log('🎉 Principal user created successfully!');
    console.log('📧 Login credentials:');
    console.log(`   Email: ${principalData.email}`);
    console.log(`   Password: admin123`);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('🔒 For security, consider updating the password in this script before running.');

  } catch (error) {
    console.error('❌ Error creating Principal user:', error.message);
    
    if (error.code === 11000) {
      console.log('   This error usually means a user with this email already exists.');
    }
    
    if (error.message.includes('MONGODB_URI')) {
      console.log('   Please make sure your MONGODB_URI is correctly set in .env.local');
    }
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the script
createPrincipalUser();