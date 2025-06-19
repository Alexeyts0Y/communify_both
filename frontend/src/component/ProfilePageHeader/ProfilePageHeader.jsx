import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import Button from '../Button/Button';
import classes from './ProfilePageHeader.module.css';
import { ROUTE } from '../../utils/consts';


const ProfilePageHeader = observer(() => {
    const { userStore, friendStore } = useContext(Context);
    const { id: profileId } = useParams(); // ID профиля из URL

    const isMyProfile = !profileId || (userStore.user && userStore.user.id === Number(profileId));
    const profileData = isMyProfile ? userStore.user : userStore.currentProfile;

    const handleAddFriend = async () => {
        if (profileId) {
            await friendStore.sendFriendRequest(Number(profileId));
        }
    };

    if (userStore.loading && !profileData?.id) return <div className={classes.profileHeader}><div className={classes.mainContent}>Loading profile header...</div></div>;
    if (!profileData?.id) return <div className={classes.profileHeader}><div className={classes.mainContent}>Profile not found.</div></div>;


    const { firstName, lastName, avatarUrl } = profileData;

    return (
        <div className={classes.profileHeader}>
            <div className={classes.background} />
            <div className={classes.bottomPart} />

            <div className={classes.mainContent}>
                <div className={classes.profileInfo}>
                    <div className={classes.avatarContainer}>
                        <img 
                            src={avatarUrl || "/default_avatar.png"} 
                            alt="avatar" 
                            className={classes.avatar}
                        />
                    </div>
                    <div className={classes.nameContainer}>
                        <h2 className={classes.name}>{firstName} {lastName}</h2>
                    </div>
                </div>
                
                <div className={classes.buttonsWrapper}>
                    {isMyProfile ? (
                        <>
                            <Link to={ROUTE.PROFILE_EDIT}> 
                                <Button>Изменить профиль</Button>
                            </Link>
                            <Link to={ROUTE.PROFILE_CHANGE_PASSWORD}>
                                <Button white="true">Изменить пароль</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleAddFriend} disabled={friendStore.loading}>
                                {friendStore.loading ? 'Processing...' : 'Add Friend'}
                            </Button>
                            <Button white="true">Share</Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ProfilePageHeader;