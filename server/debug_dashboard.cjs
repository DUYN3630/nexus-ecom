const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables - path is relative to server folder now
dotenv.config({ path: path.join(__dirname, '.env') });

const Order = require('./models/Order');
const User = require('./models/User');

async function checkData() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const now = new Date();
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const orders = await Order.countDocuments({ 
            createdAt: { $gte: start },
            isDeleted: { $ne: true }
        });
        
        const users = await User.countDocuments({ 
            createdAt: { $gte: start }, 
            role: 'Customer' 
        });

        const trend = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: start }, 
                    deliveryStatus: { $ne: 'Canceled' },
                    isDeleted: { $ne: true }
                } 
            },
            { 
                $group: { 
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
                    amount: { $sum: '$totalAmount' } 
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        console.log('--- DB CHECK RESULTS ---');
        console.log('Orders (30d):', orders);
        console.log('Users (30d):', users);
        console.log('Trend Data Count:', trend.length);
        console.log('Trend Data Sample:', JSON.stringify(trend.slice(0, 5), null, 2));
        
        const recentUsers = await User.find({ role: 'Customer' }).sort({ createdAt: -1 }).limit(5).select('name createdAt');
        console.log('Recent 5 Customers:', JSON.stringify(recentUsers, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error checking data:', err);
        process.exit(1);
    }
}

checkData();
