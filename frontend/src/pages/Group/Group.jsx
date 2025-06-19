import React, { useContext, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import GroupHeader from '../../component/GroupHeader/GroupHeader';
import PostContainer from '../../component/PostContainer/PostContainer';
import GroupSideBar from '../../component/GroupSideBar/GroupSideBar';
import Button from '../../component/Button/Button';
import classes from './Group.module.css';
import { ROUTE } from '../../utils/consts';

const Group = observer(() => {
    const { groupStore, postStore, userStore } = useContext(Context);
    const { id: groupId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (groupId) {
            groupStore.fetchGroupDetails(Number(groupId));
        }
    }, [groupId, groupStore]);

    const groupData = groupStore.currentGroupDetails;
    const posts = groupData?.posts || [];
    const isAdmin = groupId ? userStore.isGroupAdmin(Number(groupId)) : false;

    if (groupStore.loading && !groupData) return <div className={classes.container}><main>Загрузка группы...</main></div>;
    if (!groupData && !groupStore.loading) return <div className={classes.container}><main>Группы не найдена <Link to={ROUTE.FEED}>Go to Feed</Link></main></div>;


    return (
        <main className={classes.container}>
            <div className={classes.leftPart}>
                <GroupHeader />
                {isAdmin && (
                    <div className={classes.createPostButtonContainer}>
                        <Button onClick={() => navigate(ROUTE.POST_CREATE, { state: { groupId: Number(groupId) } })}>
                            Создать пост в группе
                        </Button>
                    </div>
                )}
                <PostContainer posts={posts} isGroupContext={true} />
            </div>
            <div className={classes.rightPart}>
                <GroupSideBar />
            </div>
        </main>
    );
});

export default Group;