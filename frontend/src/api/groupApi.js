import $api from "../http";

export const GroupAPI = {
    createGroup: async (groupData, imageFile) => { // groupData: { name, description, userId (creator) }
        const formData = new FormData();
        formData.append('group', new Blob([JSON.stringify(groupData)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('image', imageFile); // 'image' как в контроллере
        }
        const response = await $api.post(`/groups/new`, formData);
        return response.data; // GroupResponseDto
    },

    getGroupById: async (groupId) => {
        const response = await $api.get(`/groups/${groupId}`);
        return response.data; // GroupResponseDto
    },

    updateGroup: async (groupId, groupData, imageFile) => { // groupData: { name, description }
        const formData = new FormData();
        formData.append('group', new Blob([JSON.stringify(groupData)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const response = await $api.patch(`/groups/${groupId}/edit`, formData);
        return response.data; // GroupResponseDto
    },

    deleteGroup: async (groupId) => {
        const response = await $api.delete(`/groups/${groupId}/delete`); // Предполагаемый эндпоинт
        return response.data;
    },

    joinGroup: async (groupId) => {
        const response = await $api.post(`/groups/${groupId}/join`); // Предполагаемый эндпоинт
        return response.data; // GroupMemberDto или GroupResponseDto
    },

    leaveGroup: async (groupId) => {
        const response = await $api.post(`/groups/${groupId}/leave`); // Предполагаемый эндпоинт
        return response.data;
    },

    getGroupMembers: async (groupId) => {
        const response = await $api.get(`/groups/${groupId}/members`); // Предполагаемый эндпоинт
        return response.data; // List<GroupMemberDto>
    },

    // Получение групп, в которых состоит пользователь (может быть частью UserResponseDto)
    getUserGroups: async (userId) => { // userId может быть 'me'
        const response = await $api.get(`/users/${userId}/groups`); // Предполагаемый эндпоинт
        return response.data; // List<UserGroupDto> или List<GroupMinimalResponseDto>
    },

    // Если есть эндпоинт для рекомендованных/интересных групп
    getInterestingGroups: async () => {
        const response = await $api.get(`/groups/possible_groups`); // Предполагаемый эндпоинт
        return response.data; // List<GroupMinimalResponseDto>
    }
};