import React from 'react';

const ButtonGroup = ({ children, className = '', vertical = false }) => {
    const classes = `aurora-btn-group ${vertical ? 'aurora-btn-group-vertical' : ''} ${className}`;
    
    return (
        <div className={classes}>
            {children}
        </div>
    );
};

export default ButtonGroup;