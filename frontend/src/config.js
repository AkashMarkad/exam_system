// Configuration file for frontend application
// You can override these values using environment variables starting with REACT_APP_

const config = {
    // API Base URL
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api',
    
    // Other frontend configurations can go here
    APP_NAME: 'Exam System',
    VERSION: '1.0.0',
};

export default config;
