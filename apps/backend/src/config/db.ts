import mongoose from 'mongoose';
import { seedSuperAdmin } from './seed';


let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ems';

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('✅ MongoDB connected:', uri);

    // Seed super admin on first connection (non-test environments)
    if (process.env.NODE_ENV !== 'test') {
      await seedSuperAdmin();
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}
