const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Auth API', () => {
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', testUser.email);
            
            const user = await User.findOne({ email: testUser.email });
            expect(user).toBeTruthy();
        });

        it('should fail if email already exists', async () => {
            await User.create({
                name: 'Existing User',
                email: 'test@example.com',
                password: 'password123',
                role: 'Customer'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/đã tồn tại/i);
        });

        it('should fail if passwords do not match', async () => {
            const invalidUser = { ...testUser, confirmPassword: 'wrongpassword' };
            const res = await request(app)
                .post('/api/auth/register')
                .send(invalidUser);

            expect(res.statusCode).toBe(400);
            // express-validator error structure
            expect(res.body.errors[0].message).toMatch(/không khớp/i);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(testUser);
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toMatch(/sai/i);
        });
    });

    describe('Role-Based Access Control (RBAC)', () => {
        let userToken, adminToken;

        beforeEach(async () => {
            // Create a regular user
            const userRes = await request(app).post('/api/auth/register').send(testUser);
            userToken = userRes.body.token;

            // Create an admin user manually in DB
            const adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin'
            });
            adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'testsecret');
        });

        it('should allow regular user to access their profile', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.email).toBe(testUser.email);
        });

        it('should deny regular user from accessing admin routes', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/quản trị viên/i);
        });

        it('should allow admin user to access admin routes', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
});
