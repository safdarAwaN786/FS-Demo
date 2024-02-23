
import style from './AddFoodSafetyPlan.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function AddFoodSafetyPlan() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [treesToShow, setTreesToShow] = useState(null);
    const [selectedDecisionTree, setSelectedDecisionTree] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])



    useEffect(()=>{
        if(departmentsToShow && treesToShow){
            dispatch(setSmallLoading(false))
        } else {
            dispatch(setSmallLoading(false));
        }
    }, [departmentsToShow, treesToShow])

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-approved-decision-trees`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setTreesToShow(response.data.data);
            if(response.data.data.length === 0){
                Swal.fire({
                    icon: 'warning',
                    title: 'OOps..',
                    text: 'No, Any Decision Tree available!'
                })
            }
            console.log(response.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])

    useEffect(() => {
        let CCPDecisions = [];
        if (selectedDecisionTree) {
            console.log(selectedDecisionTree);
            selectedDecisionTree.Decisions.map((decisoinObj) => {
                if (decisoinObj.Q2 === true || decisoinObj.Q4 !== null) {
                    console.log(decisoinObj);
                    const { _id, ...rest } = decisoinObj;
                    CCPDecisions.push({ ...rest, Decision: decisoinObj._id });
                }
            })
            setDataToSend({ ...dataToSend, Plans: CCPDecisions })
        }
    }, [selectedDecisionTree])

    const makeRequest = () => {
        if (dataToSend.Plans?.length > 0) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-food-safety`, {...dataToSend, createdBy : user.Name}, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                console.log("request made !");
                setDataToSend(null);
                dispatch(setSmallLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Generate Food Safety Plan' }))
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
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Kindly Select at least one Member !',
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
                                    dispatch(updateTabData({ ...tabData, Tab: 'Generate Food Safety Plan' }))
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
                            Generate Food Safety Plan
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
                                            <select className='form-select  form-select-lg' onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }}
                                                value={dataToSend?.DocumentType} name='DocumentType' style={{ width: "100%" }} required >
                                                <option value="" selected disabled>Choose Type</option>
                                                <option value="Manuals">Manuals</option>
                                                <option value="Procedures">Procedures</option>
                                                <option value="SOPs">SOPs</option>
                                                <option value="Forms">Forms</option>

                                            </select>
                                        </div>
                                    </div>
                                    
                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <select className='form-select  form-select-lg' value={dataToSend?.Department} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='Department' style={{ width: "100%" }} required>
                                                <option value="" selected disabled>Choose Department</option>
                                                {departmentsToShow?.map((depObj) => {
                                                    return (
                                                        <option value={depObj._id}>{depObj.DepartmentName}</option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                    {treesToShow?.length > 0 && (
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p>Plan for Decisoions of :</p>
                                            </div>
                                            <div style={{
                                                border: '1px solid silver'
                                            }}>
                                                <select value={selectedDecisionTree?.ConductHaccp.Name} name='Process' onChange={(e) => {
                                                    const decisionTreeObj = JSON.parse(e.target.value);
                                                    setSelectedDecisionTree(decisionTreeObj);
                                                    setDataToSend({ ...dataToSend, DecisionTree: decisionTreeObj._id });
                                                }} style={{ width: "100%" }} required>
                                                    <option value="" selected disabled>Choose Decisions for Hazards of</option>
                                                    {treesToShow?.map((obj) => (
                                                        <option value={JSON.stringify(obj)}>{obj.ConductHaccp.Process?.ProcessName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {dataToSend?.Plans?.map((plan, index) => {
                                return (
                                    <>
                                        <div className={`bg-danger flex-cloumn row mx-lg-4 mx-md-3 mx-1 mt-4 py-3  `}>
                                            <div className={`${style.heading}  col-lg-6 col-md-6 col-12`}>
                                                ({plan.Hazard.Process.ProcessNum}) {plan.Hazard.Process.Name}
                                            </div>
                                            <div className={`${style.heading} col-lg-6 col-md-6 col-12 d-flex justify-content-end pe-3`}>
                                                {plan.Hazard.type} Hazard
                                            </div>
                                        </div>
                                        <div className='bg-white  mx-lg-4 mx-md-3 mx-1 p-3'>
                                            <div className='row '>

                                                <div className='p-3 col-lg-6 col-md-6 col-12'>

                                                    <textarea value={plan?.HazardToControl} onChange={(e) => {
                                                        const updatedCCPHazard = dataToSend.Plans || [];
                                                        updatedCCPHazard[index][e.target.name] = e.target.value;
                                                        setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                    }} name='HazardToControl' rows={3} placeholder='hazard to Control  ' className='my-4 p-2 bg-light w-100 mx-2 border-0' required/>
                                                </div>
                                                <div className='p-3 col-lg-6 col-md-6 col-12'>
                                                    <textarea value={plan.ControlMeasures} onChange={(e) => {
                                                        const updatedCCPHazard = dataToSend.Plans || [];
                                                        updatedCCPHazard[index][e.target.name] = e.target.value;
                                                        setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                    }} name='ControlMeasures' rows={3} placeholder='Control Measures ' className='my-4 p-2 bg-light w-100 mx-2 border-0' required/>
                                                </div>
                                            </div>

                                            <div className='bg-light p-2 my-4'>

                                                <h4 style={{
                                                    fontFamily: 'Inter'
                                                }} className='text-center'>Process Limit</h4>

                                                <div className='row'>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan.ProcessLimit?.TargetRange} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].ProcessLimit) {
                                                                updatedCCPHazard[index].ProcessLimit = {};
                                                            }
                                                            updatedCCPHazard[index].ProcessLimit[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='TargetRange' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='Target Range' required/>
                                                        <textarea value={plan.ProcessLimit?.CriticalCtrlPoint} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].ProcessLimit) {
                                                                updatedCCPHazard[index].ProcessLimit = {};
                                                            }
                                                            updatedCCPHazard[index].ProcessLimit[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='CriticalCtrlPoint' rows={3} type='text' placeholder='Critical Control Area' className='w-100 p-2 my-3  border-0' required/>
                                                    </div>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>

                                                        <textarea value={plan.ProcessLimit?.ActionPoint} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].ProcessLimit) {
                                                                updatedCCPHazard[index].ProcessLimit = {};
                                                            }
                                                            updatedCCPHazard[index].ProcessLimit[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                        }} name='ActionPoint' rows={3} type='text' placeholder='Action point' className='w-100 p-2 my-3  border-0' required/>

                                                    </div>

                                                </div>
                                            </div>

                                            <textarea value={plan.JustificationLink} onChange={(e) => {
                                                const updatedCCPHazard = dataToSend.Plans || [];
                                                updatedCCPHazard[index][e.target.name] = e.target.value;
                                                setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                            }} name='JustificationLink' rows={3} placeholder='Justification link for CCP ' className='my-4 p-2 bg-light w-100 mx-2 border-0' required/>

                                            <div className='bg-light p-2 my-4'>

                                                <h4 style={{
                                                    fontFamily: 'Inter'
                                                }} className='text-center'>Monitoring Point</h4>

                                                <div className='row'>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan.MonitoringPlan?.Who} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].MonitoringPlan) {
                                                                updatedCCPHazard[index].MonitoringPlan = {};
                                                            }
                                                            updatedCCPHazard[index].MonitoringPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                        }} name='Who' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='Who' required/>
                                                        <textarea value={plan.MonitoringPlan?.What} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].MonitoringPlan) {
                                                                updatedCCPHazard[index].MonitoringPlan = {};
                                                            }
                                                            updatedCCPHazard[index].MonitoringPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                        }} name='What' rows={3} type='text' placeholder='What' className='w-100 p-2 my-3  border-0' required/>
                                                    </div>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan?.MonitoringPlan?.When} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].MonitoringPlan) {
                                                                updatedCCPHazard[index].MonitoringPlan = {};
                                                            }
                                                            updatedCCPHazard[index].MonitoringPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='When' rows={3} type='text' placeholder='When' className='w-100 p-2 my-3  border-0' required/>
                                                        <textarea value={plan?.MonitoringPlan?.How} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];
                                                            if (!updatedCCPHazard[index].MonitoringPlan) {
                                                                updatedCCPHazard[index].MonitoringPlan = {};
                                                            }
                                                            updatedCCPHazard[index].MonitoringPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                        }} name='How' rows={3} type='text' placeholder='How' className='w-100 p-2 my-3  border-0' required/>

                                                    </div>

                                                </div>
                                            </div>

                                            <textarea value={plan?.CorrectiveAction} onChange={(e) => {
                                                const updatedCCPHazard = dataToSend.Plans || [];
                                                updatedCCPHazard[index][e.target.name] = e.target.value;
                                                setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                            }} name='CorrectiveAction' rows={3} placeholder='Corrective Action' className='my-4 p-2 bg-light w-100 mx-2 border-0' required/>

                                            <div className='bg-light p-2 my-4'>

                                                <h4 style={{
                                                    fontFamily: 'Inter'
                                                }} className='text-center'>Verfification Plan</h4>

                                                <div className='row'>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan.VerificationPlan?.Who} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].VerificationPlan) {
                                                                updatedCCPHazard[index].VerificationPlan = {};
                                                            }
                                                            updatedCCPHazard[index].VerificationPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='Who' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='Who' required/>
                                                        <textarea value={plan?.VerificationPlan?.What} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].VerificationPlan) {
                                                                updatedCCPHazard[index].VerificationPlan = {};
                                                            }
                                                            updatedCCPHazard[index].VerificationPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='What' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='What' required/>

                                                    </div>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan?.VerificationPlan?.When} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].VerificationPlan) {
                                                                updatedCCPHazard[index].VerificationPlan = {};
                                                            }
                                                            updatedCCPHazard[index].VerificationPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='When' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='When' required/>
                                                        <textarea value={plan?.VerificationPlan?.How} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].VerificationPlan) {
                                                                updatedCCPHazard[index].VerificationPlan = {};
                                                            }
                                                            updatedCCPHazard[index].VerificationPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='How' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='How' required/>


                                                    </div>

                                                </div>
                                            </div>

                                            <div className='row '>

                                                <div className='p-3 col-lg-6 col-md-6 col-12'>

                                                    <textarea value={plan?.MonitoringRef} onChange={(e) => {
                                                        const updatedCCPHazard = dataToSend.Plans || [];


                                                        updatedCCPHazard[index][e.target.name] = e.target.value;
                                                        setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                    }} name='MonitoringRef' rows={3} placeholder='Monitoring record refrence' className='my-4 p-2 bg-light w-100 mx-2 border-0' required/>
                                                </div>
                                                <div className='p-3 col-lg-6 col-md-6 col-12'>


                                                    <textarea value={plan?.VerificationRef} onChange={(e) => {
                                                        const updatedCCPHazard = dataToSend.Plans || [];
                                                        updatedCCPHazard[index][e.target.name] = e.target.value;
                                                        setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                    }} name='VerificationRef' rows={3} placeholder='Verification record refrence' className='my-4 p-2 bg-light w-100 mx-2 border-0' required/>
                                                </div>
                                            </div>


                                        </div>



                                    </>
                                )
                            })}



                        </div>


                        <div className={style.btn}>
                            <button type='submit' >Submit</button>
                        </div>
                    </form>
                </div>
            </div>
            {
                alert ?
                    <div class={style.alertparent} >
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest();

                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cencel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default AddFoodSafetyPlan
