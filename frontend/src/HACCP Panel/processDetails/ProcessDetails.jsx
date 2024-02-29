
import style from './ProcessDetails.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import dayjs from 'dayjs';

function ProcessDetails() {
    const [processesList, setProcessesList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [idForAction, setIdForAction] = useState(null);
    const [approve, setApprove] = useState(false)
    const [reason, setReason] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);

    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-processes`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setProcessesList(response.data.data.slice(startIndex, endIndex));
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

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-processes`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setProcessesList(response.data.data.slice(startIndex, endIndex));
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


    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setProcessesList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.DocumentId.includes(event.target.value)
            )
            setProcessesList(searchedList);
        } else {
            setProcessesList(allDataArr?.slice(startIndex, endIndex))
        }
    }



    return (
        <>
            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search Process by name' />
                </div>
                {tabData?.Creation && (
                    <div className={style.sec2} onClick={() => {
                        dispatch(updateTabData({ ...tabData, Tab: 'addProcessDetails' }));
                    }}>
                        <img src={add} alt="" />
                        <p>Add Flow Diagram</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>
                {!processesList || processesList?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Document ID</td>
                            <td>Process Name</td>
                            <td>Document Type</td>
                            <td>Department</td>
                            <td className='ps-5'>Status</td>
                            <td>Revision No</td>

                            <td>Reason</td>
                            {tabData?.Edit && (
                                <td>Action</td>
                            )}
                            {tabData?.Approval && (
                                <td></td>
                            )}
                            <td>Flow Diagram</td>
                            <td>Created By</td>
                            <td>Creation Date</td>
                            <td>Approved By</td>
                            <td>Approval Date</td>
                            <td>Disapproved By</td>
                            <td>Dispproval Date</td>
                        </tr>
                        {
                            processesList?.map((process, i) => {
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
                                        }}>{process.DocumentId}</p></td>
                                        <td>{process.ProcessName}</td>
                                        <td className={style.simpleContent}>{process.DocumentType}</td>
                                        <td>{process.Department.DepartmentName}</td>
                                        <td><div className={`text-center ${process.Status === 'Approved' && style.greenStatus} ${process.Status === 'Disapproved' && style.redStatus} ${process.Status === 'Pending' && style.yellowStatus}  `}><p>{process.Status}</p></div></td>
                                        <td>{process.RevisionNo}</td>

                                        <td>
                                            <p onClick={() => {
                                                if (process.Status === 'Disapproved') {
                                                    setDataToShow(process.Reason)
                                                } else {
                                                    setDataToShow('Process is not DisApproved.')
                                                }
                                                setShowBox(true);
                                            }} className={style.redclick}>View</p>
                                        </td>
                                        {tabData?.Edit && (
                                            <td>
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'updateProcessDetails' }))
                                                    dispatch(changeId(process._id))
                                                }} className='btn btn-outline-success p-1 m-2'>Update</p>
                                            </td>
                                        )}
                                        {tabData?.Approval && (
                                            <td className='ps-0'>
                                                <p onClick={() => {
                                                    if (process.Status === 'Approved') {
                                                        setDataToShow('Process is already Approved!');
                                                        setShowBox(true)
                                                    } else {
                                                        setIdForAction(process._id);
                                                        setApprove(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                <p onClick={() => {
                                                    if (process.Status === 'Approved') {
                                                        setDataToShow('Process is already Approved!');
                                                        setShowBox(true)
                                                    } else if (process.Status === 'Disapproved') {
                                                        setDataToShow('Process is already DisApproved!');
                                                        setShowBox(true)
                                                    } else {
                                                        setIdForAction(process._id);
                                                        setReject(true);
                                                    }
                                                }} style={{
                                                    height: '28px'

                                                }} className={`btn btn-outline-danger pt-0 px-1`}>Disapprove</p>
                                            </td>
                                        )}
                                        <td>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'viewProcessDetails' }))
                                                dispatch(changeId(process._id))
                                            }} style={{
                                                height: '28px'
                                            }} className={`btn btn-outline-warning pt-0 px-1`}>Click Here</p>
                                        </td>
                                        <td>{process.CreatedBy}</td>
                                        <td>{dayjs(process.CreationDate).format("DD/MM/YYYY")}</td>
                                        {process.ApprovedBy ? (
                                            <td>{process.ApprovedBy}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {process.ApprovalDate ? (
                                            <td>{dayjs(process.ApprovalDate).format('DD/MM/YYYYY')}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {process.DisapprovedBy ? (
                                            <td>{process.DisapprovedBy}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {process.DisapprovalDate ? (
                                            <td>{dayjs(process.DisapprovalDate).format('DD/MM/YYYY')}</td>
                                        ) : (
                                            <td>- - -</td>
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

            {
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>{dataToShow}</p>

                            <div className={style.alertbtns}>

                                <button style={{
                                    marginLeft: '120px',
                                    marginTop: '25px'
                                }} onClick={() => {
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
                            <p class={style.msg}>Do you want to Approve this Product?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setApprove(false)
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approve-process`, { id: idForAction, approvedBy: user.Name }).then(() => {
                                        dispatch(setSmallLoading(false))
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Approved Successfully',
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
                                    setApprove(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                reject && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setReject(false);
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapprove-process`, { id: idForAction, Reason: reason, disapprovedBy: user.Name }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'DisApproved Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    })


                                    refreshData();
                                }).catch(err => {
                                    dispatch(setSmallLoading(false));
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

export default ProcessDetails
