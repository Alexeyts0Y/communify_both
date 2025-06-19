import { makeAutoObservable, runInAction } from "mobx";
import { FriendsAPI } from "../api/friendApi";

export class FriendStore {
    _myFriends = []; // UserMinimalResponseDto[] - друзья текущего пользователя
    _userFriends = []; // UserMinimalResponseDto[] - друзья просматриваемого пользователя
    _receivedRequests = []; // FriendResponseDto[] - входящие заявки (где friend это 'me')
    _sentRequests = []; // FriendResponseDto[] - исходящие заявки (где user это 'me')
    _recommendedFriends = []; // UserMinimalResponseDto[]
    _loading = false;
    _error = null;

    constructor(rootStore) { // rootStore для доступа к UserStore.userId
        makeAutoObservable(this);
        this.rootStore = rootStore;
        // Инициализационные данные (если нужны при старте)
        // this.fetchMyFriends();
        // this.fetchReceivedRequests();
    }

    setLoading(bool) { this._loading = bool; }
    setError(error) { this._error = error; }

    // Getters
    get myFriends() { return this._myFriends; }
    get userFriends() { return this._userFriends; }
    get receivedRequests() { return this._receivedRequests; } // Для отображения нужно user из FriendResponseDto
    get sentRequests() { return this._sentRequests; }     // Для отображения нужно friend из FriendResponseDto
    get recommendedFriends() { return this._recommendedFriends; }
    get loading() { return this._loading; }
    get error() { return this._error; }


    async fetchMyFriends() {
        if (!this.rootStore.userStore.userId) return;
        this.setLoading(true);
        this.setError(null);
        try {
            // API может требовать 'me' или конкретный ID
            const friends = await FriendsAPI.getFriends('me');
            runInAction(() => {
                this._myFriends = friends;
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch friends"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async fetchUserFriends(userId) {
        this.setLoading(true);
        this.setError(null);
        try {
            const friends = await FriendsAPI.getFriends(userId);
            runInAction(() => {
                this._userFriends = friends;
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch user friends"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async fetchReceivedRequests() {
        this.setLoading(true);
        this.setError(null);
        try {
            const requests = await FriendsAPI.getReceivedRequests();
            runInAction(() => {
                this._receivedRequests = requests;
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch received requests"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async fetchSentRequests() {
        this.setLoading(true);
        this.setError(null);
        try {
            const requests = await FriendsAPI.getSentRequests();
            runInAction(() => {
                this._sentRequests = requests;
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch sent requests"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async sendFriendRequest(recipientUserId) {
        this.setLoading(true);
        this.setError(null);
        try {
            await FriendsAPI.sendRequest(recipientUserId);
            // Обновить список отправленных запросов или просто показать уведомление
            this.fetchSentRequests(); // Обновляем для актуальности
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to send request"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async acceptFriendRequest(requestId) { // requestId - это ID из FriendResponseDto
        this.setLoading(true);
        this.setError(null);
        try {
            await FriendsAPI.acceptRequest(requestId);
            runInAction(() => {
                this._receivedRequests = this._receivedRequests.filter(req => req.id !== requestId);
                // Можно также обновить список друзей
                this.fetchMyFriends();
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to accept request"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async rejectFriendRequest(requestId) { // requestId - это ID из FriendResponseDto
        this.setLoading(true);
        this.setError(null);
        try {
            await FriendsAPI.rejectRequest(requestId);
            runInAction(() => {
                this._receivedRequests = this._receivedRequests.filter(req => req.id !== requestId);
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to reject request"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async removeFriend(friendId) { // friendId - ID пользователя, которого удаляем из друзей
        if (!this.rootStore.userStore.userId) return;
        this.setLoading(true);
        this.setError(null);
        try {
            await FriendsAPI.removeFriend(this.rootStore.userStore.userId, friendId); // или просто friendId если /me/..
            runInAction(() => {
                this._myFriends = this._myFriends.filter(friend => friend.id !== friendId);
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to remove friend"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async cancelSentRequest(requestId) { // requestId - это ID из FriendResponseDto
        this.setLoading(true);
        this.setError(null);
        try {
            // Используем rejectRequest или отдельный cancelSentRequest эндпоинт
            await FriendsAPI.rejectRequest(requestId); // или FriendsAPI.cancelSentRequest(requestId)
            runInAction(() => {
                this._sentRequests = this._sentRequests.filter(req => req.id !== requestId);
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to cancel request"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async fetchRecommendedFriends() {
        this.setLoading(true);
        this.setError(null);
        try {

            const friends = await FriendsAPI.getRecommended();
            runInAction(() => {
                this._recommendedFriends = friends;
            });
            // console.warn("fetchRecommendedFriends: API endpoint not specified, using mock data.");
            //  runInAction(() => { // Mock data as example
            //     this._recommendedFriends = [
            //         {id: 101, firstName: 'Rec', lastName: 'One', avatarUrl: '/default_avatar.png'},
            //         {id: 102, firstName: 'Rec', lastName: 'Two', avatarUrl: '/default_avatar.png'}
            //     ];
            // });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch recommended friends"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }
}