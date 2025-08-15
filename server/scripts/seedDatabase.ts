import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User';
import connectDB from '../config/database';

// Load environment variables
dotenv.config({ path: '.env.local' });

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});

    const saltRounds = 10;

    // Create demo users
    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: await bcrypt.hash('password', saltRounds),
        role: 'admin'
      },
      {
        name: 'Principal User',
        email: 'principal@demo.com',
        password: await bcrypt.hash('password', saltRounds),
        role: 'principal'
      },
      {
        name: 'John Doe',
        email: 'user@demo.com',
        password: await bcrypt.hash('password', saltRounds),
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@demo.com',
        password: await bcrypt.hash('password', saltRounds),
        role: 'user'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@demo.com',
        password: await bcrypt.hash('password', saltRounds),
        role: 'user'
      }
    ];

    await User.insertMany(demoUsers);

    console.log('✅ Demo users created successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin: admin@demo.com / password');
    console.log('Principal: principal@demo.com / password');
    console.log('User: user@demo.com / password');
    console.log('User: jane@demo.com / password');
    console.log('User: mike@demo.com / password');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
