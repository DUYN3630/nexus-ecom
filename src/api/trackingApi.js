import axiosClient from './axiosClient';
import { v4 as uuidv4 } from 'uuid';

const SESSION_STORAGE_KEY = 'user_session_id';

/**
 * Gets the current session ID from session storage.
 * If one doesn't exist, it creates a new UUID and stores it.
 * @returns {string} The session ID.
 */
const getSessionId = () => {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
};

/**
 * Tracks a user behavior event by sending it to the backend.
 * @param {string} eventType - The type of event (e.g., 'view_product').
 * @param {object} payload - The data associated with the event.
 */
const trackEvent = (eventType, payload) => {
    const sessionId = getSessionId();
    
    // Fire-and-forget: we send the event but don't need to wait for the response
    // or handle errors, as tracking should not interrupt the user experience.
    axiosClient.post('/track', {
        eventType,
        payload,
        sessionId
    }).catch(error => {
        // Log errors to the console for debugging, but don't bother the user.
        console.warn('Tracking event failed to send:', {
            eventType,
            payload,
            error: error.response?.data?.message || error.message
        });
    });
};

const trackingApi = {
    trackEvent,
    getSessionId
};

export default trackingApi;
