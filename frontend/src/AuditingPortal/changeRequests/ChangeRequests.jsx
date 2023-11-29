import style from './ChangeRequests.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import Swal from 'sweetalert2'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '../../redux/slices/loading'
import {backend_url} from '../../LoginPage'
function ChangeRequests() {

    const [requestsList, setRequestsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [approve, setApprove] = useState(false);
    const [idForAction, setIdForAction] = useState(null);
    const [reason, setReason] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [disApprove, setDisApprove] = useState(false);
    const [review, setReview] = useState(false);
    const [allDataArr, setAllDataArr] = useState(null);


    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readChangeRequest`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setRequestsList(response.data.data.slice(startIndex, endIndex));
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

    const refreshData = () => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readChangeRequest`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setRequestsList(response.data.data.slice(startIndex, endIndex));
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
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

        setRequestsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>

                obj.ChangeRequestId.includes(event.target.value)
            )
            console.log(searchedList);
            setRequestsList(searchedList);
        } else {
            setRequestsList(allDataArr?.slice(startIndex, endIndex))
        }
    }



    return (
        <>

            <div className={style.subparent}>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search request by name' />
                    </div>
                    {tabData?.Creation && (

                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'addRequest' }))
                        }}>
                            <img src={add} alt="" />
                            <p>Add  Request</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!requestsList || requestsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Change Request ID</td>
                                <td>Document Title</td>
                                <td>Department</td>

                                <td>Creation Date</td>

                                <td>Created By</td>
                                <td>Status</td>

                                <td>Action</td>

                                <td>Reason</td>
                                {tabData?.Approval && (

                                    <td></td>
                                )}
                                {tabData?.Review && (

                                    <td></td>
                                )}
                            </tr>
                            {
                                requestsList?.map((request, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td ><p style={{
                                                backgroundColor: "#f0f5f0",
                                                padding: "2px 5px",
                                                borderRadius: "10px",
                                                fontFamily: "Inter",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                lineHeight: "20px",
                                            }}>{request.ChangeRequestId}</p></td>
                                            <td className={style.simpleContent}>{request.Document.DocumentTitle}</td>


                                            <td>{request.Department.DepartmentName}</td>
                                            <td>{request.CreationDate?.slice(0, 10).split('-')[2]}/{request.CreationDate?.slice(0, 10).split('-')[1]}/{request.CreationDate?.slice(0, 10).split('-')[0]}</td>
                                            <td>{request.CreatedBy || '---'}</td>
                                            <td><div className={`text-center ${request.Status === 'Approved' && style.greenStatus} ${request.Status === 'Disapproved' && style.redStatus} ${request.Status === 'Rejected' && style.redStatus} ${request.Status === 'Pending' && style.yellowStatus} ${request.Status === 'Reviewed' && style.blueStatus} `}><p>{request.Status}</p></div></td>
                                            <td >

                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'viewChangeRequest' }))
                                                    dispatch(changeId(request._id))

                                                }} className={style.click}>View</p>
                                            </td>
                                            <td >

                                                <p onClick={() => {
                                                    if (request.Status === 'Disapproved' || request.Status === 'Rejected') {
                                                        setDataToShow(request.Reason)
                                                    } else {
                                                        setDataToShow('Process is nor DisApproved neither Rejected.')
                                                    }
                                                    setShowBox(true);

                                                }} className={style.redclick}>View</p>
                                            </td>




                                            {tabData?.Approval && (


                                                <td >

                                                    <p onClick={() => {
                                                        if (request.Status === 'Approved' || request.Status === 'Rejected') {
                                                            setDataToShow('Document is already Approved or Rejected!');
                                                            setShowBox(true)
                                                        } else {

                                                            setApprove(true);
                                                            setIdForAction(request._id)
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                    <p onClick={() => {
                                                        if (request.Status === 'Approved' || request.Status === 'Disapproved' || request.Status === 'Rejected') {
                                                            setDataToShow(`Document is already ${request.Status}!`);
                                                            setShowBox(true);
                                                        } else {

                                                            setDisApprove(true);
                                                            setIdForAction(request._id);
                                                        }

                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Disaprrove</p>
                                                </td>
                                            )}
                                            {tabData?.Review && (

                                                <td className='ms-4' >

                                                    <p onClick={() => {
                                                        if (request.Status === 'Reviewed') {
                                                            setDataToShow('Document is already Reviewed!');
                                                            setShowBox(true);
                                                        } else {

                                                            setReview(true);
                                                            setIdForAction(request._id)
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Review</p>
                                                    <p onClick={() => {
                                                        if (document.Status === 'Rejected' || document.Status === 'Reviewed') {
                                                            setDataToShow('Document is already Rejected or Reviewed');
                                                            setShowBox(true);
                                                        } else {
                                                            setReject(true);
                                                            setIdForAction(request._id)
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Reject</p>
                                                </td>

                                            )}


                                        </tr>

                                    )

                                })
                            }
                        </table>
                    )}
                </div>
                <div className={style.Btns}>
                    {startIndex > 0 && (

                        <button onClick={backPage}>
                            {'<< '}Back
                        </button>
                    )}
                    {allDataArr?.length > endIndex && (

                        <button onClick={nextPage}>
                            next{'>> '}
                        </button>
                    )}
                </div>
            </div>

            {
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>{dataToShow}</p>

                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    setShowBox(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }

            {
                approve ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Approve this Document?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approve-ChangeRequest`, { documentId: idForAction }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                        dispatch(setLoading(false))
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        });
                                    }).catch(err => {
                                        dispatch(setLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })
                                    setApprove(false)
                                }} className={style.btn1}>Approve</button>


                                <button onClick={() => {
                                    setApprove(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                review ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Review this Document?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setReview(false);
                                    dispatch(setLoading(false))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/review-ChangeRequest`, { documentId: idForAction }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                        dispatch(setLoading(false))
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        });
                                    }).catch(err => {
                                        dispatch(setLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })
                                    setReview(false)
                                }} className={style.btn1}>Review</button>

                                <button onClick={() => {
                                    setReview(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }

            {
                disApprove && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setDisApprove(false);
                                dispatch(setLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapprove-ChangeRequest`, { documentId: idForAction, reason: reason }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                    dispatch(setLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'DisApproved Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    })
                                    refreshData();
                                }).catch(err => {
                                    dispatch(setLoading(false));
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'OOps..',
                                        text: 'Something went wrong, Try Again!'
                                    })
                                })
                            }}>
                                <textarea onChange={(e) => {
                                    setReason(e.target.value);
                                }} name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />


                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Disapprove</button>
                                    <a onClick={() => {
                                        setDisApprove(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</a>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {
                reject && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setReject(false);
                                dispatch(setLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/reject-ChangeRequest`, { documentId: idForAction, reason: reason }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                    dispatch(setLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Rejected Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    })
                                    refreshData();
                                }).catch(err => {
                                    dispatch(setLoading(false));
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'OOps..',
                                        text: 'Something went wrong, Try Again!'
                                    })
                                })
                            }}>
                                <textarea onChange={(e) => {
                                    setReason(e.target.value);
                                }} name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />


                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Reject</button>
                                    <a onClick={() => {
                                        setReject(false);
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

export default ChangeRequests;
