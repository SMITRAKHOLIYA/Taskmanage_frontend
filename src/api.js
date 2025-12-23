import axios from "axios";


// IMPORTANT: api.php must be in baseURL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api.php";

const api = axios.create({
    baseURL: API_URL,
});
console.log("DEBUG: Axios instance created with baseURL:", API_URL);
export const MEDIA_URL = API_URL.replace('/api', '');
// Attach token ONLY when needed (not for login/register)
api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        // Ensure URL is relative to baseURL if it starts with /
        if (config.url.startsWith('/')) {
            config.url = config.url.substring(1);
        }

        // Skip token for auth endpoints
        if (
            user &&
            user.token &&
            !config.url.includes("auth/login") &&
            !config.url.includes("auth/register")
        ) {
            config.headers.Authorization = `Bearer ${user.token} `;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
