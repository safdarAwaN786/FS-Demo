
import style from './ActionOnCorrective.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Slider from 'rc-slider';
import { setSmallLoading } from '../../redux/slices/loading';
import dayjs from 'dayjs';

function ActionOnCorrective() {

    const [showBox, setShowBox] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [alert, setalert] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [finalFormData, setFinalFormData] = useState(null);
    const [questions, setQuestions] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    const alertManager = () => {
        setalert(!alert)
    }

    const [auditData, setAuditData] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [correctiveAnswers, setCorrectiveAnswers] = useState([]);


    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readReportById/${idToWatch}`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            console.log(response.data.data);
            setReportData(response.data.data)
            setAuditData(response.data.data.ConductAudit);
            setAnswers(response.data.data.SelectedAnswers);
            setQuestions(response.data.data.ConductAudit.Questions);
            dispatch(setSmallLoading(false))

            if (response.data.data == undefined) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Report is not Created for this Audit yet!',
                    confirmButtonText: 'OK.'

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Corrective Action Plan' }))

                    }
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

    const handleDownloadImage = async (imageURL) => {
        try {
            if (imageURL) {

                dispatch(setSmallLoading(true))
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                    params: {
                        url: imageURL,
                    },
                    responseType: 'blob' // Specify the response type as 'blob' to handle binary data
                });


                let blob;

                blob = new Blob([response.data]);
                // }

                // Create a temporary anchor element
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);

                // Set the download attribute and suggested filename for the downloaded image
                link.download = `${user.Department.DepartmentName}-FSMS${imageURL.substring(imageURL.lastIndexOf('.'))}`;

                // Append the anchor element to the document body and click it to trigger the download
                document.body.appendChild(link);
                dispatch(setSmallLoading(false))
                link.click();
                // Clean up by removing the temporary anchor element
                document.body.removeChild(link);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'No any file uploaded here!'
                })
            }
        } catch (error) {
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        }

    };


    const makeRequest = () => {
        console.log(finalFormData)
        if (finalFormData) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addCorrectiveAction`, finalFormData, { headers: { Authorization: `${user._id}` } }).then(() => {
                dispatch(setSmallLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Corrective Action Plan' }))
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
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='mx-lg-5 px-4 mx-md-4 mx-2  mb-1 '>

                        <BsArrowLeftCircle onClick={(e) => {
                            dispatch(updateTabData({ ...tabData, Tab: 'Corrective Action Plan' }))
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
                        // Create a new FormData object
                        const formData = new FormData(event.target);

                        // Append the data to the FormData object
                        formData.append('Report', reportData._id);
                        formData.append('Answers', JSON.stringify(correctiveAnswers));
                        setFinalFormData(formData);
                        alertManager();

                    }}>

                        {console.log(answers)}
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

                                            <div className={`custom-input-like-scrollable border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3`}>
                                            {answer.Answer.question.questionText}
                                            </div>

                                            

                                        </div>
                                        <div>
                                            {answer.Answer.question.ComplianceType === 'GradingSystem' && (
                                                <div className='d-flex flex-row flex-wrap'>
                                                    <p className='my-2 fw-bold'> Selected Value : {answer.Answer?.GradingSystemAnswer}</p>
                                                    <div className='d-flex w-100 justify-content-between'>
                                                        <span>1</span>
                                                        <span>10</span></div>
                                                    <Slider
                                                        value={answer.Answer.GradingSystemAnswer}
                                                        min={1} // Set your lower value
                                                        max={10} // Set your higher value
                                                        step={1} // Set the step size
                                                        {...(answer.Answer.question.Required ? { required: true } : {})} readOnly />
                                                </div>
                                            )}
                                            {answer.Answer.question.ComplianceType === 'Yes/No' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answer.Answer.YesNoAnswer === 'Yes'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Yes-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-success m-2" for={`Yes-${index}`}>Yes</label>

                                                    <input autoComplete='off' checked={answer.Answer.YesNoAnswer === 'No'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`No-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-danger m-2" for={`No-${index}`}>No</label>
                                                    <input autoComplete='off' checked={answer.Answer.YesNoAnswer === 'N/A'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.Answer.question.ComplianceType === 'Safe/AtRisk' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answer.Answer.SafeAtRiskAnswer === 'Safe'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Safe-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Safe-${index}`}>Safe</label>

                                                    <input autoComplete='off' checked={answer.Answer.SafeAtRiskAnswer === 'At Risk'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`At Risk-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`At Risk-${index}`}>At Risk</label>
                                                    <input autoComplete='off' checked={answer.Answer.SafeAtRiskAnswer === 'N/A'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {answer.Answer.question.ComplianceType === 'Pass/Fail' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answer.Answer.PassFailAnswer === 'Pass'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Pass-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Pass-${index}`}>Pass</label>

                                                    <input autoComplete='off' checked={answer.Answer.PassFailAnswer === 'Fail'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Fail-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Fail-${index}`}>Fail</label>
                                                    <input autoComplete='off' checked={answer.Answer
                                                        .PassFailAnswer === 'N/A'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.Answer.question.ComplianceType === 'Compliant/NonCompliant' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answer.Answer.CompliantNonCompliantAnswer === 'Compliant'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Compliant-${index}`}>Compliant</label>

                                                    <input autoComplete='off' checked={answer.Answer.CompliantNonCompliantAnswer === 'Non-Compliant'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Non-Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Non-Compliant-${index}`}>Non-Compliant</label>
                                                    <input autoComplete='off' checked={answer.Answer.CompliantNonCompliantAnswer === 'N/A'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.Answer.question.ComplianceType === 'Good/Fair/Poor' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answer.Answer.GoodFairPoorAnswer === 'Good'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Good-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Good-${index}`}>Good</label>
                                                    <input autoComplete='off' checked={answer.Answer.GoodFairPoorAnswer === 'Fair'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Fair-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Fair-${index}`}>Fair</label>

                                                    <input autoComplete='off' checked={answer.Answer.GoodFairPoorAnswer === 'Poor'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Poor-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Poor-${index}`}>Poor</label>
                                                    <input autoComplete='off' checked={answer.Answer.GoodFairPoorAnswer === 'N/A'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {answer.Answer.question.ComplianceType === 'Conform/MinorNonComform/MajorNonConform/CriticalNonConform/Observation' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answer.Answer.ConformObservationAnswer === 'Conform'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Conform-${index}`}>Conform</label>
                                                    <input autoComplete='off' checked={answer.Answer.ConformObservationAnswer === 'Minor Non-Conform'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Minor Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Minor Non-Conform-${index}`}>Minor Non-Conform</label>

                                                    <input autoComplete='off' checked={answer.Answer.ConformObservationAnswer === 'Major Non-Conform'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Major Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Major Non-Conform-${index}`}>Major Non-Conform</label>
                                                    <input autoComplete='off' checked={answer.Answer.ConformObservationAnswer === 'Critical Non-Conform'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Critical Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-primary m-2" for={`Critical Non-Conform-${index}`}>Critical Non-Conform</label>

                                                    <input autoComplete='off' checked={answer.Answer.ConformObservationAnswer === 'Observation'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`Observation-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-info m-2" for={`Observation-${index}`}>Observation</label>
                                                    <input autoComplete='off' checked={answer.Answer.ConformObservationAnswer = 'N/A'} type="radio" class="btn-check" name={answer.Answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            <textarea value={answer.Answer.Remarks} rows={3} className='w-100 p-2 my-2' placeholder='Remarks...' readOnly />
                                        </div>

                                        <div style={{
                                            width: '100%'
                                        }} className=' mt-2 d-flex flex-row'>
                                            <div style={{
                                                width: '80%'
                                            }}>
                                                {answer.Answer.EvidenceDoc && (
                                                    <div className='d-flex flex-column w-50'>
                                                        <label>Evidence Document :</label>
                                                        <a onClick={() => {
                                                            handleDownloadImage(answer.Answer.EvidenceDoc)
                                                        }} className='btn btn-outline-danger' >Download</a>
                                                    </div>
                                                )}
                                            </div>
                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input autoComplete='off' checked={answer.Answer.question?.Required} className='ms-3' name='Required' type="checkbox" readOnly />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>
                                        </div>
                                        <div className='row p-3 mt-4'>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Target Date : </p>
                                                <input placeholder='write here..' value={dayjs(answer?.TargetDate).format('DD/MM/YYYY')} rows={4} className='w-100 border-0 p-2 m-2' type='text' required />
                                            </div>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Correction : </p>
                                                <textarea placeholder='write here..' name='Correction' value={correctiveAnswers[index]?.Correction} rows={4} onChange={(e) => {
                                                    const updatedAnswers = [...correctiveAnswers];
                                                    if (!updatedAnswers[index]) {
                                                        updatedAnswers[index] = {};
                                                    }
                                                    updatedAnswers[index].question = answer.Answer._id;
                                                    updatedAnswers[index].Correction = e.target.value;
                                                    setCorrectiveAnswers(updatedAnswers)
                                                }} className='w-100 border-0 p-2 m-2' type='text' required />
                                            </div>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Corrective Action : </p>
                                                <textarea placeholder='write here..' onChange={(e) => {
                                                    const updatedAnswers = [...correctiveAnswers];
                                                    if (!updatedAnswers[index]) {
                                                        updatedAnswers[index] = {};
                                                    }
                                                    updatedAnswers[index].question = answer.Answer._id;
                                                    updatedAnswers[index].CorrectiveAction = e.target.value;
                                                    setCorrectiveAnswers(updatedAnswers)
                                                }} value={correctiveAnswers[index]?.CorrectiveAction} rows={4} className='w-100 border-0 p-2 m-2' type='text' required />
                                            </div>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Root Cause : </p>
                                                <textarea placeholder='write here..' value={correctiveAnswers[index]?.RootCause} onChange={(e) => {
                                                    const updatedAnswers = [...correctiveAnswers];
                                                    if (!updatedAnswers[index]) {
                                                        updatedAnswers[index] = {};
                                                    }
                                                    updatedAnswers[index].question = answer.Answer._id;
                                                    updatedAnswers[index].RootCause = e.target.value;
                                                    setCorrectiveAnswers(updatedAnswers)
                                                }} rows={4} className='w-100 border-0 p-2 m-2' type='text' required />
                                            </div>

                                            <div className='col-lg-6 col-md-12'>
                                                <p><b>Upload Document : </b></p>
                                                <input autoComplete='off' name={`CorrectiveDoc-${index}`} className='btn btn-danger py-2 mt-3 mx-2 w-100' accept='.pdf' type='file' />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div className={style.btn}>
                            <button type='submit'>Submit</button>
                        </div>
                    </form>
                </div>
            </div>
            {
                showBox ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <div className='overflow-y-handler'>
                                <p class={style.msg}>{dataToShow}</p>
                            </div>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft: '120px',
                                    marginTop: '25px'
                                }} onClick={() => {
                                    setShowBox(false)

                                }} className={style.btn1}>Ok.</button>

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
                                    makeRequest();

                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default ActionOnCorrective
