import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage'; // Путь к вашему Context
import Button from '../../component/Button/Button'; // Путь к компоненту Button
import classes from './EditProfile.module.css'; // Ensure this CSS file exists and is correctly named
import { ROUTE } from '../../utils/consts';

const EditProfilePage = observer(() => {
    const { userStore } = useContext(Context);
    const navigate = useNavigate();
    const currentUser = userStore.user;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        avatar: null, // File object
    });
    const [avatarPreview, setAvatarPreview] = useState('/default_avatar.png'); // Default preview

    useEffect(() => {
        if (currentUser && currentUser.id) {
            setFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                avatar: null,
            });
            setAvatarPreview(currentUser.avatarUrl || '/default_avatar.png');
        } else if (!userStore.loading && !userStore.isAuth) {
            // If not loading and not authenticated, redirect to login
            // navigate(ROUTE.LOGIN); // Uncomment if you want to redirect immediately
        }
    }, [currentUser, userStore.loading, userStore.isAuth, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser || !currentUser.id) return;

        const dataToUpdate = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
        };
        const success = await userStore.updateUser(currentUser.id, dataToUpdate, formData.avatar);
        if (success) {
            navigate(ROUTE.ME); // Or ROUTE.PROFILE + `/${currentUser.id}`
        } else {
            // Error is displayed via the userStore.error paragraph below
            // alert(`Error: ${userStore.error}`); // You can keep this if you prefer alerts
        }
    };

    if (userStore.loading && !currentUser?.id) return <div className={classes.container}><p>Loading profile...</p></div>; // Added container for consistency
    if (!currentUser?.id && !userStore.loading) { // Check userStore.loading to avoid flash of "User not found"
        return (
            <div className={classes.container}>
                <p>User not found or not logged in.</p>
                <Button onClick={() => navigate(ROUTE.LOGIN)}>Login</Button>
            </div>
        );
    }
    if (!currentUser?.id) return null; // Fallback for safety, though above conditions should catch it

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>Edit Profile</h1>
            <form onSubmit={handleSubmit} className={classes.form}>
                <div className={classes.avatarSection}>
                    <img src={avatarPreview} alt="Avatar" className={classes.avatarPreview} />
                    <label htmlFor="avatarUpload" className={classes.avatarUploadLabel}>
                        Change Avatar
                    </label>
                    <input
                        type="file"
                        id="avatarUpload"
                        name="avatar"
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className={classes.fileInput} // This input is hidden by CSS
                    />
                </div>

                <div className={classes.field}> {/* Changed from formGroup to field */}
                    <label htmlFor="firstName" className={classes.label}>Имя</label> {/* Changed Имя to First Name */}
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={classes.input}
                        required
                    />
                </div>

                <div className={classes.field}> {/* Changed from formGroup to field */}
                    <label htmlFor="lastName" className={classes.label}>Фамилия</label> {/* Changed Фамилия to Last Name */}
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={classes.input}
                        required
                    />
                </div>

                <div className={classes.field}> {/* Changed from formGroup to field */}
                    <label htmlFor="email" className={classes.label}>Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={classes.input}
                        required
                    />
                </div>
                
                {userStore.error && <p className={classes.errorText}>{userStore.error}</p>}

                <div className={classes.actions}>
                    <Button type="submit" disabled={userStore.loading}>
                        {userStore.loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                        white 
                        type="button" 
                        onClick={() => navigate(ROUTE.ME)} // Navigate to user's profile
                        disabled={userStore.loading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
});

export default EditProfilePage;