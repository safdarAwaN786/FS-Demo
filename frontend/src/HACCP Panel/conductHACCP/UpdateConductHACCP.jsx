
import style from './AddHACCPRiskAssessment.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function UpdateConductHACCP() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [teamsToShow, setTeamsToShow] = useState(null);
    const [processesToShow, setProcessesToShow] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [selectedProcess, setSelectedProcess] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
            if (processesToShow && teamsToShow) {
                dispatch(setSmallLoading(false))
            }
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-approved-haccp-teams`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setTeamsToShow(response.data.data);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-processes`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setProcessesToShow(response.data.data);
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

    const idToWatch = useSelector(state => state.idToProcess);
    useEffect(() => {
        if (teamsToShow?.length === 0) {
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon: 'warning',
                title: 'OOps..',
                text: 'No, Any team available!'
            })
        } else if (processesToShow?.length === 0) {
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon: 'warning',
                title: 'OOps..',
                text: 'No, Any Process available!'
            })
        }
    }, [teamsToShow, processesToShow])

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-conduct-haccp/${idToWatch}`).then((res) => {
            setDataToSend(res.data.data);
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

    useEffect(() => {
        if (selectedProcess) {
            let hazardsArray = []
            console.log(selectedProcess);
            selectedProcess.ProcessDetails?.map((processObj) => {
                const { _id, subProcesses, ...rest } = processObj; // Extract _id property
                hazardsArray.push({ ...rest, type: 'Biological', Process: processObj._id });
                hazardsArray.push({ ...rest, type: 'Chemical', Process: processObj._id });
                hazardsArray.push({ ...rest, type: 'Physical', Process: processObj._id });
                hazardsArray.push({ ...rest, type: 'Halal', Process: processObj._id });
                hazardsArray.push({ ...rest, type: 'Allergen', Process: processObj._id });

                if (processObj.subProcesses?.length > 0) {
                    processObj.subProcesses.map((subProcess) => {
                        const { _id, subProcesses, ...rest } = subProcess; // Extract _id property
                        hazardsArray.push({ ...rest, type: 'Biological', Process: subProcess._id });
                        hazardsArray.push({ ...rest, type: 'Chemical', Process: subProcess._id });
                        hazardsArray.push({ ...rest, type: 'Physical', Process: subProcess._id });
                        hazardsArray.push({ ...rest, type: 'Halal', Process: subProcess._id });
                        hazardsArray.push({ ...rest, type: 'Allergen', Process: subProcess._id });
                    })
                }

            })
            setDataToSend({ ...dataToSend, Hazards: hazardsArray })
        }
    }, [selectedProcess])

    useEffect(() => {
        console.log(dataToSend);
    }, [dataToSend])


    const makeRequest = () => {
        if (dataToSend) {
            dispatch(setSmallLoading(true))
            axios.put(`${process.env.REACT_APP_BACKEND_URL}/update-conduct-haccp/${idToWatch}`, { ...dataToSend, updatedBy: user.Name }).then(() => {
                setDataToSend(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Conduct Risk Assessment' }))
                    }
                })
            }).catch((error) => {
                if (error.response.status === 401) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: error.response.data.message,
                        confirmButtonText: 'OK.'
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                        confirmButtonText: 'OK.'
                    })
                }
            }).finally(() => {
                dispatch(setSmallLoading(false))
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
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Conduct Risk Assessment' }))
                                }
                            }} />

                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Conduct HACCP Risk assessment
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();
                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>
                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Type</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <select className='form-select  form-select-lg' name='DocumentType' value={dataToSend?.DocumentType} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value, });
                                            }} style={{ width: "100%" }} required >
                                                <option value="Manuals">Manuals</option>
                                                <option value="Procedures">Procedures</option>
                                                <option value="SOPs">SOPs</option>
                                                <option value="Forms">Forms</option>
                                            </select>
                                        </div>
                                    </div>

                                    {teamsToShow?.length > 0 && (
                                        <div className='w-75 mx-4 d-flex flex-column justify-content-start'>
                                            <div className={style.para}>
                                                <p>Select Teams</p>
                                            </div>
                                            {teamsToShow?.map((team) => {
                                                return (
                                                    <div className='d-flex flex-row '>
                                                        <input autoComplete='off' checked={dataToSend?.Teams?.includes(team._id)} onChange={(e) => {
                                                            const updatedTeams = dataToSend?.Teams || [];
                                                            if (e.target.checked) {
                                                                updatedTeams.push(team._id);
                                                                setDataToSend({ ...dataToSend, Teams: updatedTeams })
                                                            } else {
                                                                setDataToSend({ ...dataToSend, Teams: updatedTeams.filter((teamId) => teamId !== teamId) })
                                                            }
                                                        }} className='m-1' type='checkbox' />
                                                        <p style={{
                                                            fontFamily: 'Inter'
                                                        }}>{team.DocumentId}</p>
                                                    </div>
                                                )

                                            })}


                                        </div>
                                    )}
                                </div>



                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>

                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <select className='form-select  form-select-lg' name='Department' value={dataToSend?.Department.DepartmentName} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} style={{ width: "100%" }} required>
                                                {/* <option value="" selected disabled>Choose Department</option> */}

                                                {departmentsToShow?.map((depObj) => {
                                                    return (
                                                        <option value={depObj._id}>{depObj.DepartmentName}</option>
                                                    )
                                                })}

                                            </select>


                                        </div>
                                    </div>
                                    {processesToShow?.length > 0 && (

                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p>Process</p>
                                            </div>
                                            <div style={{
                                                border: '1px solid silver'
                                            }}>
                                                <select className='form-select  form-select-lg' name='Process' value={dataToSend?.Process?.ProcessName} onChange={(e) => {
                                                    setSelectedProcess(JSON.parse(e.target.value))
                                                    setDataToSend({ ...dataToSend, [e.target.name]: JSON.parse(e.target.value)._id });
                                                }} style={{ width: "100%" }} required>
                                                    {/* <option value="" selected disabled>Choose Process</option> */}
                                                    {processesToShow?.map((processDoc) => (

                                                        <option value={JSON.stringify(processDoc)}>{processDoc.ProcessName}</option>


                                                    ))}
                                                </select>


                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {dataToSend?.Hazards?.map((hazard, index) => {
                                return (
                                    <>
                                        <div className={`${style.headers2} d-flex justify-content-start ps-3 mt-4 align-items-center `}>
                                            <div className={style.spans}>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                            <div className={`${style.heading} ms-3 `}>
                                                {hazard.Process.ProcessNum}) {hazard?.Process.Name}
                                            </div>
                                        </div>
                                        <div className='bg-white p-4 mx-lg-5 mx-2'>

                                            <div className='bg-light p-4 my-4'>
                                                <div className='d-flex justify-content-end'>
                                                    <div className={style.colorBox}>
                                                        <span className={`${hazard.SignificanceLevel < 5
                                                            ? 'bg-success'
                                                            : hazard.SignificanceLevel > 4 &&
                                                                hazard.SignificanceLevel < 15
                                                                ? 'bg-primary'
                                                                : hazard.SignificanceLevel > 14
                                                                    ? 'bg-danger'
                                                                    : ''
                                                            }`} style={{
                                                                display: 'block',
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '20px'
                                                            }}></span>
                                                    </div>
                                                </div>
                                                <h4 style={{
                                                    fontFamily: 'Inter'
                                                }} className='text-center'>{hazard.type} Hazard</h4>

                                                <div className='row'>
                                                    <div className='col-lg-6 col-md-12 p-2'>
                                                        <textarea value={hazard.Description} onChange={(e) => {
                                                            const updatedHazards = [...dataToSend.Hazards]
                                                            updatedHazards[index][e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Hazards: updatedHazards })
                                                        }} rows={3} type='text' name='Description' className='w-100 p-2 my-3  border-0' placeholder='Description' required />
                                                        <input autoComplete='off' value={hazard.ControlMeasures} onChange={(e) => {
                                                            const updatedHazards = [...dataToSend.Hazards]
                                                            updatedHazards[index][e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Hazards: updatedHazards })
                                                        }} type='text' name='ControlMeasures' placeholder='Control Measurres' className='w-100 p-2 my-3  border-0' required />
                                                    </div>
                                                    <div className='col-lg-6 col-md-12 p-2'>
                                                        <select value={hazard?.Occurence} onChange={(e) => {
                                                            const updatedHazards = [...dataToSend.Hazards]

                                                            updatedHazards[index][e.target.name] = e.target.value;
                                                            if (updatedHazards[index].Severity) {
                                                                updatedHazards[index].SignificanceLevel = updatedHazards[index].Severity * updatedHazards[index].Occurence;
                                                            }
                                                            setDataToSend({ ...dataToSend, Hazards: updatedHazards });
                                                        }} className='p-2 my-2 w-100 border-0' name='Occurence' style={{ width: "100%" }} required>



                                                            <option value={1}>1</option>
                                                            <option value={2}>2</option>
                                                            <option value={3}>3</option>
                                                            <option value={4}>4</option>
                                                            <option value={5}>5</option>

                                                        </select>
                                                        <select value={hazard?.Severity} onChange={(e) => {
                                                            const updatedHazards = [...dataToSend.Hazards]

                                                            updatedHazards[index][e.target.name] = e.target.value;
                                                            if (updatedHazards[index].Occurence) {
                                                                updatedHazards[index].SignificanceLevel = updatedHazards[index].Severity * updatedHazards[index].Occurence;
                                                            }
                                                            setDataToSend({ ...dataToSend, ProcessHazards: updatedHazards })
                                                        }} className='p-2 my-3 w-100 border-0' name='Severity' style={{ width: "100%" }} required>



                                                            <option value={1}>1</option>
                                                            <option value={2}>2</option>
                                                            <option value={3}>3</option>
                                                            <option value={4}>4</option>
                                                            <option value={5}>5</option>

                                                        </select>
                                                        <input autoComplete='off' type='number' value={dataToSend?.Hazards[index].SignificanceLevel} placeholder='Significance Score (Occurence x Severity)' className='w-100 p-2 my-3  border-0' readOnly />

                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    </>
                                )
                            })}




                        </div>


                        <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-between`}>
                            <div className={style.inputParent}>
                                <div className={style.para}>
                                    <p></p>
                                </div>
                                <div className='border w-50 border-dark-subtle'>
                                    <select className='w-100' name='Department'  >
                                        <option value="" selected >Added Team Members</option>

                                        {dataToSend?.Members?.map((member) => {

                                            return (

                                                <option disabled>{member.Name}</option>
                                            )
                                        })}


                                    </select>


                                </div>
                            </div>
                            <button type='submit' >Submit</button>
                        </div>
                    </form>
                </div>
            </div>
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest();
                                }} className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default UpdateConductHACCP
