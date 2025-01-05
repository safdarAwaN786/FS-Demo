import style from './HACCPTeamMembers.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

function HACCPTeamMembers() {
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);
    const idToWatch = useSelector(state => state.idToProcess);
    const [teamData, setTeamData] = useState(null);
    const [membersList, setMembersList] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const userToken = Cookies.get('userToken');
    const user = useSelector(state => state.auth.user);
    const [showTabs, setShowTabs] = useState(false)
    const [userTabs, setUserTabs] = useState(null);
    const [deleteUser, setDeleteUser] = useState(false);
    const [userToDel, setUserToDel] = useState(null)
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-haccp-team/${idToWatch}`).then((response) => {
            setTeamData(response.data.data)
            setMembersList(response.data.data?.TeamMembers.slice(startIndex, endIndex));
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
    const refreshData = async () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-haccp-team/${idToWatch}`).then((response) => {
            setTeamData(response.data.data)
            setMembersList(response.data.data?.TeamMembers.slice(startIndex, endIndex));
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

    // Function to toggle password visibility for a specific user
    const togglePasswordVisibility = (userIndex) => {
        if (selectedUser === userIndex) {
            setSelectedUser(null); // Hide the password if it's already visible
        } else {
            setSelectedUser(userIndex); // Show the password for the selected user
        }
    };

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setMembersList(teamData?.TeamMembers.slice(startIndex, endIndex))
    }, [startIndex, endIndex])




    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = teamData?.TeamMembers.filter((obj) =>
                obj.Name.includes(event.target.value)
            )
            setMembersList(searchedList);
        } else {
            setMembersList(teamData?.TeamMembers.slice(startIndex, endIndex))
        }
    }

    const handleDownloadImage = async (imageURL) => {
        try {
            if (imageURL) {
                dispatch(setSmallLoading(true))
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                    params: {
                        url: imageURL,
                    },
                    responseType: 'blob' // Specify the response type as 'blob' to handle binary data
                });
                let blob;
                blob = new Blob([response.data]);
                // Create a temporary anchor element
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                // Set the download attribute and suggested filename for the downloaded image
                link.download = `${user.Department.DepartmentName}-FSMS${imageURL.substring(imageURL.lastIndexOf('.'))}`;
                // Append the anchor element to the document body and click it to trigger the download
                document.body.appendChild(link);
                dispatch(setSmallLoading(false))
                link.click();
                // Clean up by removing the temporary anchor element
                document.body.removeChild(link);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'No any file uploaded here!'
                })
            }
        } catch (error) {
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        }
    };
    return (
        <>
            <div className='d-flex flex-row bg-white px-lg-5  px-2 py-2'>
                <BsArrowLeftCircle
                    role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tab: 'HACCP Team Management' }))
                        }
                    }} />
            </div>
            <div className={`${style.searchbar} mt-1 `}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search Member by name' />
                </div>
            </div>
            <div className={style.tableParent}>
                {!membersList || membersList?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Name</td>
                            <td>Education</td>
                            <td>Designation</td>
                            <td>Experience</td>
                            <td>Department</td>
                            <td>Role in Team</td>
                            <td>Trainings Attended</td>
                            <td>Date of Training</td>
                            <td>Email</td>
                            <td>UserName</td>
                            {/* <td>Password</td> */}
                            <td>Action</td>
                            <td>Assigned</td>
                            <td>Document</td>
                            <td>Action</td>
                        </tr>
                        {
                            membersList?.map((member, i) => {
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
                                        }}>{member.Name}</p></td>
                                        <td className={style.simpleContent}>{member.Education}</td>
                                        <td>{member.Designation}</td>
                                        <td>{member.Experience}</td>
                                        <td>{member.Department.DepartmentName}</td>
                                        <td>{member.RoleInTeam}</td>
                                        <td>{member.TrainingsAttended}</td>
                                        <td>{dayjs(member.TrainingDate).format('DD/MM/YYYY')}</td>
                                        <td>{member.Email}</td>
                                        <td>{member.UserName}</td>
                                        <td>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'assignTabsToMember' }));
                                                dispatch(changeId(member._id));
                                            }} className='btn btn-outline-success p-1 m-2'>Assign Tabs</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                setShowTabs(true);
                                                setUserTabs(member.Tabs)

                                            }} className='btn btn-outline-success p-1 m-2'>Current Tabs</p>
                                        </td>
                                        <td><button onClick={() => {
                                            if (member.Document) {
                                                console.log(member.Document)
                                                handleDownloadImage(member.Document)
                                            } else {
                                                setDataToShow('No File Uploaded Here');
                                                setShowBox(true);
                                            }
                                        }} className='btn btn-outline-danger p-1 '>Download</button></td>
                                        <td><button onClick={() => {
                                            setDeleteUser(true)
                                            setUserToDel(member._id)
                                        }} className='btn btn-outline-danger p-1'>Delete</button></td>
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
                {teamData?.TeamMembers.length > endIndex && (
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
                deleteUser ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to delete this Member?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setDeleteUser(false)
                                    dispatch(setSmallLoading(true))
                                    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/delete-user/${userToDel}`).then((response) => {
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Deleted Successfully',
                                            text: 'Member Deleted Successfully!',
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
            {
                showTabs && (

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
                                    setShowTabs(false);
                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default HACCPTeamMembers
