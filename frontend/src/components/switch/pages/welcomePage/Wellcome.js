import React from 'react'
import SideBar from '../../components/sidebar/SideBar'
import style from './welcome.module.css'
import welcomeImg from '../../assets/images/sidebar/welcomeimg.svg'

function Wellcome() {
  return (
    <div className={`${style.parent}`}>
      <div className={`${style.sidebar}`}>
        <SideBar />
      </div>
      <div className={style.welcome}>
        <img src={welcomeImg} alt="" />
        <p>Welcome to HR Panel!</p>
      </div>
    </div>
  )
}

export default Wellcome
