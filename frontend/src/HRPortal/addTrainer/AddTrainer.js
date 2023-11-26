import style from './AddTrainer.module.css'
import edit from '../../assets/images/addEmployee/edit.svg'
import profile from '../../assets/images/addEmployee/prof.svg'
import copyP from '../../assets/images/employeeProfile/CopyP.svg'
import Office from '../../assets/images/employeeProfile/Office.svg'
import msg from '../../assets/images/hrprofile/mail.svg'
import { useRef, useState } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from "react-redux";
import { updateTabData } from '../../redux/slices/tabSlice'
import Cookies from 'js-cookie'
import { setLoading } from '../../redux/slices/loading'

function AddTrainer() {

    const fileInputRef = useRef(null);
    const documentRef = useRef(null);
    const [alert, setalert] = useState(false)
    const [trainerData, setTrainerData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = () => {
        fileInputRef.current.click(); // Trigger the click event on the file input
    };
    const [password, setPassword] = useState(null);
    function generateRandomPassword() {
        const lowercaseCharset = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numberCharset = '0123456789';

        let password = '';

        // Ensure at least one lowercase character
        password += lowercaseCharset.charAt(Math.floor(Math.random() * lowercaseCharset.length));

        // Ensure at least one uppercase character
        password += uppercaseCharset.charAt(Math.floor(Math.random() * uppercaseCharset.length));

        // Ensure at least one number
        password += numberCharset.charAt(Math.floor(Math.random() * numberCharset.length));

        // Generate the remaining characters
        for (let i = 3; i < 8; i++) {
            const charset = lowercaseCharset + uppercaseCharset + numberCharset;
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex);
        }

        // Shuffle the password characters to randomize their positions
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        CheckPassword(password)
        return password;
    }
    const [validationMessage, setValidationMessage] = useState(null);

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


    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const [selectedDocument, setSelectedDocument] = useState(null);


    const navigate = useNavigate();
    const handleDocumentClick = () => {
        documentRef.current.click();

    };

    function handleGenerateClick() {
        const newPassword = generateRandomPassword();
        setPassword(newPassword);
    }

    const tabData = useSelector(state => state.tab);
    const userToken = Cookies.get('userToken');
    const dispatch = useDispatch();
    const makeRequest = () => {
        if (trainerData !== null) {
            dispatch(setLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addTrainer`, trainerData, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                setTrainerData(null);
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({...tabData, Tab : 'Trainers'}))
                        
                    }
                })

            }).catch(err => {
                dispatch(setLoading(false));
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
                text: 'Try filling data again',
                confirmButtonText: 'OK.'
            })
        }
    }

    const handleDocumentChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedDocument(file.name);
        }
    };

    return (
        <>


            <div style={{
                marginBottom: '20px'
            }} className={`${style.form}`}>
                <div className='d-flex flex-row bg-white px-lg-3  px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({...tabData, Tab : 'Trainers'}))
                           
                        }
                    }} />

                </div>
                <div className={style.headers}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                        Add Trainer
                    </div>

                </div>
                <form className='py-4' encType='multipart/form-data' onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.target);

                    setTrainerData(data)


                    alertManager();

                }}>

                    <div className={style.profile}>
                        <img style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "360px",
                        }} src={selectedImage || profile} onClick={handleImageClick} alt="" />
                        <div>
                            <img src={edit} onClick={handleImageClick} alt="" />
                        </div>
                        <input
                            type="file"
                            id="file-input"
                            name='TrainerImage'
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                    </div>
                    <div className={`${style.sec1} pb-3`}>
                        <div>
                            <input name='Name' type="text" placeholder='Name here' required />
                            <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={profile} alt="" />
                        </div>
                        <div>
                            <input name='Age' type="number" placeholder='Age here' required />
                            <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={profile} alt="" />
                        </div>
                        <div>
                            <input name='Email' type="email" placeholder='Email here' required />
                            <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={msg} alt="" />
                        </div>
                        <div>
                            <input name='UserName' type="text" placeholder='username (for login)' required />
                            <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={msg} alt="" />
                        </div>
                        <div className='d-flex align-items-center justify-content-between'>
                            <input value={password} onChange={(event) => {
                                setPassword(event.target.value);
                                CheckPassword(event.target.value);
                            }} name='Password' type="text" placeholder='Password here' required />
                            <a onClick={handleGenerateClick} className='btn btn-outline-primary px-2 me-2' >Generate</a>
                        </div>
                        <div className='bg-light'>

                            {validationMessage && (
                                <p className={`${validationMessage === 'Password is valid!' ? 'text-success' : 'text-danger'} `}>{validationMessage}</p>
                            )}
                        </div>
                        <div>
                            <input  name='Experience' type="text" placeholder='Experience here' required />
                            <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={Office} alt="" />
                        </div>
                        <div>
                            <input name='Qualification' type="text" placeholder='Qualification Here' required />
                            <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={Office} alt="" />
                        </div>
                        <div className={style.spec}>
                            <input name='Specialities' type="text" placeholder='Speciality here' />
                            <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={copyP} alt="" />
                        </div>
                        <input onChange={handleDocumentChange} name='TrainerDocument' type='file' ref={documentRef} style={{ display: 'none' }} />
                        <div className={`${style.btns}`}>

                            <p style={{
                                padding: "13px 20px",
                                cursor: 'pointer',
                                width: "246px",
                                height: "58px",
                                flexShrink: "0",
                                borderRadius: "10px",
                                border: "1px solid #ee6a5f",
                                color: "#ee6a5f",
                                fontSize: "17px",
                                fontFamily: "Poppins",
                                fontStyle: "normal",
                                fontWeight: "400",
                                lineHeight: "normal",
                                background: "#fff",
                            }} onClick={() => {
                                setalert(false);
                                handleDocumentClick();
                            }}
                            >{selectedDocument?.slice(0, 15) || "Upload Documents"}</p>
                            <button type='submit'>Submit</button>
                        </div>
                    </div>
                </form>
            </div>

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest();

                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default AddTrainer
