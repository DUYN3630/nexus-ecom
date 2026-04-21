const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
        
        const products = await Product.find({}).select('name images status');
        console.log("\nDATABASE REAL DATA:");
        products.forEach(p => {
            console.log(`- Product: ${p.name}`);
            console.log(`  Status:  ${p.status}`);
            console.log(`  Images in DB: ${JSON.stringify(p.images)}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();