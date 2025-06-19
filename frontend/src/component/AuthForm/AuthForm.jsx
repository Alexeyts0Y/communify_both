import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import Button from '../Button/Button';
import classes from './AuthForm.module.css';
import { Context } from '../../storage';
import { ROUTE } from '../../utils/consts';

const AuthForm = observer(({ isLogin = false }) => {
  const { userStore } = useContext(Context);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (isLogin) {
      success = await userStore.login(formData.username, formData.password);
    } else {
      const userData = {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      success = await userStore.register(userData);
    }

    if (success) {
      navigate(ROUTE.FEED);
    } else {
      alert(`Error: ${userStore.error}`);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.logo}>Добро пожаловать</div>
      <h1 className={classes.title}>{isLogin ? 'Вход в аккаунт' : 'Создание аккаунта'}</h1>
      <form onSubmit={handleSubmit} className={classes.form}>
        {!isLogin && (
          <>
            <div className={classes.formGroup}>
              <label htmlFor="firstName" className={classes.label}>Имя</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={classes.input} required={!isLogin} />
            </div>
            <div className={classes.formGroup}>
              <label htmlFor="lastName" className={classes.label}>Фамилия</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={classes.input} required={!isLogin}/>
            </div>
            <div className={classes.formGroup}>
              <label htmlFor="email" className={classes.label}>Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={classes.input} required />
            </div>
          </>
        )}

        <div className={classes.formGroup}>
          <label htmlFor="username" className={classes.label}>Имя пользователя</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className={classes.input} required />
        </div>

        <div className={classes.formGroup}>
          <label htmlFor="password" className={classes.label}>Пароль</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={classes.input} />
        </div>
        
        <Button type="submit" className={classes.submitButton} disabled={userStore.loading}>
          {userStore.loading ? 'Подождите...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
        </Button>
      </form>
      
      {userStore.error && <p style={{color: 'red', textAlign: 'center'}}>{userStore.error}</p>}

      <div className={classes.switchAuth}>
        {isLogin ? (
          <> Нет аккаунта? <Link to={ROUTE.REGISTER} className={classes.link}>Зарегистрируйтесь</Link> </>
        ) : (
          <> Уже есть аккаунт? <Link to={ROUTE.LOGIN} className={classes.link}>Войдите</Link> </>
        )}
      </div>
    </div>
  );
});

export default AuthForm;