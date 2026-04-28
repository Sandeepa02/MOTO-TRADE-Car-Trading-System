/**
 * Creates or updates the Moto Trade admin account (same credentials used after `npm run seed`).
 *
 * Run from Backend folder: npm run create-admin
 * Requires MONGODB_URI in .env
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const ADMIN = {
  name: 'Moto Trade Admin',
  email: 'admin@mototrade.com',
  password: 'Admin@123',
  role: 'admin'
};

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Missing MONGODB_URI in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN.email });

    if (existing) {
      existing.name = ADMIN.name;
      existing.role = 'admin';
      existing.password = ADMIN.password;
      await existing.save();
      console.log('Updated existing user to admin role and refreshed password.');
    } else {
      await User.create(ADMIN);
      console.log('Created new admin user.');
    }

    console.log('\n--- Admin login (use on /login) ---');
    console.log(`  Email:    ${ADMIN.email}`);
    console.log(`  Password: ${ADMIN.password}`);
    console.log(`  Name:     ${ADMIN.name}`);
    console.log('\nChange this password in production.\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
