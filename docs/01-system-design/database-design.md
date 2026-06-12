# 🗄️ Database Design (MongoDB) — Nexus E-commerce

This document outlines the NoSQL database design using MongoDB and Mongoose schemas for Nexus E-commerce.

---

## 1. Core E-commerce Entities

### Users
- `_id`: ObjectId
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `role`: String (Enum: 'user', 'admin', 'expert')
- `avatar`: String (URL)
- `createdAt`, `updatedAt`: Timestamps

### Products
- `_id`: ObjectId
- `name`: String
- `description`: String
- `price`: Number
- `stock`: Number
- `category`: ObjectId (Ref: 'Category')
- `images`: Array of Strings (URLs)
- `ratings`: Number (Average)
- `numReviews`: Number
- `createdAt`, `updatedAt`: Timestamps

### Categories
- `_id`: ObjectId
- `name`: String
- `slug`: String
- `image`: String

### Orders
- `_id`: ObjectId
- `user`: ObjectId (Ref: 'User')
- `orderItems`: Array of Objects
  - `product`: ObjectId (Ref: 'Product')
  - `name`: String
  - `qty`: Number
  - `price`: Number
- `shippingAddress`: Object
- `paymentMethod`: String
- `totalPrice`: Number
- `isPaid`: Boolean
- `isDelivered`: Boolean
- `status`: String (Enum: 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')

### Reviews
- `_id`: ObjectId
- `user`: ObjectId (Ref: 'User')
- `product`: ObjectId (Ref: 'Product')
- `rating`: Number (1-5)
- `comment`: String
- `createdAt`: Timestamp

---

## 2. IT Hub & AI Entities

### Appointments
- `_id`: ObjectId
- `user`: ObjectId (Ref: 'User')
- `expert`: ObjectId (Ref: 'User', conditional on role)
- `date`: Date
- `timeSlot`: String
- `reason`: String
- `status`: String (Enum: 'Scheduled', 'Completed', 'Cancelled')

### RepairRequests
- `_id`: ObjectId
- `user`: ObjectId (Ref: 'User')
- `deviceType`: String
- `issueDescription`: String
- `status`: String (Enum: 'Pending', 'In_Progress', 'Resolved')
- `estimatedCost`: Number
- `expertNotes`: String

### AI_Conversations
- `_id`: ObjectId
- `user`: ObjectId (Ref: 'User')
- `history`: Array of Objects
  - `role`: String (user/model)
  - `content`: String
- `createdAt`, `updatedAt`: Timestamps

---

## 3. Relationships

MongoDB uses references (`ref`) to link documents instead of SQL joins.
- `Orders` reference `Users` and `Products`.
- `Appointments` reference `Users` (both customer and expert).
- Queries utilize Mongoose `.populate()` to fetch related data when necessary.
