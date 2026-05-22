const request = require('supertest');
const app = require('../index');
const Product = require('../models/Product');
const Category = require('../models/Category');

describe('Product API', () => {
    let categoryId;

    beforeEach(async () => {
        const category = await Category.create({
            name: 'iPhone',
            slug: 'iphone',
            status: 'active'
        });
        categoryId = category._id;

        await Product.create([
            {
                name: 'iPhone 15 Pro',
                sku: 'IP15P-128',
                category: categoryId,
                price: 999,
                stock: 10,
                status: 'active',
                specifications: { Storage: '128GB', RAM: '8GB' }
            },
            {
                name: 'iPhone 15',
                sku: 'IP15-128',
                category: categoryId,
                price: 799,
                stock: 5,
                status: 'active',
                specifications: { Storage: '128GB', RAM: '6GB' }
            },
            {
                name: 'iPhone 14',
                sku: 'IP14-128',
                category: categoryId,
                price: 699,
                stock: 0,
                status: 'active',
                specifications: { Storage: '128GB', RAM: '6GB' }
            }
        ]);
    });

    describe('GET /api/products', () => {
        it('should fetch all active products', async () => {
            const res = await request(app).get('/api/products');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(3);
        });

        it('should filter products by price range', async () => {
            const res = await request(app).get('/api/products?minPrice=700&maxPrice=900');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe('iPhone 15');
        });

        it('should search products by name', async () => {
            const res = await request(app).get('/api/products?search=Pro');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe('iPhone 15 Pro');
        });

        it('should filter by specifications (e.g., RAM)', async () => {
            const res = await request(app).get('/api/products?ram=8GB');
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].name).toBe('iPhone 15 Pro');
        });
    });

    describe('GET /api/products/slug/:slug', () => {
        it('should fetch a single product by slug', async () => {
            const product = await Product.findOne({ name: 'iPhone 15 Pro' });
            const res = await request(app).get(`/api/products/slug/${product.slug}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('iPhone 15 Pro');
        });

        it('should return 404 for non-existent product', async () => {
            const res = await request(app).get('/api/products/slug/non-existent-slug');
            expect(res.statusCode).toBe(404);
        });
    });
});
