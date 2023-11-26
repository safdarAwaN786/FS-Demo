import style from './HACCPteams.module.css'
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
    const userToken = Cookies.get('userToken');


    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-haccp-teams`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            console.log(response.data.data);
            setAllDataArr(response.data.data)
            setTeamsList(response.data.data.slice(startIndex, endIndex));
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, []);
    useEffect(() => {
        console.log(teamsList);
    }, [teamsList])
    const formatDate = (date) => {

        const newDate = new Date(date);
        const formatDate = newDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return formatDate;
    }

    const refreshData = () => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-haccp-teams`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            console.log(response.data.data);
            setAllDataArr(response.data.data)
            setTeamsList(response.data.data.slice(startIndex, endIndex));
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
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>

                obj.DocumentId.includes(event.target.value)
            )
            console.log(searchedList);
            setTeamsList(searchedList);
        } else {
            setTeamsList(allDataArr?.slice(startIndex, endIndex))
        }
    }



    return (
        <>

            <div className={style.subparent}>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Document by name' />
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
                                <td>Created By</td>
                                <td>Creation Date</td>
                                <td>Approved By</td>
                                <td>Approval Date</td>
                                <td>Status</td>
                                <td>Reason</td>
                                {tabData?.Edit && (

                                    <td>Action</td>

                                )}
                                {tabData?.Approval && (

                                    <td></td>
                                )}

                                <td>HACCP Team Members</td>

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
                                            <td>{team.CreatedBy}</td>
                                            <td>{formatDate(team.CreationDate)}</td>
                                            {team.ApprovedBy ? (

                                                <td>{team.ApprovedBy}</td>
                                            ) : (
                                                <td>- - -</td>

                                            )}
                                            {team.ApprovalDate ? (


                                                <td>{formatDate(team.ApprovalDate)}</td>
                                            ) : (
                                                <td>- - -</td>
                                            )}
                                            <td><div className={`text-center ${team.Status === 'Approved' && style.greenStatus} ${team.Status === 'Disapproved' && style.redStatus} ${team.Status === 'Pending' && style.yellowStatus}  `}><p>{team.Status}</p></div></td>
                                            <td >

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

                                                <td >

                                                    <p onClick={() => {

                                                        dispatch(changeId(team._id))
                                                        dispatch(updateTabData({ ...tabData, Tab: 'updateHACCPTeam' }));
                                                    }} className='btn btn-outline-success p-1 m-2'>Update</p>
                                                </td>

                                            )}

                                            {tabData?.Approval && (


                                                <td className='ps-0' >

                                                    <p onClick={() => {
                                                        setIdForAction(team._id)
                                                        setApprove(true)
                                                    }} style={{
                                                        height: '28px'
                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                    <p onClick={() => {
                                                        if (team.Status === 'Approved') {
                                                            setDataToShow('Sorry, Team is already Approved');
                                                            setShowBox(true);
                                                        } else {

                                                            setIdForAction(team._id);
                                                            setReject(true);
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Disaprrove</p>
                                                </td>
                                            )}
                                            <td >

                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'HACCPTeamMembers' }))
                                                    dispatch(changeId(team._id))

                                                }} style={{
                                                    height: '28px'

                                                }} className={`btn btn-outline-warning pt-0 px-1`}>Click Here</p>

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
                            <p class={style.msg}>Do you want to Approve this team?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setApprove(false)
                                    dispatch(setLoading(true))
                                    axios.patch(`/approveHaccpTeam`, { id: idForAction }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                        dispatch(setLoading(false))
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Approved Successfully',
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

                                }
                                } className={style.btn1}>Submit</button>


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
                                dispatch(setLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapproveHaccpTeam`, { id: idForAction, Reason: reason }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
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
