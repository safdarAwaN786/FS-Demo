import style from './HRProfile.module.css'
import larr from '../../assets/images/hrprofile/larr.svg'
import mail from '../../assets/images/hrprofile/mail.svg'
import man from '../../assets/images/hrprofile/man.svg'
import { useState } from 'react'
import profile from '../../assets/images/addEmployee/prof.svg'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setSmallLoading } from '../../redux/slices/loading'


function HRProfile() {
    const [newPassword, setNewPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);
    const [validationMessage, setValidationMessage] = useState(null);
    const user = useSelector(state => state.auth.user);
    function CheckPassword(submittedPassword) {
        if (submittedPassword?.length < 8) {
            setValidationMessage('Password must be at least 8 characters long.');
            return;
        }

        if (
            !/[a-z]/.test(submittedPassword) ||
            !/[A-Z]/.test(submittedPassword) ||
            !/[0-9]/.test(submittedPassword)
        ) {
            setValidationMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
            return;
        }

        // Password is valid
        setValidationMessage('Password is valid!');
    }
    const dispatch = useDispatch();
    const makeRequest = () => {
        if (newPassword === confirmPassword) {
            if (validationMessage === 'Password is valid!') {
                dispatch(setSmallLoading(true))
                axios.put(`${process.env.REACT_APP_BACKEND_URL}/change-password`, {...user, Password: newPassword }, { headers: { Authorization: `${user._id}` } }).then(() => {
                    dispatch(setSmallLoading(false));
                    setNewPassword(null);
                    setConfirmPassword(null);
                    window.location.reload();
                    Swal.fire({
                        title: 'Success',
                        text: 'Password Changed Successfully',
                        icon: 'success',
                        confirmButtonText: 'Go!',

                    })

                }).catch(err => {
                    dispatch(setSmallLoading(false));
                    Swal.fire({
                        icon : 'error',
                        title : 'OOps..',
                        text : 'Something went wrong, Try Again!'
                    })
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Sorry, Password is not Valid!',
                    confirmButtonText: 'OK.'
                })
            }

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Confirm Password does not match!',
                confirmButtonText: 'OK.'
            })
        }
    }

    return (


        <div className={`${style.profile} mt-3`}>


            <div className={style.hrInfo}>
                <div>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div>
                    <p>{user.Name}</p>
                    <p>{user.Designation}</p>
                </div>
                <div >
                    <img className='bg-white' src={profile} alt="" />
                </div>

            </div>
            <div className={style.cardParent}>
                <div className={style.card1}>
                    <div className={style.card1headers}>
                        <div>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div>
                            <p>Info</p>
                        </div>
                    </div>
                    <div className={style.card1body}>
                        <div>
                            <img src={man} alt="" />
                            <div>
                                <p className={style.card1para}>Name</p>
                                <p className={style.card1para2}>{user.Name}</p>
                            </div>
                        </div>
                        <div>
                            <img src={mail} alt="" />
                            <div>
                                <p className={style.card1para}>Email</p>
                                <p className={style.card1para2}>{user.Email}</p>
                            </div>
                        </div>
                        <div>
                            <img src={mail} alt="" />
                            <div>
                                <p className={style.card1para}>UserName</p>
                                <p className={style.card1para2}>{user.UserName}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style.card2}>
                    <div className={style.card2headers}>
                        <p>Role</p>
                        <img src={larr} alt="" />
                        <p>{user.Role}</p>
                    </div>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        makeRequest()
                    }}>
                        <div className={style.card2body}>

                            <input autoComplete='off' value={newPassword} onChange={(e) => {
                                setNewPassword(e.target.value);
                                CheckPassword(e.target.value);
                            }} type="text" placeholder='Change password' required />
                            <input autoComplete='off' value={confirmPassword} onChange={(e) => {
                                setConfirmPassword(e.target.value);
                            }} type="text" placeholder='Confirm Password' required />
                            <button type='submit'>Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    )
}

export default HRProfile
