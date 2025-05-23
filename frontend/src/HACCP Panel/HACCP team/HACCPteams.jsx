import style from './HACCPteams.module.css'
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

function HACCPteams() {
    const [teamsList, setTeamsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [send, setSend] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [approve, setApprove] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [idForAction, setIdForAction] = useState(null);
    const [allDataArr, setAllDataArr] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const [deleteTeam, setDeleteTeam] = useState(false);
    const [teamToDel, setTeamToDel] = useState(null);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-haccp-teams`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setTeamsList(response.data.data.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, []);
    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-haccp-teams`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            console.log(response.data.data);
            setAllDataArr(response.data.data)
            setTeamsList(response.data.data.slice(startIndex, endIndex));
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
    const [reason, setReason] = useState(null);
    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }
    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }
    useEffect(() => {
        setTeamsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])
    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.DocumentId.includes(event.target.value)
            )
            setTeamsList(searchedList);
        } else {
            setTeamsList(allDataArr?.slice(startIndex, endIndex))
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
                        dispatch(updateTabData({ ...tabData, Tab: 'addHACCPTeam' }))
                    }}>
                        <img src={add} alt="" />
                        <p>Add Team</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>
                {!teamsList || teamsList?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Document ID</td>
                            <td>Document Type</td>
                            <td>Department</td>
                            <td>Revision No</td>
                            <td className='ps-5'>Status</td>
                            <td>Team Name</td>
                            <td>Reason</td>
                            {tabData?.Edit && (
                                <td>Action</td>
                            )}
                            {tabData?.Approval && (
                                <td></td>
                            )}
                            <td>HACCP Team Members</td>
                            <td>Created By</td>
                            <td>Creation Date</td>
                            <td>Approved By</td>
                            <td>Approval Date</td>
                            <td>Disapproved By</td>
                            <td>Disapproval Date</td>
                            <td>Action</td>
                        </tr>
                        {
                            teamsList?.map((team, i) => {
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
                                        }}>{team.DocumentId}</p></td>
                                        <td className={style.simpleContent}>{team.DocumentType}</td>
                                        <td>{team.Department.ShortName}</td>
                                        <td>{team.RevisionNo}</td>
                                        <td><div className={`text-center ${team.Status === 'Approved' && style.greenStatus} ${team.Status === 'Disapproved' && style.redStatus} ${team.Status === 'Pending' && style.yellowStatus}  `}><p>{team.Status}</p></div></td>
                                        <td>{team.teamName}</td>
                                        <td>
                                            <p onClick={() => {
                                                if (team.Status === 'Disapproved') {
                                                    setDataToShow(team.Reason)
                                                } else {
                                                    setDataToShow('This  team is Not DisApproved.')
                                                }
                                                setShowBox(true);
                                            }} className={style.redclick}>View</p>
                                        </td>
                                        {tabData?.Edit && (
                                            <td>
                                                <p onClick={() => {
                                                    dispatch(changeId(team._id))
                                                    dispatch(updateTabData({ ...tabData, Tab: 'updateHACCPTeam' }));
                                                }} className='btn btn-outline-success p-1'>Update</p>
                                            </td>
                                        )}
                                        {tabData?.Approval && (
                                            <td className='ps-0' >
                                                <p onClick={() => {
                                                    if (team.Status === 'Pending') {
                                                        setIdForAction(team._id)
                                                        setApprove(true)
                                                    } else {
                                                        setDataToShow('Sorry, Team is not Pending!');
                                                        setShowBox(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-primary pt-0 px-1 mx-1`}>Approve</p>
                                                <p onClick={() => {
                                                    if (team.Status === 'Pending') {
                                                        setIdForAction(team._id);
                                                        setReject(true);
                                                    } else {
                                                        setDataToShow('Sorry, Team is not Pending');
                                                        setShowBox(true);
                                                    }
                                                }} style={{
                                                    height: '28px'
                                                }} className={`btn btn-outline-danger pt-0 px-1 mx-1`}>Disapprove</p>
                                            </td>
                                        )}
                                        <td>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'HACCPTeamMembers' }))
                                                dispatch(changeId(team._id))
                                            }} style={{
                                                height: '28px'
                                            }} className={`btn btn-outline-warning pt-0 px-1`}>Click Here</p>
                                        </td>
                                        <td>{team.CreatedBy}</td>
                                        <td>{dayjs(team.CreationDate).format('DD/MM/YYYY')}</td>
                                        {team.ApprovedBy ? (
                                            <td>{team.ApprovedBy}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {team.ApprovalDate ? (
                                            <td>{dayjs(team.ApprovalDate).format('DD/MM/YYYY')}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {team.DisapprovedBy ? (
                                            <td>{team.DisapprovedBy}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        {team.DisapprovalDate ? (
                                            <td>{dayjs(team.DisapprovalDate).format('DD/MM/YYYY')}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        <td>
                                            <p onClick={() => {
                                                setDeleteTeam(true);
                                                setTeamToDel(team._id);
                                            }} style={{
                                                height: '28px'
                                            }} className={`btn btn-outline-danger pt-0 px-1`}>Delete</p>
                                        </td>
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
                        <div className='overflow-y-handler'>
                            <p class={style.msg}>{dataToShow}</p>
                        </div>
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
                deleteTeam ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to delete this Team?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setDeleteTeam(false)
                                    dispatch(setSmallLoading(true))
                                    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/delete-haccp-team/${teamToDel}`).then((response) => {
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Deleted Successfully',
                                            text: 'Team Deleted Successfully!',
                                            confirmButtonText: 'OK.'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                refreshData()
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
                                }} className={style.btn1}>Submit</button>
                                <button onClick={() => {
                                    setDeleteTeam(false);
                                }} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                approve ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Approve this team?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setApprove(false)
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approveHaccpTeam`, { id: idForAction, approvedBy: user.Name }).then(() => {
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
                reject && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setReject(false);
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapproveHaccpTeam`, { id: idForAction, Reason: reason, disapprovedBy: user.Name }).then(() => {
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

export default HACCPteams
