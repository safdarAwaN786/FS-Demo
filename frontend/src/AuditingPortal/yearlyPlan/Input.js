import style from './Input.module.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setLoading } from '../../redux/slices/loading'


function AddAuditingYearlyPlan() {


    const [dataToSend, setDataToSend] = useState(null)
    const months = ["January", "Febraury", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [year, setYear] = useState(null);

    const [processes, setProcesses] = useState(null);

    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [selectionError, setSelectionError] = useState(false);
    const [yearlyPlanData, setYearlyPlanData] = useState({
        Year: '',
        Selected: []
    })

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    // var yearlyPlanData = {
    //     Year: year,
    //     Selected: [
    //         // {
    //         //     Training: "",
    //         //     WeekNumbers: []
    //         // }
    //     ]

    // }


    const [showBox, setShowBox] = useState(false)
    const [popUpData, setPopUpData] = useState(null);

    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }


    const handleCheckbox = (event, Process, Risk) => {
        const monthName = event.target.value;


        const processesArray = yearlyPlanData.Selected;

        const existingProcessIndex = processesArray.findIndex(obj => obj.Process === Process);


        if (existingProcessIndex !== -1) {
            // obj found..
            const monthExist = processesArray[existingProcessIndex].monthNames.includes(monthName);
            if (monthExist) {
                const monthNameIndex = processesArray[existingProcessIndex].monthNames.indexOf(monthName);

                if (monthNameIndex !== -1) {
                    processesArray[existingProcessIndex].monthNames.splice(monthNameIndex, 1);
                }
            } else {
                processesArray[existingProcessIndex].monthNames.push(monthName);
            }
        } else {
            processesArray.push({
                Process: Process,
                Risk: Risk,
                monthNames: [monthName]
            })

        }






        for (let index = 0; index < processesArray.length; index++) {
            if (processesArray[index].monthNames.length === 0) {
                console.log("length zero");
                const emptyProcessIndex = processesArray.indexOf(processesArray[index]);
                console.log(emptyProcessIndex);
                processesArray.splice(emptyProcessIndex, 1);
            }

        }


        setYearlyPlanData({ ...yearlyPlanData, Selected: processesArray })




    }
    const [allDataArr, setAllDataArr] = useState(null);

    useEffect(() => {
        console.log(yearlyPlanData);
    }, [yearlyPlanData])
    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readProcess`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setProcesses(response.data.data.slice(startIndex, endIndex));
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
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

        setProcesses(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const makeRequest = () => {
        if (dataToSend.Year !== '' && dataToSend.Selected.lenght !== 0) {
            dispatch(setLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addYearlyAuditPlan`, dataToSend, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                setDataToSend(null);
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Yearly Plan A' }))
                    }
                })
            }).catch((error) => {
                dispatch(setLoading(false))
                if (error.response.status === 303) {

                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: error.response.data.message,
                        confirmButtonText: 'OK.'

                    })
                } else {

                    Swal.fire({
                        icon: 'error',
                        title: 'OOps..',
                        text: 'Something went wrong, Try Again!'
                    })

                }
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

            <div className={style.subparent}>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    console.log(yearlyPlanData)
                    if (yearlyPlanData.Selected.length !== 0) {


                        let hasError = false; // Initialize a variable to track errors

                        for (let i = 0; i < yearlyPlanData.Selected.length; i++) {
                            if (yearlyPlanData.Selected[i].Risk === 'High' && yearlyPlanData.Selected[i].monthNames.length !== 3) {
                                hasError = true; // Set the error flag to true
                            } else if (yearlyPlanData.Selected[i].Risk === 'Medium' && yearlyPlanData.Selected[i].monthNames.length !== 2) {
                                hasError = true; // Set the error flag to true
                            } else if (yearlyPlanData.Selected[i].Risk === 'Low' && yearlyPlanData.Selected[i].monthNames.length !== 1) {
                                hasError = true; // Set the error flag to true
                            }
                        }

                        if (!hasError) {
                            // No errors, proceed with your logic
                            alertManager();
                            setDataToSend(yearlyPlanData)
                        } else {
                            // There are errors
                            setSelectionError(true);
                        }
                    } else {
                        setPopUpData("No week selected. Kindly select some weeks.!")
                        setShowBox(true);
                    }
                }}>
                    <div className='d-flex flex-row px-lg-5  px-2 mx-2 my-2'>
                        <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Yearly Plan A' }))
                            }
                        }} />

                    </div>

                    <div className={`${style.searchbar} mt-1 `}>
                        <div className={style.sec1}>

                            <select className='bg-body-secondary px-2' onChange={(event) => {
                                console.log(event.target.value)
                                setYearlyPlanData({ ...yearlyPlanData, Year: event.target.value });

                            }} style={{
                                width: "200px",
                                border: 'none',
                                borderRadius: '50px'
                            }} name='Year' required>

                                <option value="" disabled selected>Select Year</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>


                            </select>



                        </div>

                    </div>

                    <div className={style.tableParent2}>
                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Process Name</td>
                                {months.map((month) => {
                                    return (

                                        <td>{month}</td>
                                    )
                                })}

                            </tr>
                            {
                                processes?.map((process, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td>
                                                <p>{process.ProcessName} ( {process.ProcessRiskAssessment} ) </p>
                                            </td>

                                            {months.map((month) => {
                                                return (
                                                    <td>
                                                        <input onChange={(event) => {
                                                            handleCheckbox(event, process._id, process.ProcessRiskAssessment)
                                                        }} value={month} type="checkbox" />
                                                    </td>
                                                )
                                            })}

                                        </tr>
                                    )

                                })
                            }
                        </table>
                    </div>






                    <div className={style.btn}>
                        <button onClick={() => {
                            setDataToSend(yearlyPlanData);

                        }} type='submit' >Submit</button>
                    </div>



                </form>
                {/* <div className={style.Btns}>
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
                    </div> */}
                {/* <BackBtn /> */}
            </div>
            {/* </div > */}

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest();

                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                showBox ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setShowBox(false)
                                    setPopUpData(null);

                                }
                                } className={style.btn1}>Ok.</button>



                            </div>
                        </div>
                    </div> : null
            }
            {
                selectionError ?
                    <div class={style.alertparent}>
                        <div class={style.alert2}>
                            <p class={style.msg}>Kindly select the plan according to Risk Assessment :</p>
                            <p class={style.msg}>High : Exactly 3 months should choosen</p>
                            <p class={style.msg}>Medium : Exactly 2 months should choosen</p>
                            <p class={style.msg}>Low : Exactly 1 months should choosen</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setSelectionError(false);
                                    setalert(false);
                                }
                                } className={style.btn1}>Ok.</button>



                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default AddAuditingYearlyPlan
