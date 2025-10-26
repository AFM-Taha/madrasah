/**
 * MongoDB Atlas Connection Test
 * 
 * This script tests the connection to your MongoDB Atlas database.
 * Run this script to verify your MONGODB_URI is correctly configured.
 * 
 * Usage: node scripts/test-connection.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB Atlas connection...');
    console.log(`📍 Connecting to: ${process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@')}`);
    
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 Database information:');
    console.log(`   Database name: ${db.databaseName}`);
    console.log(`   Collections: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Existing collections:');
      collections.forEach(col => {
        console.log(`     - ${col.name}`);
      });
    } else {
      console.log('   No collections found (this is normal for a new database)');
    }
    
    console.log('');
    console.log('🎉 MongoDB Atlas is ready to use!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('   Please check your username and password in the MONGODB_URI');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   Please check your cluster URL in the MONGODB_URI');
    } else if (error.message.includes('IP')) {
      console.log('   Please check your Network Access settings in MongoDB Atlas');
      console.log('   Make sure your IP address is whitelisted');
    }
    
    console.log('');
    console.log('🔧 Troubleshooting tips:');
    console.log('   1. Verify your MONGODB_URI in .env.local');
    console.log('   2. Check your MongoDB Atlas username and password');
    console.log('   3. Ensure your IP is whitelisted in Network Access');
    console.log('   4. Confirm your cluster is running and accessible');
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local');
  console.log('   Please add your MongoDB Atlas connection string to .env.local');
  process.exit(1);
}

if (process.env.MONGODB_URI.includes('<username>') || process.env.MONGODB_URI.includes('<password>')) {
  console.error('❌ Please replace <username>, <password>, and <cluster-url> in your MONGODB_URI');
  console.log('   Your connection string should look like:');
  console.log('   mongodb+srv://yourusername:yourpassword@cluster0.abc123.mongodb.net/madrasah?retryWrites=true&w=majority');
  process.exit(1);
}

// Run the test
testConnection();