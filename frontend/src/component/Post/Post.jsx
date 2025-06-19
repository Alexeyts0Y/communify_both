import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import HeartIcon from '../HeartIcon/HeartIcon';
import ShareIcon from '../ShareIcon/ShareIcon';

import classes from './Post.module.css';
import { ROUTE } from '../../utils/consts';

const Post = observer(({ post, isGroupContext = false }) => {
    const { postStore, userStore } = useContext(Context);
    const { id: postId, content, imageUrl, author, createdAt, likeCount, likedByCurrentUser, group } = post;

    const navigate = useNavigate();
    const location = useLocation();

    const displayEntity = group ? group : author;
    const entityType = group ? 'group' : 'user';

    let entityAvatarUrl = '';
    let entityName = '';
    let entityLink = '';

    if (entityType === 'group' && group) {
        entityAvatarUrl = group.imageUrl || '/default-group-avatar.png';
        entityName = group.name;
        entityLink = `/groups/${group.id}`;
    } else if (entityType === 'user' && author) {
        entityAvatarUrl = author.avatarUrl || '/default-avatar.png';
        entityName = `${author.firstName} ${author.lastName}`;
        entityLink = `/users/${author.id}`;
    }

    const canDelete = ((author?.id === userStore.userId) || 
                      (group?.id && userStore.isGroupAdmin(group.id))) && 
                      ((location.pathname === ROUTE.ME || location.pathname === `/users/${userStore.userId}`) || 
                        location.pathname === ROUTE.GROUP_DETAIL);

    const handleDeleteClick = () => {
        if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
            postStore.deletePost(postId);
        }
    };

    const handleLikeClick = () => {
        if (likedByCurrentUser) {
            postStore.unlikePost(postId);
        } else {
            postStore.likePost(postId);
        }
    };
    
    if (!displayEntity) return <div className={classes.mainContainer}>Loading post data...</div>;

    return (
        <div className={classes.mainContainer}>
            <div className={classes.postHeader}>
                <div className={classes.postHeader__leftPart}>
                    <div className={classes.profilePictureContainer}>
                        <Link to={entityLink}>
                            <img src={entityAvatarUrl} className={classes.profilePictureImage} alt="entity avatar" />
                        </Link>
                    </div>
                    <div className={classes.profileName}>
                        <Link to={entityLink} className={classes.profileLink}>
                            {entityName}
                        </Link>
                        <p className={classes.dateOfCreation}>{new Date(createdAt).toLocaleString()}</p>
                    </div>
                </div>
                
                {canDelete && (
                    <button 
                        className={classes.deleteButton}
                        onClick={handleDeleteClick}
                        title="Удалить пост"
                        disabled={postStore.loading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="var(--secondary-text-color)"/>
                        </svg>
                    </button>
                )}
            </div>
            
            <div className={classes.divider} />
            <div className={classes.contentContainer}>
                {content && <p className={classes.content}>{content}</p>}
                {imageUrl && (
                    <div className={classes.images}>
                        <img src={imageUrl} className={classes.image} alt="post content"/>
                    </div>
                )}
            </div>
            <div className={classes.divider} />
            <div className={classes.postFooter}>
                <div className={classes.postFooter__leftPart}>
                    <div className={classes.heartIconContainer} onClick={handleLikeClick} style={{cursor: 'pointer'}}>
                        <HeartIcon filled={likedByCurrentUser}/>
                        <p className={classes.likesCount}>{likeCount}</p>
                    </div>
                    <div className={classes.shareIconContainer}>
                        <ShareIcon/>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Post;