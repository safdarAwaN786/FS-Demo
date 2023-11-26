
import style from './RecordReport.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Slider from 'rc-slider';
import { setLoading } from '../../redux/slices/loading';

function RecordReport() {

    const [showBox, setShowBox] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [auditData, setAuditData] = useState(null);
    const [alert, setalert] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    // Create an array of refs for file inputs

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const [answers, setAnswers] = useState([]);

   

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const makeRequest = () => {

        if (selectedDate) {
            dispatch(setLoading(true))
            axios.post("/addReport", { ConductAudit: idToWatch, TargetDate: selectedDate }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                console.log("request made !");
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Reports Records' }))
                    }
                })

            }).catch(err => {
                dispatch(setLoading(false));
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
                text: 'Try filling data again',
                confirmButtonText: 'OK.'
            })
        }
    }


    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`/get-conduct-audit-by-auditId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            console.log(response.data.data);
            setAuditData(response.data.data)
            setAnswers(response.data.data.Answers);
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














    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='mx-lg-5 px-4 mx-md-4 mx-2  mb-1 '>

                        <BsArrowLeftCircle onClick={(e) => {
                            dispatch(updateTabData({ ...tabData, Tab: 'Reports Records' }))
                        }} className='fs-3 text-danger mx-1' role='button' />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Non Conformance Report
                        </div>
                    </div>
                    <form className='bg-white' encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();
                    }}>

                        {answers?.map((answer, index) => {
                            return (
                                <div style={{
                                    borderRadius: '6px',
                                    width: '700px'
                                }} className='bg-white mx-auto my-4 p-2'>
                                    <div className='d-flex bg-light p-3 justify-content-center flex-column '>
                                        <div style={{
                                            width: '100%'
                                        }} className=' me-3 d-flex flex-column'>
                                            <input value={answer.question.questionText} style={{
                                                borderRadius: '0px'
                                            }} name='questionText' placeholder='Untitled Question' className='border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3' required readOnly />

                                        </div>
                                        <div>
                                            {answer.question.ComplianceType === 'GradingSystem' && (
                                                <div className='d-flex flex-row flex-wrap'>
                                                    <p className='my-2 fw-bold'> Selected Value : {answers[index]?.GradingSystemAnswer}</p>
                                                    <div className='d-flex w-100 justify-content-between'>
                                                        <span>1</span>
                                                        <span>10</span></div>
                                                    <Slider
                                                        value={answers[index].GradingSystemAnswer}
                                                        min={1} // Set your lower value
                                                        max={10} // Set your higher value
                                                        step={1} // Set the step size
                                                        {...(answer.question.Required ? { required: true } : {})} readOnly />
                                                </div>
                                            )}
                                            {answer.question.ComplianceType === 'Yes/No' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input checked={answers[index].YesNoAnswer === 'Yes'} type="radio" class="btn-check" name={answer.question._id} id={`Yes-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-success m-2" for={`Yes-${index}`}>Yes</label>

                                                    <input checked={answers[index].YesNoAnswer === 'No'} type="radio" class="btn-check" name={answer.question._id} id={`No-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-danger m-2" for={`No-${index}`}>No</label>
                                                    <input checked={answers[index].YesNoAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.question.ComplianceType === 'Safe/AtRisk' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input checked={answers[index].SafeAtRiskAnswer === 'Safe'} type="radio" class="btn-check" name={answer.question._id} id={`Safe-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Safe-${index}`}>Safe</label>

                                                    <input checked={answers[index].SafeAtRiskAnswer === 'At Risk'} type="radio" class="btn-check" name={answer.question._id} id={`At Risk-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`At Risk-${index}`}>At Risk</label>
                                                    <input checked={answers[index].SafeAtRiskAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {answer.question.ComplianceType === 'Pass/Fail' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input checked={answers[index].PassFailAnswer === 'Pass'} type="radio" class="btn-check" name={answer.question._id} id={`Pass-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Pass-${index}`}>Pass</label>

                                                    <input checked={answers[index].PassFailAnswer === 'Fail'} type="radio" class="btn-check" name={answer.question._id} id={`Fail-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Fail-${index}`}>Fail</label>
                                                    <input checked={answers[index].PassFailAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.question.ComplianceType === 'Compliant/NonCompliant' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input checked={answers[index].CompliantNonCompliantAnswer === 'Compliant'} type="radio" class="btn-check" name={answer.question._id} id={`Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Compliant-${index}`}>Compliant</label>

                                                    <input checked={answers[index].CompliantNonCompliantAnswer === 'Non-Compliant'} type="radio" class="btn-check" name={answer.question._id} id={`Non-Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Non-Compliant-${index}`}>Non-Compliant</label>
                                                    <input checked={answers[index].CompliantNonCompliantAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.question.ComplianceType === 'Good/Fair/Poor' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input checked={answers[index].GoodFairPoorAnswer === 'Good'} type="radio" class="btn-check" name={answer.question._id} id={`Good-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Good-${index}`}>Good</label>
                                                    <input checked={answers[index].GoodFairPoorAnswer === 'Fair'} type="radio" class="btn-check" name={answer.question._id} id={`Fair-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Fair-${index}`}>Fair</label>

                                                    <input checked={answers[index].GoodFairPoorAnswer === 'Poor'} type="radio" class="btn-check" name={answer.question._id} id={`Poor-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Poor-${index}`}>Poor</label>
                                                    <input checked={answers[index].GoodFairPoorAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {answer.question.ComplianceType === 'Conform/MinorNonComform/MajorNonConform/CriticalNonConform/Observation' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input checked={answers[index].ConformObservationAnswer === 'Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Conform-${index}`}>Conform</label>
                                                    <input checked={answers[index].ConformObservationAnswer === 'Minor Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Minor Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Minor Non-Conform-${index}`}>Minor Non-Conform</label>

                                                    <input checked={answers[index].ConformObservationAnswer === 'Major Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Major Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Major Non-Conform-${index}`}>Major Non-Conform</label>
                                                    <input checked={answers[index].ConformObservationAnswer === 'Critical Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Critical Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-primary m-2" for={`Critical Non-Conform-${index}`}>Critical Non-Conform</label>

                                                    <input checked={answers[index].ConformObservationAnswer === 'Observation'} type="radio" class="btn-check" name={answer.question._id} id={`Observation-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-info m-2" for={`Observation-${index}`}>Observation</label>
                                                    <input checked={answers[index].ConformObservationAnswer = 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            <textarea value={answers[index].Remarks} rows={3} className='w-100 p-2 my-2' placeholder='Remarks...' required />
                                        </div>

                                        <div style={{
                                            width: '100%'
                                        }} className=' mt-2 d-flex flex-row'>
                                            <div style={{
                                                width: '80%'
                                            }}>
                                                {answers[index].EvidenceDoc && (

                                                    <div className='d-flex flex-column w-50'>
                                                        <label>Evidence Document :</label>
                                                        <a href={answers[index].EvidenceDoc} className='btn btn-outline-danger' download>Download</a>
                                                    </div>
                                                )}
                                            </div>
                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input checked={answer.question?.Required} className='ms-3' name='Required' type="checkbox" readOnly />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}




                        <div className='p-3 mx-lg-5 mx-3 px-3 bg-light px-lg-5 '>

                            <p className='my-1 fw-bold'>Select Date (For Corrective Action)</p>
                            <input onChange={(e) => {
                                setSelectedDate(e.target.value)
                            }} className='w-25 p-2' type='date' required />
                        </div>
                        <div className={style.btn}>
                            <button type='submit'>Submit</button>
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
                            <p class={style.msg}>{dataToShow}</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setShowBox(false)

                                }} className={style.btn1}>Ok.</button>




                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default RecordReport
