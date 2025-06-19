import $api from "../http";

export const AuthAPI = {
    login: async (username, password) => {
        const response = await $api.post('/auth/login', { username, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await $api.post('/auth/register', userData);
        return response.data;
    },

    changePassword: async (userId, oldPassword, newPassword) => {
        const response = await $api.post(`/users/${userId}/change-password`, { oldPassword, newPassword });
        return response.data;
    }
};