import React from 'react'
import style from './welcome.module.css'
import welcomeImg from '../../assets/images/sidebar/welcomeimg.svg'
import { useSelector } from 'react-redux';

function Wellcome() {
 

  const user = useSelector(state => state.auth?.user);
  return (
    <div className={`${style.parent}`}>
      
      <div className={style.welcome}>
        <img src={welcomeImg} alt="" />
        <p>Welcome to {user?.Department?.DepartmentName} Panel!</p>
      </div>
    </div>
  )
}

export default Wellcome
