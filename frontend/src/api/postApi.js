import $api from "../http";

export const PostAPI = {
    getLatest: async (page = 0, size = 10) => {
        const response = await $api.get(`/posts/feed?page=${page}&size=${size}&sort=createdAt,desc`);
        return response.data; // Ожидаем Page<PostResponseDto>
    },

    getRecommended: async (page = 0, size = 10) => {
        const response = await $api.get(`/recommendations?page=${page}&size=${size}`);
        return response.data; // Ожидаем Page<PostResponseDto>
    },

    createPost: async (postData, imageFile) => { // postData: { content, userId, groupId }
        const formData = new FormData();
        formData.append('post', new Blob([JSON.stringify(postData)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await $api.post(`/posts/new`, formData);
        return response.data; // PostResponseDto
    },

    deletePost: async (postId) => {
        const response = await $api.delete(`/posts/${postId}/delete`);
        return response.data; // Обычно пустое тело или сообщение об успехе
    },

    getPostsByUserId: async (userId) => {
        const response = await $api.get(`/users/${userId}/posts`); // Предполагаемый эндпоинт
        return response.data; // List<PostResponseDto>
    },

    getPostsByGroupId: async (groupId) => {
        const response = await $api.get(`/groups/${groupId}/posts`); // Предполагаемый эндпоинт
        return response.data; // List<PostResponseDto>
    },

    likePost: async (postId) => {
        const response = await $api.post(`/posts/${postId}/like`); // Предполагаемый эндпоинт
        return response.data; // PostResponseDto (обновленный) или { success: true }
    },

    unlikePost: async (postId) => {
        const response = await $api.delete(`/posts/${postId}/unlike`); // Предполагаемый эндпоинт
        return response.data; // PostResponseDto (обновленный) или { success: true }
    }
};