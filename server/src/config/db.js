import mongoose from 'mongoose';
import { requiredEnv } from './env.js';

const connectDb = async () => {
  const uri = requiredEnv('MONGO_URI');
  console.log('Connecting to MongoDB with URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // add other mongoose options if needed
    });
    console.log('MongoDB connected successfully');
    
    // Test the connection
    const db = mongoose.connection;
    console.log('Database name:', db.name);
    console.log('Database ready state:', db.readyState);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

export default connectDb;
