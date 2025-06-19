import React, { useContext, useEffect } from 'react';
import { useParams, Link, useNavigate }
from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import ProfilePageHeader from '../../component/ProfilePageHeader/ProfilePageHeader';
import PostContainer from '../../component/PostContainer/PostContainer';
import ProfilePageSideBar from '../../component/ProfilePageSideBar/ProfilePageSideBar';
import Button from '../../component/Button/Button';
import classes from './Profile.module.css';
import { ROUTE } from '../../utils/consts';

const Profile = observer(() => {
    const { userStore } = useContext(Context);
    const { id } = useParams();
    const navigate = useNavigate();

    const profileIdToLoad = id ? Number(id) : userStore.userId;
    const isMyProfile = userStore.userId === profileIdToLoad;

    useEffect(() => {
        const loadProfile = async () => {
            if (profileIdToLoad) {
                try {
                    await userStore.fetchUserProfile(profileIdToLoad);
                } catch (error) {
                    console.error("Failed to load profile in component:", error);
                }
            } else if (!userStore.isAuth) {
                navigate(ROUTE.LOGIN);
            }
        };

        loadProfile();

        return () => {
            if (userStore.currentProfile && userStore.currentProfile.id === profileIdToLoad && profileIdToLoad !== userStore.userId) {
                userStore.setCurrentProfile(null);
            }
        };

    }, [profileIdToLoad, userStore, navigate]);

    const profileData = isMyProfile ? userStore.user : userStore.currentProfile;
    const posts = profileData?.posts || [];

    if (userStore.loading && (!profileData || profileData.id !== profileIdToLoad)) {
      return <div className={classes.container}><main>Загрузка профиля...</main></div>;
    }
    if (!profileData?.id && !userStore.loading) {
      return <div className={classes.container}><main>Профиль не найден <Link to={ROUTE.FEED}>Перейти на главную</Link></main></div>;
    }

    return (
        <main className={classes.container}>
            <div className={classes.leftPart}>
                <ProfilePageHeader profileData={profileData} />
                {isMyProfile && (
                    <div className={classes.createPostButtonContainer}>
                        <Link to={ROUTE.POST_CREATE} state={{ fromProfileId: profileIdToLoad }}>
                            <Button>Создать пост</Button>
                        </Link>
                    </div>
                )}
                <PostContainer posts={posts} />
            </div>
            <div className={classes.rightPart}>
                <ProfilePageSideBar />
            </div>
        </main>
    );
});

export default Profile;