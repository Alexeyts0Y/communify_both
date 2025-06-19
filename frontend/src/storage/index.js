import React, { createContext, useContext } from 'react';
import { UserStore } from './UserStore';
import { PostStore } from './PostStore';
import { FriendStore } from './FriendStore';
import { GroupStore } from './GroupStore';

class RootStore {
    constructor() {
        this.userStore = new UserStore(this);
        this.postStore = new PostStore(this);
        this.friendStore = new FriendStore(this);
        this.groupStore = new GroupStore(this);
    }
}

const rootStore = new RootStore();

export const Context = createContext(rootStore);

export const useStores = () => useContext(Context);