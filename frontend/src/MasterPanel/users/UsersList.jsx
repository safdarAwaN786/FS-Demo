import style from './UsersList.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import { BsArrowLeftCircle } from 'react-icons/bs';

function UsersList() {
    const [alert, setalert] = useState(false);
    const [alert2, setalert2] = useState(false);
    const [deleteUser, setDeleteUser] = useState(false);
    const [usersList, setUsersList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const user = useSelector(state => state.auth.user);
    const alertManager = () => {
        setalert(!alert)
    }
    const [userTabs, setUserTabs] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch()
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const idToWatch = useSelector(state => state.idToProcess);
    const [idToProcess, setIdToProcess] = useState(null);
    useEffect(() => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-usersByDepartment/${idToWatch}`).then((response) => {
            dispatch(setSmallLoading(false));
            setAllDataArr(response.data.data);
            setUsersList(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const refreshData = () => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-usersByDepartment/${idToWatch}`).then((response) => {
            dispatch(setSmallLoading(false))
            setAllDataArr(response.data.data);
            setUsersList(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }
    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }
    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }
    const [userIdForAccess, setUserIdForAccess] = useState(null);
    useEffect(() => {
        setUsersList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])
    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.Name.includes(event.target.value)
            )
            setUsersList(searchedList);
        } else {
            setUsersList(allDataArr?.slice(startIndex, endIndex))
        }
    }

    return (
        <>
            <div className='d-flex flex-row px-lg-5 px-2 pt-5'>
                <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                    {
                        dispatch(changeId(usersList[0]?.Company?._id || ''))
                        dispatch(updateTabData({ ...tabData, Tab: 'viewUsersDepartments' }));
                    }
                }} />
            </div>
            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search Document by name' />
                </div>
            </div>
            <div className={style.tableParent}>
                {!usersList || usersList?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Name</td>
                            <td>Designation</td>
                            <td>Role No</td>
                            <td>Phone No</td>
                            <td>Email Address</td>
                            <td>Username</td>
                            {/* <td>Password</td> */}
                            <td>Assigned Tabs</td>
                            <td>Action</td>
                            {/* <td>Send</td> */}
                            <td>Action</td>
                            <td>Action</td>
                        </tr>
                        {
                            usersList?.map((user, i) => {
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
                                        }}>{user.Name}</p></td>
                                        <td>{user.Designation}</td>
                                        <td>{user.Role}</td>
                                        <td>{user.PhoneNo}</td>
                                        <td>{user.Email}</td>
                                        <td>{user.UserName}</td>
                                        <td>
                                            <p onClick={() => {
                                                setUserTabs(user.Tabs);
                                                setShowBox(true);
                                            }} className={style.redclick}>View</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'assignTabs' }));
                                                dispatch(changeId(user._id));
                                            }} className='btn btn-outline-success p-1 m-2'>Assign Tabs</p>
                                        </td>
                                        <td>
                                            {user.isSuspended ? (
                                                <button onClick={() => {
                                                    setUserIdForAccess(user._id);
                                                    setalert2(true);
                                                }} className='btn btn-outline-primary  p-1'>Allow Access</button>
                                            ) : (
                                                <button onClick={() => {
                                                    setUserIdForAccess(user._id);
                                                    alertManager();
                                                }} className='btn btn-outline-primary  p-1'>Stop Access</button>
                                            )}
                                        </td>
                                        <td><button onClick={() => {
                                            setIdToProcess(user._id);
                                            setDeleteUser(true);
                                        }} className='btn  btn-outline-danger px-3 py-1'>Delete</button></td>
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
                        <div style={{
                            height: '80%',
                            overflowY: 'scroll'
                        }} class={`${style.alert} py-3 `}>
                            {userTabs.map((tabObj) => {
                                return (
                                    <p class={style.msg}>{tabObj.Tab}</p>
                                )
                            })}
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
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to stop  the access for this user?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/suspend-user/${userIdForAccess}`).then((res) => {
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Access Stoped Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        })
                                    }).catch(err => {
                                        console.log(err);
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: 'Try Again!',
                                            confirmButtonText: 'OK.'

                                        })
                                    })

                                }} className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                alert2 ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Allow  the access for this user?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setalert2(false);
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/reassign-access/${userIdForAccess}`, null).then((res) => {
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Access Allowed Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        })
                                    }).catch(err => {
                                        console.log(err);
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: 'Try Again!',
                                            confirmButtonText: 'OK.'

                                        })
                                    })

                                }} className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                deleteUser ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to delete this user?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setDeleteUser(false)
                                    dispatch(setSmallLoading(true))
                                    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/delete-user/${idToProcess}`).then((response) => {
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Deleted Successfully',
                                            text: 'User Deleted Successfully!',
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
                                    setDeleteUser(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default UsersList
