import { useState } from 'react'
import style from './ProfileUser.module.css'
import circularuser from '../../assets/images/hrprofile/UserCircle.svg'
import profile from '../../assets/images/addEmployee/prof.svg'
import logout from '../../assets/images/hrprofile/Logout.svg'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import Cookies from 'js-cookie'
import { logOutUser } from '../../redux/slices/authSlice'
import axios from 'axios'
function ProfileUser({ setRedTab }) {

    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false)
    let navigate = useNavigate()
    const toggler = () => {
        if (isOpen) {
            setIsOpen(false)
        } else {
            setIsOpen(true)
        }
    }
    const userToken = Cookies.get('userToken');
    const pushProfile = () => {
        dispatch(updateTabData({ ...tabData, Tab: "User Profile" }));
        setRedTab(null)
        toggler()
    }
    return (
        <div className={style.parent}>
            <img style={{
                width: '40px'
            }} src={profile} onClick={toggler} alt="" />
            {
                isOpen ?
                    <div className={style.dropdown}>
                        <div onClick={pushProfile}>
                            <img src={circularuser} alt="" />
                            <p>Profile</p>
                        </div>
                        <div onClick={() => {
                            Cookies.remove('userToken');
                            navigate('/login');
                            dispatch(logOutUser());
                            dispatch(updateTabData(null))
                        }}>
                            <img src={logout} alt="" />
                            <p>Logout</p>
                        </div>
                    </div> : null
            }

        </div>
    )
}

export default ProfileUser
