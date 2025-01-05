
import style from './DocumentsList.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function DocumentsList() {

    const [documentsList, setDocumentsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [send, setSend] = useState(false);
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
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const [documentToProcess, setDocumentToProcess] = useState(null);
    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-documents`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setDocumentsList(response.data.data.slice(startIndex, endIndex));
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-documents`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setDocumentsList(response.data.data.slice(startIndex, endIndex));
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
        setDocumentsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.DocumentId.includes(event.target.value) || obj.DocumentTitle.includes(event.target.value)
            )
            console.log(searchedList);
            setDocumentsList(searchedList);
        } else {
            setDocumentsList(allDataArr?.slice(startIndex, endIndex))
        }
    }

    return (
        <>
            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search Document by name' />
                </div>
                {tabData?.Creation && (

                    <div className={style.sec2} onClick={() => {
                        dispatch(updateTabData({ ...tabData, Tab: 'createDocument' }))
                    }}>
                        <img src={add} alt="" />
                        <p>Create document</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>
                {!documentsList || documentsList?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Document ID</td>
                            <td>Document Title</td>
                            <td>Revision No.</td>
                            <td>Status</td>
                            <td>Document Type</td>
                            <td>Department</td>


                            <td>Action</td>
                            <td>Action</td>
                            <td>Document</td>
                            <td>Reason</td>
                            {tabData?.Approval && (
                                <td></td>
                            )}
                            {tabData?.Review && (
                                <td></td>
                            )}
                            <td className='ms-4'>Created By</td>
                            <td>Creation Date</td>
                            <td>Reviewed By</td>
                            <td>Review Date</td>
                            <td>Rejected By</td>
                            <td>Rejection Date</td>
                            <td>Approved By</td>
                            <td>Approval Date</td>
                            <td>Disapproved By</td>
                            <td>Disapproval Date</td>
                        </tr>
                        {
                            documentsList?.map((document, i) => {
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
                                        }}>{document.DocumentId}</p></td>
                                        <td className={style.simpleContent}>{document.DocumentTitle}</td>
                                        <td>{document.RevisionNo}</td>
                                        <td><div className={`text-center ${document.Status === 'Approved' && style.greenStatus} ${document.Status === 'Disapproved' && style.redStatus} ${document.Status === 'Rejected' && style.redStatus} ${document.Status === 'Pending' && style.yellowStatus} ${document.Status === 'Reviewed' && style.blueStatus} `}><p>{document.Status}</p></div></td>
                                        <td>{document.DocumentType}</td>
                                        <td>{document.Department.DepartmentName}</td>
                                        <td>
                                            <p onClick={() => {
                                                setSend(true);
                                                setDocumentToProcess(document)
                                            }} className={style.click}>Send</p>
                                        </td>
                                        <td>
                                            {tabData?.Edit && (
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'editDocument' }))
                                                    dispatch(changeId(document._id))
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-primary pt-0`}>Edit</p>
                                            )}
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'viewDocument' }));
                                                dispatch(changeId(document._id))
                                            }} style={{
                                                height: '28px'
                                            }} className={`btn btn-outline-danger pt-0`}>View</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                setDataToShow('Pending feature')
                                                setShowBox(true);
                                            }} className={style.click}>Download</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                if (document.Status === 'Disapproved' || document.Status === 'Rejected') {
                                                    setDataToShow(document.Reason)
                                                } else {
                                                    setDataToShow('Process is nor DisApproved neither Rejected.')
                                                }
                                                setShowBox(true);
                                            }} className={style.redclick}>View</p>
                                        </td>
                                        {tabData?.Approval && (
                                            <td>
                                                <p onClick={() => {
                                                    if (document.Status === 'Reviewed') {
                                                        setApprove(true);
                                                        setIdForAction(document._id)
                                                    } else {
                                                        setDataToShow('Document is not Reviewed!');
                                                        setShowBox(true)
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                <p onClick={() => {
                                                    if (document.Status === 'Reviewed') {
                                                        setDisApprove(true);
                                                        setIdForAction(document._id);
                                                    } else {
                                                        setDataToShow(`Document is not Reviewed!`);
                                                        setShowBox(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-danger pt-0 px-1`}>Disaprrove</p>
                                            </td>
                                        )}
                                        {tabData?.Review && (
                                            <td className='ms-4' >
                                                <p onClick={() => {
                                                    if (document.Status === 'Pending') {
                                                        setReview(true);
                                                        setIdForAction(document._id)
                                                    } else {
                                                        setDataToShow('Document is not Pending!');
                                                        setShowBox(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-danger pt-0 px-1`}>Review</p>
                                                <p onClick={() => {
                                                    if (document.Status === 'Pending' || document.Status === 'Reviewed') {
                                                        setReject(true);
                                                        setIdForAction(document._id)
                                                    } else {
                                                        setDataToShow('Document is niether Pending nor Reviewed');
                                                        setShowBox(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-primary pt-0 px-1`}>Reject</p>
                                            </td>
                                        )}
                                        <td>{document.CreatedBy}</td>
                                        <td>{document.CreationDate?.slice(0, 10).split('-')[2]}/{document.CreationDate?.slice(0, 10).split('-')[1]}/{document.CreationDate?.slice(0, 10).split('-')[0]}</td>
                                        <td>{document.ReviewedBy || '--'}</td>
                                        {document.ReviewDate ? (
                                            <td>{document.ReviewDate?.slice(0, 10).split('-')[2]}/{document.ReviewDate?.slice(0, 10).split('-')[1]}/{document.ReviewDate?.slice(0, 10).split('-')[0]}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        <td>{document.RejectedBy || '--'}</td>
                                        {document.RejectionDate ? (
                                            <td>{document.RejectionDate?.slice(0, 10).split('-')[2]}/{document.RejectionDate?.slice(0, 10).split('-')[1]}/{document.RejectionDate?.slice(0, 10).split('-')[0]}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        <td>{document.ApprovedBy || '--'}</td>
                                        {document.ApprovalDate ? (
                                            <td>{document.ApprovalDate?.slice(0, 10).split('-')[2]}/{document.ApprovalDate?.slice(0, 10).split('-')[1]}/{document.ApprovalDate?.slice(0, 10).split('-')[0]}</td>
                                        ) : (
                                            <td>---</td>
                                        )}
                                        <td>{document.DisapprovedBy || '--'}</td>
                                        {document.DisapprovalDate ? (
                                            <td>{document.DisapprovalDate?.slice(0, 10).split('-')[2]}/{document.DisapprovalDate?.slice(0, 10).split('-')[1]}/{document.DisapprovalDate?.slice(0, 10).split('-')[0]}</td>
                                        ) : (
                                            <td>---</td>
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
                            <p class={style.msg}>Do you want to Approve this Document?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approve-document`, { documentId: idForAction, approvedBy: user.Name }).then(() => {
                                        dispatch(setSmallLoading(false))
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        });
                                        setApprove(false);
                                    }).catch(err => {
                                        dispatch(setSmallLoading(false));
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
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/review-document`, { documentId: idForAction, reviewedBy: user.Name }).then(() => {
                                        dispatch(setSmallLoading(false))
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        });
                                    }).catch(err => {
                                        dispatch(setSmallLoading(false));
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
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapprove-document`, { documentId: idForAction, reason: reason, disapprovedBy: user.Name }).then(() => {
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
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/reject-document`, { documentId: idForAction, reason: reason, rejectedBy: user.Name }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Rejected Successfully',
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
            {
                send && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert} p-3 pt-5`}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (documentToProcess?.SendToDepartments.length > 0) {
                                    dispatch(setSmallLoading(true))
                                    axios.put(`${process.env.REACT_APP_BACKEND_URL}/send-form`, documentToProcess).then(() => {
                                        dispatch(setSmallLoading(false))
                                        setDocumentToProcess(null);
                                        setSend(false)
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Sended Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        })
                                    }).catch(err => {
                                        dispatch(setSmallLoading(false));
                                        setSend(false)
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })
                                } else {
                                    setSend(false)
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Oops...',
                                        text: 'Kindly, Mark at least one department!',
                                        confirmButtonText: 'OK.'
                                    })
                                }
                            }}>
                                {departmentsToShow.map((depObj) => {
                                    return (
                                        <div className='mx-4 my-4 d-inline'>
                                            <input autoComplete='off' type='checkbox' onChange={(e) => {
                                                const updatedDocument = { ...documentToProcess }
                                                if (!updatedDocument.SendToDepartments) {
                                                    updatedDocument.SendToDepartments = []
                                                }
                                                if (e.target.checked) {
                                                    updatedDocument.SendToDepartments.push(depObj._id)
                                                } else {
                                                    updatedDocument.SendToDepartments = updatedDocument.SendToDepartments.filter(depId => depId !== depObj._id)
                                                }
                                                setDocumentToProcess(updatedDocument)
                                            }} className='mx-3 mt-2 p-2' /><span>{depObj.DepartmentName}</span>
                                        </div>
                                    )
                                })}

                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Send</button>
                                    <button onClick={() => {
                                        setSend(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


        </>
    )
}

export default DocumentsList
