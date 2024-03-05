
import style from './FoodSafetyPlan.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import dayjs from 'dayjs';

function FoodSafetyPlan() {
    const [safetyPlansList, setSafetyPlansList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [send, setSend] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [approve, setApprove] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [hazardName, setHazardName] = useState(null);
    const [allDataArr, setAllDataArr] = useState(null);
    const [planData, setPlanData] = useState(null);
    const [idForAction, setIdForAction] = useState(null);
    const [reason, setReason] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();


    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-food-safety`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setSafetyPlansList(response.data.data.slice(startIndex, endIndex));
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-food-safety`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data);
            setSafetyPlansList(response.data.data.slice(startIndex, endIndex));
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
    const [showPlan, setShowPlan] = useState(false)

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setSafetyPlansList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.DocumentId.includes(event.target.value)
            )
            setSafetyPlansList(searchedList);
        } else {
            setSafetyPlansList(allDataArr?.slice(startIndex, endIndex))
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
                        dispatch(updateTabData({ ...tabData, Tab: 'addFoodSafetyPlan' }))
                    }}>
                        <img src={add} alt="" />
                        <p>Add Plan</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>
                {!safetyPlansList || safetyPlansList?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (

                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Document ID</td>
                            <td>Document Type</td>
                            <td>Department</td>
                            <td>Revision No.</td>
                            <td className='ps-5'>Status</td>
                            <td>Process Name</td>
                            {tabData?.Edit && (
                                <td>Action</td>
                            )}
                            <td>Plan Details</td>
                            <td>Reason</td>
                            {tabData?.Approval && (
                                <td></td>
                            )}
                            <td></td>
                            <td>Teams</td>
                            <td>Created By</td>
                            <td>Creation Date</td>
                            <td>Approved By</td>
                            <td>Approval Date</td>
                            <td>Disapproved By</td>
                            <td>Disapproval Date</td>
                        </tr>
                        {
                            safetyPlansList?.map((plan, i) => {
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
                                        }}>{plan.DocumentId}</p></td>
                                        <td className={style.simpleContent}>{plan.DocumentType}</td>
                                        <td>{plan.Department.DepartmentName}</td>
                                        <td>{plan.RevisionNo}</td>
                                        <td><div className={`text-center ${plan.Status === 'Approved' && style.greenStatus} ${plan.Status === 'Disapproved' && style.redStatus} ${plan.Status === 'Pending' && style.yellowStatus}  `}><p>{plan.Status}</p></div></td>
                                        <td>{plan?.DecisionTree?.ConductHaccp?.Process?.ProcessName}</td>
                                        {tabData?.Edit && (
                                            <td>
                                                <p onClick={() => {
                                                    dispatch(changeId(plan._id));
                                                    dispatch(updateTabData({ ...tabData, Tab: 'updateFoodSafetyPlan' }))
                                                }} className={style.greenclick}>Update</p>
                                            </td>
                                        )}

                                        <td>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'viewFoodSafetyPlan' }));
                                                dispatch(changeId(plan._id));
                                            }} className='btn btn-outline-danger'>View</p>
                                        </td>
                                        <td >
                                            <p onClick={() => {
                                                if (plan.Status === 'Disapproved') {
                                                    setDataToShow(plan.Reason)
                                                } else {
                                                    setDataToShow('Process is not DisApproved.')
                                                }
                                                setShowBox(true);
                                            }} className='btn btn-outline-danger'>View</p>
                                        </td>
                                        {tabData?.Approval && (
                                            <td>
                                                <p onClick={() => {
                                                    if (plan.Status === 'Approved') {
                                                        setDataToShow('Sorry, Plan is already Approved');
                                                        setShowBox(true);
                                                    } else if (plan.Status === 'Disapproved') {
                                                        setDataToShow('Sorry, Plan is already Disapproved');
                                                        setShowBox(true);
                                                    } else {
                                                        setIdForAction(plan._id);
                                                        setApprove(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                <p onClick={() => {
                                                    if (plan.Status === 'Approved') {
                                                        setDataToShow('Sorry, Plan is already Approved');
                                                        setShowBox(true);
                                                    } else if (plan.Status === 'Disapproved') {
                                                        setDataToShow('Sorry, Plan is already Disapproved');
                                                        setShowBox(true);
                                                    } else {
                                                        setIdForAction(plan._id);
                                                        setReject(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-danger pt-0 px-1`}>Disapprove</p>
                                            </td>
                                        )}
                                        <td></td>
                                        <td>
                                            <p onClick={() => {
                                                dispatch(changeId(plan._id))
                                                dispatch(updateTabData({ ...tabData, Tab: 'foodSafetyPlanTeams' }))
                                            }} className='btn btn-outline-warning'>Click Here</p>
                                        </td>
                                        <td>{plan.CreatedBy}</td>
                                        <td>{dayjs(plan.CreationDate).format('DD/MM/YYYY')}</td>
                                        {plan.ApprovedBy ? (
                                            <td>{plan.ApprovedBy}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {plan.ApprovalDate ? (
                                            <td>{dayjs(plan.ApprovalDate).format('DD/MM/YYYY')}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {plan.DisapprovedBy ? (
                                            <td>{plan.DisapprovedBy}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {plan.DisapprovalDate ? (
                                            <td>{dayjs(plan.DisapprovalDate).format('DD/MM/YYYY')}</td>
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
                                <button onClick={() => {
                                    setShowBox(false);
                                }} className={style.btn2}>OK</button>
                            </div>
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
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapprove-food-safety`, { id: idForAction, Reason: reason, disapprovedBy: user.Name }).then(() => {
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
            {
                approve ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Approve this Decision Food Safety Plan ?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setApprove(false)
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approve-food-safety`, { id: idForAction, approvedBy: user.Name }).then(() => {
                                        dispatch(setSmallLoading(false))
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Approved Successfully',
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
                                }} className={style.btn1}>Submit</button>


                                <button onClick={() => {
                                    setApprove(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {showPlan && (
                <div style={{
                    width: '100%',
                    backgroundColor: 'rgba(217, 217, 217, 0.7)',
                    height: '100%',
                    position: 'fixed',
                    top: '0',

                    zIndex: '10',

                }}>
                    <div className='mx-auto mt-4' style={{
                        width: '75%',
                        backgroundColor: 'white',
                        height: '90%',
                        overflowY: 'scroll'
                    }}>


                        <div>
                            <div className={`bg-danger row mx-lg-4 mx-md-3 mx-1 mt-4 py-3  `}>
                                <div className='w-50 col-lg-6 col-md-6 col-12'>


                                    <div className={`${style.heading} ms-3 text-white fs-3 `}>
                                        {planData.DecisionTree.ConductHaccp.Process.Name}
                                    </div>
                                </div>
                                <div className='w-50 col-lg-6 col-md-6 col-12 d-flex justify-content-end pe-3'>
                                    <div className={`${style.heading} text-white fs-3`}>
                                        {hazardName}
                                    </div>
                                </div>
                            </div>

                            <div className='bg-white  mx-lg-4 mx-md-3 mx-1 p-3'>
                                <div className='row '>

                                    <div className='p-3 col-lg-6 col-md-6 col-12'>
                                        <p style={{
                                            fontFamily: 'Inter'
                                        }}><b>Hazard To Control</b></p>
                                        <textarea value={planData?.CCPHazard?.HazardToControl} name='HazardToControl' rows={3} className='my-4 p-2 bg-light w-100 mx-2 border-0' readOnly />
                                    </div>
                                    <div className='p-3 col-lg-6 col-md-6 col-12'>

                                        <p style={{
                                            fontFamily: 'Inter'
                                        }}><b>Control Measuresl</b></p>
                                        <textarea value={planData?.CCPHazard?.ControlMeasures} name='ControlMeasures' rows={3} className='my-4 p-2 bg-light w-100 mx-2 border-0' readOnly />
                                    </div>
                                </div>

                                <div className='bg-light p-2 my-4'>

                                    <h4 style={{
                                        fontFamily: 'Inter'
                                    }} className='text-center'>Process Limit</h4>

                                    <div className='row'>
                                        <div className='col-lg-6 col-md-6 col-12 p-4'>
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>Traget Range</b></p>
                                            <textarea value={planData?.CCPHazard?.ProcessLimit?.TargetRange} name='TargetRange' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>Critical Control Area</b></p>
                                            <textarea value={planData?.CCPHazard?.ProcessLimit?.CriticalCtrlPoint} name='CriticalCtrlPoint' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />
                                        </div>
                                        <div className='col-lg-6 col-md-6 col-12 p-4'>
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>Action point</b></p>
                                            <textarea value={planData?.CCPHazard?.ProcessLimit?.ActionPoint} name='ActionPoint' rows={3} type='text' placeholder='Action point' className='w-100 p-2 my-3  border-0' readOnly />

                                        </div>

                                    </div>
                                </div>
                                <p style={{
                                    fontFamily: 'Inter'
                                }}><b>Justification link for CCP</b></p>
                                <textarea value={planData?.CCPHazard?.JustificationLink} name='JustificationLink' rows={3} className='my-4 p-2 bg-light w-100 mx-2 border-0' readOnly />

                                <div className='bg-light p-2 my-4'>

                                    <h4 style={{
                                        fontFamily: 'Inter'
                                    }} className='text-center'>Monitoring Point</h4>

                                    <div className='row'>
                                        <div className='col-lg-6 col-md-6 col-12 p-4'>
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>Who</b></p>
                                            <textarea value={planData?.CCPHazard?.MonitoringPlan?.Who} name='Who' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>What</b></p>
                                            <textarea value={planData?.CCPHazard?.MonitoringPlan?.What} name='What' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />
                                        </div>
                                        <div className='col-lg-6 col-md-6 col-12 p-4'>
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>When</b></p>
                                            <textarea value={planData?.CCPHazard?.MonitoringPlan?.When} name='When' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>How</b></p>
                                            <textarea value={planData?.CCPHazard?.MonitoringPlan?.How} name='How' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />

                                        </div>

                                    </div>
                                </div>
                                <p style={{
                                    fontFamily: 'Inter'
                                }}><b>Corrective Action</b></p>
                                <textarea value={planData?.CCPHazard?.CorrectiveAction} name='CorrectiveAction' rows={3} className='my-4 p-2 bg-light w-100 mx-2 border-0' readOnly />

                                <div className='bg-light p-2 my-4'>

                                    <h4 style={{
                                        fontFamily: 'Inter'
                                    }} className='text-center'>Verfification Plan</h4>

                                    <div className='row'>
                                        <div className='col-lg-6 col-md-6 col-12 p-4'>
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>Who</b></p>
                                            <textarea value={planData?.CCPHazard?.VerificationPlan?.Who} name='Who' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>What</b></p>
                                            <textarea value={planData?.CCPHazard?.VerificationPlan?.What} name='What' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />

                                        </div>
                                        <div className='col-lg-6 col-md-6 col-12 p-4'>
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>When</b></p>
                                            <textarea value={planData?.CCPHazard?.VerificationPlan?.When} name='When' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}><b>How</b></p>
                                            <textarea value={planData?.CCPHazard?.VerificationPlan?.How} name='How' rows={3} type='text' className='w-100 p-2 my-3  border-0' readOnly />


                                        </div>

                                    </div>
                                </div>

                                <div className='row '>

                                    <div className='p-3 col-lg-6 col-md-6 col-12'>
                                        <p style={{
                                            fontFamily: 'Inter'
                                        }}><b>Monitoring record refrence</b></p>
                                        <textarea value={planData?.CCPHazard?.MonitoringRef} name='MonitoringRef' rows={3} className='my-4 p-2 bg-light w-100 mx-2 border-0' readOnly />
                                    </div>
                                    <div className='p-3 col-lg-6 col-md-6 col-12'>

                                        <p style={{
                                            fontFamily: 'Inter'
                                        }}><b>Verification record refrence</b></p>
                                        <textarea value={planData?.CCPHazard?.VerificationRef} name='VerificationRef' rows={3} className='my-4 p-2 bg-light w-100 mx-2 border-0' readOnly />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-center'>
                                    <button onClick={() => {
                                        setShowPlan(false);
                                    }} className='btn btn-danger px-4 py-1'>
                                        Close
                                    </button>

                                </div>

                            </div>


                        </div>
                    </div>




                </div>

            )}
        </>
    )
}

export default FoodSafetyPlan
