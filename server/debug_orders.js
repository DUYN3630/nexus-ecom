const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

async function debugOrders() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const orders = await Order.find({ deliveryStatus: 'Delivered', isDeleted: false });
        console.log(`Found ${orders.length} delivered orders.`);

        const users = await User.find({ role: /admin/i });
        console.log('Admin Users in system:');
        users.forEach(u => console.log(`- ID: ${u._id}, Email: ${u.email}, Name: ${u.name}`));

        console.log('\nDelivered Orders Detail:');
        orders.forEach(o => {
            console.log(`Order #${o.orderNumber}:`);
            console.log(`  - Customer Email: ${o.customer?.email}`);
            console.log(`  - UserId field: ${o.userId}`);
            console.log(`  - CreatedAt: ${o.createdAt}`);
            console.log(`  - AuditLogs count: ${o.auditLogs?.length}`);
            if (o.auditLogs && o.auditLogs.length > 0) {
                console.log(`  - First Audit User: ${o.auditLogs[0].user}`);
            }
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

debugOrders();
