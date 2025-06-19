import React, { useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import MainLeftSideBar from '../../component/MainLeftSideBar/MainLeftSideBar';
import PostContainer from '../../component/PostContainer/PostContainer';
import MainRightSideBar from '../../component/MainRightSideBar/MainRightSideBar';
import classes from './Main.module.css';
import { ROUTE } from '../../utils/consts';


const Main = observer(() => {
    const { postStore, friendStore, groupStore } = useContext(Context);
    const location = useLocation();

    const observer = useRef();
    const loadMoreTriggerRef = useRef(null);

    useEffect(() => {
        if (friendStore.recommendedFriends.length === 0) {
            friendStore.fetchRecommendedFriends();
        }
        if (groupStore.recommendedGroups.length === 0) {
            groupStore.fetchRecommendedGroups();
        }
    }, [friendStore, groupStore]);

    useEffect(() => {
        if (location.pathname === ROUTE.RECOMMENDATIONS) {
            postStore.fetchRecommendedPosts(true);
        } else if (location.pathname === ROUTE.FEED) {
            postStore.fetchFeedPosts(true);
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [location.pathname, postStore]);

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
            if (location.pathname === ROUTE.RECOMMENDATIONS) {
                if (postStore.hasMoreRec && !postStore.loadingMoreRec) {
                    console.log("Intersecting Recommendations, loading more...");
                    postStore.fetchRecommendedPosts();
                }
            } else if (location.pathname === ROUTE.FEED) {
                if (postStore.hasMoreFeed && !postStore.loadingMoreFeed) {
                    console.log("Intersecting Feed, loading more...");
                    postStore.fetchFeedPosts();
                }
            }
        }
    }, [postStore, location.pathname]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '20px',
            threshold: 0.1
        };

        observer.current = new IntersectionObserver(handleObserver, options);

        const currentTrigger = loadMoreTriggerRef.current;
        if (currentTrigger) {
            observer.current.observe(currentTrigger);
        }

        return () => {
            if (currentTrigger && observer.current) {
                observer.current.unobserve(currentTrigger);
            }
        };
    }, [handleObserver, loadMoreTriggerRef.current]);

    const getCurrentPostsData = () => {
        switch (location.pathname) {
            case ROUTE.RECOMMENDATIONS:
                return {
                    posts: postStore.recommendedPosts,
                    isLoadingMore: postStore.loadingMoreRec,
                    hasMoreToLoad: postStore.hasMoreRec,
                    isInitialLoading: postStore.loading && postStore.recommendedPosts.length === 0
                };
            case ROUTE.FEED:
            default:
                return {
                    posts: postStore.feedPosts,
                    isLoadingMore: postStore.loadingMoreFeed,
                    hasMoreToLoad: postStore.hasMoreFeed,
                    isInitialLoading: postStore.loading && postStore.feedPosts.length === 0
                };
        }
    };

    const { posts, isLoadingMore, hasMoreToLoad, isInitialLoading } = getCurrentPostsData();

    if (isInitialLoading) {
        return (
            <main className={classes.mainContainer}>
                <MainLeftSideBar />
                <div className={classes.container} style={{ textAlign: 'center', padding: '20px' }}>
                    Loading posts...
                </div>
                <MainRightSideBar
                    possibleFriends={friendStore.recommendedFriends}
                    interestingGroups={groupStore.recommendedGroups}
                />
            </main>
        );
    }

    return (
        <main className={classes.mainContainer}>
            <MainLeftSideBar />
            <div className={classes.container}>
                {posts.length > 0 ? (
                    <PostContainer posts={posts} />
                ) : (
                    !isLoadingMore && !hasMoreToLoad && <div style={{ textAlign: 'center', padding: '20px' }}>Нет постов для отображения</div>
                )}

                <div ref={loadMoreTriggerRef} className={classes.loadMoreTrigger}>
                    {isLoadingMore && <p>Загружаем еще посты...</p>}
                    {!hasMoreToLoad && posts.length > 0 && <p>Конец</p>}
                </div>
            </div>
            <MainRightSideBar 
                possibleFriends={friendStore.recommendedFriends} 
                interestingGroups={groupStore.recommendedGroups}
            />
        </main>
    );
});

export default Main;