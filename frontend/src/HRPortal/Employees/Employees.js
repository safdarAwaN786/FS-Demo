import style from './Employees.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import profile from '../../assets/images/addEmployee/prof.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function Employees() {

    const [employeesList, setEmployeesList] = useState(null);
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const [allDataArr, setAllDataArr] = useState(null);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readEmployee`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            dispatch(setSmallLoading(false))
            setAllDataArr(response.data.data);
            setEmployeesList(response.data.data.slice(startIndex, endIndex))
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
        setEmployeesList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

     const handleDownloadImage = async (imageURL) => {
        try {
            if (imageURL) {

                dispatch(setSmallLoading(true))
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                    params: {
                        url: imageURL,
                    },
                    responseType: 'blob', headers: { Authorization: `${user._id}` } // Specify the response type as 'blob' to handle binary data
                });


                let blob;

                blob = new Blob([response.data]);
                // }

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



    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>
                obj.Name.includes(event.target.value) || obj.UserId.includes(event.target.value)
            )
            console.log(searchedList);
            setEmployeesList(searchedList);
        } else {
            setEmployeesList(allDataArr?.slice(startIndex, endIndex))
        }
    }



    return (
        <>
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input autoComplete='off' onChange={search} type="text" placeholder='Search Employee by name or id' />
                    </div>
                    {tabData?.Creation && (

                        <div onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'addEmployee' }))
                        }} className={style.sec2}>
                            <img src={add} alt="" />
                            <p>Add Employee</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>

                    {!employeesList || employeesList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (


                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Employee ID</td>
                                <td>Name</td>
                                <td>CNIC</td>
                                <td>Phone Number</td>
                                <td>Email</td>
                                <td>Department</td>
                                <td>Training Status</td>
                                <td>Profile</td>
                                <td>CV Certificate</td>
                                {/* <td></td> */}
                            </tr>

                            {
                                employeesList?.map((employee, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td className={style.txtStyle1}>
                                                <p>{employee.UserId}</p>
                                            </td>
                                            <td className={style.txtStyle2}>
                                                <div style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "50%",
                                                    overflow: "hidden",


                                                    backgroundImage: `url(${profile})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',

                                                }}>
                                                    <img style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover"
                                                    }} onError={(e) => {
                                                        e.target.style.display = 'none'; // Hide the img tag on error
                                                    }} src={employee.EmployeeImage || profile} alt="Image" />

                                                </div> {employee.Name}</td>
                                            <td className={style.txtStyle4}>{employee.CNIC}</td>
                                            <td className={style.txtStyle4}>{employee.PhoneNumber}</td>
                                            <td className={style.txtStyle3}>{employee.Email}</td>
                                            <td className={style.txtStyle4}>{employee.DepartmentText}</td>
                                            <td className={employee.TrainingStatus === 'Trained' ? style.txtStyle5 : style.txtStyle6}> <div className={`text-center ${employee.TrainingStatus === 'Trained' ? style.greenStatus : style.redStatus} `}><p>{employee.TrainingStatus}</p></div></td>
                                            <td>
                                                <button className={style.viewBtn} onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'viewEmployeeProfile' }))
                                                    dispatch(changeId(employee._id))

                                                }}>
                                                    View
                                                </button>
                                            </td>
                                            <td>
                                                <a onClick={() => {
                                                    handleDownloadImage(employee.EmployeeCV)
                                                }} className='btn btn-outline-primary p-1 ' >
                                                    Download
                                                </a>
                                            </td>
                                            {/* <td>
                                                <button onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'assignTabsToEmployee' }));
                                                    dispatch(changeId(employee._id));
                                                }} type='button' className='btn btn-outline-success w-100 ms-2 p-1'>Assign Tabs</button>
                                            </td> */}
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
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>
                                <button  style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={alertManager} className={style.btn2}>OK.</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default Employees
