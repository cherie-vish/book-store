import { pgTable, serial, text, timestamp, boolean, integer, real } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('customer').notNull(), // 'admin' or 'customer'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  stock: integer('stock').default(0).notNull(),
  image: text('image'),
  category: text('category').default('other').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  customerAddress: text('customer_address').notNull(),
  total: real('total').notNull(),
  status: text('status').default('pending').notNull(),
  trackingNumber: text('tracking_number'),
  estimatedDelivery: timestamp('estimated_delivery'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Also add to your existing orders definition
// Order Items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
});

// Wishlist table
export const wishlist = pgTable('wishlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Add after existing tables
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  userName: text('user_name').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  approved: boolean('approved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;