const mongoose = require('mongoose');

const EVENT_TYPES = [
    'view_product',
    'click_product',
    'search_keyword',
    'add_to_cart',
    'category_view',
    'time_on_page'
];

const TrackingEventSchema = new mongoose.Schema({
    // User ID if the user is logged in
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        index: true, // Index for faster user-based queries
        default: null 
    },
    // Session ID for anonymous or logged-in users to group events
    sessionId: { 
        type: String, 
        required: true,
        index: true // Index for faster session-based queries
    },
    // Type of the event being tracked
    eventType: { 
        type: String, 
        required: true,
        enum: EVENT_TYPES
    },
    // Flexible payload to store event-specific data
    // Examples:
    // { productId: '...', productName: '...' } for 'view_product'
    // { keyword: '...' } for 'search_keyword'
    // { durationMs: 15000, pageUrl: '/products/some-product' } for 'time_on_page'
    payload: { 
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
}, { 
    timestamps: { createdAt: true, updatedAt: false } // Only track creation time
});

module.exports = mongoose.model('TrackingEvent', TrackingEventSchema);
