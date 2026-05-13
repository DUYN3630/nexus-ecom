const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path =require('path');
const fs = require('fs/promises');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, './.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seedProducts() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in server/.env file.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Optional: Clear existing products
    console.log('Deleting existing products...');
    await Product.deleteMany({});
    console.log('Existing products deleted.');

    // Read products from JSON file
    const productsPath = path.join(__dirname, 'products.json');
    const productsData = JSON.parse(await fs.readFile(productsPath, 'utf-8'));
    
    if (!productsData || productsData.length === 0) {
        console.log('No products found in products.json. Exiting.');
        return;
    }

    console.log(`Found ${productsData.length} products in JSON file. Processing...`);

    const productsToInsert = [];
    for (const product of productsData) {
        const category = await Category.findOne({ slug: product.categorySlug });
        if (category) {
            // Replace categorySlug with the actual category ObjectId
            const newProduct = { ...product };
            delete newProduct.categorySlug; // remove the temporary slug field
            newProduct.category = category._id;
            productsToInsert.push(newProduct);
        } else {
            console.warn(`
            - WARNING: Category with slug "${product.categorySlug}" not found for product "${product.name}". 
            - This product will be SKIPPED.
            - Please ensure you have run 'node server/seedCategories.js' first.
            `);
        }
    }
    
    // Insert products into the database
    if (productsToInsert.length > 0) {
        console.log(`Inserting ${productsToInsert.length} products into the database...`);
        await Product.insertMany(productsToInsert);
        console.log('-------------------------------------------');
        console.log(`Successfully seeded ${productsToInsert.length} products.`);
        console.log('-------------------------------------------');
    } else {
        console.log('No valid products were available to insert.');
    }

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedProducts();
