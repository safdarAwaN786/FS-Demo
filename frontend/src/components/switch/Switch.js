import React, { useState } from 'react';
import style from './Switch.module.css';

const Switch = (props) => {
    const [isOn, setIsOn] = useState(props.state);

    const handleToggle = () => {
        setIsOn(!isOn);
    };

    return (
        <label className={style.switch}>
            <input type="checkbox" checked={isOn} onChange={handleToggle} />
            <span className={`${style.slider} ${style.round}`} ></span>
        </label >
    );
};

export default Switch;
