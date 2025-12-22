// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || '/api';

// const api = axios.create({
//     baseURL: API_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// export const MEDIA_URL = API_URL.replace('/api', '');

// api.interceptors.request.use(
//     (config) => {
//         const user = JSON.parse(localStorage.getItem('user'));
//         if (user && user.token) {
//             config.headers.Authorization = `Bearer ${user.token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// export default api;


import axios from "axios";

// IMPORTANT: api.php must be in baseURL
const API_URL = import.meta.env.VITE_API_URL || "https://taskmanage.iceiy.com/api.php";

const api = axios.create({
    baseURL: API_URL,
    // DO NOT set default Content-Type
    // DO NOT use withCredentials
});

// Attach token ONLY when needed (not for login/register)
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem("user"));

        // Skip token for auth endpoints
        if (
            user &&
            user.token &&
            !config.url.includes("/auth/login") &&
            !config.url.includes("/auth/register")
        ) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);
export const MEDIA_URL = API_URL.replace('/api', '');
export default api;
