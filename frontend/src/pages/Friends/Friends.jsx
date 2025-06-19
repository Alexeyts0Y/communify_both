import React, { useEffect, useContext } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import FriendItem from '../../component/FriendItem/FriendItem'; // Проверьте путь
import classes from './Friends.module.css'; // Создайте CSS
import { ROUTE } from '../../utils/consts';


const Friends = observer(() => {
    const { friendStore, userStore } = useContext(Context);
    const location = useLocation();
    const { id: userIdParam } = useParams(); // Для /users/{id}/friends

    const getPageTypeAndTitle = () => {
        if (userIdParam && Number(userIdParam) !== userStore.userId) return { type: 'userFriends', title: `Друзья пользователя` };
        if (location.pathname.endsWith(ROUTE.FRIENDS_SENT)) return { type: 'sentRequests', title: 'Отправленные заявки в друзья' };
        if (location.pathname.endsWith(ROUTE.FRIENDS_RECEIVED)) return { type: 'receivedRequests', title: 'Полученные заявки в друзья' };
        return { type: 'myFriends', title: 'Мои друзья' };
    };
    
    const { type: pageType, title } = getPageTypeAndTitle();
    
    useEffect(() => {
        switch(pageType) {
            case 'myFriends':
                friendStore.fetchMyFriends();
                break;
            case 'sentRequests':
                friendStore.fetchSentRequests();
                break;
            case 'receivedRequests':
                friendStore.fetchReceivedRequests();
                break;
            case 'userFriends':
                if (userIdParam) friendStore.fetchUserFriends(Number(userIdParam));
                break;
            default:
                break;
        }
    }, [pageType, userIdParam, friendStore, userStore.userId]);
    
    const handleAction = (action, entityId, userIdInItem = null) => {
        switch(action) {
            case 'remove':
                friendStore.removeFriend(entityId);
                break;
            case 'cancel':
                friendStore.cancelSentRequest(entityId);
                break;
            case 'accept':
                friendStore.acceptFriendRequest(entityId);
                break;
            case 'reject':
                friendStore.rejectFriendRequest(entityId);
                break;
            default:
                console.warn("Unknown action:", action);
        }
    };
    
    const getUsersToDisplay = () => {
        switch(pageType) {
            case 'myFriends': 
                return friendStore.myFriends.map(friend => ({...friend, id: friend.id, type: 'friend'}));
            case 'sentRequests': 
                return friendStore.sentRequests.map(req => ({...req.friend, requestId: req.id, type: 'sent'}));
            case 'receivedRequests': 
                return friendStore.receivedRequests.map(req => ({...req.user, requestId: req.id, type: 'received'}));
            case 'userFriends': 
                return friendStore.userFriends.map(friend => ({...friend, id: friend.id, type: 'friendOfUser'}));
            default: return [];
        }
    };
    
    const users = getUsersToDisplay();
    
    if (friendStore.loading) return <div className={classes.container}><h1 className={classes.title}>{title}</h1><div>Loading...</div></div>;
    if (friendStore.error) return <div className={classes.container}><h1 className={classes.title}>{title}</h1><p>Error: {friendStore.error}</p></div>;

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>{title}</h1>
            
            {/* Навигация для друзей */}
            {(!userIdParam || Number(userIdParam) === userStore.userId) && (
                 <nav className={classes.friendsNav}>
                    <Link to={ROUTE.FRIENDS_MY} className={pageType === 'myFriends' ? classes.activeLink : ''}>Мои друзья</Link>
                    <Link to={ROUTE.FRIENDS_RECEIVED} className={pageType === 'receivedRequests' ? classes.activeLink : ''}>Полученные заявки</Link>
                    <Link to={ROUTE.FRIENDS_SENT} className={pageType === 'sentRequests' ? classes.activeLink : ''}>Отправленные заяки</Link>
                 </nav>
            )}
            
            {users.length === 0 && <p>Нет рользователей для отображения</p>}
            <div className={classes.usersList}>
                {users.map(user => (
                    <FriendItem 
                        key={user.requestId || user.id}
                        user={user}
                        pageType={
                            user.type === 'friend' ? 'friends' :
                            user.type === 'sent' ? 'sentRequests' :
                            user.type === 'received' ? 'receivedRequests' :
                            'viewOnly'
                        }
                        onAction={(actionName) => handleAction(actionName, user.type === 'friend' ? user.id : user.requestId, user.id)}
                    />
                ))}
            </div>
        </div>
    );
});

export default Friends