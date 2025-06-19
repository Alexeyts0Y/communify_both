import { makeAutoObservable, runInAction } from "mobx";
import { jwtDecode } from "jwt-decode";
import { AuthAPI } from "../api/authApi";
import { UserAPI } from "../api/userApi";

export class UserStore {
    _isAuth = false;
    _user = {}; // Данные текущего авторизованного пользователя (UserResponseDto)
    _token = null;
    _currentProfile = null; // Данные просматриваемого профиля (UserResponseDto)
    _searchResults = [];
    _loading = false;
    _error = null;

    constructor() {
        makeAutoObservable(this);
        this.loadToken();
    }

    // Setters & Actions
    setLoading(bool) {
        this._loading = bool;
    }

    setError(error) {
        this._error = error;
    }

    setIsAuth(bool) {
        this._isAuth = bool;
    }

    setUser(user) { // user is UserResponseDto, potentially with posts and groups
        this._user = user;
    }

    setToken(token) {
        this._token = token;
        if (token) {
            localStorage.setItem('token', token);
            this.setIsAuth(true);
            try {
                const decoded = jwtDecode(token);
                // Initial user object from token (might be minimal)
                const minimalUser = {
                    id: decoded.id,
                    email: decoded.email,
                    roles: decoded.roles || [],
                    firstName: decoded.firstName,
                    lastName: decoded.lastName,
                    avatarUrl: decoded.avatarUrl,
                };
                // Set user based on token, but this might not have posts/groups yet
                this.setUser(minimalUser);

                // If user details from token are minimal, fetch full profile
                // This fetchCurrentUser should ideally get the UserResponseDto with posts and groups
                // if you want them immediately available in userStore.user
                if (!this._user.firstName && this._user.id) { // Example condition
                    this.fetchCurrentUser(); // This should fetch UserResponseDto
                }
            } catch (e) {
                console.error("Failed to decode token or set user:", e);
                this.logout();
            }
        } else {
            localStorage.removeItem('token');
            this.setIsAuth(false);
            this.setUser({});
        }
    }

    setCurrentProfile(user) { // user is UserResponseDto, with posts and groups
        this._currentProfile = user;
    }

    setSearchResults(users) {
        this._searchResults = users;
    }

    loadToken() {
        const token = localStorage.getItem('token');
        if (token) {
            this.setToken(token);
        }
    }

    async login(username, password) {
        this.setLoading(true);
        this.setError(null);
        try {
            const data = await AuthAPI.login(username, password);
            runInAction(() => {
                this.setToken(data.token);
                // After login, setToken calls fetchCurrentUser if needed,
                // or fetchCurrentUser explicitly here if setToken doesn't.
                // To ensure userStore.user has posts and groups, fetchCurrentUser needs to get the full DTO.
                if (this.userId) {
                    this.fetchCurrentUser(); // Ensure full profile is loaded into userStore.user
                }
            });
            return true;
        } catch (e) {
            runInAction(() => {
                this.setError(e.response?.data?.message || "Login failed");
            });
            console.error(e);
            return false;
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async register(userData) {
        this.setLoading(true);
        this.setError(null);
        try {
            const data = await AuthAPI.register(userData);
            runInAction(() => {
                if (data.token) {
                    this.setToken(data.token);
                     if (this.userId) {
                        this.fetchCurrentUser(); // Ensure full profile is loaded into userStore.user
                    }
                } else {
                    console.log("Registration successful, please login.", data);
                }
            });
            return true;
        } catch (e) {
            runInAction(() => {
                this.setError(e.response?.data?.message || "Registration failed");
            });
            console.error(e);
            return false;
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    logout() {
        this.setToken(null);
    }

    async fetchCurrentUser() {
        if (!this.userId) return;
        this.setLoading(true);
        try {
            // This call should return the UserResponseDto including 'posts' and 'groups' arrays
            const userData = await UserAPI.getUserById(this.userId);
            runInAction(() => {
                this.setUser(userData); // Updates userStore.user with full data
            });
        } catch (e) {
            console.error("Failed to fetch current user data", e);
            runInAction(() => {
                 this.setError(e.response?.data?.message || "Failed to fetch user data");
            });
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async fetchUserProfile(userId) {
        this.setLoading(true);
        this.setError(null);
        try {
            const numericUserId = Number(userId); // Ensure userId is number for comparison
            // This call must return UserResponseDto including 'posts' and 'groups'
            const userData = await UserAPI.getUserById(numericUserId);
            runInAction(() => {
                this.setCurrentProfile(userData); // Populates userStore.currentProfile

                // If the fetched profile is for the currently authenticated user,
                // also update userStore.user with this complete data.
                if (this.userId && numericUserId === this.userId) {
                    this.setUser(userData);
                }
            });
            return userData; // Return for potential chaining
        } catch (e) {
            runInAction(() => {
                this.setError(e.response?.data?.message || "Failed to fetch profile");
            });
            console.error(e);
            throw e; // Re-throw for component to handle if needed
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async updateUser(userId, userData, avatarFile) {
        this.setLoading(true);
        this.setError(null);
        try {
            const numericUserId = Number(userId);
            // Assume updateUser API returns the updated UserResponseDto (potentially with posts/groups)
            const updatedUser = await UserAPI.updateUser(numericUserId, userData, avatarFile);
            runInAction(() => {
                // If updated profile is the current user, update userStore.user
                if (numericUserId === this.userId) {
                    // Merge or replace? If updatedUser contains posts/groups, direct set is fine.
                    // If API returns only updated fields, a merge might be needed with existing this._user.
                    // Assuming it returns the full UserResponseDto:
                    this.setUser(updatedUser);
                }
                // If updated profile is the one being viewed (userStore.currentProfile)
                if (this._currentProfile && this._currentProfile.id === numericUserId) {
                    this.setCurrentProfile(updatedUser);
                }
            });
            return true;
        } catch (e) {
             runInAction(() => {
                this.setError(e.response?.data?.message || "Failed to update profile");
            });
            console.error(e);
            return false;
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async changePassword(oldPassword, newPassword) {
        if (!this.userId) return false;
        this.setLoading(true);
        this.setError(null);
        try {
            await AuthAPI.changePassword(this.userId, oldPassword, newPassword);
            return true;
        } catch (e) {
            runInAction(() => {
                this.setError(e.response?.data?.message || "Failed to change password");
            });
            console.error(e);
            return false;
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    // Getters
    get isAuth() { return this._isAuth; }
    get user() { return this._user; } // Should now contain posts & groups if fetched
    get userId() { return this._user?.id || null; }
    get currentProfile() { return this._currentProfile; } // Should now contain posts & groups
    get searchResults() { return this._searchResults; }
    get token() { return this._token; }
    get loading() { return this._loading; }
    get error() { return this._error; }

    isGroupAdmin(groupId) {
        if (!this._token) return false;
        try {
            const decoded = jwtDecode(this._token);
            const roles = decoded.roles || [];
            return roles.includes(`GROUP_${groupId}_ADMIN`);
        } catch (e) {
            return false;
        }
    }
}