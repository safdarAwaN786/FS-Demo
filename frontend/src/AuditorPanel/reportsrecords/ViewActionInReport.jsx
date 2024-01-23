
import style from './ActionInReport.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Slider from 'rc-slider';
import { setSmallLoading } from '../../redux/slices/loading';

function ViewActionInReport() {

    const [showBox, setShowBox] = useState(false);
    const [actionData, setActionData] = useState(null);
    const [dataToShow, setDataToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const [correctiveAnswers, setCorrectiveAnswers] = useState([]);

    useEffect(() => {
        
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readCorrectiveActionById/${idToWatch}`).then((response) => {
            setActionData(response.data.data)
            setCorrectiveAnswers(response.data.data.Answers);
            dispatch(setSmallLoading(false))
            if (response.data.data == undefined) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Report is not Created for this Audit yet!',
                    confirmButtonText: 'OK.'
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({...tabData, Tab : 'Corrective Action Plan'}))
                        
                    }
                })
            }

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
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='mx-lg-5 px-4 mx-md-4 mx-2  mb-1 '>
                        <BsArrowLeftCircle onClick={(e) => {
                            dispatch(updateTabData({ ...tabData, Tab: 'Non-Conformity Report' }))
                        }} className='fs-3 text-danger mx-1' role='button' />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Corrective Action
                        </div>
                    </div>
                    <form className='bg-white' encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                    }}>
                        {correctiveAnswers?.map((correctiveAnswer, index) => {
                            return (
                                <div style={{
                                    borderRadius: '6px',
                                    width: '700px'
                                }} className='bg-white mx-auto my-4 p-2'>
                                    <div className='d-flex bg-light p-3 justify-content-center flex-column '>
                                        <div style={{
                                            width: '100%'
                                        }} className=' me-3 d-flex flex-column'>
                                            <input autoComplete='off' value={correctiveAnswer.question.question.questionText} style={{
                                                borderRadius: '0px'
                                            }} name='questionText' placeholder='Untitled Question' className='border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3' required readOnly />

                                        </div>
                                        <div>
                                            {correctiveAnswer.question.question.ComplianceType === 'GradingSystem' && (
                                                <div className='d-flex flex-row flex-wrap'>
                                                    <p className='my-2 fw-bold'> Selected Value : {correctiveAnswer.question?.GradingSystemAnswer}</p>
                                                    <div className='d-flex w-100 justify-content-between'>
                                                        <span>1</span>
                                                        <span>10</span></div>
                                                    <Slider
                                                        value={correctiveAnswer.question.GradingSystemAnswer}
                                                        min={1} // Set your lower value
                                                        max={10} // Set your higher value
                                                        step={1} // Set the step size
                                                        {...(correctiveAnswer.question.question.Required ? { required: true } : {})} readOnly />
                                                </div>
                                            )}
                                            {correctiveAnswer.question.question.ComplianceType === 'Yes/No' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.YesNoAnswer === 'Yes'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Yes-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-success m-2" for={`Yes-${index}`}>Yes</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.YesNoAnswer === 'No'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`No-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-danger m-2" for={`No-${index}`}>No</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.YesNoAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {correctiveAnswer.question.question.ComplianceType === 'Safe/AtRisk' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.SafeAtRiskAnswer === 'Safe'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Safe-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Safe-${index}`}>Safe</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.SafeAtRiskAnswer === 'At Risk'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`At Risk-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`At Risk-${index}`}>At Risk</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.SafeAtRiskAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {correctiveAnswer.question.question.ComplianceType === 'Pass/Fail' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.PassFailAnswer === 'Pass'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Pass-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Pass-${index}`}>Pass</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.PassFailAnswer === 'Fail'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Fail-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Fail-${index}`}>Fail</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.PassFailAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {correctiveAnswer.question.question.ComplianceType === 'Compliant/NonCompliant' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.CompliantNonCompliantAnswer === 'Compliant'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Compliant-${index}`}>Compliant</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.CompliantNonCompliantAnswer === 'Non-Compliant'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Non-Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Non-Compliant-${index}`}>Non-Compliant</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.CompliantNonCompliantAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {correctiveAnswer.question.question.ComplianceType === 'Good/Fair/Poor' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.GoodFairPoorAnswer === 'Good'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Good-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Good-${index}`}>Good</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.GoodFairPoorAnswer === 'Fair'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Fair-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Fair-${index}`}>Fair</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.GoodFairPoorAnswer === 'Poor'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Poor-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Poor-${index}`}>Poor</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.GoodFairPoorAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {correctiveAnswer.question.question.ComplianceType === 'Conform/MinorNonComform/MajorNonConform/CriticalNonConform/Observation' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Conform'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Conform-${index}`}>Conform</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Minor Non-Conform'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Minor Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Minor Non-Conform-${index}`}>Minor Non-Conform</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Major Non-Conform'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Major Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Major Non-Conform-${index}`}>Major Non-Conform</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Critical Non-Conform'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Critical Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-primary m-2" for={`Critical Non-Conform-${index}`}>Critical Non-Conform</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Observation'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Observation-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-info m-2" for={`Observation-${index}`}>Observation</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer = 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            <textarea value={correctiveAnswer.question.Remarks} rows={3} className='w-100 p-2 my-2' placeholder='Remarks...' required />
                                        </div>

                                        <div style={{
                                            width: '100%'
                                        }} className=' mt-2 d-flex flex-row'>
                                            <div style={{
                                                width: '80%'
                                            }}>
                                                {correctiveAnswer.question.EvidenceDoc && (

                                                    <div className='d-flex flex-column w-50'>
                                                        <label>Evidence Document :</label>
                                                        <a href={correctiveAnswer.question.EvidenceDoc} className='btn btn-outline-danger' download>Download</a>
                                                    </div>
                                                )}
                                            </div>
                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input autoComplete='off' checked={correctiveAnswer.question.question?.Required} className='ms-3' name='Required' type="checkbox" readOnly />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>
                                        </div>
                                        <div className='row p-3 mt-4'>

                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Correction : </p>
                                                <textarea placeholder='write here..' name='Correction' value={correctiveAnswer?.Correction} rows={4}  className='w-100 border-0 p-2 m-2' type='text' required readOnly/>
                                            </div>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Corrective Action : </p>
                                                <textarea placeholder='write here..'  value={correctiveAnswer?.CorrectiveAction} rows={4} className='w-100 border-0 p-2 m-2' type='text' required readOnly/>
                                            </div>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Root Cause : </p>
                                                <textarea placeholder='write here..' value={correctiveAnswer?.RootCause}  rows={4} className='w-100 border-0 p-2 m-2' type='text' required readOnly/>
                                            </div>
                                            {correctiveAnswer?.CorrectiveDoc && (
                                            <div className='col-lg-6 col-md-12'>
                                                <p><b>Corrective Document : </b></p>
                                                <a href={correctiveAnswer?.CorrectiveDoc} className='btn btn-danger py-2 mt-3 mx-2 w-100'  >Download</a>
                                            </div>
                                            )}




                                        </div>
                                    </div>
                                </div>
                            )
                        })}







                    </form>
                </div>
            </div>
            {
                showBox ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{dataToShow}</p>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={() => {
                                    setShowBox(false)

                                }} className={style.btn1}>Ok.</button>




                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default ViewActionInReport
