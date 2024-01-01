import style from './AddProcess.module.css'
import office from '../../assets/images/employeeProfile/Office.svg'
import copyp from '../../assets/images/employeeProfile/CopyP.svg'
import cnic from '../../assets/images/employeeProfile/UserCard.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setLoading } from '../../redux/slices/loading'


function AddProcess() {

    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    const [addOwner, setAddOwner] = useState(false);
    const [processInfo, setProcessInfo] = useState({});
    const [ownerDetail, setOwnerDetail] = useState({});
    const [ownerError, setOwnerError] = useState(false);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    const updateProcessInfo = (e) => {
        setProcessInfo({ ...processInfo, [e.target.name]: e.target.value });
    }
    const updateOwnerDetail = (e) => {
        setOwnerDetail({ ...ownerDetail, [e.target.name]: e.target.value })
    }
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`, { headers: { Authorization: `${user._id}` } }).then((res) => {
            SetDepartmentsToShow(res.data.data);
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

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

    function handleGenerateClick() {
        const newPassword = generateRandomPassword();
        setOwnerDetail({ ...ownerDetail, Password: newPassword })
    }



    const makeRequest = () => {
        if (processInfo) {
            dispatch(setLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addProcess`, processInfo, { headers: { Authorization: `${user._id}` } }).then(() => {
                setProcessInfo(null);
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Define Process' }))
                    }
                })
            }).catch(err => {
                dispatch(setLoading(false));
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


    return (
        <>

            <div className={style.parent}>

                <div className={`${style.form} mt-5`}>
                    <div className='d-flex flex-row px-lg-5 px-2 bg-white py-1'>
                        <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Define Process' }))
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
                            Add Process
                        </div>

                    </div>
                    <div className={`${style.sec1} px-lg-5 px-3`}>
                        <form encType='multipart/form-data' onSubmit={(event) => {
                            event.preventDefault();


                            if (processInfo?.ProcessOwner === null) {
                                setOwnerError(true);
                            } else if (validationMessage !== 'Password is valid!') {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'OOps..',
                                    text: validationMessage
                                })
                            } else {
                                alertManager();
                            }
                        }}>
                            <div>
                                <p>Process Name</p>
                                <div>
                                    <img src={office} alt="" />
                                    <input name='ProcessName' onChange={(event) => {
                                        updateProcessInfo(event);
                                    }} type="text" required />
                                </div>
                            </div>
                            <div>
                                <p>Department</p>
                                <select name='Department' style={{
                                    border: 'none'
                                }} onChange={(event) => {
                                    updateProcessInfo(event);
                                }} className={`form-select  form-select-lg mb-3`} aria-label="Large select example">
                                    <option disabled selected>Choose Department</option>
                                    {departmentsToShow?.map((depObj) => {
                                        return (
                                            <option value={depObj._id}>{depObj.DepartmentName}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div>
                                <p>Activities</p>
                                <div>
                                    <img src={copyp} alt="" />
                                    <textarea onChange={(event) => {
                                        updateProcessInfo(event);
                                    }} name='Activities' className={style.fortextarea} type="text" required />
                                </div>
                            </div>
                            <div>
                                <p>Special Istructions</p>
                                <div>
                                    <img src={copyp} alt="" />
                                    <textarea name='SpecialInstructions' onChange={(event) => {
                                        updateProcessInfo(event);
                                    }} className={style.fortextarea} type="text" required />
                                </div>
                            </div>
                            <div>
                                <p>Shift Breaks</p>
                                <div>
                                    <img src={cnic} alt="" />
                                    <textarea name='ShiftBreaks' onChange={(event) => {
                                        updateProcessInfo(event);
                                    }} className={style.fortextarea} type="text" required />
                                </div>
                            </div>
                            <div>
                                <p>Critical Areas</p>
                                <div>
                                    <img src={cnic} alt="" />
                                    <textarea name='CriticalAreas' onChange={(event) => {
                                        updateProcessInfo(event);
                                    }} className={style.fortextarea} type="text" required />
                                </div>
                            </div>
                            <div>
                                <p>Process Risk Assesment </p>
                                <select style={{
                                    border: 'none'
                                }} name='ProcessRiskAssessment' onChange={(event) => {
                                    updateProcessInfo(event);
                                }} class="form-select form-select-lg mb-3" aria-label="Large select example">
                                    <option disabled selected>Choose Level</option>
                                    <option value="High">High (Thrice a year)</option>
                                    <option value="Medium">Medium (Twice a year)</option>
                                    <option value="Low">Low (Once a year)</option>
                                </select>
                            </div>
                            <div>
                                <p>Reason</p>
                                <div>
                                    <img src={copyp} alt="" />
                                    <textarea name='Reason' onChange={(event) => {
                                        updateProcessInfo(event);
                                    }} className={style.fortextarea} type="text" required />
                                </div>
                            </div>
                            <div className={`mx-auto my-2 `}>
                                <p>Name</p>
                                <input value={ownerDetail?.Name} type='text' name='Name' onChange={(event) => {
                                    updateOwnerDetail(event);
                                }} className={`p-3 w-100`} required />
                            </div>
                            <div className={`mx-auto my-2 `}>
                                <p>Designation</p>
                                <input value={ownerDetail?.Designation} type='text' onChange={(event) => {
                                    updateOwnerDetail(event);
                                }} name='Designation' className={`p-3 w-100`} required />
                            </div>
                            <div className={`mx-auto my-2 `}>
                                <p>Phone</p>
                                <input value={ownerDetail?.PhoneNumber} name='PhoneNumber' onChange={(event) => {
                                    updateOwnerDetail(event);
                                }} type='number' className={`p-3 w-100`} required />
                            </div>
                            <div className={`mx-auto my-2 `}>
                                <p>Email Address</p>
                                <input value={ownerDetail?.Email} name='Email' onChange={(event) => {
                                    updateOwnerDetail(event);
                                }} type='text' className={`p-3 w-100`} required />
                            </div>
                            <div className={`mx-auto my-2 `}>
                                <p>UserName (for login)</p>
                                <input value={ownerDetail?.UserName} name='UserName' onChange={(event) => {
                                    updateOwnerDetail(event);
                                }} type='text' className={`p-3 w-100`} required />
                            </div>
                            <div className={`mx-auto my-2 `}>
                                <p>Password</p>
                                <div className='mb-0 d-flex flex-row justify-content-start'>
                                    <input name='Password' value={ownerDetail?.Password} onChange={(event) => {
                                        updateOwnerDetail(event);
                                        CheckPassword(ownerDetail.Password);


                                    }} type='text' className={`p-3 w-100`} required />

                                    <a onClick={handleGenerateClick} className='btn btn-primary ms-2 my-auto'>Generate</a>
                                </div>
                                {validationMessage && (
                                    <p className={`${validationMessage === 'Password is valid!' ? 'text-success' : 'text-danger'} mt-0`}>{validationMessage}</p>
                                )}
                            </div>
                            <div className={`mx-auto my-3 gap-2 d-flex flex-row`}>
                                <input className='mt-1' value={ownerDetail?.UserName} name='UserName' onChange={(event) => {
                                    setOwnerDetail({ ...ownerDetail, deputyOwner: event.target.checked })
                                }} type='checkbox' required />
                                <p>Deputy Process Owner</p>
                            </div>
                            <div className={style.btns}>
                                <button onClick={() => {
                                    if (validationMessage == 'Password is valid!') {
                                        setProcessInfo({ ...processInfo, ProcessOwner: ownerDetail });
                                    }
                                }} className='mt-5' type='submit'>Submit</button>
                            </div>
                        </form>
                    </div>
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
            {
                ownerError && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>Kindly Add the Owner Details of the Process</p>

                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    setOwnerError(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }

            {
                addOwner ?
                    <div class={`${style.alertparent} ${style.addOwnerBox}`}>
                        <div className={`${style.addOwnerForm} `}>
                            <div className={style.headers}>
                                <div className={style.spans}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                {processInfo.ProcessOwner === null ? (
                                    <div className={style.para}>

                                        Add Process Owner
                                    </div>
                                ) : (
                                    <div className={style.para}>
                                        Edit Owner Details
                                    </div>
                                )}

                            </div>
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                if (validationMessage == 'Password is valid!') {

                                    setProcessInfo({ ...processInfo, ProcessOwner: ownerDetail });
                                    setAddOwner(false);
                                }


                            }}>

                                <div className={` d-flex justify-content-center`}>
                                    <button type='submit' onClick={() => {

                                        // setAddOwner(false);

                                    }} className={style.btn1}>Save</button>
                                    <button onClick={() => {
                                        setAddOwner(false);
                                        setValidationMessage(null);
                                        setOwnerDetail(null);
                                        setProcessInfo({ ...processInfo, ProcessOwner: null })
                                    }} className={style.btn2}>Close</button>

                                </div>
                            </form>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default AddProcess;
