import React from 'react';
import { createContext } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import './index.css';

import { PostStore } from './storage/PostStore';
import { UserStore } from './storage/UserStore';
import { GroupStore } from './storage/GroupStore';
import { FriendStore } from './storage/FriendStore';

const root = ReactDOM.createRoot(document.getElementById('root'));
export const Context = createContext(null)

root.render(
  <React.StrictMode>
    <Context.Provider value={{
      groupStorage: new GroupStore(),
      userStorage: new UserStore(),
      postStorage: new PostStore(),
      friendStorage: new FriendStore()
    }}>
      <App />
    </Context.Provider>
  </React.StrictMode>
);