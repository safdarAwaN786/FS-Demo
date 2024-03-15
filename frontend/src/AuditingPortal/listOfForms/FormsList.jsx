import style from './FormsList.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function FormsList() {

    const [formsList, setFormsList] = useState(null);
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
    const [formToProcess, setFormToProcess] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);

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
        console.log(formToProcess);
    }, [formToProcess])
    useEffect(() => {
        if (formsList && departmentsToShow) {
            dispatch(setSmallLoading(false))
        }

    }, [departmentsToShow, formsList])

    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-forms`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.forms)
            setFormsList(response.data.forms.slice(startIndex, endIndex));

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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-forms`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            console.log(response.data.forms);
            setAllDataArr(response.data.forms)
            setFormsList(response.data.forms.slice(startIndex, endIndex));
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
        setFormsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);
            const searchedList = allDataArr.filter((obj) =>
                obj.FormId.includes(event.target.value) || obj.FormName.includes(event.target.value)
            )
            console.log(searchedList);
            setFormsList(searchedList);
        } else {
            setFormsList(allDataArr?.slice(startIndex, endIndex))
        }
    }



    return (
        <>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input autoComplete='off' onChange={search} type="text" placeholder='Search form by name' />
                    </div>
                    {tabData?.Creation && (

                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'createForm' }))
                        }}>
                            <img src={add} alt="" />
                            <p>Create Form</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!formsList || formsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Form ID</td>
                                <td>Form Title</td>
                                <td>Revision No.</td>
                                {/* <td>Document Type</td> */}
                                <td>Status</td>
                                <td>Maintenance Frequency</td>
                                <td>Department</td>
                                <td>Results History</td>
                                <td>Action</td>
                                <td>Action</td>
                                {/* <td>Document</td> */}
                                <td>Reason</td>
                                {tabData?.Approval && (
                                    <td></td>
                                )}
                                {tabData?.Review && (
                                    <td></td>
                                )}
                                <td>Creation Date</td>
                                <td className='ms-4'>Created By</td>
                                <td>Approved By</td>
                                <td>Approval Date</td>
                                <td>Disapproved By</td>
                                <td>Disapproval Date</td>
                                <td>Reviewed By</td>
                                <td>Review Date</td>
                                <td>Rejected By</td>
                                <td>Rejection Date</td>
                            </tr>
                            {
                                formsList?.map((form, i) => {
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
                                            }}>{form.FormId}</p></td>
                                            <td className={style.simpleContent}>{form.FormName}</td>
                                            <td>{form.RevisionNo}</td>
                                            <td><div className={`text-center ${form.Status === 'Approved' && style.greenStatus} ${form.Status === 'Disapproved' && style.redStatus} ${form.Status === 'Rejected' && style.redStatus} ${form.Status === 'Pending' && style.yellowStatus} ${form.Status === 'Reviewed' && style.blueStatus} `}><p>{form.Status}</p></div></td>
                                            <td className={style.simpleContent}>{form.MaintenanceFrequency}</td>
                                            <td>{form.Department.DepartmentName}</td>
                                            <td>
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'viewResultsHistory' }))
                                                    dispatch(changeId(form._id))
                                                }} className={style.click}>View</p>
                                            </td>
                                            <td>
                                                <p onClick={() => {
                                                    setFormToProcess(form);
                                                    setSend(true);
                                                }} className={style.click}>Send</p>
                                            </td>
                                            <td>
                                                {tabData?.Edit && (
                                                    <p onClick={() => {
                                                        dispatch(updateTabData({ ...tabData, Tab: 'editForm' }))
                                                        dispatch(changeId(form._id))
                                                    }} style={{
                                                        height: '28px'
                                                    }} className={`btn btn-outline-primary pt-0`}>Edit</p>
                                                )}
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'viewForm' }));
                                                    dispatch(changeId(form._id))
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-danger pt-0`}>View</p>
                                            </td>
                                            {/* <td >

                                                <p onClick={() => {
                                                    setShowBox(true);
                                                    setDataToShow('Pending feature!')
                                                }} className={style.click}>Download</p>
                                            </td> */}
                                            <td >

                                                <p onClick={() => {
                                                    if (form.Status === 'Disapproved' || form.Status === 'Rejected') {
                                                        setDataToShow(form.Reason)
                                                    } else {
                                                        setDataToShow('Form is nor DisApproved neither Rejected.')
                                                    }
                                                    setShowBox(true);
                                                }} className={style.redclick}>View</p>
                                            </td>
                                            {tabData?.Approval && (
                                                <td>
                                                    <p onClick={() => {
                                                        if (form.Status === 'Reviewed') {
                                                            setApprove(true);
                                                            setIdForAction(form._id)
                                                        } else {
                                                            setDataToShow('Form is not Reviewed!');
                                                            setShowBox(true)
                                                        }
                                                    }} style={{
                                                        height: '28px'
                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                    <p onClick={() => {
                                                        if (form.Status === 'Reviewed') {
                                                            setDisApprove(true);
                                                            setIdForAction(form._id);
                                                        } else {
                                                            setDataToShow(`Form is not Reviewed!`);
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
                                                        if (form.Status === 'Pending') {
                                                            setReview(true);
                                                            setIdForAction(form._id)
                                                        } else {
                                                            setDataToShow('Form is not Pending!');
                                                            setShowBox(true);
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Review</p>
                                                    <p onClick={() => {
                                                        if (form.Status === 'Pending' || form.Status === 'Reviewed') {
                                                            setReject(true);
                                                            setIdForAction(form._id);
                                                        } else {
                                                            setDataToShow('Form is niether Pending not Reviewed!');
                                                            setShowBox(true);
                                                        }
                                                    }} style={{
                                                        height: '28px'
                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Reject</p>
                                                </td>
                                            )}
                                            <td className='ps-0'>{form.CreationDate?.slice(0, 10).split('-')[2]}/{form.CreationDate?.slice(0, 10).split('-')[1]}/{form.CreationDate?.slice(0, 10).split('-')[0]}</td>
                                            <td>{form.CreatedBy}</td>
                                            <td>{form.ApprovedBy || '--'}</td>
                                            {form.ApprovalDate ? (
                                                <td>{form.ApprovalDate?.slice(0, 10).split('-')[2]}/{form.ApprovalDate?.slice(0, 10).split('-')[1]}/{form.ApprovalDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>---</td>
                                            )}
                                            <td>{form.DisapprovedBy || '--'}</td>
                                            {form.DisapprovalDate ? (

                                                <td>{form.DisapprovalDate?.slice(0, 10).split('-')[2]}/{form.DisapprovalDate?.slice(0, 10).split('-')[1]}/{form.DisapprovalDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>---</td>
                                            )}
                                            <td>{form.ReviewedBy || '--'}</td>
                                            {form.ReviewDate ? (

                                                <td>{form.ReviewDate?.slice(0, 10).split('-')[2]}/{form.ReviewDate?.slice(0, 10).split('-')[1]}/{form.ReviewDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>- - -</td>
                                            )}
                                            <td>{form.RejectedBy || '--'}</td>
                                            {form.RejectionDate ? (

                                                <td>{form.RejectionDate?.slice(0, 10).split('-')[2]}/{form.RejectionDate?.slice(0, 10).split('-')[1]}/{form.RejectionDate?.slice(0, 10).split('-')[0]}</td>
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
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={() => {
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
                            <p class={style.msg}>Do you want to Approve this Form?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approveForm`, { id: idForAction, approvedBy : user.Name }).then(() => {
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


                                }
                                } className={style.btn1}>Approve</button>


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
                            <p class={style.msg}>Do you want to Review this Form?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setReview(false);
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/reviewForm`, { formId: idForAction, reviewedBy : user.Name }).then(() => {
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


                                }
                                } className={style.btn1}>Review</button>


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
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapproveForm`, { formId: idForAction, reason: reason, disapprovedBy : user.Name }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'DisApproved Successfully',
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
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/rejectForm`, { formId: idForAction, reason: reason, rejectedBy : user.Name }).then(() => {
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
                                if (formToProcess?.SendToDepartments.length > 0) {
                                    dispatch(setSmallLoading(true))
                                    axios.put(`${process.env.REACT_APP_BACKEND_URL}/send-form`, formToProcess).then(() => {
                                        dispatch(setSmallLoading(false))
                                        setFormToProcess(null);
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
                                                const updatedForm = { ...formToProcess }
                                                if (!updatedForm.SendToDepartments) {
                                                    updatedForm.SendToDepartments = []
                                                }
                                                if (e.target.checked) {
                                                    updatedForm.SendToDepartments.push(depObj._id)
                                                } else {
                                                    updatedForm.SendToDepartments = updatedForm.SendToDepartments.filter(depId => depId !== depObj._id)
                                                }
                                                setFormToProcess(updatedForm)
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

export default FormsList
