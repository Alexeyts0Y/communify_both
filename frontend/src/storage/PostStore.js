import { makeAutoObservable, runInAction } from "mobx";
import { PostAPI } from "../api/postApi";

export class PostStore {
    _feedPosts = [];
    _userPosts = [];
    _groupPosts = [];
    _recommendedPosts = [];
    _currentPost = null;

    _currentPageFeed = 0;
    _hasMoreFeed = true;
    _loadingMoreFeed = false;

    _currentPageRec = 0;
    _hasMoreRec = true;
    _loadingMoreRec = false;

    _loading = false;
    _error = null;
    rootStore = null;

    constructor(rootStore) {
        makeAutoObservable(this);
        this.rootStore = rootStore;
    }

    setLoading(bool) { this._loading = bool; }
    setError(error) { this._error = error; }

    get feedPosts() { return this._feedPosts; }
    get userPosts() { return this._userPosts; }
    get groupPosts() { return this._groupPosts; }
    get recommendedPosts() { return this._recommendedPosts; }
    get currentPost() { return this._currentPost; }
    get loading() { return this._loading; }
    get error() { return this._error; }

    get currentPageFeed() { return this._currentPageFeed; }
    get hasMoreFeed() { return this._hasMoreFeed; }
    get loadingMoreFeed() { return this._loadingMoreFeed; }

    get currentPageRec() { return this._currentPageRec; }
    get hasMoreRec() { return this._hasMoreRec; }
    get loadingMoreRec() { return this._loadingMoreRec; }


