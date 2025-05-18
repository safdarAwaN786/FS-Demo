import style from './AssignTrainings.module.css'
import search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import profile from '../../assets/images/addEmployee/prof.svg'
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'

function AssignTrainings() {
    const [employeesToShow, setEmployeesToShow] = useState(null);
    const [plannedTraining, setPlannedTraining] = useState(null);
    const [reqIds, setReqIds] = useState({
        monthlyId: "",
        employeeIds: []
    });
    // Track selected employees with a state object
    const [selectedEmployees, setSelectedEmployees] = useState({});
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);
    const idToWatch = useSelector(state => state.idToProcess);
    const user = useSelector(state => state.auth.user);
    
    // For search functionality
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            const plannedTrainingsList = response.data.data;
            setPlannedTraining(plannedTrainingsList.find((training) => training._id === idToWatch))
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

    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);

    const [allDataArr, setAllDataArr] = useState(null);
    const [filteredData, setFilteredData] = useState(null);

    useEffect(() => {
        if (plannedTraining !== null) {
            dispatch(setSmallLoading(true))
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/readEmployee`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
                const allEmployees = response.data.data;
                dispatch(setSmallLoading(false))
                setAllDataArr(allEmployees);
                setFilteredData(allEmployees);
                setEmployeesToShow(allEmployees?.slice(startIndex, endIndex));
            }).catch(err => {
                dispatch(setSmallLoading(false));
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'Something went wrong, Try Again!'
                })
            })
        }
        setReqIds({ ...reqIds, monthlyId: plannedTraining?._id })
    }, [plannedTraining])
    
    const [dataToSend, setDataToSend] = useState(null);

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setEmployeesToShow(filteredData?.slice(startIndex, endIndex))
    }, [startIndex, endIndex, filteredData])

    // Handle search functionality
    useEffect(() => {
        if (allDataArr) {
            if (searchQuery.trim() === '') {
                setFilteredData(allDataArr);
            } else {
                const filtered = allDataArr.filter(employee => 
                    employee.Name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setFilteredData(filtered);
                setStartIndex(0);
                setEndIndex(8);
            }
        }
    }, [searchQuery, allDataArr]);

    const handleCheckboxChange = (employeeID) => {
        // Update the selected employees state
        setSelectedEmployees(prev => ({
            ...prev,
            [employeeID]: !prev[employeeID]
        }));
        
        // Update the reqIds state
        const updatedEmployeeIds = [...reqIds.employeeIds];
        if (updatedEmployeeIds.includes(employeeID)) {
            const indexofId = updatedEmployeeIds.indexOf(employeeID);
            updatedEmployeeIds.splice(indexofId, 1);
        } else {
            updatedEmployeeIds.push(employeeID);
        }
        setReqIds({ ...reqIds, employeeIds: updatedEmployeeIds });
    }

    const makeRequest = () => {
        if (dataToSend) {
            dispatch(setSmallLoading(true))
            axios.patch(`${process.env.REACT_APP_BACKEND_URL}/assignEmployee`, dataToSend).then((res) => {
                dispatch(setSmallLoading(false))
                setDataToSend(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Training Record' }));
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
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Try filling data again',
                confirmButtonText: 'OK.'
            })
        }
    }

    return (
        <>
            <div className='d-flex flex-row mt-5 px-lg-5 px-3'>
                <BsArrowLeftCircle 
                    role='button' 
                    className='fs-4 mt-1 text-danger' 
                    onClick={() => {
                        dispatch(updateTabData({ ...tabData, Tab: 'Training Record' }))
                    }} 
                />
            </div>
            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={search} alt="" />
                    <input 
                        autoComplete='off' 
                        type="text" 
                        placeholder='Search by name' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {reqIds.employeeIds?.length !== 0 && (
                    <div 
                        onClick={() => {
                            setDataToSend(reqIds);
                            alertManager();
                        }} 
                        className={style.sec2}
                    >
                        <p>Assign Training</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent2}>
                {!employeesToShow || employeesToShow?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No Records Available</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <thead>
                            <tr className={style.headers}>
                                <td></td>
                                <td>Employee Code</td>
                                <td>Name</td>
                                <td>CNIC</td>
                                <td>Phone Number</td>
                                <td>Email</td>
                            </tr>
                        </thead>
                        <tbody>
                            {employeesToShow?.map((employee, i) => {
                                return (
                                    <tr className={style.tablebody} key={employee._id}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedEmployees[employee._id] || false}
                                                onChange={() => handleCheckboxChange(employee._id)} 
                                            />
                                        </td>
                                        <td className={style.textStyle1}>
                                            <p>{employee.UserId}</p>
                                        </td>
                                        <td className={style.textStyle2}>
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
                                                }} src={employee.EmployeeImage || profile} onError={(e) => {
                                                    e.target.style.display = 'none'
                                                }} alt="" />
                                            </div>
                                            {employee.Name}
                                        </td>
                                        <td className={style.textStyle2}>{employee.CNIC}</td>
                                        <td className={style.textStyle2}>{employee.PhoneNumber}</td>
                                        <td className={style.textStyle3}>{employee.Email}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            <div className={style.Btns}>
                {startIndex > 0 && (
                    <button onClick={backPage}>
                        {'<< '}Back
                    </button>
                )}
                {filteredData?.length > endIndex && (
                    <button onClick={nextPage}>
                        next{'>> '}
                    </button>
                )}
            </div>

            {alert && (
                <div className={style.alertparent}>
                    <div className={style.alert}>
                        <p className={style.msg}>Do you want to submit this information?</p>
                        <div className={style.alertbtns}>
                            <button onClick={() => {
                                alertManager();
                                makeRequest();
                            }} className={style.btn1}>Submit</button>
                            <button onClick={alertManager} className={style.btn2}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default AssignTrainings