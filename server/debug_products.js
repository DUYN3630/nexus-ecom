const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function debug() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully!");
        
        const count = await Product.countDocuments({});
        console.log("Total Products in DB:", count);
        
        const allProducts = await Product.find({}).limit(10);
        console.log("Sample Products (Name | Status):");
        allProducts.forEach(p => console.log(`- ${p.name} | ${p.status}`));
        
        const activeOnly = await Product.countDocuments({ status: 'active' });
        console.log("Active Products:", activeOnly);

        process.exit(0);
    } catch (err) {
        console.error("DEBUG ERROR:", err);
        process.exit(1);
    }
}

debug();