import style from './FillForm.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';

function FillForm() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [answerData, setAnswerData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const [isFormValid, setIsFormValid] = useState(true);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`/get-form-by-id/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            setDataToSend(res.data.form);
            setAnswerData({ Form: res.data.form._id })
            setQuestions(res.data.form.questions);
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
        setAnswerData({ ...answerData, answers: answers });
    }, [answers])


    useEffect(() => {
        console.log(answerData);
    }, [answerData])



    const makeRequest = () => {
        console.log(answerData);
        if (answerData.answers?.length > 0) {
            dispatch(setLoading(true))
            axios.post("/submit-response", answerData, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                dispatch(setLoading(false))
                setAnswerData(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Form Records' }))
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
                text: 'Kindly, Provide Answers !',
                confirmButtonText: 'OK.'
            })
        }
    }

    return (
        <>

            <div className={style.parent}>

                <div className={`${style.form} mt-5`}>
                    <div className='bg-white px-2    mb-1 '>
                        <BsArrowLeftCircle onClick={(e) => {
                            dispatch(updateTabData({ ...tabData, Tab: 'Form Records' }))
                        }} className='fs-3 text-danger mx-1' role='button' />
                    </div>
                    <div className={`${style.headers} mt-0`}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={style.para}>
                            Fill Form
                        </div>

                    </div>
                    <div className={`${style.sec1}  px-3`}>
                        <form encType='multipart/form-data' onSubmit={(event) => {
                            event.preventDefault();
                            // Check if the form is valid
                            const isFormValid = questions.every((question, index) => {
                                if (question.questionType === 'Checkboxgrid' && question.Required) {
                                    const rowHasChecked = questions[index].rows.every((row, rowIndex) => {
                                        return answers[index]?.checkboxGridAnswers?.some((text) => text.startsWith(`R${rowIndex + 1}`));
                                    });
                                    return rowHasChecked;
                                }
                                return true; // For other question types or when not required
                            });

                            if (!isFormValid) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: 'Kindly, Select at least one checkbox in each question !',
                                    confirmButtonText: 'OK.'
                                })
                            } else {

                                console.log(answerData);

                                alertManager();
                            }
                        }}>

                            <div>
                                <p className='text-black'>Document Type</p>
                                <select value={dataToSend?.DocumentType} onChange={(e) => {
                                    setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                }} name='DocumentType' className={`form-select  form-select-lg mb-3`} aria-label="Large select example" required readOnly>
                                    <option disabled selected>{dataToSend?.DocumentType}</option>


                                </select>
                            </div>
                            <div className='mb-4'>
                                <p className='text-black'>Department</p>
                                <div>
                                    <select value={dataToSend?.Department.DepartmentName} name='Department' className={`form-select  form-select-lg `} aria-label="Large select example" readOnly >
                                        <option selected>{dataToSend?.Department.DepartmentName}</option>

                                    </select>
                                </div>
                            </div>

                            <div>
                                <p className='text-black'>Maintenance Frequency</p>
                                <select value={dataToSend?.MaintenanceFrequency} name='MaintenanceFrequency' className={`form-select  form-select-lg mb-3`} aria-label="Large select example" readOnly>
                                    <option disabled selected>{dataToSend?.MaintenanceFrequency}</option>


                                </select>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Form Name</p>
                                <div>

                                    <input value={dataToSend?.FormName} className='w-100' name='FormName' type="text" readOnly />
                                </div>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Form Description</p>
                                <div>

                                    <input value={dataToSend?.FormDescription} className='w-100' name='FormDescription' type="text" readOnly />
                                </div>
                            </div>


                            {questions.map((question, index) => {
                                return (
                                    <div style={{
                                        borderRadius: '6px'
                                    }} className='bg-white my-4 p-3'>
                                        <div className='d-flex bg-white justify-content-between '>
                                            <div style={{
                                                width: '100%'
                                            }} className=' me-3 d-flex flex-column'>
                                                <input value={dataToSend?.questions[index]?.questionText} style={{
                                                    borderRadius: '0px'
                                                }} name='questionText' className='border-bottom border-secondary bg-light mt-2 mb-3 w-100 p-3' readOnly />

                                            </div>

                                        </div>


                                        {(questions[index].questionType === 'ShortText') && (
                                            <div className='pe-4'>
                                                <span>Short Answer :</span>

                                                <input onChange={(e) => {
                                                    const updatedAnswers = [...answers]
                                                    if (!updatedAnswers[index]) {
                                                        updatedAnswers[index] = {};
                                                    }

                                                    updatedAnswers[index].question = questions[index]._id;
                                                    updatedAnswers[index].shortTextAnswer = e.target.value;
                                                    setAnswers(updatedAnswers);

                                                }} className='bg-light border-bottom border-secondary py-1 my-1  w-100' type='text' {...(questions[index].Required ? { required: true } : {})} />

                                            </div>

                                        )}
                                        {(questions[index].questionType === 'LongText') && (
                                            <div className='pe-4'>
                                                <span>Long Answer :</span>
                                                <textarea onChange={(e) => {

                                                    const updatedAnswers = [...answers]
                                                    if (!updatedAnswers[index]) {
                                                        updatedAnswers[index] = {};
                                                    }

                                                    updatedAnswers[index].question = questions[index]._id;
                                                    updatedAnswers[index].longTextAnswer = e.target.value;
                                                    setAnswers(updatedAnswers);

                                                }} rows={3} name='longTextAnswer' className='w-100 bg-light border-0 p-1 border-bottom border-secondary' {...(questions[index].Required ? { required: true } : {})} />

                                            </div>

                                        )}

                                        {(questions[index].questionType === 'Multiplechoicegrid') && (
                                            <div className=' d-flex flex-column'>
                                                <div className='d-flex my-2 flex-row'>
                                                    <span className='me-5 pe-4 px-2 py-0 d-inline'>R\C</span>
                                                    {questions[index]?.columns.map((column, colIndex) => {
                                                        return (
                                                            <input value={dataToSend?.questions[index].columns[colIndex].colTitle} className='bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ' type='text' readOnly />
                                                        )
                                                    })}
                                                </div>


                                                {questions[index]?.rows?.map((row, rowIndex) => {
                                                    return (

                                                        <div className='my-2 d-flex flex-row'>


                                                            <span>{rowIndex + 1}.</span>

                                                            <input value={dataToSend?.questions[index].rows[rowIndex].rowTitle} name='rowTitle' type='text' style={{
                                                                borderRadius: '0px'
                                                            }} className='bg-light border-bottom border-secondary w-25 px-2 py-0 d-inline' readOnly />
                                                            <div className='d-flex justify-content-between w-75'>


                                                                {questions[index]?.columns.map((colnum, colIndex) => {
                                                                    return (
                                                                        <input onChange={(e) => {
                                                                            const updatedAnswers = [...answers]
                                                                            if (!updatedAnswers[index]) {
                                                                                updatedAnswers[index] = {};
                                                                            }

                                                                            updatedAnswers[index].question = questions[index]._id;
                                                                            if (!updatedAnswers[index].multipleChoiceGridAnswers) {
                                                                                updatedAnswers[index].multipleChoiceGridAnswers = [];
                                                                            }

                                                                            if (e.target.checked) {
                                                                                updatedAnswers[index].multipleChoiceGridAnswers.push(`R${rowIndex}-C${colIndex}`);
                                                                            } else {
                                                                                updatedAnswers[index].multipleChoiceGridAnswers.filter(answer => answer !== `R${rowIndex}-C${colIndex}`)
                                                                            }
                                                                            setAnswers(updatedAnswers);
                                                                        }} className='mx-2' style={{
                                                                            width: '20px',
                                                                            height: '20px'
                                                                        }} name={`R${rowIndex}`} type='radio' {...(questions[index].Required ? { required: true } : {})} />
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}




                                            </div>

                                        )}

                                        {(questions[index].questionType === 'Checkboxgrid') && (
                                            <div className=' d-flex flex-column'>
                                                <div className='d-flex my-2 flex-row'>
                                                    <span className='me-25 pe-25 px-2 py-0 d-inline'>R\C</span>
                                                    {questions[index]?.columns.map((column, colIndex) => {
                                                        return (
                                                            <input value={dataToSend?.questions[index].columns[colIndex].colTitle} className='bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ' type='text' readOnly />
                                                        )
                                                    })}
                                                </div>


                                                {questions[index]?.rows?.map((row, rowIndex) => {
                                                    return (

                                                        <div className='my-2 d-flex flex-row'>


                                                            <span>{rowIndex + 1}.</span>

                                                            <input value={dataToSend?.questions[index].rows[rowIndex].rowTitle} type='text' style={{
                                                                borderRadius: '0px'
                                                            }} className='bg-light border-bottom border-secondary w-50 px-2 py-0 d-inline' readOnly />

                                                            <div className='d-flex justify-content-between w-75'>

                                                                {questions[index]?.columns.map((colnum, colIndex) => {
                                                                    return (
                                                                        <input onChange={(e) => {
                                                                            const updatedAnswers = [...answers]
                                                                            if (!updatedAnswers[index]) {
                                                                                updatedAnswers[index] = {};
                                                                            }

                                                                            updatedAnswers[index].question = questions[index]._id;
                                                                            if (!updatedAnswers[index].checkboxGridAnswers) {
                                                                                updatedAnswers[index].checkboxGridAnswers = [];
                                                                            }

                                                                            if (e.target.checked) {
                                                                                updatedAnswers[index].checkboxGridAnswers.push(`R${rowIndex}C${colIndex}`)
                                                                            } else {
                                                                                updatedAnswers[index].checkboxGridAnswers = updatedAnswers[index].checkboxGridAnswers.filter((text) => {
                                                                                    return (
                                                                                        text !== `R${rowIndex}C${colIndex}`
                                                                                    )
                                                                                })
                                                                            }
                                                                            setAnswers(updatedAnswers);

                                                                        }} className='mx-2' type='checkbox' />
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                        )}




                                        {(questions[index].questionType === 'Dropdown') && (
                                            <div className=' d-flex flex-column'>


                                                <div className='my-2 d-flex flex-row'>
                                                    <select onChange={(e) => {
                                                        const updatedAnswers = [...answers]
                                                        if (!updatedAnswers[index]) {
                                                            updatedAnswers[index] = {};
                                                        }

                                                        updatedAnswers[index].question = questions[index]._id;
                                                        updatedAnswers[index].dropdownAnswer = e.target.value;
                                                        setAnswers(updatedAnswers);
                                                    }} className='w-50 bg-light p-2 border-0 border-bottom border-secondary' {...(questions[index].Required ? { required: true } : {})}>

                                                        {questions[index]?.options?.map((option, optindex) => {
                                                            return (
                                                                <option value={option.optionText}>{option.optionText}</option>
                                                            )
                                                        })}
                                                    </select>
                                                </div>





                                            </div>

                                        )}
                                        {(questions[index].questionType === 'Checkbox') && (
                                            <div className=' d-flex flex-column'>


                                                {questions[index]?.options?.map((option, optindex) => {
                                                    return (

                                                        <div className='my-2 d-flex flex-row'>


                                                            <input onChange={(e) => {
                                                                const updatedAnswers = [...answers]
                                                                if (!updatedAnswers[index]) {
                                                                    updatedAnswers[index] = {};
                                                                }

                                                                updatedAnswers[index].question = questions[index]._id;
                                                                if (!updatedAnswers[index].CheckboxesAnswers) {
                                                                    updatedAnswers[index].CheckboxesAnswers = [];
                                                                }
                                                                if (e.target.checked) {
                                                                    updatedAnswers[index].CheckboxesAnswers.push(option.optionText)
                                                                } else {
                                                                    updatedAnswers[index].CheckboxesAnswers = updatedAnswers[index].CheckboxesAnswers.filter((optionText) => {
                                                                        return (
                                                                            optionText !== option.optionText
                                                                        )
                                                                    })
                                                                }

                                                                setAnswers(updatedAnswers);
                                                            }} className='mx-2 mt-1' type='checkbox' />                                                            <input type='text' value={dataToSend?.questions[index]?.options[optindex].optionText} style={{
                                                                borderRadius: '0px'
                                                            }} name='optionText' className='bg-light border-bottom border-secondary w-50 px-2 py-0 d-inline' readOnly />
                                                        </div>
                                                    )
                                                })}





                                            </div>

                                        )}
                                        {(questions[index].questionType === 'Multiplechoice') && (
                                            <div className=' d-flex flex-column'>


                                                {questions[index]?.options?.map((option, optindex) => {
                                                    return (

                                                        <div className='my-2 d-flex flex-row'>


                                                            <input onChange={((e) => {
                                                                const updatedAnswers = [...answers]
                                                                if (!updatedAnswers[index]) {
                                                                    updatedAnswers[index] = {};
                                                                }

                                                                updatedAnswers[index].question = questions[index]._id;
                                                                updatedAnswers[index].multipleChoiceAnswer = option.optionText;
                                                                setAnswers(updatedAnswers);
                                                            })} style={{
                                                                width: '23px'
                                                            }} className='mx-2' type='radio' name={`question-${index}`} {...(questions[index].Required ? { required: true } : {})} />

                                                            <input type='text' value={option.optionText} style={{
                                                                borderRadius: '0px'
                                                            }} name='optionText' className='bg-light border-bottom border-secondary w-50 px-2 py-0 d-inline' readOnly />
                                                        </div>
                                                    )
                                                })}





                                            </div>

                                        )}


                                        {questions[index].questionType === 'Linearscale' && (
                                            <div className=' d-flex my-3 flex-column pe-4'>

                                            {answers[index]?.linearScaleAnswer && (
                                                <span>Selected Value : {answers[index]?.linearScaleAnswer}</span>
                                            )}

                                                <Slider

                                                    onChange={(value) => {
                                                        const updatedAnswers = [...answers]
                                                        if (!updatedAnswers[index]) {
                                                            updatedAnswers[index] = {};
                                                        }

                                                        updatedAnswers[index].question = questions[index]._id;
                                                        updatedAnswers[index].linearScaleAnswer = value;
                                                        setAnswers(updatedAnswers);
                                                    }}
                                                    min={dataToSend?.questions[index]?.minValue} // Set your lower value
                                                    max={dataToSend?.questions[index]?.maxValue} // Set your higher value
                                                    step={1} // Set the step size
                                                    {...(questions[index].Required ? { required: true } : {})} />



                                            </div>

                                        )}
                                        {questions[index].questionType === 'Date' && (
                                            <div className=' d-flex my-3 flex-column pe-4'>




                                                <input onChange={(e) => {
                                                    const updatedAnswers = [...answers]
                                                    if (!updatedAnswers[index]) {
                                                        updatedAnswers[index] = {};
                                                    }

                                                    updatedAnswers[index].question = questions[index]._id;
                                                    updatedAnswers[index].dateAnswer = e.target.value;
                                                    setAnswers(updatedAnswers);
                                                }} type='date' className='w-50 bg-light p-2 border-0 border-bottom border-secondary' {...(questions[index].Required ? { required: true } : {})} />



                                            </div>

                                        )}
                                        {questions[index].questionType === 'Time' && (
                                            <div className=' d-flex my-3 flex-column pe-4'>




                                                <input onChange={(e) => {
                                                    const updatedAnswers = [...answers]
                                                    if (!updatedAnswers[index]) {
                                                        updatedAnswers[index] = {};
                                                    }

                                                    updatedAnswers[index].question = questions[index]._id;
                                                    updatedAnswers[index].timeAnswer = e.target.value;
                                                    setAnswers(updatedAnswers);
                                                }} type='time' className='w-50 bg-light p-2 border-0 border-bottom border-secondary' {...(questions[index].Required ? { required: true } : {})} />



                                            </div>

                                        )}




                                        <div className='my-2 mt-4 d-flex justify-content-end'>


                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input className='ms-3' name='IsPass' type="checkbox" checked={dataToSend?.questions[index].Required} />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>

                                        </div>
                                    </div>
                                )
                            })}





                            <div className={style.btns}>
                                <button className='mt-3' type='submit'>Submit</button>
                            </div>
                        </form>
                    </div>

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

export default FillForm
