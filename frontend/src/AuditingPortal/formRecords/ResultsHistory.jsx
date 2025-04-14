import style from './ResultsHistory.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function ResultsHistory() {

    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [comment, setComment] = useState(null);
    const [commentBox, setCommentBox] = useState(false);
    const [formResults, setFormResults] = useState(null);
    const [idForAction, setIdForAction] = useState(null);
    const [formData, setFormData] = useState(null);
    const [verify, setVerify] = useState(false);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess)
    const user = useSelector(state => state.auth.user)
    function extractTimeFromDate(dateString) {
        const dateObject = new Date(dateString);
        const hours = dateObject.getHours().toString().padStart(2, '0');
        const minutes = dateObject.getMinutes().toString().padStart(2, '0');
        const seconds = dateObject.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-responses-by-formId/${idToWatch}`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setFormResults(res.data.data);
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
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-form-by-id/${idToWatch}`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setFormData(res.data.form);
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
    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-responses-by-formId/${idToWatch}`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setFormResults(res.data.data);
            setFormData(res.data.data[0]?.Form);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }


    return (
        <>

            <div className='mx-lg-5 px-2 mx-md-4 mx-2 mt-5 mb-1 '>
                <BsArrowLeftCircle onClick={(e) => {
                    dispatch(updateTabData({ ...tabData, Tab: 'Master List of Records/Forms' }))
                }} className='fs-3 text-danger mx-1' role='button' />
            </div>
            <div className={`${style.headers} mt-0`}>
                <div className={style.spans}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className={style.para}>
                    Record Keeping
                </div>
            </div>
            <div className={style.form}>
                <div className={style.sec1}>
                    <div>
                        <p>Form Id</p>
                        <div className="custom-input-like-scrollable">
                            {formData?.FormId}
                        </div>

                    </div>
                    <div>
                        <p>Created By</p>
                        <div className="custom-input-like-scrollable">
                            {formData?.CreatedBy}
                        </div>

                    </div>
                    <div>
                        <p>Creation Date</p>
                        {formData?.CreationDate ? (
                            <input autoComplete='off' value={`${formData?.CreationDate?.slice(0, 10).split('-')[2]}/${formData?.CreationDate?.slice(0, 10).split('-')[1]}/${formData?.CreationDate?.slice(0, 10).split('-')[0]}`} type="text" readOnly />
                        ) : (
                            <input autoComplete='off' value='- - -' />
                        )}
                    </div>
                </div>
                <div className={style.sec2}>
                    <div>
                        <p>Form Name</p>
                        <div className="custom-input-like-scrollable">
                            {formData?.FormName}
                        </div>
                    </div>
                    <div>
                        <p>Approved By</p>
                        <div className="custom-input-like-scrollable">
                            {formData?.ApprovedBy}
                        </div>

                    </div>
                    <div>
                        <p>Approval Date</p>
                        {formData?.ApprovalDate !== undefined ? (

                            <input autoComplete='off' type="text" value={`${formData?.ApprovalDate?.slice(0, 10).split('-')[2]}/${formData?.ApprovalDate?.slice(0, 10).split('-')[1]}/${formData?.ApprovalDate?.slice(0, 10).split('-')[0]}`} />
                        ) : (
                            <input autoComplete='off' type="text" value={`- - -`} />
                        )}
                    </div>
                </div>
            </div>
            <div className={style.tableParent}>
                <table className={style.table}>
                    <tr className={style.tableHeader}>
                        <th>Time</th>
                        <th>Maintenance Frequency</th>
                        <th>Filled By</th>
                        <th>Fill Date</th>
                        <th>Status</th>
                        <th>Verified By</th>
                        <th>Verification Date</th>
                        <th>Department</th>
                        {/* <th>Designation</th> */}
                        <th>Action</th>
                        {tabData?.Verification && (
                            <th>Action</th>
                        )}
                        <th>Comment</th>
                    </tr>
                    {
                        formResults?.map((result, index) => {
                            return (
                                <tr key={index}>
                                    <td>{extractTimeFromDate(result.FillDate)}</td>
                                    <td>{formData?.MaintenanceFrequency}</td>
                                    <td>{result?.FillBy}</td>
                                    <td>{result?.FillDate?.slice(0, 10).split('-')[2]}/{result?.FillDate?.slice(0, 10).split('-')[1]}/{result?.FillDate?.slice(0, 10).split('-')[0]}</td>
                                    <td><div className={`text-center ${result.Status === 'Verified' && style.greenStatus} ${result.Status === 'Rejected' && style.redStatus}  ${result.Status === 'Pending' && style.yellowStatus}  `}><p>{result.Status}</p></div></td>
                                    <td>{result?.verifiedBy || 'Pending'}</td>
                                    <td>{result?.verificationDate || 'Pending'}</td>
                                    <td>{formData?.Department.DepartmentName}</td>
                                    {/* <td>{result?.User?.Designation}</td> */}
                                    <td><button className={style.btn} onClick={() => {
                                        dispatch(updateTabData({ ...tabData, Tab: 'viewFormAnswers' }))
                                        dispatch(changeId(result._id));
                                    }}>View Form</button></td>
                                    {tabData?.Verification && (
                                        <td><button className={style.btn} onClick={() => {
                                            setIdForAction(result._id)
                                            setVerify(true)
                                        }}>Verify</button></td>
                                    )}
                                    <td >
                                        <button className={`${style.btn} my-1`} onClick={() => {
                                            setIdForAction(result._id);
                                            setCommentBox(true)
                                        }}>Add</button>
                                        <button className={`${style.btn} my-1`} onClick={() => {
                                            setPopUpData(result.Comment || 'No comment added');
                                            alertManager();
                                        }}>View</button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </table>
            </div>
            {/* <div className={style.btnparent}>
                    <button className={style.download}>Download</button>
                </div> */}
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <div className='overflow-y-handler'>

                                <p class={style.msg}>{popUpData}</p>
                            </div>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft: '120px',
                                    marginTop: '25px'
                                }} onClick={alertManager} className={style.btn2}>OK.</button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                verify ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to verify this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setVerify(false);
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/verify-response`, { resultId: idForAction, verifiedBy: user.Name }).then(() => {
                                        dispatch(setSmallLoading(false))
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Verified Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        })
                                        refreshData();
                                    }).catch(err => {
                                        console.log(err)
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })
                                }} className={style.btn1}>Submit</button>
                                <button onClick={() => {
                                    setVerify(false)
                                }} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                commentBox && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setCommentBox(false);
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/addComment`, { resultId: idForAction, comment: comment }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Commented Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    })
                                    refreshData();
                                }).catch(err => {
                                    console.log(err)
                                    dispatch(setSmallLoading(false));
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'OOps..',
                                        text: 'Something went wrong, Try Again!'
                                    })
                                })
                            }}>
                                <textarea onChange={(e) => {
                                    setComment(e.target.value);
                                }} name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />
                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Add</button>
                                    <a onClick={() => {
                                        setCommentBox(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</a>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default ResultsHistory