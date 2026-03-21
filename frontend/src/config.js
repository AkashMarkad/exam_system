// Configuration file for frontend application
// You can override these values using environment variables starting with REACT_APP_

const dev = {
    // Development API Base URL
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',

    // Other frontend configurations can go here
    APP_NAME: 'Exam System (Dev)',
    VERSION: '1.0.0-dev',
};

const prod = {
    // Production API Base URL
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://examsystem-production.up.railway.app:8080/api',

    // Other frontend configurations can go here
    APP_NAME: 'Exam System',
    VERSION: '1.0.0',
};

// Select configuration based on the environment (NODE_ENV is set by CRA)
const config = process.env.NODE_ENV === 'development' ? dev : prod;

export default config;
