import style from './Main.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import profile from '../../assets/images/addEmployee/prof.svg'
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'

function MainForTrainerPortal() {
    const [trainingToShow, setTrainingToShow] = useState(null);
    const [alert, setAlert] = useState(null);
    const alertManager = () => {
        setAlert(!alert)
    }
    const [remarksInput, setRemarksInput] = useState(false)
    const showRemarksInput = () => {
        setRemarksInput(!remarksInput)
    }
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess)
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [trainingEmployees, setTrainingEmployees] = useState(null);

    const makeRequest = () => {
        dispatch(setSmallLoading(true))
        axios.patch(`${process.env.REACT_APP_BACKEND_URL}/update-training-status`, dataToSend).then((res) => {
           dispatch(setSmallLoading(false))
            setDataToSend(null);
            Swal.fire({
                title: 'Success',
                text: 'Submitted Successfully',
                icon: 'success',
                confirmButtonText: 'Go!',

            }).then((result) => {
                if (result.isConfirmed) {
                    dispatch(updateTabData({...tabData, Tab : 'Pending Tasks'}));
                }
            })

        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })

    }

    const [showBox, setShowBox] = useState(false);
    const [popUpData, setPopUpData] = useState(null);


    const [idForRemarks, setIdForRemarks] = useState(null);

    const [dataToSend, setDataToSend] = useState([]);

    useEffect(() => {
        console.log('changed : ' + dataToSend);
    }, [dataToSend])

    var trainerFormData = [

    ];

    function trainingIdIndex(array) {

        return (array.indexOf(array.find((data) => data.Training === idToWatch)) || null)


    }

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);

    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);


    }


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = trainingToShow?.Employee?.filter((obj) =>

                obj.EmployeeName.includes(event.target.value) || obj.EmployeeCode.includes(event.target.value)
            )
            console.log(searchedList);
            setTrainingEmployees(searchedList);
        } else {
            setTrainingEmployees(trainingToShow?.Employee)
        }
    }

    useEffect(() => {

        setTrainingEmployees(trainingToShow?.Employee?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const handleDataChange = (event, employeeId) => {
        if (dataToSend) {

            trainerFormData = dataToSend;
        }
        const existEmployeeIndex = trainerFormData.findIndex(obj => obj.EmployeeId === employeeId);

        const Name = event.target.name

        if (existEmployeeIndex !== -1) {
            // obj found


            if (Name === 'IsPass' || Name === 'IsPresent') {
                trainerFormData[existEmployeeIndex][Name] = event.target.checked;
            } else {
                trainerFormData[existEmployeeIndex][Name] = event.target.value;
            }

        } else {

            console.log("not found");
            if (Name === "IsPass") {
                trainerFormData.push({
                    EmployeeId: employeeId,
                    trainingId: idToWatch,
                    [Name]: event.target.checked,
                    IsPresent: false,
                })
            } else if (Name === "IsPresent") {
                trainerFormData.push({
                    EmployeeId: employeeId,
                    trainingId: idToWatch,
                    IsPass: false,
                    [Name]: event.target.checked
                })
            } else {

                trainerFormData.push({
                    EmployeeId: employeeId,
                    trainingId: idToWatch,
                    IsPass: false,
                    IsPresent: false,
                    Remarks: '',
                    [Name]: event.target.value
                })
            }
        }

        setDataToSend(trainerFormData)

    }




    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            const plannedTrainingsList = response.data.data;
            setTrainingToShow(plannedTrainingsList.find((training) => training._id === idToWatch));
            setTrainingEmployees(plannedTrainingsList.find((training) => training._id === idToWatch)?.Employee.slice(startIndex, endIndex))
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
                <form onSubmit={(event) => {
                    event.preventDefault();

                    alertManager();

                }}>

                    <div className={style.searchbar}>
                        <div className={style.sec1}>
                            <img src={Search} alt="" />
                            <input autoComplete='off' onChange={search} type="text" placeholder='Search Training by name' />
                        </div>
                        {!trainingEmployees || trainingEmployees?.length === 0 ? (
                            <>

                            </>
                        ) : (


                            <div >

                                {trainingToShow?.TrainingResultStatus !== "Conducted" && (
                                    <>

                                        <button type='submit' className={style.redtxtbtn}>Conduct Now</button>
                                    </>
                                )}
                            </div>
                        )}

                    </div>
                    <div className={style.tableParent}>
                        {!trainingEmployees || trainingEmployees?.length === 0 ? (
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
                                    {trainingToShow?.TrainingResultStatus === "Conducted" && (

                                        <td>Generate Certificate</td>
                                    )}
                                </tr>
                                {
                                    trainingEmployees?.map((employee, i) => {
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
                                                <td>{employee.EmployeeData[trainingIdIndex(employee.EmployeeData)]?.EmployeeResultStatus || "Pending"}</td>

                                                <td>
                                                    <label className={style.switch}>
                                                        {trainingToShow?.TrainingResultStatus === "Conducted" ? (
                                                            <input autoComplete='off' type="checkbox" checked={employee.EmployeeData[trainingIdIndex(employee.EmployeeData)]?.IsPass} />
                                                        ) : (

                                                            <input autoComplete='off' name='IsPass' type="checkbox" onChange={(event) => {
                                                                handleDataChange(event, employee._id)
                                                            }} />
                                                        )}
                                                        <span className={`${style.slider} ${style.round}`} ></span>
                                                    </label>
                                                </td>
                                                <td>
                                                    <label className={style.switch}>
                                                        {trainingToShow?.TrainingResultStatus === "Conducted" ? (
                                                            <input autoComplete='off' type="checkbox" checked={employee.EmployeeData[trainingIdIndex(employee.EmployeeData)]?.IsPresent} />
                                                        ) : (

                                                            <input autoComplete='off' name='IsPresent' type="checkbox" onChange={(event) => {
                                                                handleDataChange(event, employee._id)
                                                            }} />
                                                        )}
                                                        <span className={`${style.slider} ${style.round}`} ></span>
                                                    </label>
                                                </td>
                                                <td>
                                                    {trainingToShow?.TrainingResultStatus === "Conducted" ? (
                                                        <>
                                                            {employee.EmployeeData[trainingIdIndex(employee.EmployeeData)]?.Marks}
                                                        </>

                                                    ) : (


                                                        <input autoComplete='off' placeholder='Give marks' name='Marks' style={{
                                                            width: "100px"
                                                        }} type='number' onChange={(event) => {
                                                            handleDataChange(event, employee._id);
                                                        }} required />

                                                    )}
                                                </td>
                                                <td>
                                                    {trainingToShow?.TrainingResultStatus === "Conducted" ? (
                                                        <p onClick={() => {
                                                            setPopUpData(employee.EmployeeData[trainingIdIndex(employee.EmployeeData)]?.Remarks || "No Remarks Given");
                                                            setShowBox(true)
                                                            console.log(employee)

                                                        }} className={style.btn}>View</p>
                                                    ) : (

                                                        <p onClick={() => {
                                                            setDataToSend(trainerFormData);
                                                            setIdForRemarks(employee._id);
                                                            showRemarksInput();

                                                        }} className={style.btn}>Add Remarks</p>
                                                    )}
                                                </td>
                                                {trainingToShow?.TrainingResultStatus === "Conducted" && (

                                                    <td>
                                                        <p className={style.btn}>Click Here</p>
                                                    </td>
                                                )}
                                            </tr>
                                        )

                                    })
                                }
                            </table>
                        )}
                    </div>
                </form>

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
                remarksInput ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <textarea cols={55} rows={3} style={{
                                padding: "5px",
                                margin: "10px",
                                border: "none",

                            }} placeholder='Remarks Here..' name='Remarks' type='text' onChange={(event) => {
                                trainerFormData = dataToSend;
                                handleDataChange(event, idForRemarks);


                            }} />
                            <div >

                                <button onClick={() => {

                                    showRemarksInput();

                                    console.log(trainerFormData);
                                }} className={style.btn2}>Add</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest()


                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cencel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                showBox ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                        <div className='overflow-y-handler'>
                            <p class={style.msg}>{popUpData}</p>
                        </div>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={() => {
                                    setShowBox(false);

                                }
                                } className={style.btn1}>Close</button>




                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default MainForTrainerPortal
