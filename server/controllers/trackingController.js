const TrackingEvent = require('../models/TrackingEvent');

const trackEventHandler = async (req, res) => {
    try {
        const { eventType, payload, sessionId } = req.body;

        if (!eventType || !payload || !sessionId) {
            return res.status(400).json({ message: 'Missing required tracking data: eventType, payload, and sessionId are required.' });
        }

        // The user ID is attached by the 'auth' middleware if the user is logged in
        const userId = req.user ? req.user.id : null;
        
        const newEvent = new TrackingEvent({
            userId,
            sessionId,
            eventType,
            payload
        });

        await newEvent.save();
        
        // Respond with 201 Created for successful event logging
        res.status(201).json({ message: 'Event tracked successfully.' });

    } catch (error) {
        console.error('Error tracking event:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', details: error.message });
        }

        res.status(500).json({ message: 'Internal server error while tracking event.' });
    }
};

module.exports = {
    trackEventHandler
};
