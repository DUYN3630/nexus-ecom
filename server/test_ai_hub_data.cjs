require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Setting = require('./models/Setting');
const RepairRequest = require('./models/RepairRequest');
const Expert = require('./models/Expert');
const SupportTicket = require('./models/SupportTicket');

const testAPIs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to DB");

        console.log("\n--- [DEBUG] Checking Settings ---");
        const settings = await Setting.find({ key: { $in: ['ai_system_instruction', 'ai_model_name'] } });
        console.log(`Found ${settings.length} settings.`);
        settings.forEach(s => console.log(`- ${s.key}: ${s.value}`));

        console.log("\n--- [DEBUG] Checking Analytics Data ---");
        const totalRepairs = await RepairRequest.countDocuments();
        const recentRepairs = await RepairRequest.find().limit(2);
        console.log(`Total RepairRequests: ${totalRepairs}`);

        console.log("\n--- [DEBUG] Checking Expert Data ---");
        const experts = await Expert.find();
        console.log(`Total Experts: ${experts.length}`);
        experts.forEach(e => console.log(`- ${e.name} (${e.role})`));

        console.log("\n--- [DEBUG] Checking Support Tickets ---");
        const tickets = await SupportTicket.find();
        console.log(`Total SupportTickets: ${tickets.length}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
};

testAPIs();
