import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Post from '../Post/Post';
import classes from './PostContainer.module.css';

const PostContainer = observer(({ posts, isGroupContext = false }) => {
    if (!posts || posts.length === 0) {
        return <div className={classes.container}><p>No posts to display.</p></div>;
    }

    return (
        <div className={classes.container}>
            {posts.map((post) => (
                <Post 
                    post={post} 
                    key={post.id}
                    isGroupContext={isGroupContext}
                />
            ))}
        </div>
    );
});

export default PostContainer;