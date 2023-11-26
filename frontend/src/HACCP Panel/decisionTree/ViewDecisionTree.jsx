import style from './AddDecisionTree.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';

function ViewDecisionTree() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [allConductHaccps, setAllConductHaccps] = useState(null);
    const [selectedConductHaccp, setSelectedConductHaccp] = useState(null);



    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();


    const alertManager = () => {
        setalert(!alert)
    }
    const idToWatch = useSelector(state => state.idToProcess);
    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-decision-tree/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            setDataToSend(res.data.data);
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])

    useEffect(() => {
        console.log(dataToSend);
    }, [dataToSend])


    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Decision Tree' }))
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
                            Decison Tree for CCP/ORP Selection
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
                                            <select value={dataToSend?.DocumentType} name='DocumentType' style={{ width: "100%" }} required >
                                                <option value="" selected disabled>{dataToSend?.DocumentType}</option>


                                            </select>

                                        </div>
                                    </div>



                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Decision tree for Hazards of :</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <select value={dataToSend?.ConductHaccp?.Process?.ProcessName} name='ConductHaccp' style={{ width: "100%" }} required >
                                                <option value="" selected disabled>{dataToSend?.ConductHaccp?.Process?.ProcessName}</option>
                                                {/* {allConductHaccps.map((obj) => (
                                                        <option value={JSON.stringify(obj)}>{obj.Process.ProcessName}</option>

                                                    ))} */}

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
                                            <select name='Department' value={dataToSend?.Department.DepartmentName} style={{ width: "100%" }} required>
                                                <option value="" selected disabled>{dataToSend?.Department.DepartmentName}</option>
                                                {/* {departmentsToShow?.map((depObj) => {
                                                    return (
                                                        <option value={depObj._id}>{depObj.DepartmentName}</option>
                                                    )
                                                })} */}
                                            </select>


                                        </div>
                                    </div>
                                </div>
                            </div>
                            {dataToSend?.Decisions?.map((decision, index) => {
                                console.log(decision.Q1)
                                return (
                                    <>
                                        <div className={`bg-danger row mx-lg-4 mx-md-3 mx-1 mt-4 py-3  `}>
                                            <div className=' col-lg-6 col-md-6 col-12'>
                                                <div className={`${style.heading} ms-3 `}>
                                                    {decision.Hazard.Process.ProcessNum}) {decision.Hazard.Process.Name}
                                                </div>
                                            </div>
                                            <div className='col-lg-6 col-md-6 col-12 d-flex justify-content-end pe-3'>
                                                <div className={`${style.heading} ms-3 `}>
                                                    {decision?.Hazard.type} Hazard
                                                </div>
                                            </div>
                                        </div>
                                        <div className='bg-white  mx-lg-4 mx-md-3 mx-1 p-3'>

                                            <div className='d-flex justify-content-between'>
                                                <div>
                                                    <h5><b>Q1 : </b> Are Control Measures in place for the hazard ?</h5>
                                                </div>
                                                <div>
                                                    {decision.Q1 === true &&
                                                        <span className={`${style.answerSpan} ${decision.Q1 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                            Yes
                                                        </span>
                                                    }
                                                    {decision.Q1 === false &&
                                                        <span className={`${style.answerSpan} ${decision.Q1 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                            No
                                                        </span>
                                                    }
                                                    {decision.Q1 === null &&
                                                        <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                            Not Answered
                                                        </span>
                                                    }
                                                </div>

                                            </div>
                                            {decision.Q1 === false && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 1A : </b> Is control at this step necessary ? </h5>
                                                    </div>
                                                    <div>
                                                        {decision.Q1A === true &&
                                                            <span className={`${style.answerSpan} ${decision.Q1A ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                                Yes

                                                            </span>
                                                        }
                                                        {decision.Q1A === false &&
                                                            <span className={`${style.answerSpan} ${decision.Q1A === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                                No
                                                            </span>
                                                        }
                                                        {decision.Q1A === null &&
                                                        <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                            Not Answered
                                                        </span>
                                                    }
                                                    </div>

                                                </div>
                                            )}
                                            {(decision.Q1 === true || decision.Q1A === true) && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 2 : </b> Is this step specially designed to control the Hazard ?</h5>
                                                    </div>
                                                    <div>
                                                        {decision.Q2 === true &&
                                                            <span className={`${style.answerSpan} ${decision.Q2 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                                Yes
                                                            </span>
                                                        }
                                                        {decision.Q2 === false &&
                                                            <span className={`${style.answerSpan} ${decision.Q2 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                                No
                                                            </span>
                                                        }
                                                        {decision.Q2 === null &&
                                                        <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                            Not Answered
                                                        </span>
                                                    }

                                                    </div>

                                                </div>
                                            )}
                                            {decision.Q2 === false && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 3 : </b> Could Hazard increase if not stopped at the point ?</h5>
                                                    </div>
                                                    <div>
                                                        {decision.Q3 === true &&
                                                            <span className={`${style.answerSpan} ${decision.Q3 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                                Yes
                                                            </span>
                                                        }
                                                        {decision.Q3 === false &&
                                                            <span className={`${style.answerSpan} ${decision.Q3 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                                No
                                                            </span>
                                                        }
                                                        {decision.Q3 === null &&
                                                        <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                            Not Answered
                                                        </span>
                                                    }
                                                    </div>
                                                </div>
                                            )}
                                            {decision.Q3 === true && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 4 : </b> Will the subsequent step eliminate the hazard ?</h5>
                                                    </div>
                                                    <div>
                                                    {decision.Q4 === true && 
                                                        <span  className={`${style.answerSpan} ${decision.Q4 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                            Yes
                                                        </span>
                                                    }
                                                    {decision.Q4 === false && 
                                                        <span  className={`${style.answerSpan} ${decision.Q4 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                            No
                                                        </span>
                                                    }
                                                    {decision.Q4 === null &&
                                                        <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                            Not Answered
                                                        </span>
                                                    }
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
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default ViewDecisionTree
