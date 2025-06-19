import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../storage'; // Путь к Context
import Button from '../Button/Button';
import classes from './GroupForm.module.css'; // Убедитесь, что CSS файл существует

const GroupForm = observer(({ isEdit = false }) => {
    const { groupStore } = useContext(Context);
    const { id: groupId } = useParams(); // ID группы из URL
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        photo: null, // File object
        changePhoto: false // Для режима редактирования
    });
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if (isEdit && groupId) {
            // Загрузка данных группы, если они еще не загружены или для актуализации
            // groupStore.fetchGroupDetails(groupId) может быть вызван на странице группы
            const group = groupStore.currentGroupDetails;
            if (group && group.id === Number(groupId)) {
                setFormData({
                    name: group.name || '',
                    description: group.description || '',
                    photo: null,
                    changePhoto: false
                });
                setPhotoPreview(group.imageUrl || '/default-group-avatar.png');
            } else {
                 // Если данных нет, загружаем
                groupStore.fetchGroupDetails(groupId).then(fetchedGroup => {
                    if (fetchedGroup) {
                         setFormData({
                            name: fetchedGroup.name || '',
                            description: fetchedGroup.description || '',
                            photo: null,
                            changePhoto: false
                        });
                        setPhotoPreview(fetchedGroup.imageUrl || '/default-group-avatar.png');
                    } else {
                        // Группа не найдена, редирект или сообщение
                        navigate('/groups', { replace: true });
                    }
                });
            }
        } else {
            // Сброс для формы создания
            setFormData({ name: '', description: '', photo: null, changePhoto: false });
            setPhotoPreview(null);
        }
    }, [groupId, isEdit, groupStore]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, photo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            if (isEdit) { // Автоматически ставим галочку "Change Photo"
                setFormData(prev => ({ ...prev, changePhoto: true }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let resultGroup;
        if (isEdit) {
            resultGroup = await groupStore.updateGroup(
                groupId, 
                formData.name, 
                formData.description, 
                formData.changePhoto ? formData.photo : null, // Отправляем фото только если стоит галочка
                formData.changePhoto
            );
        } else {
            resultGroup = await groupStore.createGroup(
                formData.name, 
                formData.description, 
                formData.photo
            );
        }
        
        if (resultGroup) {
            navigate(`/groups/${resultGroup.id}`);
        } else {
            alert(`Error: ${groupStore.error}`);
        }
    };

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>
                {isEdit ? 'Edit Group Information' : 'Create New Group'}
            </h1>
            
            <form onSubmit={handleSubmit} className={classes.form}>
                {(isEdit || photoPreview) && (
                     <div className={classes.avatarSection}>
                        <img src={photoPreview || '/default-group-avatar.png'} alt="Group Avatar" className={classes.avatarPreview} />
                    </div>
                )}

                {isEdit && (
                    <div className={classes.field}>
                        <label className={classes.checkboxLabel}>
                            <input 
                                type="checkbox"
                                name="changePhoto"
                                checked={formData.changePhoto}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    changePhoto: e.target.checked
                                }))}
                                className={classes.checkbox}
                            />
                            Change Group Photo
                        </label>
                        {(formData.changePhoto || !photoPreview) && ( // Показываем инпут если выбрано изменить или если фото еще нет
                            <input 
                                type="file"
                                name="photo"
                                onChange={handlePhotoChange}
                                accept="image/*"
                                className={classes.fileInput}
                            />
                        )}
                    </div>
                )}

                {!isEdit && (
                    <div className={classes.field}>
                        <label className={classes.label}>Group Photo</label>
                        <input 
                            type="file"
                            name="photo"
                            onChange={handlePhotoChange}
                            accept="image/*"
                            className={classes.fileInput}
                            required={!isEdit} // Обязательно для создания
                        />
                    </div>
                )}

                <div className={classes.field}>
                    <label className={classes.label}>Group Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={classes.input}
                        required
                    />
                </div>

                <div className={classes.field}>
                    <label className={classes.label}>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={classes.textarea}
                        rows={4}
                    />
                </div>
                 {groupStore.error && <p className={classes.errorText}>{groupStore.error}</p>}
                <div className={classes.actions}>
                    <Button type="submit" disabled={groupStore.loading}>
                        {groupStore.loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Group')}
                    </Button>
                    <Button 
                        white 
                        type="button"
                        onClick={() => navigate(isEdit ? `/groups/${groupId}` : '/groups')} // или navigate(-1)
                        disabled={groupStore.loading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
});

export default GroupForm;