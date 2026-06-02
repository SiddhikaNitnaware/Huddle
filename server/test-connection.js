// MongoDB Atlas Connection Test
const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing connection to:', MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@'));

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({ message: String, timestamp: Date });
    const Test = mongoose.model('Test', TestSchema);
    
    const testDoc = new Test({ message: 'Connection test', timestamp: new Date() });
    await testDoc.save();
    console.log('✅ SUCCESS: Database write operation worked!');
    
    // Clean up test document
    await Test.deleteOne({ _id: testDoc._id });
    console.log('✅ SUCCESS: Database delete operation worked!');
    
    await mongoose.disconnect();
    console.log('✅ SUCCESS: All database operations working perfectly!');
    console.log('\n🎉 Your MongoDB Atlas connection is ready for the message board!');
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED:', error.message);
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Check your internet connection');
    console.log('2. Try using Google DNS (8.8.8.8, 8.8.4.4)');
    console.log('3. Disable VPN if you are using one');
    console.log('4. Check Windows Firewall settings');
    console.log('5. Try the connection from a different network');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('\n💡 DNS Resolution Issue Detected:');
      console.log('   - Change your DNS servers to 8.8.8.8 and 8.8.4.4');
      console.log('   - Or try connecting from a different network');
      console.log('   - Or use a VPN to bypass local DNS issues');
    }
  }
}

testConnection();