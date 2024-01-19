
import style from './DecisionTree.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function DecisionTree() {

    const [decisionTreesList, setDecisionTreesList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [send, setSend] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [approve, setApprove] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [hazardName, setHazardName] = useState(null);
    const [allDataArr, setAllDataArr] = useState(null);
    const [treeData, setTreeData] = useState(null);
    const [idForAction, setIdForAction] = useState(null);
    const [reason, setReason] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);

    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-decision-trees`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setDecisionTreesList(response.data.data.slice(startIndex, endIndex));
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-decision-trees`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setDecisionTreesList(response.data.data.slice(startIndex, endIndex));
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
    const [showQuestions, setShowQuestions] = useState(false)
    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setDecisionTreesList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.DocumentId.includes(event.target.value)
            )
            setDecisionTreesList(searchedList);
        } else {
            setDecisionTreesList(allDataArr?.slice(startIndex, endIndex))
        }
    }



    return (
        <>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Document by name' />
                    </div>
                    {tabData?.Creation && (

                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'addDecisionTree' }))
                        }}>
                            <img src={add} alt="" />
                            <p>Add Decision Tree</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!decisionTreesList || decisionTreesList?.length === 0 ? (
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
                                <td>Created By</td>
                                <td>Creation Date</td>
                                <td>Process Name</td>
                                {tabData?.Edit && (
                                    <td>Action</td>
                                )}
                                <td>Decision Tree</td>
                                <td>Reason</td>
                                {tabData?.Approval && (
                                    <td></td>
                                )}
                                <td></td>
                                <td>Team Members</td>
                                <td>Approved By</td>
                                <td>Approval Date</td>
                                <td>Status</td>
                            </tr>
                            {
                                decisionTreesList?.map((tree, i) => {
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
                                            }}>{tree.DocumentId}</p></td>
                                            <td className={style.simpleContent}>{tree.DocumentType}</td>
                                            <td>{tree.Department.DepartmentName}</td>
                                            <td>{tree.RevisionNo}</td>
                                            <td>{tree.CreatedBy}</td>
                                            <td>{tree.CreationDate?.slice(0, 10).split('-')[2]}/{tree.CreationDate?.slice(0, 10).split('-')[1]}/{tree.CreationDate?.slice(0, 10).split('-')[0]}</td>
                                            <td>{tree.ConductHaccp.Process.ProcessName}</td>
                                            {tabData?.Edit && (
                                                <td>
                                                    <p onClick={() => {
                                                        dispatch(changeId(tree._id))
                                                        dispatch(updateTabData({ ...tabData, Tab: 'updateDecisionTree' }))
                                                    }} className={style.greenclick}>Update</p>
                                                </td>
                                            )}
                                            <td >
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'viewDecisionTree' }))
                                                    dispatch(changeId(tree._id))
                                                }} className='btn btn-outline-danger'>View</p>
                                            </td>
                                            <td >
                                                <p onClick={() => {
                                                    setDataToShow(tree.Reason);
                                                    setShowBox(true);
                                                }} className='btn btn-outline-danger'>View</p>
                                            </td>

                                            {tabData?.Approval && (
                                                <td>
                                                    <p onClick={() => {
                                                        setIdForAction(tree._id);
                                                        setApprove(true);
                                                    }} style={{
                                                        height: '28px'
                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                    <p onClick={() => {
                                                        if (tree.Status === 'Approved') {
                                                            setDataToShow('Sorry, Team is already Approved');
                                                            setShowBox(true);
                                                        } else {

                                                            setIdForAction(tree._id);
                                                            setReject(true);
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Disapprove</p>
                                                </td>
                                            )}
                                            <td></td>
                                            <td >

                                                <p onClick={() => {
                                                    dispatch(changeId(tree._id))
                                                    dispatch(updateTabData({ ...tabData, Tab: 'decisionTreeMembers' }))
                                                }} className='btn btn-outline-warning'>Click Here</p>
                                            </td>

                                            {tree.ApprovedBy ? (

                                                <td>{tree.ApprovedBy}</td>
                                            ) : (
                                                <td>- - -</td>

                                            )}
                                            {tree.ApprovalDate ? (


                                                <td>{tree.ApprovalDate?.slice(0, 10).split('-')[2]}/{tree.ApprovalDate?.slice(0, 10).split('-')[1]}/{tree.ApprovalDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>- - -</td>
                                            )}
                                            <td><div className={`text-center ${tree.Status === 'Approved' && style.greenStatus} ${tree.Status === 'Disapproved' && style.redStatus} ${tree.Status === 'Pending' && style.yellowStatus}  `}><p>{tree.Status}</p></div></td>
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
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapprove-decision-tree`, { id: idForAction, Reason: reason, disapprovedBy : user.Name }).then(() => {
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
                            <p class={style.msg}>Do you want to Approve this Decision Tree ?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setApprove(false)
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approve-decision-tree`, { id: idForAction, approvedBy : user.Name }).then(() => {
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
                showQuestions && (

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
                                            {treeData.ConductHaccp.Process.Name}
                                        </div>
                                    </div>
                                    <div className='w-50 col-lg-6 col-md-6 col-12 d-flex justify-content-end pe-3'>
                                        <div className={`${style.heading} text-white fs-3`}>
                                            {hazardName}
                                        </div>
                                    </div>
                                </div>


                                <div className='bg-light m-3 p-3 '>

                                    <div className='d-flex justify-content-between'>
                                        <div>
                                            <h5><b>Q1 : </b> Are Control Measures in place for the hazard ?</h5>
                                        </div>
                                        <div>
                                            {treeData.Q1 === true && (

                                                <span className={`${style.answerSpan} ${treeData.Q1 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                    Yes

                                                </span>
                                            )}
                                            {treeData.Q1 === false && (

                                                <span className={`${style.answerSpan} ${treeData.Q1 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                    No

                                                </span>
                                            )}
                                        </div>

                                    </div>
                                    {treeData.Q1 === false && (

                                        <div className='d-flex justify-content-between'>
                                            <div>
                                                <h5><b>Q 1A : </b> Is control at this step necessary ? </h5>
                                            </div>
                                            <div>
                                                {treeData.Q1A === true && (

                                                    <span className={`${style.answerSpan} ${treeData.Q1A ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                        Yes

                                                    </span>
                                                )}
                                                {treeData.Q1A === false && (

                                                    <span className={`${style.answerSpan} ${treeData.Q1A === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                        No

                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    )}
                                    {(treeData.Q1 === true || treeData.Q1A === true) ? (

                                        <div className='d-flex justify-content-between'>
                                            <div>
                                                <h5><b>Q 2 : </b> Is this step specially designed to control the Hazard ?</h5>
                                            </div>
                                            <div>
                                                {treeData.Q2 === true && (

                                                    <span className={`${style.answerSpan} ${treeData.Q2 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                        Yes

                                                    </span>
                                                )}
                                                {treeData.Q2 === false && (

                                                    <span className={`${style.answerSpan} ${treeData.Q2 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                        No

                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    ) : null}

                                    {treeData.Q2 === false && (

                                        <div className='d-flex justify-content-between'>
                                            <div>
                                                <h5><b>Q 3 : </b> Could Hazard increase if not stopped at the point ?</h5>
                                            </div>
                                            <div>
                                                {treeData.Q3 === true && (

                                                    <span className={`${style.answerSpan} ${treeData.Q3 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                        Yes

                                                    </span>
                                                )}
                                                {treeData.Q3 === false && (

                                                    <span className={`${style.answerSpan} ${treeData.Q3 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                        No

                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    )}
                                    {treeData.Q3 === true && (

                                        <div className='d-flex justify-content-between'>
                                            <div>
                                                <h5><b>Q 4 : </b> Will the subsequent step eliminate the hazard ?</h5>
                                            </div>
                                            <div>
                                                {treeData.Q4 === true && (

                                                    <span className={`${style.answerSpan} ${treeData.Q4 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                        Yes

                                                    </span>
                                                )}
                                                {treeData.Q4 === false && (

                                                    <span className={`${style.answerSpan} ${treeData.Q4 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                        No

                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    )}

                                    <div className=' my-4 d-flex justify-content-center'>
                                        <button onClick={() => {
                                            setShowQuestions(false);
                                        }} className='px-4 py-2 btn btn-danger'>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }



        </>
    )
}

export default DecisionTree
