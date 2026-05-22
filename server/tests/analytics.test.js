const request = require('supertest');
const app = require('../index');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const TrackingEvent = require('../models/TrackingEvent');
const jwt = require('jsonwebtoken');

describe('Analytics API', () => {
    let adminToken, categoryId, productId;

    beforeEach(async () => {
        const adminUser = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'testsecret');

        const category = await Category.create({ name: 'Laptops', slug: 'laptops' });
        categoryId = category._id;

        const product = await Product.create({
            name: 'MacBook Pro',
            sku: 'MBP-14',
            category: categoryId,
            price: 2000,
            stock: 10
        });
        productId = product._id;

        // Create some orders
        await Order.create([
            {
                orderNumber: 'ORD-1',
                items: [{ productId: productId, name: 'MacBook Pro', quantity: 1, price: 2000 }],
                totalAmount: 2000,
                deliveryStatus: 'Delivered',
                isPaid: true
            },
            {
                orderNumber: 'ORD-2',
                items: [{ productId: productId, name: 'MacBook Pro', quantity: 1, price: 2000 }],
                totalAmount: 2000,
                deliveryStatus: 'Processing',
                isPaid: false
            },
            {
                orderNumber: 'ORD-3',
                items: [{ productId: productId, name: 'MacBook Pro', quantity: 1, price: 2000 }],
                totalAmount: 2000,
                deliveryStatus: 'Canceled',
                isPaid: false
            }
        ]);

        // Create some tracking events
        await TrackingEvent.create([
            { eventType: 'view_product', sessionId: 's1', payload: { productId: productId.toString(), productName: 'MacBook Pro' } },
            { eventType: 'view_product', sessionId: 's2', payload: { productId: productId.toString(), productName: 'MacBook Pro' } },
            { eventType: 'view_product', sessionId: 's3', payload: { productId: productId.toString(), productName: 'MacBook Pro' } },
            { eventType: 'view_product', sessionId: 's4', payload: { productId: productId.toString(), productName: 'MacBook Pro' } }
        ]);
    });

    it('should return correct overview stats', async () => {
        const res = await request(app)
            .get('/api/analytics/overview')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        
        const data = res.body.data;
        // ORD-1 and ORD-2 are not canceled, total revenue = 2000 + 2000 = 4000
        expect(data.totalRevenue).toBe(4000);
        expect(data.totalOrders).toBe(2);
        
        // Conversion rate: 2 orders / 4 views = 50%
        expect(data.conversionRate).toBe('50.00');
        
        // Category revenue
        expect(data.categoryRevenue.length).toBe(1);
        expect(data.categoryRevenue[0]._id).toBe('Laptops');
        expect(data.categoryRevenue[0].revenue).toBe(4000);
    });

    it('should filter stats by date range', async () => {
        // Create an old order
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 60);
        
        await Order.create({
            orderNumber: 'ORD-OLD',
            items: [{ productId: productId, name: 'MacBook Pro', quantity: 1, price: 2000 }],
            totalAmount: 2000,
            deliveryStatus: 'Delivered',
            createdAt: oldDate
        });

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const res = await request(app)
            .get(`/api/analytics/overview?startDate=${startDate.toISOString()}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        // Should only count the 2 recent non-canceled orders
        expect(res.body.data.totalOrders).toBe(2);
    });
});
