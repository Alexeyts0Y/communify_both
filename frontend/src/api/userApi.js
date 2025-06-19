import $api from "../http";

export const UserAPI = {
    getUserById: async (userId) => {
        const response = await $api.get(`/users/${userId}`);
        return response.data; // UserResponseDto
    },

    updateUser: async (userId, userData, avatarFile) => {
        const formData = new FormData();
        formData.append('user', new Blob([JSON.stringify(userData)], { type: 'application/json' }));
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        // Axios сам установит Content-Type: multipart/form-data
        const response = await $api.patch(`/users/${userId}`, formData);
        return response.data; // UserResponseDto
    },

    // Если есть поиск пользователей
    searchUsers: async (query) => {
        const response = await $api.get(`/users/search?query=${query}`);
        return response.data; // List<UserMinimalResponseDto>
    }
};