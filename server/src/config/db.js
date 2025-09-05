import mongoose from 'mongoose';
import { requiredEnv } from './env.js';

const connectDb = async () => {
  const uri = requiredEnv('MONGO_URI');
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // add other mongoose options if needed
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

export default connectDb;
