import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    name: 'Admin User',
    email: 'admin@bookstore.com',
    password: hashedPassword,
    role: 'admin',
  });
  console.log('Admin created: admin@bookstore.com / admin123');
}

createAdmin();