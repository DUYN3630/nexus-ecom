const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

async function fixOrders() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ email: 'admin123@gmail.com' });
        if (!admin) {
            console.log('Admin user not found');
            return;
        }

        const result = await Order.updateMany(
            { 
                $or: [
                    { 'customer.email': { $exists: false } },
                    { 'customer.email': null },
                    { 'customer.email': '' }
                ],
                auditLogs: { $elemMatch: { user: admin._id.toString() } }
            },
            { 
                $set: { 
                    'customer.email': admin.email,
                    'customer.name': admin.name,
                    'userId': admin._id
                } 
            }
        );

        console.log(`Updated ${result.modifiedCount} orders to belong to admin ${admin.email}`);

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

fixOrders();
