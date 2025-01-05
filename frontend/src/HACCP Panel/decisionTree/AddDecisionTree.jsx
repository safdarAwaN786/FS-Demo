import style from './AddDecisionTree.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function AddDecisionTree() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [allConductHaccps, setAllConductHaccps] = useState(null);
    const [selectedConductHaccp, setSelectedConductHaccp] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-approved-conduct-haccp`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllConductHaccps(response.data.data);
            if(response.data.data.length === 0){
                Swal.fire({
                    icon: 'warning',
                    title: 'OOps..',
                    text: 'No, Any Risk Assessment available!'
                })
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
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            console.log(err);
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])
    useEffect(() => {
        if (departmentsToShow && allConductHaccps) {
            dispatch(setSmallLoading(false))
        }
    }, [departmentsToShow, allConductHaccps])

    useEffect(() => {
        let redAndBlueHazards = [];
        if (selectedConductHaccp) {
            selectedConductHaccp.Hazards.map((hazardObj) => {
                if (hazardObj.SignificanceLevel > 4) {
                    const { _id, ...rest } = hazardObj;
                    redAndBlueHazards.push({ ...rest, Hazard: hazardObj._id });
                }
            })
            setDataToSend({ ...dataToSend, Decisions: redAndBlueHazards })
        }
    }, [selectedConductHaccp])

    const makeRequest = () => {
        if (dataToSend.Decisions.length > 0) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-decision-tree`, {...dataToSend, createdBy : user.Name}, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
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
                        dispatch(updateTabData({ ...tabData, Tab: 'Identify CCP/OPRP' }))
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
                text: 'Kindly answer at least one!',
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
                                    dispatch(updateTabData({ ...tabData, Tab: 'Identify CCP/OPRP' }))
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
                            Add Decison Tree for CCP/OPRP Selection
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
                                            <select className='form-select  form-select-lg' value={dataToSend?.DocumentType} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='DocumentType' style={{ width: "100%" }} required >
                                                <option value="" selected disabled>Choose Type</option>
                                                <option value="Manuals">Manuals</option>
                                                <option value="Procedures">Procedures</option>
                                                <option value="SOPs">SOPs</option>
                                                <option value="Forms">Forms</option>
                                            </select>
                                        </div>
                                    </div>

                                    {allConductHaccps?.length > 0 && (

                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p>Decision tree for Hazards of :</p>
                                            </div>
                                            <div style={{
                                                border: '1px solid silver'
                                            }}>
                                                <select className='form-select  form-select-lg' name='ConductHaccp' onChange={(e) => {
                                                    setDataToSend({ ...dataToSend, [e.target.name]: JSON.parse(e.target.value)._id });
                                                    setSelectedConductHaccp(JSON.parse(e.target.value))
                                                }} style={{ width: "100%" }} required >
                                                    <option value="" selected disabled>Choose Hazard of</option>
                                                    {allConductHaccps.map((obj) => (
                                                        <option value={JSON.stringify(obj)}>{obj.Process.ProcessName}</option>
                                                    ))}

                                                </select>

                                            </div>
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
                                            <select className='form-select  form-select-lg' name='Department' value={dataToSend?.Department} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} style={{ width: "100%" }} required>
                                                <option value="" selected disabled>Choose Department</option>
                                                {departmentsToShow?.map((depObj) => {
                                                    return (
                                                        <option value={depObj._id}>{depObj.DepartmentName}</option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {dataToSend?.Decisions?.map((decision, index) => {
                                return (
                                    <>
                                        <div className={`bg-danger row mx-lg-4 mx-md-3 mx-1 mt-4 py-3  `}>
                                            <div className=' col-lg-6 col-md-6 col-12'>
                                                <div className={`${style.heading} ms-3 `}>
                                                    {decision.Process.ProcessNum}: {decision.Process.Name}
                                                </div>
                                            </div>
                                            <div className='col-lg-6 col-md-6 col-12 d-flex justify-content-end pe-3'>
                                                <div className={`${style.heading} ms-3 `}>
                                                    {decision?.type} Hazard
                                                </div>
                                            </div>
                                        </div>
                                        <div className='bg-white  mx-lg-4 mx-md-3 mx-1 p-3'>

                                            <div className='d-flex justify-content-between'>
                                                <div>
                                                    <h5><b>Q1 : </b> Are Control Measures in place for the hazard ?</h5>
                                                </div>
                                                <div>
                                                    <span onClick={() => {
                                                        const updatedDecisions = [...dataToSend.Decisions];
                                                        updatedDecisions[index].Q1 = true;
                                                        updatedDecisions[index].Q1A = null;
                                                        updatedDecisions[index].Q2 = null;
                                                        updatedDecisions[index].Q3 = null;
                                                        updatedDecisions[index].Q4 = null;

                                                        setDataToSend({ ...dataToSend, Decisions: updatedDecisions })
                                                    }} className={`${style.answerSpan} ${decision.Q1 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                        Yes
                                                    </span>
                                                    <span onClick={() => {
                                                        const updatedDecisions = [...dataToSend.Decisions];
                                                        updatedDecisions[index].Q1 = false;
                                                        updatedDecisions[index].Q1A = null;
                                                        updatedDecisions[index].Q2 = null;
                                                        updatedDecisions[index].Q3 = null;
                                                        updatedDecisions[index].Q4 = null;

                                                        setDataToSend({ ...dataToSend, Decisions: updatedDecisions })

                                                    }} className={`${style.answerSpan} ${decision.Q1 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                        No
                                                    </span>
                                                </div>

                                            </div>
                                            {decision.Q1 === false && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 1A : </b> Is control at this step necessary ? </h5>
                                                    </div>
                                                    <div>
                                                        <span onClick={() => {
                                                            const updatedDecisions = [...dataToSend.Decisions];
                                                            updatedDecisions[index].Q1A = true;
                                                            updatedDecisions[index].Q2 = null;
                                                            updatedDecisions[index].Q3 = null;
                                                            updatedDecisions[index].Q4 = null;

                                                            setDataToSend({ ...dataToSend, Decisions: updatedDecisions })

                                                        }} className={`${style.answerSpan} ${decision.Q1A ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                            Yes

                                                        </span>
                                                        <span onClick={() => {
                                                            const updatedDecisions = [...dataToSend.Decisions];

                                                            updatedDecisions[index].Q1A = false;
                                                            updatedDecisions[index].Q2 = null;
                                                            updatedDecisions[index].Q3 = null;
                                                            updatedDecisions[index].Q4 = null;

                                                            setDataToSend({ ...dataToSend, Decisions: updatedDecisions })
                                                            setDataToSend({ ...dataToSend, Q1A: false, Q2: null, Q3: null, Q4: null })
                                                        }} className={`${style.answerSpan} ${decision.Q1A === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                            No
                                                        </span>
                                                    </div>

                                                </div>
                                            )}
                                            {(decision.Q1 === true || decision.Q1A === true) && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 2 : </b> Is this step specially designed to control the Hazard ?</h5>
                                                    </div>
                                                    <div>
                                                        <span onClick={() => {
                                                            const updatedDecisions = [...dataToSend.Decisions];

                                                            updatedDecisions[index].Q2 = true;
                                                            updatedDecisions[index].Q3 = null;
                                                            updatedDecisions[index].Q4 = null;

                                                            setDataToSend({ ...dataToSend, Decisions: updatedDecisions })

                                                        }} className={`${style.answerSpan} ${decision.Q2 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                            Yes
                                                        </span>
                                                        <span onClick={() => {
                                                            const updatedDecisions = [...dataToSend.Decisions];

                                                            updatedDecisions[index].Q2 = false;
                                                            updatedDecisions[index].Q3 = null;
                                                            updatedDecisions[index].Q4 = null;

                                                            setDataToSend({ ...dataToSend, Decisions: updatedDecisions })

                                                        }} className={`${style.answerSpan} ${decision.Q2 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                            No
                                                        </span>
                                                    </div>

                                                </div>
                                            )}
                                            {decision.Q2 === false && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 3 : </b> Could Hazard increase if not stopped at the point ?</h5>
                                                    </div>
                                                    <div>
                                                        <span onClick={() => {
                                                            const updatedDecisions = [...dataToSend.Decisions];

                                                            updatedDecisions[index].Q3 = true;
                                                            updatedDecisions[index].Q4 = null;

                                                            setDataToSend({ ...dataToSend, Decisions: updatedDecisions })
                                                            setDataToSend({ ...dataToSend, Q3: true, Q4: null })
                                                        }} className={`${style.answerSpan} ${decision.Q3 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                            Yes
                                                        </span>
                                                        <span onClick={() => {
                                                            const updatedDecisions = [...dataToSend.Decisions];

                                                            updatedDecisions[index].Q3 = false;
                                                            updatedDecisions[index].Q4 = null;

                                                            setDataToSend({ ...dataToSend, Decisions: updatedDecisions })

                                                        }} className={`${style.answerSpan} ${decision.Q3 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                            No
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {decision.Q3 === true && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 4 : </b> Will the subsequent step eliminate the hazard ?</h5>
                                                    </div>
                                                    <div>
                                                        <span onClick={() => {
                                                            const updatedDecisions = [...dataToSend.Decisions];

                                                            updatedDecisions[index].Q4 = true;

                                                            setDataToSend({ ...dataToSend, Decisions: updatedDecisions })

                                                        }} className={`${style.answerSpan} ${decision.Q4 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                            Yes
                                                        </span>
                                                        <span onClick={() => {
                                                            const updatedDecisions = [...dataToSend.Decisions];

                                                            updatedDecisions[index].Q4 = false;

                                                            setDataToSend({ ...dataToSend, Decisions: updatedDecisions })
                                                        }} className={`${style.answerSpan} ${decision.Q4 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                            No
                                                        </span>
                                                    </div>

                                                </div>
                                            )}
                                            <p className='text-center fw-bold'>
                                                {decision.Q1A === false && 'Stop✋! it is not a CCP.'}
                                                {decision.Q2 === true && 'Stop✋! CCP Identified.'}
                                                {decision.Q3 === false && 'Stop✋! it is not a CCP.'}
                                                {decision.Q4 === false && 'CCP Identified.'}
                                                {decision.Q4 === true && 'OPRP Identified.'}
                                            </p>
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

export default AddDecisionTree
