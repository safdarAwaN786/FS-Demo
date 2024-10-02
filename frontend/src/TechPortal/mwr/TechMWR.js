import style from './Table.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import dayjs from 'dayjs'

function TechMWR() {
    const [alert, setalert] = useState(false);
    const [alert2, setalert2] = useState(false);
    const [alert3, setalert3] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [acceptObj, setAcceptObj] = useState(null);
    const [openedRequestId, setOpenedRequestId] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const [requests, setRequests] = useState(null);
    const [selectedPriority, setSelectedPriority] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setSmallLoading(true))
        if (tabData?.Approval) {
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/getTotalWorkRequests`, { headers: { Authorization: `${user.Company._id}` } }).then((res) => {
                setAllDataArr(res.data.data);
                setRequests(res.data.data.slice(startIndex, endIndex));
                dispatch(setSmallLoading(false))
            }).catch(err => {
                dispatch(setSmallLoading(false));
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'Something went wrong, Try Again!'
                })
            })
        } else {
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/getAllWorkRequests`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
                setAllDataArr(res.data.data);
                setRequests(res.data.data.slice(startIndex, endIndex));
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

    }, [])

    const reGetData = () => {
        dispatch(setSmallLoading(true))
        if (tabData?.Approval) {
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/getTotalWorkRequests`, { headers: { Authorization: `${user.Company._id}` } }).then((res) => {
                setAllDataArr(res.data.data);
                setRequests(res.data.data.slice(startIndex, endIndex));
                dispatch(setSmallLoading(false))
            }).catch(err => {
                dispatch(setSmallLoading(false));
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'Something went wrong, Try Again!'
                })
            })
        } else {
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/getAllWorkRequests`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
                setAllDataArr(res.data.data);
                setRequests(res.data.data.slice(startIndex, endIndex));
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
    }

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }
    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }
    useEffect(() => {
        setRequests(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const searchFunction = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.MWRId.includes(event.target.value)
            )
            console.log(searchedList);
            setRequests(searchedList);
        } else {
            setRequests(allDataArr?.slice(startIndex, endIndex))
        }
    }

    const [alert4, setAlert4] = useState(false);
    const [rejectObj, setRejectObj] = useState({});
    const formattedTime = (dateString) => {
        if (dateString) {
            // Convert the date string to a Date object
            const dateObj = new Date(dateString);
            // Get the hours from the Date object
            const hours = dateObj.getHours();
            // Convert hours to AM/PM format
            const amPmHours = hours % 12 === 0 ? 12 : hours % 12;
            const amPm = hours < 12 ? 'AM' : 'PM';
            // Construct the final string
            const formattedTime = `${amPmHours}:${dateObj.getMinutes().toString().padStart(2, '0')} ${amPm}`;
            return formattedTime;
        } else {
            return ("---")
        }
    }

    return (
        <>
            <div className={`${style.searchbar}`}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={searchFunction} type="text" placeholder='Search MWR by id' />
                </div>
                {tabData?.Creation && (
                    <div onClick={() => {
                        dispatch(updateTabData({ ...tabData, Tab: 'generateMWR' }))
                    }} className={style.sec2}>
                        <img src={add} alt="" />
                        <p>Generate MWR</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>
                {!requests || requests?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <tr className={style.headers}>
                            {/* <td>MWR Id</td> */}
                            <td>Date</td>
                            <td>Time</td>
                            <td>Area</td>
                            <td>Status</td>
                            <td>Department</td>
                            <td>Machine Name</td>
                            <td>Change Priority</td>
                            <td>Description</td>
                            <td>Instruction</td>
                            {tabData?.Approval && (
                                <>
                                    <td>Action</td>
                                    <td></td>
                                    <td></td>
                                </>
                            )}
                            <td>Start Time</td>
                            <td>End Time</td>
                            <td>Reason</td>
                            <td>Detail</td>
                            <td>MWR Detail</td>
                        </tr>
                        {
                            requests?.map((request, i) => {
                                return (
                                    <tr className={style.body} key={i}>
                                        {/* <td>
                                            <p>
                                                {request.MWRId}
                                            </p>
                                        </td> */}
                                        <td className={style.text1}>{request.Date.slice(0, 10).split('-')[2]}/{request.Date.slice(0, 10).split('-')[1]}/{request.Date.slice(0, 10).split('-')[0]}</td>
                                        <td className={style.text2}>
                                            {dayjs(request.Time).format('hh:mm:A')}
                                        </td>
                                        <td className={style.text2}>{request.Area}</td>
                                        <td ><div className={`w-100 text-center ${(request.Status === 'Approved') && (style.blueStatus)} ${(request.Status === 'Pending') && (style.yellowStatus)} ${(request.Status === 'Completed') && (style.greenStatus)} ${request.Status === 'Rejected' && (style.redStatus)}`}><p>{request.Status}</p></div></td>
                                        <td className={style.text2}>{request.Department.DepartmentName}</td>
                                        <td className={style.text2}>
                                            {request.Machinery.machineName}
                                        </td>
                                        <td className={style.text3}>
                                            {(request.Status === 'Pending') ? (
                                                <select onChange={(e) => {
                                                    setSelectedPriority(e.target.value);
                                                    const updatedRequests = [...requests]
                                                    updatedRequests[i].Priority = e.target.value
                                                    setRequests(updatedRequests)
                                                }} name="" id="">
                                                    <option style={{ display: 'none' }} value={request.Priority} selected disabled>{request.Priority}</option>
                                                    <option value="A">A-Emergency Job</option>
                                                    <option value="B">B-Urgent Job</option>
                                                    <option value="C">within 8 days</option>
                                                    <option value="D">within 7 days
                                                        or more</option>
                                                </select>
                                            ) : (
                                                <p>
                                                    {request.Priority}
                                                </p>
                                            )}
                                        </td>
                                        <td><button onClick={() => {
                                            setPopUpData(request.Description)
                                            setalert(!alert)
                                        }} className={style.viewBtn}>View</button></td>
                                        <td><button onClick={() => {
                                            setPopUpData(request.SpecialInstruction)
                                            setalert(!alert)
                                        }} className={style.viewBtn}>View</button></td>
                                        {tabData?.Approval && (
                                            <>
                                                <td>
                                                    <button className={`${style.accept} ${request.Status === 'Approved' && 'bg-primary text-light'}`} onClick={() => {
                                                        if (request.Status === 'Pending' || request.Status === 'Rejected') {
                                                            setOpenedRequestId(request._id)
                                                            setAcceptObj(request)
                                                            setalert3(!alert3)
                                                        } else {
                                                            setPopUpData('Sorry! This Job is Already Accepted or Completed');
                                                            setalert(true)
                                                        }
                                                    }} >Accept</button>
                                                </td>
                                                <td>
                                                    <button onClick={() => {
                                                        if (request.Status === 'Approved' || request.Status === 'Completed' || request.Status === 'Rejected') {
                                                            setPopUpData('Sorry! Job is not Pending for Rejection')
                                                            setalert(true)
                                                        } else {

                                                            setRejectObj(request)

                                                            setOpenedRequestId(request._id);
                                                            setalert2(!alert2)
                                                        }
                                                    }} className={`${style.reject} ${request.Status === 'Rejected' && 'bg-danger text-light'}`}>Reject</button>
                                                </td>
                                                <td>

                                                    <button onClick={() => {
                                                        if (request.Status !== 'Approved') {
                                                            setPopUpData("Kindly Accept job before completing!");
                                                            setalert(true)
                                                        } else {
                                                            setOpenedRequestId(request._id)
                                                            setPopUpData('Do you Really want to complete this request ?');
                                                            setAlert4(true);
                                                        }
                                                    }} className={`${style.complete} ${request.Status === 'Completed' && 'bg-success text-light'}`}>Complete</button>
                                                </td>
                                            </>
                                        )}
                                        <td className={style.text2}>{formattedTime(request.StartTime)}</td>
                                        <td className={style.text2}>{formattedTime(request.EndTime)}</td>
                                        <td><button onClick={() => {
                                            if (request.Status === 'Rejected') {
                                                setPopUpData(request.Reason)
                                                setalert(!alert)
                                            } else {
                                                setPopUpData(` Job is ${request.Status}`);
                                                setalert(true)
                                            }
                                        }} className={style.viewBtn}>View</button></td>
                                        <td><button className={style.viewBtn} onClick={() => {
                                            dispatch(changeId(request.Machinery._id))
                                            dispatch(updateTabData({ ...tabData, Tab: 'viewCorrectiveMaintenanceForMWR' }))
                                        }}>View</button></td>
                                        <td><button onClick={() => {
                                            dispatch(changeId(request._id))
                                            dispatch(updateTabData({ ...tabData, Tab: 'MWRDetails' }))
                                        }} className={style.viewBtn}>View</button></td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                )}
            </div>
            <div className={style.next}>
                {startIndex > 0 && (
                    <button className='mx-2' onClick={backPage}>
                        {'<< '}Back
                    </button>
                )}
                {allDataArr?.length > endIndex && (
                    <button className='mx-2' onClick={nextPage}>
                        next{'>> '}
                    </button>
                )}
            </div>
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft: '120px',
                                    marginTop: '25px'
                                }} onClick={alertManager} className={style.btn2}>Close</button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                alert2 ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/rejectMWR/${openedRequestId}`, { ...rejectObj, rejectedBy: user.Name }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Submitted Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            reGetData();
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
                                setalert2(false);
                            }}>
                                <textarea onChange={(e) => {
                                    setRejectObj({ ...rejectObj, [e.target.name]: e.target.value });
                                }} name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />
                                <div className={style.alertbtns}>
                                    <button type='submit' className={style.btn1}>Submit</button>
                                    <button onClick={() => {
                                        setalert2(!alert2)
                                    }} className={style.btn2}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div> : null
            }
            {
                alert4 ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p className='text-center m-3 fs-5'>{popUpData}</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/completeMWR/${openedRequestId}`, { completedBy: user.Name }).then(() => {
                                        dispatch(setSmallLoading(false))
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                reGetData();
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
                                    setAlert4(false)
                                }} className={style.btn1}>Submit</button>
                                <button onClick={() => {
                                    setAlert4(false)
                                }} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                alert3 ?
                    <div class={style.alertparent2}>
                        <div class={style.alert2}>
                            <form encType='multipart/form-data' onSubmit={(e) => {
                                e.preventDefault();
                                setalert3(false);
                                console.log(acceptObj)
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/acceptMWR/${openedRequestId}`, { ...acceptObj, acceptedBy: user.Name }).then((res) => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Submitted Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            reGetData();
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
                            }}>

                                <div>
                                    <p>Job Assign</p>
                                    <input autoComplete='off' name='JobAssigned' onChange={(e) => {
                                        setAcceptObj({ ...acceptObj, [e.target.name]: e.target.value })
                                    }} type="text" required />
                                </div>
                                <div>
                                    <p>Designation</p>
                                    <input autoComplete='off' onChange={(e) => {
                                        setAcceptObj({ ...acceptObj, [e.target.name]: e.target.value })
                                    }} name='Designation' type="text" required />
                                </div>
                                <div>
                                    <p>Detail</p>
                                    <input autoComplete='off' onChange={(e) => {
                                        setAcceptObj({ ...acceptObj, [e.target.name]: e.target.value })
                                    }} name='DetailOfWork' type="text" required />
                                </div>
                                <div>
                                    <button type='submit' className={style.btn4}>
                                        Submit
                                    </button>
                                    <button onClick={() => {
                                        setalert3(false);
                                    }} className="btn btn-outline-danger mx-2 px-3 py-2">
                                        Cancel
                                    </button>
                                </div>
                            </form>

                        </div>
                    </div> : null
            }

        </>
    )
}

export default TechMWR
