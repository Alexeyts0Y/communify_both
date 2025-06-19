import React from 'react';
import { Link } from 'react-router-dom';
import classes from './MainRightSideBar.module.css';

const MainRightSideBar = ({possibleFriends = [], interestingGroups = []}) => {
    return (
        <div className={classes.rightSidebar}>
            <div className={classes.sidebarSection}>
                <h3>Возможные друзья</h3>
                <div className={classes.sidebarItems}>
                    {possibleFriends.map((friend) => (
                        <div className={classes.sidebarItem} key={friend.id}>
                            <img src={friend.avatarUrl} alt="avatar" className={classes.sidebarAvatar} />
                            <Link className={classes.link} to={`/users/${friend.id}`}>{friend.firstName + " " + friend.lastName} </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className={classes.sidebarSection}>
                <h3>Интересные группы</h3>
                <div className={classes.sidebarItems}>
                    {interestingGroups.map((group) => (
                        <div className={classes.sidebarItem} key={group.id}>
                            <img src={group.imageUrl} alt="avatar" className={classes.sidebarAvatar} />
                            <Link className={classes.link} to={`/groups/${group.id}`}>{group.name}</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainRightSideBar;