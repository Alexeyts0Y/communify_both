import React from 'react';
import { Link } from 'react-router-dom';
import classes from './FriendItem.module.css';

const FriendItem = ({ user, pageType, onAction }) => {
    return (
        <div className={classes.userCard}>
            <div className={classes.userInfo}>
                <Link to={`/users/${user.id}`}>
                    <img 
                        src={user.avatarUrl || '/default-avatar.png'} 
                        alt="avatar"
                        className={classes.avatar}
                    />
                </Link>
                <div>
                    <Link to={`/users/${user.id}`} className={classes.userNameLink}>
                        <h3>{user.firstName} {user.lastName}</h3>
                    </Link>
                    {user.mutualFriendsCount > 0 && 
                        <p>Общих друзей: {user.mutualFriendsCount}</p>
                    }
                </div>
            </div>

            {pageType === 'friends' && (
                <button 
                    className={classes.actionButton}
                    onClick={() => onAction('remove')}
                >
                    Удалить
                </button>
            )}
            
            {pageType === 'sentRequests' && (
                <button 
                    className={classes.actionButton}
                    onClick={() => onAction('cancel')}
                >
                    Отменить заявку
                </button>
            )}
            
            {pageType === 'receivedRequests' && (
                <div className={classes.requestActions}>
                    <button 
                        className={`${classes.actionButton} ${classes.acceptButton}`}
                        onClick={() => onAction('accept')}
                    >
                        Принять
                    </button>
                    <button 
                        className={`${classes.actionButton} ${classes.rejectButton}`}
                        onClick={() => onAction('reject')}
                    >
                        Отклонить
                    </button>
                </div>
            )}

        </div>
    );
};

export default FriendItem;