import { makeAutoObservable, runInAction } from "mobx";
import { GroupAPI } from "../api/groupApi";

export class GroupStore {
    _userGroups = [];
    _currentGroupDetails = null; 
    _recommendedGroups = [];
    _loading = false;
    _error = null;

    constructor(rootStore) {
        makeAutoObservable(this);
        this.rootStore = rootStore;
    }

    setLoading(bool) { this._loading = bool; }
    setError(error) { this._error = error; }

    get userGroups() { return this._userGroups; }
    get currentGroupDetails() { return this._currentGroupDetails; }
    get currentGroupPosts() { return this._currentGroupDetails?.posts || []; }
    get currentGroupMembers() { return this._currentGroupDetails?.members || []; }
    get recommendedGroups() { return this._recommendedGroups; }
    get loading() { return this._loading; }
    get error() { return this._error; }

    async fetchUserGroups() {
        const userId = this.rootStore.userStore.userId;
        if (!userId) return;
        this.setLoading(true);
        this.setError(null);
        try {
            // Предполагается, что API вернет группы для 'me' или конкретного ID
            const groups = await GroupAPI.getUserGroups('me');
            runInAction(() => {
                this._userGroups = groups;
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch user groups"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async fetchGroupDetails(groupId) {
        this.setLoading(true);
        this.setError(null);
        try {
            const groupDetails = await GroupAPI.getGroupById(groupId);
            runInAction(() => {
                this._currentGroupDetails = groupDetails;
            });
        } catch (e) {
            runInAction(() => {
                this.setError(e.response?.data?.message || "Failed to fetch group details");
                this._currentGroupDetails = null; // Очищаем в случае ошибки
            });
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async createGroup(groupName, description, imageFile) {
        const userId = this.rootStore.userStore.userId;
        if (!userId) {
            this.setError("User not authenticated");
            return null;
        }
        const groupData = {
            name: groupName,
            description: description,
            userId: userId // creatorId
        };

        this.setLoading(true);
        this.setError(null);
        try {
            const newGroup = await GroupAPI.createGroup(groupData, imageFile);
            runInAction(() => {
                this._userGroups.push({ // Добавляем в список групп пользователя (упрощенный вариант)
                    id: newGroup.id,
                    name: newGroup.name,
                    imageUrl: newGroup.imageUrl,
                    role: 'ADMIN' // или OWNER, зависит от логики сервера
                });
                // Можно также обновить this._currentGroupDetails, если нужно сразу перейти
            });
            return newGroup; // Возвращаем созданную группу для редиректа и т.д.
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to create group"));
            console.error(e);
            return null;
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async updateGroup(groupId, groupName, description, imageFile, changePhoto) {
        const groupData = {
            name: groupName,
            description: description,
        };
        // imageFile будет передан отдельно, если changePhoto === true

        this.setLoading(true);
        this.setError(null);
        try {
            const updatedGroup = await GroupAPI.updateGroup(groupId, groupData, changePhoto ? imageFile : null);
            runInAction(() => {
                this._currentGroupDetails = updatedGroup;
                // Обновить _userGroups если имя или картинка изменились
                const index = this._userGroups.findIndex(g => g.id === groupId);
                if (index !== -1) {
                    this._userGroups[index] = {
                        ...this._userGroups[index],
                        name: updatedGroup.name,
                        imageUrl: updatedGroup.imageUrl,
                    };
                }
            });
            return updatedGroup;
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to update group"));
            console.error(e);
            return null;
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }
    
    async joinGroup(groupId) {
        this.setLoading(true);
        this.setError(null);
        try {
            await GroupAPI.joinGroup(groupId);
            runInAction(() => {
                // Обновить currentGroupDetails (добавить мембера)
                // Обновить userGroups (добавить группу, если ее там не было)
                if (this._currentGroupDetails && this._currentGroupDetails.id === groupId) {
                    // Логика добавления текущего пользователя в список members
                    // Это сложнее, так как API может не вернуть обновленный список members
                    // Проще перезапросить fetchGroupDetails
                    this.fetchGroupDetails(groupId);
                }
                this.fetchUserGroups(); // Обновить список групп пользователя
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to join group"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async leaveGroup(groupId) {
        this.setLoading(true);
        this.setError(null);
        try {
            await GroupAPI.leaveGroup(groupId);
             runInAction(() => {
                if (this._currentGroupDetails && this._currentGroupDetails.id === groupId) {
                    this.fetchGroupDetails(groupId); // Обновить
                }
                this._userGroups = this._userGroups.filter(g => g.id !== groupId);
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to leave group"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async fetchRecommendedGroups() {
        this.setLoading(true);
        this.setError(null);
        try {
            const groups = await GroupAPI.getInterestingGroups();
            runInAction(() => {
                this._recommendedGroups = groups;
            });
        } catch (e) {
             runInAction(() => { // Mock data as example
                this.setError(e.response?.data?.message || "Failed to fetch recommended groups")
                console.error(e);
            });
            console.warn("fetchRecommendedGroups: API endpoint might not exist or failed, using mock. ", e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }
}