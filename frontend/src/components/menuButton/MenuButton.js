import { useState } from 'react'
import style from './MenuButton.module.css'

function MenuButton(props) {
   
    const toggleH = () => {
        
        props?.func()
    }
    return (
        <div onClick={toggleH} className={`${props.offcanvas ? `${style.open} ${style.navIcon1}` : `${style.navIcon1}` } mx-2`}>
            <span></span>
            <span></span>
            <span></span>
        </div>

    )
}

export default MenuButton
