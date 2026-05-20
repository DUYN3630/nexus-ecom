const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const Part = require('./models/Part');

async function checkStock() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const part = await Part.findOne({ sku: 'SCR-I13-ZIN' });
    console.log('--- PART STOCK CHECK ---');
    console.log('Name:', part.name);
    console.log('SKU:', part.sku);
    console.log('Stock:', part.stock);
    console.log('Price:', part.price);
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStock();
