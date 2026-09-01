// All API calls use this single URL.
// When running locally, set REACT_APP_API_URL=http://localhost:5000 in the .env file
// When live (Vercel/Netlify), set REACT_APP_API_URL as an Environment Variable to your Render backend URL.
// The fallback below is the live Render backend — it's only used if that
// Environment Variable is ever missing, so local dev (with .env present)
// and Vercel (with the Environment Variable set) both work as expected.
const API_URL = process.env.REACT_APP_API_URL || 'https://gvs-ngo-website.onrender.com';

export default API_URL;
