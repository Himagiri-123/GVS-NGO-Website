// All API calls use this single URL.
// When running locally, set REACT_APP_API_URL=http://localhost:5000 in the .env file
// When live (Vercel/Netlify), set REACT_APP_API_URL as an Environment Variable to your Render backend URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_URL;
