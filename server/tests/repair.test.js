const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Expert = require('../models/Expert');
const RepairRequest = require('../models/RepairRequest');
const Part = require('../models/Part');
const jwt = require('jsonwebtoken');

describe('Expert & Repair API', () => {
    let expertToken, expertId, partId, repairId;

    beforeEach(async () => {
        // Create Expert User
        const expertUser = await User.create({
            name: 'Technician One',
            email: 'tech@nexus.com',
            password: 'password123',
            role: 'expert'
        });
        expertToken = jwt.sign({ id: expertUser._id }, process.env.JWT_SECRET || 'testsecret');

        // Create Expert Profile
        const expertProfile = await Expert.create({
            user: expertUser._id,
            employeeId: 'NX-001',
            name: 'Technician One',
            status: 'active'
        });
        expertId = expertProfile._id;

        // Create a Part
        const part = await Part.create({
            name: 'iPhone 15 Screen',
            sku: 'SCR-IP15',
            category: 'Screen',
            stock: 10,
            price: 200
        });
        partId = part._id;

        // Create a Repair Request
        const repair = await RepairRequest.create({
            ticketNumber: 'REP-123',
            deviceType: 'iPhone 15',
            description: 'Broken screen',
            guestInfo: { name: 'Customer', phone: '0909090909' },
            expert: expertId,
            status: 'Pending'
        });
        repairId = repair._id;
    });

    describe('PATCH /api/support/repair/:id', () => {
        it('should update repair status and add parts', async () => {
            const updateData = {
                status: 'Repairing',
                repairNotes: 'Starting screen replacement',
                usedParts: [
                    { part: partId, quantity: 1 }
                ]
            };

            const res = await request(app)
                .patch(`/api/support/repair/${repairId}`)
                .set('Authorization', `Bearer ${expertToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('Repairing');
            expect(res.body.data.usedParts.length).toBe(1);

            // Check part stock decrement
            const updatedPart = await Part.findById(partId);
            expect(updatedPart.stock).toBe(9); // 10 - 1 = 9
        });
    });
});
