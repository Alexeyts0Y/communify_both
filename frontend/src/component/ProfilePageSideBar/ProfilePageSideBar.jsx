import React, { useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import classes from './ProfilePageSideBar.module.css';
import { ROUTE } from '../../utils/consts';

const ProfilePageSideBar = observer(() => {
    const { friendStore, userStore } = useContext(Context);
    const { id: profileIdFromParams } = useParams();

    const isMyProfile = !profileIdFromParams || (userStore.user && userStore.user.id === Number(profileIdFromParams));
    const targetUserId = isMyProfile ? userStore.userId : Number(profileIdFromParams);

    useEffect(() => {
        if (targetUserId) {
            if (isMyProfile) {
                friendStore.fetchMyFriends();
            } else {
                friendStore.fetchUserFriends(targetUserId);
            }
        }
    }, [targetUserId, isMyProfile, friendStore]);

    const profileData = isMyProfile ? userStore.user : userStore.currentProfile;
    
    const friends = isMyProfile ? friendStore.myFriends : friendStore.userFriends;
    const groups = profileData?.groups || [];

    const friendsLimit = 6;
    const groupsLimit = 6;
    if (!profileData) {
        return <div className={classes.mainContainer}>Загрузка данных...</div>;
    }

    return (
        <div className={classes.mainContainer}>
            <div className={classes.container}>
                <h2 className={classes.title}>Друзья</h2>
                <div className={classes.items}>
                    {friends.length > 0 ? friends.slice(0, friendsLimit).map((friend) => (
                        <div className={classes.item} key={`friend-${friend.id}`}>
                            <div className={classes.avatarContainer}>
                                <Link to={`/users/${friend.id}`}>
                                    <img src={friend.avatarUrl || '/default-avatar.png'} alt="avatar" className={classes.avatar}/>
                                </Link>
                            </div>
                            <div className={classes.linkContainer}>
                                <Link to={`/users/${friend.id}`} className={classes.link}>
                                    {`${friend.firstName} ${friend.lastName}`}
                                </Link>
                            </div>
                        </div>
                    )) : (<div>Здесь пока ничего нет.</div>)}
                </div>
                {friends.length > friendsLimit && (
                    <Link to={isMyProfile ? ROUTE.FRIENDS_MY : `/users/${targetUserId}/friends`} className={classes.seeAllLink}>
                        Посмотреть всех друзей
                    </Link>
                )}
            </div>

            <div className={classes.container}>
                <h2 className={classes.title}>Группы</h2>
                <div className={classes.items}>
                    {groups.length > 0 ? groups.slice(0, groupsLimit).map((userGroup) => (
                        userGroup && userGroup.group && (
                            <div className={classes.item} key={`group-${userGroup.group.id}`}>
                                <div className={classes.avatarContainer}>
                                    <Link to={`/groups/${userGroup.group.id}`}>
                                        <img src={userGroup.group.imageUrl || '/default-group-avatar.png'} alt="group avatar" className={classes.avatar}/>
                                    </Link>
                                </div>
                                <div className={classes.linkContainer}>
                                    <Link to={`/groups/${userGroup.group.id}`} className={classes.link}>
                                        {userGroup.group.name}
                                    </Link>
                                    {/* <span className={classes.roleInGroup}>{userGroup.role}</span> */}
                                </div>
                            </div>
                        )
                    )) : (<div>Здесь пока ничего нет.</div>)}
                </div>
            </div>
        </div>
    );
});

export default ProfilePageSideBar;