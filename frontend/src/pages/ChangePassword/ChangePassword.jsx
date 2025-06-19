import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage';
import Button from '../../component/Button/Button';
import classes from './ChangePassword.module.css';
import { ROUTE } from '../../utils/consts';

const ChangePassword = observer(() => {
    const { userStore } = useContext(Context);
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (passwords.newPassword !== passwords.confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (passwords.newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }

        const success = await userStore.changePassword(passwords.oldPassword, passwords.newPassword);
        if (success) {
            alert("Password changed successfully!");
            navigate('/me');
        } else {
            setError(userStore.error || "Failed to change password. Check old password.");
        }
    };
    
    if (!userStore.isAuth) {
        navigate(ROUTE.LOGIN);
        return null;
    }

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>Change Password</h1>
            <form onSubmit={handleSubmit} className={classes.form}>
                <div className={classes.formGroup}>
                    <label htmlFor="oldPassword" className={classes.label}>Old Password</label>
                    <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        value={passwords.oldPassword}
                        onChange={handleChange}
                        className={classes.input}
                        required
                    />
                </div>

                <div className={classes.formGroup}>
                    <label htmlFor="newPassword" className={classes.label}>New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handleChange}
                        className={classes.input}
                        required
                        minLength={6}
                    />
                </div>

                <div className={classes.formGroup}>
                    <label htmlFor="confirmNewPassword" className={classes.label}>Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={passwords.confirmNewPassword}
                        onChange={handleChange}
                        className={classes.input}
                        required
                        minLength={6}
                    />
                </div>
                
                {error && <p className={classes.errorText}>{error}</p>}
                {userStore.error && !error && <p className={classes.errorText}>{userStore.error}</p>}


                <div className={classes.actions}>
                    <Button type="submit" disabled={userStore.loading}>
                        {userStore.loading ? 'Changing...' : 'Change Password'}
                    </Button>
                    <Button white type="button" onClick={() => navigate(-1)} disabled={userStore.loading}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
});

export default ChangePassword;