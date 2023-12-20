import style from './AuditConduction.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import JoditEditor from 'jodit-react';
import Select from 'react-select';
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Slider from 'rc-slider';
import { setLoading } from '../../redux/slices/loading';



function ViewAudit() {

    const [dataToSend, setDataToSend] = useState({})
    const [finalFormData, setFinalFormData] = useState(null);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [checklistData, setChecklistData] = useState(null);
    const [alert, setalert] = useState(false);
    const [clickedIndex, setClickedIndex] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [auditData, setAuditData] = useState(null);
    const [questions, setQuestions] = useState([]);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

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

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-conduct-audit-by-auditId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            console.log(response.data.data);
            setChecklistData(response.data.data.Checklist);
            setAuditData(response.data.data);
            setAnswers(response.data.data.Answers);
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
    useEffect(() => {
        setAuditData({ ...auditData, Answers: answers });
    }, [answers])


    const user = useSelector(state => state.auth.user);
    
    const handleDownloadImage = async (imageURL) => {
        try {
            if (imageURL) {

                dispatch(setLoading(true))
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                    params: {
                        url: imageURL,
                    },
                    responseType: 'blob', headers: { Authorization: `Bearer ${userToken}` } // Specify the response type as 'blob' to handle binary data
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
                dispatch(setLoading(false))
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
            dispatch(setLoading(false))
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        }

    };


    useEffect(() => {
        console.log(auditData);
    }, [auditData])


    const makeRequest = () => {
        console.log(finalFormData)
        if (finalFormData) {
            dispatch(setLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addConductAudit`, finalFormData, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                console.log("request made !");
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Conduct Audit' }))
                    }
                })

            }).catch(err => {
                dispatch(setLoading(false));
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

    const gradingSystem = [
        { value: '1', label: <div>1</div> },
        { value: '2', label: <div>2</div> },
        { value: '3', label: <div>3</div> },
        { value: '4', label: <div>4</div> },
        { value: '5', label: <div>5</div> },
        { value: '6', label: <div>6</div> },
        { value: '7', label: <div>7</div> },
        { value: '8', label: <div>8 </div> },
        { value: '9', label: <div>9</div> },
        { value: '10', label: <div>10</div> },
    ]
    const dropdown = [
        { value: 'Conform', label: <div>Conform</div> },
        { value: 'Minor NC', label: <div>Minor NC</div> },
        { value: 'Major NC', label: <div>Major NC</div> },
        { value: 'Critical NC', label: <div>Critical NC</div> },
        { value: 'Observation', label: <div>Observation</div> },

    ]



    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='mx-lg-5 px-4 mx-md-4 mx-2  mb-1 '>
                        <BsArrowLeftCircle onClick={(e) => {
                            dispatch(updateTabData({ ...tabData, Tab: 'Conduct Audit' }))
                        }} className='fs-3 text-danger mx-1' role='button' />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            View Audit
                        </div>
                    </div>
                    <form className='bg-white' encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        // Create a new FormData object
                        const formData = new FormData(event.target);
                        // Append the data to the FormData object
                        formData.append('Checklist', checklistData._id);
                        formData.append('Answers', JSON.stringify(auditData.Answers));
                        setFinalFormData(formData);
                        alertManager();

                    }}>
                        <div className={`${style.formDivider} flex-column justify-content-center`}>
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
                                                            <a onClick={()=>{
                                                                handleDownloadImage(answers[index].EvidenceDoc)
                                                            }} className='btn btn-outline-danger' >Download</a>
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

                            {/* <div className='d-flex flex-row mx-auto'>
    <a onClick={addQuestion} className='btn btn-outline-danger my-4 fs-4 w-100'>Add Question</a>
    {questions.length > 0 && (
        <a style={{
            borderRadius: '100px',
            width: '40px',
            height: '40px',
        }} onClick={clearLastQuestion} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
    )}
</div> */}
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

        </>
    )
}

export default ViewAudit
