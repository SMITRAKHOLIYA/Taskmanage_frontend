import axios from "axios";


// IMPORTANT: api.php must be in baseURL
// Update this to your live backend URL
// Update this to your live backend URL
// Update this to your live backend URL
export const API_BASE_URL = "https://taskmanage.iceiy.com/task_backend/backend/api.php/";

const api = axios.create({
    baseURL: API_BASE_URL,
});
export const MEDIA_URL = "https://taskmanage.iceiy.com/task_backend/backend/"; // Explicit media URL root
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

        // Debug Logs
        // console.group("🚀 API Request Debug Info");
        // console.log(`%c URL:`, 'font-weight: bold; color: #00f6ff;', `${config.baseURL}${config.url}`);
        // console.log(`%c Method:`, 'font-weight: bold; color: #a100ff;', config.method.toUpperCase());
        // console.log(`%c Headers:`, 'font-weight: bold; color: #ffa500;', config.headers);
        // console.log(`%c Payload:`, 'font-weight: bold; color: #00ff00;', config.data);
        // console.groupEnd();

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
