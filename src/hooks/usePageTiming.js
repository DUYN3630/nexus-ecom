import { useEffect, useRef } from 'react';
import trackingApi from '../api/trackingApi';

/**
 * Custom hook to track the time a user spends on a page.
 * It sends a tracking event when the component using the hook unmounts.
 * 
 * @param {boolean} isTracking - A flag to enable or disable tracking.
 * @param {string} eventType - The type of event to track (e.g., 'time_on_page').
 * @param {object} payload - The payload to send with the tracking event.
 */
const usePageTiming = (isTracking, eventType, payload) => {
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Reset start time if tracking conditions change
    startTimeRef.current = Date.now();

    const handleBeforeUnload = () => {
      if (!isTracking) return;
      
      const durationMs = Date.now() - startTimeRef.current;
      const finalPayload = {
        ...payload,
        durationMs,
        pageUrl: window.location.pathname,
      };
      // Note: sendBeacon is more reliable for unload events, but requires a different endpoint setup.
      // For simplicity with our current setup, we'll rely on the unmount cleanup.
      trackingApi.trackEvent(eventType, finalPayload);
    };

    // Add event listener for when the user closes the tab/browser
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function for when the component unmounts (e.g., navigating away)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (!isTracking) return;
      
      const durationMs = Date.now() - startTimeRef.current;
      const finalPayload = {
        ...payload,
        durationMs,
        pageUrl: window.location.pathname,
      };
      
      trackingApi.trackEvent(eventType, finalPayload);
    };
  }, [isTracking, eventType, payload]); // Rerun effect if these change
};

export default usePageTiming;
