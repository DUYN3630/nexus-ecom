const request = require('supertest');
const app = require('../index');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Order API & Purchase Flow', () => {
    let token, product, categoryId;

    beforeEach(async () => {
        const category = await Category.create({ name: 'Test Cat', slug: 'test-cat' });
        categoryId = category._id;

        product = await Product.create({
            name: 'Test iPhone',
            sku: 'TEST-IPHONE',
            category: categoryId,
            price: 1000,
            stock: 10,
            status: 'active'
        });

        const user = await User.create({
            name: 'Buyer',
            email: 'buyer@example.com',
            password: 'password123'
        });
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'testsecret');
    });

    describe('POST /api/orders', () => {
        it('should create an order successfully', async () => {
            const orderData = {
                items: [{
                    productId: product._id,
                    name: product.name,
                    quantity: 1,
                    price: product.price,
                    image: 'test.jpg'
                }],
                totalAmount: 1000,
                customer: {
                    name: 'Buyer',
                    email: 'buyer@example.com',
                    phone: '0123456789',
                    address: '123 Street'
                },
                paymentMethod: 'COD'
            };

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send(orderData);

            if (res.statusCode !== 201) {
                console.log('Error Body:', res.body);
            }

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('orderNumber');
            expect(res.body.items.length).toBe(1);
        });

        it('should decrement stock after order creation', async () => {
            const orderData = {
                items: [{
                    productId: product._id,
                    name: product.name,
                    quantity: 2,
                    price: product.price,
                    image: 'test.jpg'
                }],
                totalAmount: 2000,
                customer: {
                    name: 'Buyer',
                    email: 'buyer@example.com',
                    phone: '0123456789',
                    address: '123 Street'
                },
                paymentMethod: 'COD'
            };

            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${token}`)
                .send(orderData);

            const updatedProduct = await Product.findById(product._id);
            expect(updatedProduct.stock).toBe(8); // 10 - 2 = 8
        });
    });
});
