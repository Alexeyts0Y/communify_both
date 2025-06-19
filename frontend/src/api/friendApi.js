import $api from "../http";

export const FriendsAPI = {
    getFriends: async (userId) => {
        const response = await $api.get(`/users/${userId}/friends`);
        return response.data;
    },

    removeFriend: async (currentUserId, friendId) => {
        const response = await $api.delete(`/users/me/friends/delete/${friendId}`);
        return response.data;
    },

    getRecommended: async () => {
        const response = await $api.get(`/users/me/possible_friends`);
        return response.data;
    },

    sendRequest: async (recipientUserId) => {
        const response = await $api.post(`/users/${recipientUserId}/send_friend_request`);
        return response.data;
    },

    getSentRequests: async () => {
        const response = await $api.get(`/users/me/friends/requests/sent`);
        return response.data;
    },

    getReceivedRequests: async () => {
        const response = await $api.get(`/users/me/friends/requests/recieved`);
        return response.data;
    },

    acceptRequest: async (requestId) => {
        const response = await $api.patch(`/users/me/friends/requests/${requestId}/accept`);
        return response.data;
    },

    rejectRequest: async (requestId) => {
        const response = await $api.patch(`/users/me/friends/requests/${requestId}/reject`);
        return response.data;
    },

    cancelSentRequest: async (requestId) => {
         const response = await $api.delete(`/users/me/friends/requests/sent/${requestId}/cancel`);
         return response.data;
    }
};