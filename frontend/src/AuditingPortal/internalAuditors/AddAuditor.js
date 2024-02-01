import style from './AddAuditors.module.css';
import edit from '../../assets/images/addEmployee/edit.svg'
import profile from '../../assets/images/addEmployee/prof.svg'
import Office from '../../assets/images/employeeProfile/Office.svg'
import msg from '../../assets/images/hrprofile/mail.svg'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'

function AddAuditor() {

    const imageInputRef = useRef(null);
    const documentRef = useRef(null);
    const letterRef = useRef(null);
    const [alert, setalert] = useState(false)
    const [auditorData, setAuditorData] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [selectedImage, setSelectedImage] = useState(null);
    const handleImageClick = () => {
        imageInputRef.current.click(); // Trigger the click event on the file input
    };
    const user = useSelector(state => state.auth.user)
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
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
    const [approvedAuditor, setApprovedAuditor] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const handleDocumentClick = () => {
        documentRef.current.click();
    };
    const handleLetterClick = () => {
        letterRef.current.click();
    };
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
    const [generatedPassword, setGeneratedPassowrd] = useState(null);
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
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])
    useEffect(() => {
        if (generatedPassword != null) {
            CheckPassword(generatedPassword)
        }
    }, [generatedPassword])

    function handleGenerateClick() {
        const newPassword = generateRandomPassword();
        setGeneratedPassowrd(newPassword)
    }
    const makeRequest = () => {
        if (auditorData !== null) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addAuditor`, auditorData, { headers: { Authorization: `${user._id}` } }).then(() => {
                setAuditorData(null);
                dispatch(setSmallLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Internal Auditor Management' }))
                    }
                })
            }).catch(err => {
                dispatch(setSmallLoading(false));
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'Something went wrong, Try Again!'
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
    const handleLetterChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedLetter(file.name);
        }
    };

    return (
        <>
            <div className={style.parent}>
                <div className={`${style.form} mt-5`}>
                    <div className='d-flex flex-row px-lg-5 bg-white px-2 '>
                        <BsArrowLeftCircle role='button' className='fs-3 my-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Internal Auditor Management' }))
                            }
                        }} />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start align-items-center p-2`}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.para} ms-2`}>
                            Add Auditor
                        </div>
                    </div>
                    <form className='px-lg-5 px-3' encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        if (validationMessage !== 'Password is valid!') {
                            Swal.fire({
                                icon: 'error',
                                title: 'OOps..',
                                text: validationMessage
                            })
                        } else if (phoneNumber.length != 11) {
                            Swal.fire({
                                icon: 'error',
                                title: 'OOps..',
                                text: 'Provide 11 digits for phone Number'
                            })
                        } else if(approvedAuditor && !letterRef.current.value) {
                            Swal.fire({
                                icon: 'error',
                                title: 'OOps..',
                                text: 'Kindly Upload Approved Auditor Document!'
                            })
                        } else {
                            const data = new FormData(event.target);
                            setAuditorData(data)
                            alertManager();
                        }
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
                                accept='.png, .jpg, .jpeg'
                                name='AuditorImage'
                                style={{ display: 'none' }}
                                ref={imageInputRef}
                                onChange={handleImageChange}
                            />
                            <input
                                type="file"
                                id="file-input"
                                name='AuditorDocument'
                                accept='.pdf'
                                style={{ display: 'none' }}
                                ref={documentRef}
                                onChange={handleDocumentChange}
                            />
                            <input
                                type="file"
                                id="file-input"
                                name='ApprovedAuditorLetter'
                                accept='.pdf'
                                style={{ display: 'none' }}
                                ref={letterRef}
                                onChange={handleLetterChange}
                            />
                        </div>
                        <div className={`${style.sec1} px-lg-5 px-sm-4 px-2`}>
                            <div>
                                <input autoComplete='off' name='Name' type="text" placeholder='Name here' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={profile} alt="" />
                            </div>
                            <div>
                                <input autoComplete='off' name='Designation' type="text" placeholder='Designation here' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={Office} alt="" />
                            </div>
                            <div>
                                <input autoComplete='off' name='Age' type="number" placeholder='Age here' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={profile} alt="" />
                            </div>
                            <div>
                                <input autoComplete='off' onChange={(e) => {
                                    setPhoneNumber(e.target.value);
                                }} name='PhoneNumber' type="number" placeholder='Phone Number' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={profile} alt="" />
                            </div>
                            <div>
                                <input autoComplete='off' name='Email' type="email" placeholder='Email Address' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={msg} alt="" />
                            </div>
                            <div>
                                <input autoComplete='off' name='UserName' type="text" placeholder='UserName (for login)' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={msg} alt="" />
                            </div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <input autoComplete='off' value={generatedPassword} onChange={(e) => {
                                    setGeneratedPassowrd(e.target.value);
                                }} name='Password' type="text" placeholder='Password here' required />
                                <a onClick={handleGenerateClick} className='btn btn-outline-primary  mx-2' >Generate</a>
                            </div>
                            {validationMessage != null && (
                                <p className={`${validationMessage === 'Password is valid!' ? 'text-success' : 'text-danger'} mb-3 ms-3`}>{validationMessage}</p>
                            )}
                            <div >
                                <input autoComplete='off' name='Experience' type="text" placeholder='Experience here' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={Office} alt="" />
                            </div>
                            <div >
                                <input autoComplete='off' name='Skills' type="text" placeholder='Skills here' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={Office} alt="" />
                            </div>
                            <div >
                                <input autoComplete='off' name='Education' type="text" placeholder='Education here' required />
                                <img style={{ width: '20px', height: '20px', cursor: 'pointer' }} src={Office} alt="" />
                            </div>
                            <select name='Department' class="form-select fs-6 form-select-lg mb-3" aria-label="Large select example" required>
                                <option disabled selected> Department</option>
                                {departmentsToShow?.map((depObj) => {
                                    return (
                                        <option value={depObj._id}>{depObj.DepartmentName}</option>
                                    )
                                })}
                            </select>
                            <select name='Role' class="form-select fs-6 form-select-lg mb-3" aria-label="Large select example" required>
                                <option disabled selected>Role in team</option>
                                <option value="Team Auditor">Team Auditor</option>
                                <option value="Lead Auditor">Lead Auditor</option>
                            </select>
                            <div className='text-center bg-body-tertiary'>
                                <a onClick={handleDocumentClick} className='btn btn-outline-primary '>{selectedDocument?.slice(0, 15) || "Upload Document"}</a>
                            </div>
                            <div className='p-3 d-flex justify-content-between'>
                                <div className='w-75 m-0 d-flex align-items-center'><p><b>Approved Internal Auditor</b></p> <input autoComplete='off' value={approvedAuditor} name='ApprovedInternalAuditor' style={{
                                    width: '20px',
                                    margin: '10px'
                                }} type='checkbox' onChange={(event) => {
                                    if (event.target.checked) {
                                        setApprovedAuditor(true);
                                    } else {
                                        setApprovedAuditor(false);
                                    }
                                }} />
                                </div>
                                {approvedAuditor && (
                                    <a onClick={handleLetterClick} className='btn w-50 pt-1 btn-outline-primary'>
                                        {selectedLetter?.slice(0, 15) || "Upload Document"}
                                    </a>
                                )}
                            </div>
                            <div className={style.btns}>
                                <button className='mt-4 ' type='submit'>Submit</button>
                            </div>
                        </div>
                    </form>
                </div>
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
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default AddAuditor

