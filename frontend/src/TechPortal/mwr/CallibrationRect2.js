import style from './CallibrationRect2.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import { IoCheckmarkCircleOutline } from "react-icons/io5";

function CallibrationRect2() {
    const [alert, setalert] = useState(false);
    const [alert2, setalert2] = useState(false);
    const [alert3, setalert3] = useState(false);
    const imageInputRef = useRef(null);
    const certificateInputRef = useRef(null);
    const masterCertificateInputRef = useRef(null);
    const exCertificateInputRef = useRef(null);
    const [comment, setComment] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const callibrationType = useSelector(state => state.appData.callibrationType);
    const dateType = useSelector(state => state.appData.dateType);
    const user = useSelector(state => state.auth.user);

    const alertManager = () => {
        setalert(!alert)
    }
    var nextdate = new Date();

    if (dateType === 'Daily') {
        nextdate.setDate(nextdate.getDate() + 1);
    } else if (dateType === 'Weekly') {
        nextdate.setDate(nextdate.getDate() + 7);
    } else if (dateType === 'Monthly') {
        nextdate.setMonth(nextdate.getMonth() + 1);
    } else if (dateType === 'Quarterly') {
        nextdate.setMonth(nextdate.getMonth() + 3)
    } else if (dateType === 'Yearly') {
        nextdate.setFullYear(nextdate.getFullYear() + 1)
    }

    const [formValues, setFormValues] = useState({
        dateType: dateType,
        callibrationType: callibrationType,
        equipmentId: idToWatch,
        lastDate: JSON.stringify(new Date()),
        nextDate: JSON.stringify(nextdate),
        CR: user.Name
    });
    const [submitAlert, setSubmitAlert] = useState(false);
    const [equipment, setEquipment] = useState(null);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readEquipment/${idToWatch}`).then((res) => {
            setEquipment(res.data.data);
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


    const updateFormValues = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value })
    }
    const updateFormFiles = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.files[0] })
    }

    const convertStateToFormData = (state) => {
        const formData = new FormData();
        // Iterate through the state object
        for (const key in state) {
            if (state.hasOwnProperty(key)) {
                const value = state[key];

                // Append text values directly to FormData
                if (typeof value === 'string') {
                    formData.append(key, value);
                }

                // Append file objects to FormData
                if (value instanceof File) {
                    formData.append(key, value, value.name);
                }
            }
        }

        return formData;
    }
    useEffect(() => {
        console.log(formValues);
    }, [formValues])

    const [alertdata, setAlertData] = useState(false)


    return (
        <>
                <div className='d-flex flex-row bg-white px-lg-5 mx-1 px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tab: 'Master List of Monitoring and Measuring Devices' }))
                        }
                    }} />

                </div>
                <div className={`${style.headers} mt-1 `}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                        Callibration Record
                    </div>

                </div>
                <div className={style.form}>
                    <div className={style.sec1}>
                        <div>
                            <p>Device Id</p>
                            <input autoComplete='off' type="text" value={equipment?.equipmentCode} />
                        </div>
                        <div>
                            <p>Device name</p>
                            <input autoComplete='off' type="text" value={equipment?.equipmentName} />
                        </div>
                        <div>
                            <p>Date type</p>
                            <input autoComplete='off' type="text" value={dateType} />
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div>
                            <p>Device location</p>
                            <input autoComplete='off' type="text" value={equipment?.equipmentLocation} />
                        </div>
                        <div>
                            <p>Device Range</p>
                            <input autoComplete='off' type="text" value={equipment?.Range} />
                        </div>
                        <div>
                            <p>Callibration type</p>
                            <input autoComplete='off' type="text" value={callibrationType} />
                        </div>
                    </div>
                </div>
                <div className={style.btnparent}>
                    <p>Add</p>
                    <button onClick={() => {
                        setalert2(!alert2)
                    }} className={style.download}>Internal {(formValues.Image && formValues.Certificate && formValues.masterCertificate) && <IoCheckmarkCircleOutline className='text-white fs-3' />} </button>
                    <button onClick={() => {
                        setalert3(!alert3)
                    }} className={style.next}>External {(formValues.companyName && formValues.masterReference && formValues.Certificate) && <IoCheckmarkCircleOutline className='text-white fs-3' />}</button>
                </div>
                <div className={style.tableParent}>
                    <table className={style.table}>
                        <tr className={style.tableHeader}>
                            <th>Last Callibration date</th>
                            <th colSpan={3}>
                                <div>Marked Readings</div>
                                <div>
                                    <p>1st</p>
                                    <p>2nd</p>
                                    <p>3rd</p>
                                </div>
                            </th>
                            <th>Next Callibration date</th>
                            <th>Condition/Remarks</th>
                            <th>CR Initials</th>
                        </tr>

                        <tr >
                            <td>{new Date().getDate()}/{new Date().getMonth()}/{new Date().getFullYear()}</td>
                            <td className='px-1' style={{width : '100px'}}><input style={{backgroundColor : '#d6d6d6'}} autoComplete='off' className='px-1 w-100 bg-grey' onChange={updateFormValues} name='firstReading' type="number" /></td>
                            <td  className='px-1' style={{width : '100px'}}><input style={{backgroundColor : '#d6d6d6'}} autoComplete='off' className='px-1 w-100' onChange={updateFormValues} name='secondReading' type="number" /></td>
                            <td className='px-1' style={{width : '100px'}} ><input style={{backgroundColor : '#d6d6d6'}} autoComplete='off' className='px-1 w-100' onChange={updateFormValues} name='thirdReading' type="number" /></td>
                            <td>{nextdate.getDate()}/{nextdate.getMonth()}/{nextdate.getFullYear()}</td>
                            <td ><button onClick={alertManager} className={style.btn}>add {formValues.comment && <IoCheckmarkCircleOutline className='text-success fs-4' />}</button></td>
                            <td className='px-1'><input autoComplete='off' className='px-1 w-100' value={user.Name} name='CR' type="text" /></td>
                        </tr>
                    </table>
                </div>
                <div className={style.btnparent}>
                    <button onClick={() => {
                        if (formValues.firstReading && formValues.secondReading && formValues.thirdReading && formValues.Image && formValues.Certificate && formValues.exCertificate && formValues.masterCertificate && formValues.companyName && formValues.masterReference && formValues.comment) {
                            setSubmitAlert(true);
                        } else {

                            setAlertData(true)
                        }
                    }} >Submit</button>

                </div>
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <textarea name="remarks" id="" onChange={(e) => {
                                setComment(e.target.value)
                            }} cols="30" rows="10" placeholder='Comment here'></textarea>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    if (comment) {
                                        setFormValues({ ...formValues, comment: comment })
                                    }
                                    alertManager();
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                alert2 ?
                    <div class={style.alertparent2}>
                        <div class={style.alert2}>
                            <div>
                                <p>Image</p>
                                <button onClick={() => {
                                    imageInputRef.current.click();
                                }} className={style.btn1}>{formValues?.Image?.name?.slice(0, 15) || 'Upload'}</button>
                                <input
                                    type="file"
                                    name='Image'
                                    accept='.jpg, .jpeg, .png'
                                    style={{ display: 'none' }}
                                    ref={imageInputRef}
                                    onChange={updateFormFiles}
                                />
                            </div>
                            <div>
                                <p>Certificate</p>
                                <button onClick={() => {
                                    certificateInputRef.current.click();
                                }} className={style.btn1}>{formValues?.Certificate?.name?.slice(0, 15) || 'Generate'}</button>
                                <input
                                    name='Certificate'
                                    type="file"
                                    accept='.pdf'
                                    style={{ display: 'none' }}
                                    ref={certificateInputRef}
                                    onChange={updateFormFiles}
                                />
                            </div>
                            <div>
                                <p>Master callibration certificate</p>
                                <button onClick={() => {
                                    masterCertificateInputRef.current.click();
                                }} className={style.btn1} >{formValues?.masterCertificate?.name?.slice(0, 15) || 'Upload'}</button>
                                <input
                                    name='masterCertificate'
                                    type="file"
                                    accept='.pdf'
                                    style={{ display: 'none' }}
                                    ref={masterCertificateInputRef}
                                    onChange={updateFormFiles}
                                />
                            </div>
                            <div>
                                <p onClick={() => {
                                    setalert2(!alert2)
                                }}>Ok</p>
                            </div>
                        </div>
                    </div> : null
            }
            {
                alert3 ?
                    <div class={style.alertparent2}>
                        <div class={style.alert2}>
                            <div>
                                <p>Company name</p>
                                <input autoComplete='off' name='companyName' onChange={updateFormValues} type="text" />
                            </div>
                            <div>
                                <p>Master callibration reference</p>
                                <input autoComplete='off' name='masterReference' onChange={updateFormValues} type="text" />
                            </div>
                            <div>
                                <p>Certificate</p>
                                <button onClick={() => {
                                    exCertificateInputRef.current.click();
                                }} className={style.btn1} >{formValues?.exCertificate?.name?.slice(0, 15) || 'Upload'}</button>
                                <input
                                    name='exCertificate'
                                    type="file"
                                    accept='.pdf'
                                    style={{ display: 'none' }}
                                    ref={exCertificateInputRef}
                                    onChange={updateFormFiles}
                                />
                            </div>
                            <div>
                                <p onClick={() => {
                                    setalert3(!alert3)
                                }}>Ok</p>
                            </div>
                        </div>
                    </div> : null
            }
            {
                submitAlert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={`${style.msg} text-center p-4 mt-3 fs-5 fw-bold`}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setSubmitAlert(false)
                                    const formData = convertStateToFormData(formValues);
                                    dispatch(setSmallLoading(true))
                                    axios.post(`${process.env.REACT_APP_BACKEND_URL}/addCalibration/${idToWatch}`, formData, { headers: { Authorization: `${user._id}` } }).then((res) => {
                                        dispatch(setSmallLoading(false))
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                dispatch(updateTabData({ ...tabData, Tab: 'Master List of Monitoring and Measuring Devices' }))
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

                                }} className={style.btn1}>Submit</button>
                                <button onClick={() => { setSubmitAlert(false) }} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }

            {
                alertdata ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={`${style.msg} text-center p-4 mt-3 fs-5 fw-bold`}>Please provide all data in internal, external, remarks and readings..</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => { setAlertData(false) }} className={style.btn2}>Close</button>
                            </div>
                        </div>
                    </div> : null
            }


        </>
    )
}

export default CallibrationRect2
