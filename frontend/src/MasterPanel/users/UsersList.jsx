import style from './UsersList.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import Cookies from 'js-cookie';
import { setLoading } from '../../redux/slices/loading';



function UsersList() {
    const [alert, setalert] = useState(false);
    const [alert2, setalert2] = useState(false);
    const [usersList, setUsersList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false); // State to control password visibility
    const [selectedUser, setSelectedUser] = useState(null); // State to keep track of the selected user

    // Function to toggle password visibility for a specific user
    const togglePasswordVisibility = (userIndex) => {
        if (selectedUser === userIndex) {
            setSelectedUser(null); // Hide the password if it's already visible
        } else {
            setSelectedUser(userIndex); // Show the password for the selected user
        }
    };
    const alertManager = () => {
        setalert(!alert)
    }
    const [userTabs, setUserTabs] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch()
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [idForAction, setIdForAction] = useState(null);
    const [allDataArr, setAllDataArr] = useState(null);
    const [usersObj, setUsersObj] = useState(null)
    const idToWatch = useSelector(state => state.idToProcess);

    const userToken = Cookies.get('userToken');
    useEffect(() => {
        dispatch(setLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-usersByDepartment/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            dispatch(setLoading(false));
            setAllDataArr(response.data.data);
            setUsersList(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const refreshData = () => {
        dispatch(setLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-usersByDepartment/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            dispatch(setLoading(false))
            setAllDataArr(response.data.data);
            setUsersList(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
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
            console.log(event.target.value);
            const searchedList = allDataArr.filter((obj) =>
                obj.Name.includes(event.target.value)
            )
            console.log(searchedList);
            setUsersList(searchedList);
        } else {
            setUsersList(allDataArr?.slice(startIndex, endIndex))
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
                                <td>Send</td>
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
                                            {/* <td> {selectedUser === i ? (
                                                user.Password // Show the password if selectedUser matches the current user index
                                            ) : (
                                                '********' // Show asterisks by default
                                            )}
                                                {selectedUser === i ? (
                                                    <AiFillEyeInvisible style={{
                                                        cursor: 'pointer'
                                                    }} className='fs-4' onClick={() => togglePasswordVisibility(i)} />
                                                ) : (

                                                    <AiFillEye style={{
                                                        cursor: 'pointer'
                                                    }} className='fs-4' onClick={() => togglePasswordVisibility(i)} />
                                                )}
                                            </td> */}
                                            <td >
                                                <p onClick={() => {
                                                    setUserTabs(user.Tabs);
                                                    setShowBox(true);
                                                }} className={style.redclick}>View</p>
                                            </td>
                                            <td>
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'assignTabs' }))

                                                    dispatch(changeId(user._id))



                                                }} className='btn btn-outline-success p-1 m-2'>Assign Tabs</p>
                                            </td>
                                            <td>
                                                <p onClick={() => {

                                                }} className='btn btn-outline-primary p-1 m-2'>Send Email</p>
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

                                <button onClick={() => {
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
                                    const userToken = Cookies.get('userToken');

                                    console.log(userToken)
                                    alertManager();
                                    axios.patch(`/suspend-user/${userIdForAccess}`, null, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
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
                                    const userToken = Cookies.get('userToken');

                                    console.log(userToken)
                                    setalert2(false);
                                    axios.patch(`/reassign-access/${userIdForAccess}`, null, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
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


        </>
    )
}

export default UsersList
