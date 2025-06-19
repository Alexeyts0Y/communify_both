import React from 'react';

import classes from './Button.module.css'

const Button = ({children, ...props}) => {
    return (
        <button {...props} className={props.white ? `${classes.btn} ${classes.btnWhite}` : classes.btn }>
            {children}
        </button>
    );
};

export default Button;