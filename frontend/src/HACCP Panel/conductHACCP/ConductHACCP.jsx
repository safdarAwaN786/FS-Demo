import style from './ConductHACCP.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import dayjs from 'dayjs';

function ConductHACCP() {

    const [ConductHACCPsList, setConductHACCPsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [showHazard, setShowHazard] = useState(false)
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [hazardName, setHazardName] = useState(null);
    const [hazardData, setHazardData] = useState(null);
    const [allDataArr, setAllDataArr] = useState(null);
    const [approve, setApprove] = useState(false);
    const [idForAction, setIdForAction] = useState(null);
    const [reason, setReason] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch()

    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-conduct-haccp`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setConductHACCPsList(response.data.data.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false));
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-conduct-haccp`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setConductHACCPsList(response.data.data.slice(startIndex, endIndex));
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
        setConductHACCPsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.DocumentId.includes(event.target.value)
            )
            setConductHACCPsList(searchedList);
        } else {
            setConductHACCPsList(allDataArr?.slice(startIndex, endIndex))
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
                        dispatch(updateTabData({ ...tabData, Tab: 'addHACCPRiskAssessment' }))
                    }}>
                        <img src={add} alt="" />
                        <p>Add Assesment</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>
                {!ConductHACCPsList || ConductHACCPsList?.length === 0 ? (
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
                            <td>Hazards Details</td>
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
                            ConductHACCPsList?.map((HACCP, i) => {
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
                                        }}>{HACCP.DocumentId}</p></td>
                                        <td className={style.simpleContent}>{HACCP.DocumentType}</td>
                                        <td>{HACCP.Department.DepartmentName}</td>
                                        <td>{HACCP.RevisionNo}</td>
                                        <td><div className={`text-center ${HACCP.Status === 'Approved' && style.greenStatus} ${HACCP.Status === 'Disapproved' && style.redStatus} ${HACCP.Status === 'Pending' && style.yellowStatus}  `}><p>{HACCP.Status}</p></div></td>
                                        <td>{HACCP.Process.ProcessName}</td>
                                        {tabData?.Edit && (
                                            <td>
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'updateConductHACCP' }));
                                                    dispatch(changeId(HACCP._id))
                                                }} className={style.greenclick}>Update</p>
                                            </td>
                                        )}
                                        <td>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'viewAllHazards' }));
                                                dispatch(changeId(HACCP._id));
                                            }} className='btn btn-outline-danger'>View</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                if (HACCP.Status === 'Disapproved') {
                                                    setDataToShow(HACCP.Reason)
                                                } else {
                                                    setDataToShow('Process is not DisApproved.')
                                                }
                                                setShowBox(true);
                                            }} className='btn btn-outline-danger'>View</p>
                                        </td>
                                        {tabData?.Approval && (
                                            <td>
                                                <p onClick={() => {
                                                    if (HACCP.Status === 'Pending') {
                                                        setIdForAction(HACCP._id);
                                                        setApprove(true);
                                                    } else {
                                                        setDataToShow('Sorry, Risk Assessment is not pending!');
                                                        setShowBox(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                <p onClick={() => {
                                                    if (HACCP.Status === 'Pending') {
                                                        setIdForAction(HACCP._id);
                                                        setReject(true);
                                                    } else {
                                                        setDataToShow('Sorry, Risk Assessment is not pending!');
                                                        setShowBox(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-danger pt-0 px-1`}>Disapprove</p>
                                            </td>
                                        )}
                                        <td></td>
                                        <td>
                                            <p onClick={() => {
                                                dispatch(changeId(HACCP._id))
                                                dispatch(updateTabData({ ...tabData, Tab: 'conductHACCPTeams' }))
                                            }} className='btn btn-outline-warning'>Click Here</p>
                                        </td>
                                        <td>{HACCP.CreatedBy}</td>
                                        <td>{dayjs(HACCP.CreationDate).format('DD/MM/YYYY')}</td>
                                        {HACCP.ApprovedBy ? (
                                            <td>{HACCP.ApprovedBy}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {HACCP.ApprovalDate ? (
                                            <td>{dayjs(HACCP.ApprovalDate).format('DD/mm/YYYY')}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {HACCP.DisapprovedBy ? (
                                            <td>{HACCP.DisapprovedBy}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {HACCP.DisapprovalDate ? (
                                            <td>{dayjs(HACCP.DisapprovalDate).format('DD/MM/YYYY')}</td>
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
                            <p class={style.msg}>Do you want to Approve this Assessment?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setApprove(false)
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approve-conduct-haccp`, { id: idForAction, ApprovedBy: user.Name }, { headers: { Authorization: `${user._id}` } }).then(() => {
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
            {
                showHazard && (

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
                            <div >

                                <div className={`${style.headers} d-flex justify-content-start ps-3 bg-danger align-items-center `}>
                                    <div className={style.spans}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <div className={`${style.heading} ms-3 `}>
                                        Hazard Details
                                    </div>
                                </div>
                                <div className='bg-light m-3 p-3 '>


                                    <div className='d-flex justify-content-end p-3'>
                                        <div className={style.colorBox}>
                                            <span className={`bg-danger`} style={{
                                                display: 'block',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '20px'
                                            }}></span>
                                        </div>

                                    </div>
                                    <h4 style={{
                                        fontFamily: 'Inter'
                                    }} className='text-center my-3 '>{hazardName}</h4>
                                    <div className='row'>
                                        <div className='col-lg-6 col-md-12 p-2'>
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}>Description</p>
                                            <textarea value={hazardData.Description} rows={3} className='w-100 p-2 my-3  border-0' readOnly />
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}>Control Measures</p>
                                            <input autoComplete='off' value={hazardData.ControlMeasures} className='w-100 p-2 my-3  border-0' readOnly />

                                        </div>
                                        <div className='col-lg-6 col-md-12 p-2'>
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}>Occurence</p>
                                            <input autoComplete='off' value={hazardData.Occurence} className='w-100 p-2 my-3  border-0' readOnly />
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}>Severity</p>
                                            <input autoComplete='off' value={hazardData.Severity} className='w-100 p-2 my-3  border-0' readOnly />
                                            <p style={{
                                                fontFamily: 'Inter'
                                            }}>Significance Score</p>
                                            <input autoComplete='off' value={hazardData.SignificanceLevel} className='w-100 p-2 my-3  border-0' readOnly />
                                        </div>

                                    </div>
                                    <div className=' my-2 d-flex justify-content-center'>
                                        <button onClick={() => {
                                            setHazardData(null);
                                            setHazardName(null);
                                            setShowHazard(false);
                                        }} className='px-4 py-2 btn btn-danger'>Close</button>
                                    </div>
                                </div>
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
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapprove-conduct-haccp`, { id: idForAction, Reason: reason, DisapprovedBy: user.Name }, { headers: { Authorization: `${user._id}` } }).then(() => {
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

export default ConductHACCP
