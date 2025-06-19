import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../storage'; // Убедитесь, что путь правильный
import { authRoutes, publicRoutes } from '../routes';
import { ROUTE } from '../utils/consts';
import Header from './Header/Header'; // Если Header общий для всех страниц

const AppRouter = observer(() => {
    const { userStore } = useContext(Context);
    const isAuth = userStore.isAuth;

    // Можно сделать более сложную логику для лейаутов
    // Например, некоторые страницы без Header/Sidebar (Login, Register)

    return (
        <>
            {/* <Header /> Отображение Header здесь, если он нужен на всех страницах */}
            <Routes>
                {isAuth && authRoutes.map(({ path, Component }) => (
                    // Обертка в MainLayout для страниц, которым нужен сайдбар и т.д.
                    <Route key={path} path={path} element={<Component />} />
                ))}
                {publicRoutes.map(({ path, Component }) => (
                     // Обертка в MainLayout для публичных страниц, которым нужен сайдбар (например, Feed, Profile другого юзера)
                     // Для Login/Register лейаут может быть другим или отсутствовать
                    (path === ROUTE.LOGIN || path === ROUTE.REGISTER) ?
                        <Route key={path} path={path} element={<Component />} /> :
                        <Route key={path} path={path} element={<Component />} />
                ))}
                <Route path="/" element={<Navigate to={ROUTE.FEED} replace />} />
                {/* Если пользователь не авторизован и пытается зайти на защищенный роут, 
                    можно сделать редирект на LOGIN. React Router v6 делает это автоматически, 
                    если такой роут не найден среди publicRoutes и isAuth=false для authRoutes.
                    Для явного редиректа:
                    {!isAuth && authRoutes.map(({ path }) => (
                        <Route key={`redirect-${path}`} path={path} element={<Navigate to={ROUTE.LOGIN} replace />} />
                    ))}
                */}
                <Route path="*" element={<Navigate to={ROUTE.NOT_FOUND} replace />} />
            </Routes>
        </>
    );
});

export default AppRouter;