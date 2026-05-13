const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Marketing = require('./models/Marketing');
const Product = require('./models/Product');

const seedMarketing = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not set.");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding marketing data...");

        // Clear existing marketing data
        await Marketing.deleteMany({});
        console.log("Cleared existing marketing banners.");

        // Find some products to link to
        const iphone = await Product.findOne({ slug: { $regex: 'iphone', $options: 'i' } });
        const macbook = await Product.findOne({ slug: { $regex: 'macbook', $options: 'i' } });

        const banners = [
            {
                name: "iPhone 15 Pro Launch",
                type: "hero",
                media: {
                    kind: "image",
                    url: "/uploads/images-1767422128912-50486164.jpg", // Using an existing image from the file list
                    altText: "iPhone 15 Pro Titanium"
                },
                content: {
                    title: `Titanium. 
So Strong. So Light. So Pro.`,
                    subtitle: "New Arrival",
                    ctaText: "Shop Now"
                },
                linkType: iphone ? "product" : "none",
                linkTarget: iphone ? { productId: iphone._id } : {},
                position: "home-top",
                priority: 10,
                status: "active",
                schedule: {
                    startAt: new Date(),
                    endAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year from now
                }
            },
            {
                name: "MacBook Pro M3 Max Hero",
                type: "hero",
                media: {
                    kind: "image",
                    url: "/uploads/banner-1768477014319-148637144.jpg",
                    altText: "MacBook Pro M3 Max with dynamic wave animation"
                },
                content: {
                    title: "Power unleashed. M3 Max.",
                    subtitle: "For those who redefine possible.",
                    ctaText: "Learn More"
                },
                linkType: macbook ? "product" : "none",
                linkTarget: macbook ? { productId: macbook._id } : {},
                position: "home-top",
                priority: 8, // Changed priority to appear after iPhone
                status: "active",
                schedule: {
                    startAt: new Date(),
                    endAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
            },
            {
                name: "Emotional Storytelling Banner",
                type: "hero",
                media: {
                    kind: "image",
                    url: "/uploads/banner-1768477941672-580320102.jpg", 
                    altText: "A person enjoying nature with a tech device, evoking freedom and connection"
                },
                content: {
                    title: `Unleash Your Potential.
Live the Experience.`,
                    subtitle: "Crafting moments, powered by innovation.",
                    ctaText: "Explore the experience"
                },
                linkType: "none", // Or link to a relevant product/category if desired
                position: "home-top",
                priority: 12, // Higher priority to make it appear first
                status: "active",
                schedule: {
                    startAt: new Date(),
                    endAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                }
            }
        ];

        await Marketing.insertMany(banners);
        console.log(`✅ Successfully seeded ${banners.length} banners.`);

    } catch (error) {
        console.error("Error seeding marketing data:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
};

seedMarketing();
