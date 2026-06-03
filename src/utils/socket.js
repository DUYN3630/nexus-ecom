import { io } from 'socket.io-client';

// Use the same logic as axiosClient for URL
const getSocketURL = () => {
  const isLocal = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') || 
    window.location.hostname.startsWith('172.') || 
    window.location.hostname.endsWith('.local');

  return isLocal ? 'http://localhost:5000' : 'https://nexus-ecom-es17.onrender.com';
};

const socket = io(getSocketURL(), {
  autoConnect: false,
});

export default socket;
