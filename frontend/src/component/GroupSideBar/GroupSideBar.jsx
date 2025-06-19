import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import classes from './GroupSideBar.module.css'; // CSS

const GroupSideBar = observer(() => {
    const { groupStore } = useContext(Context);
    // const { id: groupId } = useParams(); // groupId уже должен быть в groupStore.currentGroupDetails

    const group = groupStore.currentGroupDetails;

    if (groupStore.loading && !group) return <div className={classes.mainContainer}><div className={classes.container}>Loading sidebar...</div></div>;
    if (!group) return <div className={classes.mainContainer}><div className={classes.container}>Group data not available.</div></div>;

    const admins = group.members?.filter(member => member.role === 'ADMIN' || member.role === 'OWNER') || [];
    // Другие участники для отображения, если нужно

    return (
        <div className={classes.mainContainer}>
            <div className={classes.container}>
                <h2 className={classes.title}>About Group</h2>
                <div className={classes.description}>
                    {group.description || "No description provided."}
                </div>
                <div className={classes.details}>
                    <div className={classes.detailItem}>
                        {/* <strong>Public group</strong> Тип группы, если есть */}
                        <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                    </div>
                     {group.creatorId && <div className={classes.detailItem}>Creator ID: {group.creatorId}</div>}
                </div>
            </div>

            {admins.length > 0 && (
                <div className={classes.container}>
                    <h2 className={classes.title}>Group Admins ({admins.length})</h2>
                    <div className={classes.items}>
                        {admins.map((adminMember) => (
                            <div className={classes.item} key={`admin-${adminMember.user.id}`}>
                                <div className={classes.avatarContainer}>
                                    <Link to={`/users/${adminMember.user.id}`}>
                                        <img src={adminMember.user.avatarUrl || '/default-avatar.png'} alt="avatar" className={classes.avatar}/>
                                    </Link>
                                </div>
                                <div className={classes.infoContainer}>
                                    <Link to={`/users/${adminMember.user.id}`} className={classes.name}>
                                        {adminMember.user.firstName} {adminMember.user.lastName}
                                    </Link>
                                    <span className={classes.role}>{adminMember.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Можно добавить секцию для других участников */}
        </div>
    );
});

export default GroupSideBar;