export const ROUTE = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FEED: '/feed',
    RECOMMENDATIONS: '/recommendations',
    ME: '/me', // Мой профиль
    PROFILE: '/users/:id', // Профиль другого пользователя
    PROFILE_EDIT: '/profile/edit', // Редактирование своего профиля
    PROFILE_CHANGE_PASSWORD: '/profile/change-password',
    FRIENDS: '/friends', // Базовый путь для друзей, может редиректить на MY
    FRIENDS_MY: '/me/friends', // Мои друзья
    FRIENDS_USER: '/users/:id/friends', // Друзья другого пользователя
    FRIENDS_SENT: '/me/requests/sent', // Отправленные заявки
    FRIENDS_RECEIVED: '/me/requests/received', // Полученные заявки
    GROUPS: '/groups', // Список групп или страница для создания
    GROUP_CREATE: '/groups/new',
    GROUP_DETAIL: '/groups/:id',
    GROUP_EDIT: '/groups/:id/edit',
    POST_CREATE: '/posts/new',
    // POST_DETAIL: '/posts/:id', // Если есть отдельная страница поста
    NOT_FOUND: '/404', // или другой путь для ненайденных страниц
};