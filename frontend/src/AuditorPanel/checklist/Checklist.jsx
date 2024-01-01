import style from './Checklist.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setLoading } from '../../redux/slices/loading';


function Checklist() {

    const [checkists, setChecklists] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [send, setSend] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [checklistIdForAction, setChecklistIdForAction] = useState(null);
    const [approve, setApprove] = useState(false);
    const [disapprove, setDisapprove] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [Reason, setReason] = useState(null);
    const [allDataArr, setAllDataArr] = useState(null);

    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    const statusChange = () => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getChecklists`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setChecklists(response.data.data.slice(startIndex, endIndex));
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getChecklists`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setChecklists(response.data.data.slice(startIndex, endIndex));
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

        setChecklists(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>

                obj.ChecklistId.includes(event.target.value)
            )
            console.log(searchedList);
            setChecklists(searchedList);
        } else {
            setChecklists(allDataArr?.slice(startIndex, endIndex))
        }
    }


    return (
        <>

            <div className={style.subparent}>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search document by name' />
                    </div>
                    {tabData?.Creation && (

                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'createChecklist' }))
                        }}>
                            <img src={add} alt="" />
                            <p>Create Checklist</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!checkists || checkists?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Document ID</td>
                                <td>Document Type</td>
                                <td>Department</td>
                                <td>Reason</td>
                                <td>Action</td>
                                {tabData?.Approval && (

                                    <td></td>
                                )}
                                <td></td>
                                <td>Status</td>
                                <td>Revision No.</td>
                                <td>Created By</td>
                                <td>Creation Date</td>
                                <td>Approved By</td>
                                <td>Approval Date</td>

                            </tr>
                            {
                                checkists?.map((checklist, i) => {
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
                                            }}>{checklist.ChecklistId}</p></td>
                                            <td className={style.simpleContent}>{checklist.DocumentType}</td>
                                            <td>{checklist.Department.DepartmentName}</td>
                                            <td >

                                                <p onClick={() => {
                                                    setShowBox(true);
                                                    if (checklist.Status !== 'Disapproved') {
                                                        setDataToShow('Checklist is not DisApproved')
                                                    } else {

                                                        setDataToShow(checklist.Reason)
                                                    }
                                                }} className={style.redclick}>View</p>
                                            </td>
                                            <td >
                                                {tabData?.Edit && (

                                                    <p onClick={() => {
                                                        dispatch(changeId(checklist._id))

                                                        dispatch(updateTabData({ ...tabData, Tab: 'editChecklist' }))

                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-primary pt-0`}>Edit</p>
                                                )}
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'viewChecklist' }))
                                                    dispatch(changeId(checklist._id))
                                                }} style={{
                                                    height: '28px'

                                                }} className={`btn btn-outline-danger pt-0`}>View</p>
                                            </td>
                                            {tabData?.Approval && (

                                                <td >

                                                    <p onClick={() => {
                                                        if (checklist.Status === 'Pending') {
                                                            setApprove(true);
                                                            setChecklistIdForAction(checklist._id);
                                                        } else {

                                                            setDataToShow(`Checklist is already ${checklist.Status}`);
                                                            setShowBox(true);

                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                    <p onClick={() => {
                                                        if (checklist.Status === 'Pending') {

                                                            setReject(true);
                                                            setChecklistIdForAction(checklist._id);


                                                        } else {

                                                            setDataToShow(`Sorry, Checklist is ${checklist.Status}`);
                                                            setShowBox(true);
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Disaprrove</p>
                                                </td>
                                            )}
                                            <td></td>
                                            <td><div className={`text-center ${checklist.Status === 'Approved' && style.greenStatus} ${checklist.Status === 'Disapproved' && style.redStatus} ${checklist.Status === 'Pending' && style.yellowStatus}  `}><p>{checklist.Status}</p></div></td>
                                            <td>{checklist.RevisionNo}</td>
                                            <td>{checklist.CreatedBy}</td>
                                            <td>{checklist.CreationDate?.slice(0, 10).split('-')[2]}/{checklist.CreationDate?.slice(0, 10).split('-')[1]}/{checklist.CreationDate?.slice(0, 10).split('-')[0]}</td>
                                            <td>{checklist.ApprovedBy || '--'}</td>
                                            {checklist.ApprovalDate ? (
                                                <td>{checklist.ApprovalDate?.slice(0, 10).split('-')[2]}/{checklist.ApprovalDate?.slice(0, 10).split('-')[1]}/{checklist.ApprovalDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>- -</td>
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
                                    setDataToShow(null)

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
                            <p class={style.msg}>Do you want to Approve this Checklist?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approveChecklist`, { id: checklistIdForAction }, { headers: { Authorization: `${user._id}` }}).then(() => {
                                        dispatch(setLoading(false))
                                        statusChange();
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
                                }} className={style.btn1}>Approve</button>


                                <button onClick={() => {
                                    setApprove(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                disapprove ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Disapprove this Checklist?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapproveChecklist`, { id: checklistIdForAction, Reason: Reason }, { headers: { Authorization: `${user._id}` } }).then(() => {
                                        dispatch(setLoading(false))
                                        statusChange();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        });
                                        setDisapprove(false);
                                    }).catch(err => {
                                        dispatch(setLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })
                                    setDisapprove(false)


                                }
                                } className={style.btn1}>Approve</button>


                                <button onClick={() => {
                                    setDisapprove(false);
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
                                setReject(false)
                                setDisapprove(true);
                            }}>
                                <textarea onChange={(e) => {
                                    setReason(e.target.value)
                                }} name="Reason" value={Reason} id="" cols="30" rows="10" placeholder='Comment here' required />


                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Submit</button>
                                    <button onClick={() => {
                                        setReject(false);
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

export default Checklist;
