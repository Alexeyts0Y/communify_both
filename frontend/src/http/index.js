import axios from 'axios';

export const API_URL = 'http://194.87.98.76:8080/api';

const $api = axios.create({
    baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default $api;