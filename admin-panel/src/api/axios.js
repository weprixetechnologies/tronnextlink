import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://api-backend-tronnext.duckdns.org/api',
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
