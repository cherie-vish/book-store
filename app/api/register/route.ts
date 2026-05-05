import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  const newUser = await db.insert(users).values({
    name,
    email,
    password,
    role: 'customer',
  }).returning();

  return NextResponse.json(newUser[0]);
}