import style from './AddEmployees.module.css'
import edit from '../../assets/images/addEmployee/edit.svg'
import profile from '../../assets/images/addEmployee/prof.svg'
import mail from '../../assets/images/hrprofile/mail.svg'
import Phone from '../../assets/images/employeeProfile/Phone.svg'
import copyp from '../../assets/images/employeeProfile/CopyP.svg'
import Location from '../../assets/images/employeeProfile/Location.svg'
import UserCard from '../../assets/images/employeeProfile/UserCard.svg'
import man from '../../assets/images/hrprofile/man.svg'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'

function AddEmployee() {

    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const fileInputRef = useRef(null);
    const documentRef = useRef(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [phone, setPhone] = useState(null);
    const [CNIC, setCNIC] = useState(null);
    const [password, setPassword] = useState(null);
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

    function generateRandomPassword(index) {
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

        CheckPassword(password, index)
        return password;
    }


    const handleImageClick = () => {
        fileInputRef.current.click(); // Trigger the click event on the file input
    };
    const handleDocumentClick = () => {
        setalert(false)
        documentRef.current.click(); // Trigger the click event on the file input
    };
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);
    const [departmentsToShow, setDepartmentsToShow] = useState(null);


    useEffect(() => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            dispatch(setSmallLoading(false))
            setDepartmentsToShow(res.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const [dataError, setDataError] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [employeesList, setEmployeesList] = useState(null);
    const [email, setEmail] = useState(null);
    const [error, setError] = useState(false);


    const makeRequest = () => {
        if (employeeData && !error) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addEmployee`, employeeData, { headers: { Authorization: `${user._id}` } }).then((response) => {
                dispatch(setSmallLoading(false))
                if (response.status === 201) {
                    Swal.fire({
                        title: 'OOps',
                        text: response.data.message,
                        icon: 'error',
                        confirmButtonText: 'Go!',

                    })
                } else {
                    Swal.fire({
                        title: 'Success',
                        text: 'Submitted Successfully',
                        icon: 'success',
                        confirmButtonText: 'Go!',

                    }).then((result) => {
                        if (result.isConfirmed) {
                            dispatch(updateTabData({ ...tabData, Tab: 'Employee Registration' }));
                        }
                    })
                }
            }).catch(err => {
                dispatch(setSmallLoading(false));
                Swal.fire({
                    icon : 'error',
                    title : 'OOps..',
                    text : 'Something went wrong, Try Again!'
                })
            })
        }
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
    const checkError = async () => {
        if (employeesList) {


            if (employeesList.filter((employee) => employee.Email === email || employee.PhoneNumber === phone)) {
                setalert(false);
                setError(true);
            }
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


                <div className='d-flex flex-row px-lg-5  px-2 mx-1 my-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tab: 'Employee Registration' }))
                        }
                    }} />

                </div>

                <div className={`${style.form} mt-1 `}>
                    <div className={style.headers}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={style.para}>
                            Add&nbsp;Employee
                        </div>

                    </div>
                    <form encType='multipart/form-data' onSubmit={async (event) => {
                        event.preventDefault();



                        if (phone.length !== 11 && CNIC.length !== 13) {
                            setDataError(true);
                        } else {
                            await checkError();



                            const data = new FormData(event.target);
                            console.log(data)

                            setEmployeeData(data);
                            alertManager();





                        }
                    }}>

                        <div className={style.profile}>
                            <img style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "360px",
                            }} src={selectedImage || profile} alt="" onClick={handleImageClick} />
                            <div>
                                <img src={edit} alt="" onClick={handleImageClick} />
                            </div>
                            <input
                                type="file"
                                id="file-input"
                                name='Image'
                                accept=".jpg, .jpeg, .png"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />
                        </div>
                        <div className={style.userform}>
                            <div className={style.sec1}>
                                <div>
                                    <input name='Name' type="text" placeholder='Name* here' required />
                                    <img src={man} alt="" />
                                </div>
                                <div>
                                    <input name='UserName' type="text" placeholder='username (for login)' required />
                                    <img src={man} alt="" />
                                </div>
                                <div>
                                    <input id='phoneNumber' onChange={(event) => {
                                        setPhone(event.target.value);
                                    }} name='PhoneNumber' type="number" placeholder='Phone Number* (11 digits)' required />
                                    <img src={Phone} alt="" />
                                </div>
                                <div>
                                    <input name='Email' onChange={(event) => {
                                        setEmail(event.target.value);
                                    }} type="email" placeholder='Email* here' required />
                                    <img src={mail} alt="" />
                                </div>
                                <div>
                                    <input id='CNIC' onChange={(event) => {
                                        setCNIC(event.target.value);
                                    }} name='CNIC' type="number" placeholder='CNIC* (without dashes"-")' required />
                                    <img src={UserCard} alt="" />
                                </div>
                                <div>
                                    <input name='Qualification' type="text" placeholder='Qualification* here' required />
                                    <img src={copyp} alt="" />
                                </div>
                            </div>
                            <div className={style.sec2}>
                                <div>
                                    <select className='form-select  form-select-lg' name='Department' style={{ width: "100%" }} required>
                                        <option value="" selected disabled>Choose Department*</option>
                                        {departmentsToShow?.map((depObj) => {
                                            return (
                                                <option value={depObj.DepartmentName}>{depObj.DepartmentName}</option>
                                            )
                                        })}
                                    </select>
                                    
                                </div>
                                <div>
                                    <input onChange={(e) => {
                                        setPassword(e.target.value);
                                        CheckPassword(e.target.value);
                                    }} value={password} name='Password' type="text" placeholder='Password here' />

                                    <button onClick={() => {
                                        const generatedPassword = generateRandomPassword();
                                        setPassword(generatedPassword);
                                        CheckPassword(generatedPassword);
                                    }} type='button' className='btn btn-outline-primary p-0'>Generate</button>
                                </div>
                                {validationMessage && (
                                    <p className={`${validationMessage === 'Password is valid!' ? 'text-success' : 'text-danger'}`}>{validationMessage}</p>
                                )}
                                <div>
                                    <input name='Address' type="text" placeholder='Address* here' />
                                    <img src={Location} alt="" required />
                                </div>
                                <div>
                                    <input name='Designation' type="text" placeholder='Designation* here' required />
                                    <div className={style.indicator}>
                                        <img src={mail} alt="" />
                                        {/* <div>
                                                <img src={arrow} alt="" />
                                            </div> */}
                                    </div>
                                </div>
                                <div><p style={{
                                    marginLeft: "20px"
                                }}>Date of Birth :</p>
                                    <input name='DateOfBirth' type="date" style={{
                                        width: "50%"
                                    }} placeholder='Date of Birth*' required />

                                </div>
                                <input onChange={handleDocumentChange} name='CV' type='file' accept=".pdf" ref={documentRef} style={{ display: 'none' }} />
                                <div className='d-flex flex-wrap'>

                                    <p className={style.pbtn} onClick={() => {
                                        handleDocumentClick();
                                        setalert(false);
                                    }}>{selectedDocument?.slice(0, 15) || "Upload Documents"}</p>
                                    <div className={`${style.btns} my-2`}>
                                        <button type='submit'>Submit</button>
                                    </div>
                                </div>


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


                                <button onClick={alertManager} className={style.btn2}>Cencel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                dataError ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Please enter a valid information. Check phone Number digits and CNIC.</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setDataError(false);


                                }
                                } className={style.btn1}>Ok.</button>




                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default AddEmployee
