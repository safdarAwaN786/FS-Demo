import style from './TrainedEmployeesForTrainer.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import profile from '../../assets/images/addEmployee/prof.svg'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function TrainedEmployeesForTrainer() {
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const [popUpData, setPopUpData] = useState(null);
    const [trainingToShow, setTrainingToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    
    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = trainingToShow?.Employee?.filter((obj) =>

                obj.EmployeeName.includes(event.target.value) || obj.EmployeeCode.includes(event.target.value)
            )
            console.log(searchedList);
            setTrainedEmployees(searchedList);
        } else {
            setTrainedEmployees(trainingToShow?.Employee)
        }
    }

    const [trainedEmployees, setTrainedEmployees] = useState(null);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            const plannedTrainingsList = response.data.data;
            const foundTraining = plannedTrainingsList.find((training) => training._id === idToWatch);
            if (foundTraining) {
                setTrainingToShow(foundTraining);
                setTrainedEmployees(foundTraining.Employee?.slice(startIndex, endIndex))
            }
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])
    console.log(trainingToShow);

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }
    useEffect(() => {
        setTrainedEmployees(trainingToShow?.Employee.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    function findObjectIndexByPropertyValue(array) {
        const foundObject = array.find((data) => data.Training === idToWatch);
        if (foundObject) {
            return (array.indexOf(foundObject))
        }
        return null; // Return null if property value is not found in any object
    }

    return (
        <>
                <div className='d-flex flex-row px-4 mt-5 mb-1'>
                    <BsArrowLeftCircle role='button' className='fs-3  text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({...tabData, Tab : 'viewTrainingInfo'}))
                        }
                    }} />
                    <p className={style.headingtxt}>Employees Who are getting Trained</p>
                </div>

                <div className={`${style.searchbar} mt-1`}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Employee by name or id' />
                    </div>
                </div>
                <div className={style.tableParent}>
                    {!trainedEmployees || trainedEmployees?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (
                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Employee Code</td>
                                <td>Name</td>
                                <td>CNIC</td>
                                <td>Phone Number</td>
                                <td>Email</td>
                                <td>Result Status</td>
                                <td>Pass/Fail</td>
                                <td>Attendence</td>
                                <td>Obtained Marks</td>
                                <td>Remarks</td>
                            </tr>
                            {
                                trainedEmployees?.map((employee, i) => {
                                    console.log(employee)
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td>
                                                <p>{employee.UserId}</p>
                                            </td>
                                            <td className={style.name}><div style={{
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
                                                }} src={employee.EmployeeImage || profile}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none'
                                                    }} alt="" />

                                            </div> {employee.Name}</td>
                                            <td>{employee.CNIC}</td>
                                            <td>{employee.PhoneNumber}</td>
                                            <td>{employee.Email}</td>

                                            {(employee.EmployeeData.length !== 0 && findObjectIndexByPropertyValue(employee.EmployeeData) !== null) ? (

                                                <>

                                                    <td>{employee.EmployeeData[findObjectIndexByPropertyValue(employee.EmployeeData)].EmployeeResultStatus}</td>
                                                    <td><label className={style.switch}>
                                                        <input type="checkbox" checked={employee.EmployeeData[findObjectIndexByPropertyValue(employee.EmployeeData)].IsPass} />

                                                        <span className={`${style.slider} ${style.round}`} ></span>
                                                    </label></td>

                                                    <td>
                                                        <label className={style.switch}>
                                                            <input type="checkbox" checked={employee.EmployeeData[findObjectIndexByPropertyValue(employee.EmployeeData)].IsPresent} />
                                                            <span className={`${style.slider} ${style.round}`} ></span>
                                                        </label>
                                                    </td>
                                                    <td>{employee.EmployeeData[findObjectIndexByPropertyValue(employee.EmployeeData)].Marks}</td>
                                                    <td>
                                                        <p onClick={() => {
                                                            setPopUpData(employee.EmployeeData[findObjectIndexByPropertyValue(employee.EmployeeData)].Remarks || "No Remarks are given");
                                                            alertManager();
                                                            setalert(true);
                                                        }} className={style.click}>Click Here</p>
                                                    </td>

                                                </>
                                            ) : (
                                                <>
                                                    <td>Pending</td>
                                                    <td><label className={style.switch}>
                                                        <input type="checkbox" checked={false} />

                                                        <span className={`${style.slider} ${style.round}`} ></span>
                                                    </label></td>

                                                    <td>
                                                        <label className={style.switch}>
                                                            <input type="checkbox" checked={false} />
                                                            <span className={`${style.slider} ${style.round}`} ></span>
                                                        </label>
                                                    </td>
                                                    <td>Not Given</td>
                                                    <td>
                                                        <p onClick={() => {
                                                            setPopUpData("No Remarks Given");
                                                            alertManager();
                                                            setalert(true);
                                                        }} className={style.click}>Click Here</p>
                                                    </td>
                                                </>
                                            )


                                            }
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
                    {trainingToShow?.Employee?.length > endIndex && (

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

                                <button onClick={alertManager} className={style.btn2}>OK.</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default TrainedEmployeesForTrainer
