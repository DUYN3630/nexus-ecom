const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const Product = require('./server/models/Product');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
        
        const count = await Product.countDocuments({});
        console.log("Total Products in DB:", count);
        
        const allProducts = await Product.find({}).limit(5);
        console.log("Sample Products:", allProducts.map(p => ({ name: p.name, status: p.status })));
        
        const activeOnly = await Product.countDocuments({ status: 'active' });
        console.log("Active Products:", activeOnly);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();