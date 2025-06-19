import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import Button from '../Button/Button';
import classes from './GroupHeader.module.css';

const GroupHeader = observer(() => {
    const { groupStore, userStore } = useContext(Context);
    const { id: groupId } = useParams();
    
    const group = groupStore.currentGroupDetails;

    if (groupStore.loading && !group) return <div className={classes.header}><div className={classes.info}>Loading group header...</div></div>;
    if (!group) return <div className={classes.header}><div className={classes.info}>Group not found.</div></div>;

    const isAdmin = userStore.isGroupAdmin(Number(groupId));

    const handleJoinLeaveGroup = () => {
        alert("Join/Leave logic to be implemented based on membership status");
    };

    return (
        <div className={classes.header}>
            <div className={classes.cover}>
                {group.imageUrl ? (
                    <img src={group.imageUrl} alt={`${group.name} cover`} className={classes.coverImage} />
                ) : (
                    <div className={classes.coverPlaceholder}></div>
                )}
            </div>
            <div className={classes.info}>
                <h1 className={classes.title}>{group.name}</h1>
                <div className={classes.meta}>
                    <span className={classes.members}>{group.members?.length || 0} Участники</span>
                </div>
                <div className={classes.actions}>
                    {isAdmin && (
                        <Link to={`/groups/${groupId}/edit`}>
                            <Button>Изменить группу</Button>
                        </Link>
                    )}
                    <Button white onClick={handleJoinLeaveGroup} disabled={groupStore.loading}>
                        Вступить/Покинуть (temp)
                    </Button>
                    <Button>Поделиться</Button>
                </div>
            </div>
        </div>
    );
});

export default GroupHeader;