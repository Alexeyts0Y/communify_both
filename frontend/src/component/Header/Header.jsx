import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import classes from './Header.module.css'; // CSS
import { ROUTE } from '../../utils/consts';
import Button from '../Button/Button'; // Если нужна кнопка выхода

const Header = observer(() => {
    const { userStore } = useContext(Context);
    const navigate = useNavigate();

    const handleLogout = () => {
        userStore.logout();
        navigate(ROUTE.LOGIN);
    };

    return (
        <header className={classes.headerContainer}>
            <div className={classes.container}>
                <div>
                    <Link to={ROUTE.FEED}>
                        <img src="/logo.png" alt="logo" className={classes.logo}/>
                    </Link>
                </div>

                <div className={classes.actions}>
                    {userStore.isAuth && userStore.user ? (
                        <div className={classes.anotherContainer}>
                        <div className={classes.avatarContainer}>
                            <Link to={ROUTE.ME} className={classes.profileLink}>
                                <img 
                                    src={userStore.user.avatarUrl || "/default_avatar.png"} 
                                    alt="avatar" 
                                    className={classes.avatar}
                                />
                            </Link>
                        </div>
                        <Button onClick={handleLogout} white={false} className={classes.logoutButton}>Выйти</Button>
                        </div>
                    ) : (
                        <div className={classes.links}>
                            <Link to={ROUTE.LOGIN} className={classes.authLink}>Войти</Link>
                            <Link to={ROUTE.REGISTER} className={classes.authLink}>Зарегистрироваться</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
});

export default Header;