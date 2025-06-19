import Main from "./pages/Main/Main";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import Group from "./pages/Group/Group";
import CreatePost from "./pages/CreatePost/CreatePost";
import CreateGroup from "./pages/CreateGroup/CreateGroup";
import EditGroup from "./pages/EditGroup/EditGroup";
import EditProfile from "./pages/EditProfile/EditProfile";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import Friends from "./pages/Friends/Friends"; // Переименованный Friends.jsx
import NotFound from "./pages/NotFound/NotFound"; // Создайте эту страницу

import { ROUTE } from "./utils/consts";

export const authRoutes = [
    { path: ROUTE.ME, Component: Profile },
    { path: ROUTE.PROFILE_EDIT, Component: EditProfile },
    { path: ROUTE.PROFILE_CHANGE_PASSWORD, Component: ChangePassword },
    { path: ROUTE.POST_CREATE, Component: CreatePost },
    { path: ROUTE.GROUP_CREATE, Component: CreateGroup },
    { path: ROUTE.GROUP_EDIT, Component: EditGroup }, // :id будет из URL
    { path: ROUTE.FRIENDS_MY, Component: Friends },
    { path: ROUTE.FRIENDS_SENT, Component: Friends },
    { path: ROUTE.FRIENDS_RECEIVED, Component: Friends },
    // Другие защищенные роуты
];

export const publicRoutes = [
    { path: ROUTE.FEED, Component: Main },
    { path: ROUTE.RECOMMENDATIONS, Component: Main }, // Main будет определять, что показывать
    { path: ROUTE.LOGIN, Component: Login },
    { path: ROUTE.REGISTER, Component: Register },
    { path: ROUTE.PROFILE, Component: Profile }, // :id будет из URL
    { path: ROUTE.GROUP_DETAIL, Component: Group }, // :id будет из URL
    { path: ROUTE.FRIENDS_USER, Component: Friends }, // :id пользователя будет из URL
    { path: ROUTE.NOT_FOUND, Component: NotFound },
    // Другие публичные роуты
];