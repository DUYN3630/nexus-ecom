const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Setting = require('../models/Setting');
const jwt = require('jsonwebtoken');

describe('AI Hub API', () => {
    let adminToken, expertToken, userToken;

    beforeEach(async () => {
        // Create Admin
        const adminUser = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });
        adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'testsecret');

        // Create Expert
        const expertUser = await User.create({
            name: 'Expert',
            email: 'expert@example.com',
            password: 'password123',
            role: 'expert'
        });
        expertToken = jwt.sign({ id: expertUser._id }, process.env.JWT_SECRET || 'testsecret');

        // Create Regular User
        const regularUser = await User.create({
            name: 'User',
            email: 'user@example.com',
            password: 'password123',
            role: 'Customer'
        });
        userToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET || 'testsecret');

        // Seed some settings
        await Setting.create([
            { key: 'ai_model_name', value: 'gemini-1.5-flash' },
            { key: 'ai_temperature', value: 0.7 }
        ]);
    });

    describe('GET /api/ai-settings', () => {
        it('should allow admin to get AI settings', async () => {
            const res = await request(app)
                .get('/api/ai-settings')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('ai_model_name', 'gemini-1.5-flash');
            expect(res.body).toHaveProperty('ai_temperature', 0.7);
        });

        it('should allow expert to get AI settings', async () => {
            const res = await request(app)
                .get('/api/ai-settings')
                .set('Authorization', `Bearer ${expertToken}`);

            expect(res.statusCode).toBe(200);
        });

        it('should deny regular user from getting AI settings', async () => {
            const res = await request(app)
                .get('/api/ai-settings')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
        });
    });

    describe('POST /api/ai-settings/update', () => {
        it('should allow admin to update AI settings', async () => {
            const updates = {
                ai_model_name: 'gemini-pro',
                ai_temperature: 0.5
            };

            const res = await request(app)
                .post('/api/ai-settings/update')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updates);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/thành công/i);

            const updatedModel = await Setting.findOne({ key: 'ai_model_name' });
            expect(updatedModel.value).toBe('gemini-pro');
        });

        it('should allow expert to update AI settings', async () => {
            const updates = { ai_temperature: 0.9 };
            const res = await request(app)
                .post('/api/ai-settings/update')
                .set('Authorization', `Bearer ${expertToken}`)
                .send(updates);

            expect(res.statusCode).toBe(200);
        });

        it('should deny regular user from updating AI settings', async () => {
            const res = await request(app)
                .post('/api/ai-settings/update')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ai_temperature: 1.0 });

            expect(res.statusCode).toBe(403);
        });
    });
});
