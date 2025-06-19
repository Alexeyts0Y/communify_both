import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import classes from './MainLeftSideBar.module.css';

const MainLeftSideBar = () => {
    const location = useLocation();

    return (
        <div className={classes.leftSidebar}>
            <nav className={classes.navigation}>
                <ul>
                    <li className={location.pathname === '/feed' ? classes.active : ''}>
                        <div className={classes.item}>
                            <img className={classes.icon} src="/icons/home.png" alt="home" />
                            <Link to="/feed">Главная</Link>
                        </div>
                    </li>
                    <li className={location.pathname === '/recommendations' ? classes.active : ''}>
                        <div className={classes.item}>
                            <img className={classes.icon} src="/icons/recommendations.png" alt="rec" />
                            <Link to="/recommendations">Рекомендации</Link>
                        </div>
                    </li>
                    <li>
                        <div className={classes.item}> 
                            <img className={classes.icon} src="/icons/user.png" alt="user" />
                            <Link to="/me">Профиль</Link>
                        </div>
                    </li>
                    <li>
                        <div className={classes.item}>
                            <img className={classes.icon} src="/icons/friends.png" alt="friends" />
                            <Link to="/me/friends">Друзья</Link>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default MainLeftSideBar;