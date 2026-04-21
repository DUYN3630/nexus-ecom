const axios = require('axios');

async function checkFeaturedAPI() {
    try {
        // Giả lập gọi API local
        const response = await axios.get('http://127.0.0.1:5000/api/products/featured');
        console.log("Status:", response.status);
        console.log("Data Type:", Array.isArray(response.data) ? "Array" : typeof response.data);
        console.log("Data Length:", response.data.length);
        if (response.data.length > 0) {
            console.log("First Product:", JSON.stringify(response.data[0], null, 2));
        } else {
            console.log("⚠️ API returned empty array!");
        }
    } catch (error) {
        console.error("❌ API Error:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
}

checkFeaturedAPI();
