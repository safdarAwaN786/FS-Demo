// Import statements remain unchanged
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
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

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
    const [departmentsToShow, setDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);

    useEffect(() => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            dispatch(setSmallLoading(false))
            setDepartmentsToShow(res.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
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
            }).catch(err => {
                dispatch(setSmallLoading(false));
                if (err.response?.status === 400) {
                    Swal.fire({
                        title: 'OOps',
                        text: err.response.data.message,
                        icon: 'error',
                        confirmButtonText: 'Go!',
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'OOps..',
                        text: 'Something went wrong, Try Again!'
                    })
                }
            })
        }
    }

    const handleImageClick = () => fileInputRef.current.click();
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentClick = () => {
        setalert(false);
        documentRef.current.click();
    };

    const handleDocumentChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedDocument(file.name);
        }
    };

    const checkError = async () => {
        if (employeesList) {
            if (employeesList.filter((employee) => employee.Email === email)) {
                setalert(false);
                setError(true);
            }
        }
    }

    return (
        <>
            <div className='d-flex flex-row px-lg-5  px-2 mx-1 my-2'>
                <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={() => {
                    dispatch(updateTabData({ ...tabData, Tab: 'Employee Registration' }))
                }} />
            </div>

            <div className={`${style.form} mt-1 `}>
                <div className={style.headers}>
                    <div className={style.spans}><span></span><span></span><span></span></div>
                    <div className={style.para}>Add&nbsp;Employee</div>
                </div>
                <form encType='multipart/form-data' onSubmit={async (event) => {
                    event.preventDefault();
                    await checkError();
                    const data = new FormData(event.target);
                    data.append("PhoneNumber", phone);
                    data.append("CNIC", CNIC);
                    setEmployeeData(data);
                    alertManager();
                }}>

                    <div className={style.profile}>
                        <img style={{ width: "200px", height: "200px", borderRadius: "360px" }} src={selectedImage || profile} alt="" onClick={handleImageClick} />
                        <div><img src={edit} alt="" onClick={handleImageClick} /></div>
                        <input type="file" name='Image' accept=".jpg, .jpeg, .png" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageChange} />
                    </div>

                    <div className={style.userform}>
                        <div className={style.sec1}>
                            <div><input autoComplete='off' name='Name' type="text" placeholder='Name* here' required /><img src={man} alt="" /></div>
                            <div><PhoneInput placeholder="Enter phone number" value={phone} onChange={setPhone} defaultCountry="US" international required /><img src={Phone} alt="" /></div>
                            <div><input autoComplete='off' name='Email' onChange={(e) => setEmail(e.target.value)} type="email" placeholder='Email* here' required /><img src={mail} alt="" /></div>
                            <div><input autoComplete='off' name='CNIC' onChange={(e) => setCNIC(e.target.value)} type="text" placeholder='CNIC' required /><img src={UserCard} alt="" /></div>
                            <div><input autoComplete='off' name='Qualification' type="text" placeholder='Qualification* here' required /><img src={copyp} alt="" /></div>
                        </div>

                        <div className={style.sec2}>
                            <div>
                                <select name='Department' required style={{ border: 'none', padding: '10px', width: '100%' }} className='form-select'>
                                    <option disabled selected value="">Choose Department</option>
                                    {departmentsToShow?.map(dep => (
                                        <option key={dep._id} value={dep.DepartmentName}>{dep.DepartmentName}</option>
                                    ))}
                                </select>
                                <img src={copyp} alt="" />
                            </div>
                            <div><input autoComplete='off' name='Address' type="text" placeholder='Address* here' required /><img src={Location} alt="" /></div>
                            <div><input autoComplete='off' name='Designation' type="text" placeholder='Designation* here' required /><div className={style.indicator}><img src={mail} alt="" /></div></div>
                            <div><p style={{ marginLeft: "20px" }}>Date of Birth :</p><input autoComplete='off' name='DateOfBirth' type="date" style={{ width: "50%" }} required /></div>
                            <input autoComplete='off' onChange={handleDocumentChange} name='CV' type='file' accept=".pdf" ref={documentRef} style={{ display: 'none' }} />
                            <div className='d-flex flex-wrap'>
                                <p className={style.pbtn} onClick={handleDocumentClick}>{selectedDocument?.slice(0, 15) || "Upload Documents"}</p>
                                <div className={`${style.btns} my-2`}><button type='submit'>Submit</button></div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {alert && (
                <div className={style.alertparent}>
                    <div className={style.alert}>
                        <p className={style.msg}>Do you want to submit this information?</p>
                        <div className={style.alertbtns}>
                            <button onClick={() => { alertManager(); makeRequest(); }} className={style.btn1}>Submit</button>
                            <button onClick={alertManager} className={style.btn2}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {dataError && (
                <div className={style.alertparent}>
                    <div className={style.alert}>
                        <div className={style.alertbtns}>
                            <button onClick={() => { setDataError(false); }} className={style.btn1}>Ok.</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AddEmployee;
