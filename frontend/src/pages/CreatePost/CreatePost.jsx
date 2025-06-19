import React, { useState, useRef, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useLocation } from 'react-router-dom'; // Добавили useLocation
import { Context } from '../../storage';
import classes from './CreatePost.module.css';
import { ROUTE } from '../../utils/consts';
import Button from '../../component/Button/Button';
const CloseIcon = () => <span style={{cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2em', padding: '5px'}}>✖</span>; // Немного стилизовал

const CreatePost = observer(() => {
    const { userStore, postStore } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    const user = userStore.user;

    const groupIdFromState = location.state?.groupId;

    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fromProfileId = location.state?.fromProfileId;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) {
            alert("Пост не может быть пустым.");
            return;
        }
        const success = await postStore.createPost(content, image, groupIdFromState); 
        if (success) {
            setContent('');
            setImage(null);
            setImagePreview(null);
            if (groupIdFromState) {
                navigate(ROUTE.GROUP_DETAIL.replace(':id', groupIdFromState));
            } else if (fromProfileId) {
                if (Number(fromProfileId) === userStore.userId) {
                    navigate(ROUTE.ME);
                } else {
                    navigate(ROUTE.PROFILE.replace(':id', fromProfileId));
                }
            } else {
                navigate(-1);
            }
        } else {
            alert(`Ошибка создания поста: ${postStore.error || 'Неизвестная ошибка'}`);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
             fileInputRef.current.click();
        }
    };
    
    if (!userStore.isAuth || !user?.id) {
        return <div>Пожалуйста, войдите в систему, чтобы создать пост.</div>;
    }

    // Для кнопки "назад" или "отмена"
    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className={classes.pageContainer}>
             <div className={classes.formHeader}>
                <h2>Создать пост</h2>
                <Button onClick={handleCancel} className={classes.cancelButton}>Отмена</Button>
            </div>
            <form onSubmit={handleSubmit} className={classes.postForm}>
                <div className={classes.mainContainer}>
                    <div className={classes.postHeader}>
                        <div className={classes.postHeader__leftPart}>
                            <div className={classes.profilePictureContainer}>
                                <img 
                                    src={user.avatarUrl || '/default-avatar.png'} 
                                    className={classes.profilePictureImage} 
                                    alt="avatar" 
                                />
                            </div>
                            <div className={classes.profileName}>
                                <span className={classes.profileLink}>
                                    {user.firstName} {user.lastName}
                                </span>
                                {groupIdFromState && <p className={classes.groupContextInfo}>в группе (ID: {groupIdFromState})</p>}
                                <p className={classes.dateOfCreation}>Сейчас</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className={classes.divider} />
                    
                    <div className={classes.contentContainer}>
                        <textarea
                            className={classes.contentInput}
                            placeholder="Что у вас нового?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                        />
                        
                        {imagePreview && (
                            <div className={classes.imagePreviewContainer}>
                                <div className={classes.removeImageButton} onClick={handleRemoveImage}>
                                    <CloseIcon />
                                </div>
                                <img 
                                    src={imagePreview} 
                                    className={classes.image} 
                                    alt="preview" 
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className={classes.divider} />
                    
                    <div className={classes.postFooter}>
                        <div className={classes.postFooter__leftPart}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <button 
                                type="button" 
                                className={`${classes.mediaButton} ${classes.actionButton}`}
                                onClick={triggerFileInput}
                            >
                                Фото
                            </button>
                        </div>
                        <button 
                            type="submit" 
                            className={`${classes.submitButton} ${classes.actionButton}`}
                            disabled={(!content.trim() && !image) || postStore.loading}
                        >
                            {postStore.loading ? 'Публикация...' : 'Опубликовать'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
});

export default CreatePost;