    async fetchFeedPosts(initial = false) {
        if (initial) {
            runInAction(() => {
                this._feedPosts = [];
                this._currentPageFeed = 0;
                this._hasMoreFeed = true;
                this.setLoading(true);
            });
        } else {
            if (this._loadingMoreFeed || !this._hasMoreFeed) return;
            runInAction(() => {
                this._loadingMoreFeed = true;
            });
        }
        this.setError(null);

        try {
            const postsPage = await PostAPI.getLatest(this._currentPageFeed, 10);
            runInAction(() => {
                this._feedPosts = initial ? postsPage.content : [...this._feedPosts, ...postsPage.content];
                this._hasMoreFeed = !postsPage.last;
                if (!postsPage.last) {
                    this._currentPageFeed += 1;
                }
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch feed posts"));
            console.error(e);
        } finally {
            runInAction(() => {
                if (initial) this.setLoading(false);
                this._loadingMoreFeed = false;
            });
        }
    }

    async fetchRecommendedPosts(initial = false) {
        if (initial) {
            runInAction(() => {
                this._recommendedPosts = [];
                this._currentPageRec = 0;
                this._hasMoreRec = true;
                this.setLoading(true);
            });
        } else {
            if (this._loadingMoreRec || !this._hasMoreRec) return;
            runInAction(() => {
                this._loadingMoreRec = true;
            });
        }
        this.setError(null);

        try {
            const postsPage = await PostAPI.getRecommended(this._currentPageRec, 10);
            runInAction(() => {
                this._recommendedPosts = initial ? postsPage.content : [...this._recommendedPosts, ...postsPage.content];
                this._hasMoreRec = !postsPage.last;
                if (!postsPage.last) {
                    this._currentPageRec += 1;
                }
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch recommended posts"));
            console.error(e);
        } finally {
            runInAction(() => {
                if (initial) this.setLoading(false);
                this._loadingMoreRec = false;
            });
        }
    }

    async fetchUserPosts(userId) {
        this.setLoading(true);
        this.setError(null);
        try {
            const posts = await PostAPI.getPostsByUserId(userId);
            runInAction(() => {
                this._userPosts = posts.content;
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch user posts"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async fetchGroupPosts(groupId) {
        this.setLoading(true);
        this.setError(null);
        try {
            const posts = await PostAPI.getPostsByGroupId(groupId);
            runInAction(() => {
                this._groupPosts = posts.content;
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to fetch group posts"));
            console.error(e);
        } finally {
            runInAction(() => this.setLoading(false));
        }
    }

    async createPost(postContent, imageFile, groupId = null) {
        const userId = this.rootStore.userStore.userId;
        if (!userId) {
            this.setError("User not authenticated");
            return false;
        }
        const postData = {
            content: postContent,
            userId: userId,
            groupId: groupId
        };

        this.setError(null);
        try {
            const newPost = await PostAPI.createPost(postData, imageFile);
            runInAction(() => {
                this._feedPosts.unshift(newPost);
                
                if (groupId) {
                    // Логика обновления постов группы
                } else {
                   // Логика обновления постов пользователя
                }
            });
            return true;
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to create post"));
            console.error(e);
            return false;
        } finally {
            // runInAction(() => this.setLoading(false));
        }
    }

    async deletePost(postId) {
        this.setError(null);
        try {
            await PostAPI.deletePost(postId);
            runInAction(() => {
                this._feedPosts = this._feedPosts.filter(p => p.id !== postId);
                this._userPosts = this._userPosts.filter(p => p.id !== postId);
                this._groupPosts = this._groupPosts.filter(p => p.id !== postId);
                this._recommendedPosts = this._recommendedPosts.filter(p => p.id !== postId);
                // Удаление элемента может нарушить пагинацию.
                // Для простоты, просто удаляем. При необходимости можно перезагрузить.
            });
        } catch (e) {
            runInAction(() => this.setError(e.response?.data?.message || "Failed to delete post"));
            console.error(e);
        } finally {
            // runInAction(() => this.setLoading(false));
        }
    }

    _updatePostLike(postId, updatedPostData) {
        const update = (postsArray) => postsArray.map(p => p.id === postId ? {...p, ...updatedPostData} : p);
        this._feedPosts = update(this._feedPosts);
        this._userPosts = update(this._userPosts);
        this._groupPosts = update(this._groupPosts);
        this._recommendedPosts = update(this._recommendedPosts);
        if (this._currentPost?.id === postId) {
            this._currentPost = {...this._currentPost, ...updatedPostData};
        }
    }

    async likePost(postId) {
        const originalPosts = {
            feed: [...this._feedPosts],
            user: [...this._userPosts],
            group: [...this._groupPosts],
            rec: [...this._recommendedPosts],
            current: this._currentPost ? {...this._currentPost} : null
        };
        const postToUpdate = this._feedPosts.find(p => p.id === postId) ||
                             this._userPosts.find(p => p.id === postId) ||
                             this._groupPosts.find(p => p.id === postId) ||
                             this._recommendedPosts.find(p => p.id === postId) ||
                             (this._currentPost?.id === postId ? this._currentPost : null);


        if (postToUpdate) {
            runInAction(() => {
                this._updatePostLike(postId, {
                    likeCount: postToUpdate.likeCount + 1,
                    likedByCurrentUser: true
                });
            });
        }

        try {
            await PostAPI.likePost(postId);
        } catch (e) {
            runInAction(() => {
                this.setError(e.response?.data?.message || "Failed to like post");
                this._feedPosts = originalPosts.feed;
                this._userPosts = originalPosts.user;
                this._groupPosts = originalPosts.group;
                this._recommendedPosts = originalPosts.rec;
                if (originalPosts.current) this._currentPost = originalPosts.current;
                else if (this._currentPost?.id === postId) this._currentPost = null;
            });
            console.error(e);
        }
    }

    async unlikePost(postId) {
        const originalPosts = {
            feed: [...this._feedPosts],
            user: [...this._userPosts],
            group: [...this._groupPosts],
            rec: [...this._recommendedPosts],
            current: this._currentPost ? {...this._currentPost} : null
        };
        const postToUpdate = this._feedPosts.find(p => p.id === postId) ||
                             this._userPosts.find(p => p.id === postId) ||
                             this._groupPosts.find(p => p.id === postId) ||
                             this._recommendedPosts.find(p => p.id === postId) ||
                             (this._currentPost?.id === postId ? this._currentPost : null);

        if (postToUpdate) {
             runInAction(() => {
                this._updatePostLike(postId, {
                    likeCount: postToUpdate.likeCount - 1,
                    likedByCurrentUser: false
                });
            });
        }
        try {
            await PostAPI.unlikePost(postId);
        } catch (e) {
            runInAction(() => {
                this.setError(e.response?.data?.message || "Failed to unlike post");
                this._feedPosts = originalPosts.feed;
                this._userPosts = originalPosts.user;
                this._groupPosts = originalPosts.group;
                this._recommendedPosts = originalPosts.rec;
                if (originalPosts.current) this._currentPost = originalPosts.current;
                else if (this._currentPost?.id === postId) this._currentPost = null;
            });
            console.error(e);
        }
    }

    _resetFeedStateInternal() {
        this._feedPosts = [];
        this._currentPageFeed = 0;
        this._hasMoreFeed = true;
        this._loadingMoreFeed = false;
    }

    _resetRecommendedStateInternal() {
        this._recommendedPosts = [];
        this._currentPageRec = 0;
        this._hasMoreRec = true;
        this._loadingMoreRec = false;
    }
}