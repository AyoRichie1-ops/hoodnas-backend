import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

try {
  if (![ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI].every(Boolean)) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, and MONGO_URI are required.');
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
  }

  await mongoose.connect(MONGO_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const existingUser = await User.findOne({ email });
  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: ADMIN_NAME.trim(),
        email,
        passwordHash,
        role: 'admin',
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin user ${existingUser ? 'updated' : 'created'} for ${email}.`);
} catch (error) {
  console.error(`Admin seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
