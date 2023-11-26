import style from './FormsList.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import Cookies from 'js-cookie';
import { setLoading } from '../../redux/slices/loading';

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


    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    const refreshData = () => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-forms`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            setAllDataArr(response.data.forms)
            setFormsList(response.data.forms.slice(startIndex, endIndex));
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


    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-forms`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            console.log(response.data.forms);
            setAllDataArr(response.data.forms)
            setFormsList(response.data.forms.slice(startIndex, endIndex));
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

            <div className={style.subparent}>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search form by name' />
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
                                <td>Department</td>
                                <td>Creation Date</td>
                                <td>Created By</td>
                                <td>Status</td>
                                <td>Reviewed By</td>
                                <td>Review Date</td>
                                <td>Approved By</td>
                                <td>Approval Date</td>
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

                                            <td>{form.Department.DepartmentName}</td>
                                            <td>{form.CreationDate?.slice(0, 10).split('-')[2]}/{form.CreationDate?.slice(0, 10).split('-')[1]}/{form.CreationDate?.slice(0, 10).split('-')[0]}</td>
                                            <td>{form.CreatedBy}</td>
                                            <td><div className={`text-center ${form.Status === 'Approved' && style.greenStatus} ${form.Status === 'Disapproved' && style.redStatus} ${form.Status === 'Rejected' && style.redStatus} ${form.Status === 'Pending' && style.yellowStatus} ${form.Status === 'Reviewed' && style.blueStatus} `}><p>{form.Status}</p></div></td>
                                            <td>{form.ReviewedBy || '--'}</td>
                                            {form.ReviewDate ? (

                                                <td>{form.ReviewDate?.slice(0, 10).split('-')[2]}/{form.ReviewDate?.slice(0, 10).split('-')[1]}/{form.ReviewDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>- - -</td>
                                            )}
                                            <td>{form.ApprovedBy || '--'}</td>
                                            {form.ApprovalDate ? (

                                                <td>{form.ApprovalDate?.slice(0, 10).split('-')[2]}/{form.ApprovalDate?.slice(0, 10).split('-')[1]}/{form.ApprovalDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>---</td>
                                            )}


                                            <td >

                                                <p onClick={() => {

                                                    setSend(true);
                                                }} className={style.click}>Send</p>
                                            </td>
                                            <td >
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
                                            <td >

                                                <p onClick={() => {
                                                    setShowBox(true);
                                                    setDataToShow('Pending feature!')
                                                }} className={style.click}>Download</p>
                                            </td>
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
                                                        if (form.Status === 'Approved' || form.Status === 'Rejected') {
                                                            setDataToShow('Form is already Approved or Rejected!');
                                                            setShowBox(true)
                                                        } else {

                                                            setApprove(true);
                                                            setIdForAction(form._id)
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                    <p onClick={() => {
                                                        if (form.Status === 'Approved' || form.Status === 'Disapproved' || form.Status === 'Rejected') {
                                                            setDataToShow(`Form is already ${form.Status}!`);
                                                            setShowBox(true);
                                                        } else {

                                                            setDisApprove(true);
                                                            setIdForAction(form._id);
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Disaprrove</p>
                                                </td>
                                            )}
                                            {tabData?.Review && (

                                                <td className='ms-4' >

                                                    <p onClick={() => {
                                                        if (form.Status === 'Reviewed') {
                                                            setDataToShow('Form is already Reviewed!');
                                                            setShowBox(true);
                                                        } else {

                                                            setReview(true);
                                                            setIdForAction(form._id)
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Review</p>
                                                    <p onClick={() => {
                                                        if (form.Status === 'Rejected' || form.Status === 'Reviewed') {
                                                            setDataToShow('Document is already Rejected or Reviewed');
                                                            setShowBox(true);
                                                        } else {
                                                            setReject(true);
                                                            setIdForAction(form._id);
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
                            <p class={style.msg}>Do you want to Approve this Form?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approveForm`, { id: idForAction }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                        dispatch(setLoading(false))
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        });
                                        setApprove(false);
                                    }).catch(err => {
                                        dispatch(setLoading(false));
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
                                    dispatch(setLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/reviewForm`, { formId: idForAction }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
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
                                dispatch(setLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapproveForm`, { formId: idForAction, reason: reason }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                    dispatch(false)
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
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/rejectForm`, { formId: idForAction, reason: reason }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
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

            {
                send && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert} p-3 pt-5`}>
                            <form onSubmit={(e) => {

                            }}>
                                <div className='mx-4 my-4 d-inline'>

                                    <input type='checkbox' className='mx-3 my-2 p-2' /><span>Department 1</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input type='checkbox' className='mx-3 my-2 p-2' /><span>Department 2</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input type='checkbox' className='mx-3 my-2 p-2' /><span>Department 3</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input type='checkbox' className='mx-3 my-2 p-2' /><span>Department 4</span>
                                </div>


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
