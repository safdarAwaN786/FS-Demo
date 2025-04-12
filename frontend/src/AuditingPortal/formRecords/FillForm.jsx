import style from './FillForm.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function FillForm() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [answerData, setAnswerData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const user = useSelector(state => state.auth.user)
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-form-by-id/${idToWatch}`).then((res) => {
            setDataToSend(res.data.form);
            setAnswerData({ Form: res.data.form._id })
            setQuestions(res.data.form.questions);
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
        setAnswerData({ ...answerData, answers: answers });
    }, [answers])

    const makeRequest = () => {
        if (answerData.answers?.length > 0) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/submit-response`, { ...answerData, filledBy: user.Name }, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                dispatch(setSmallLoading(false))
                setAnswerData(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Record Keeping' }))
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
                            dispatch(updateTabData({ ...tabData, Tab: 'Record Keeping' }))
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
                            console.log(questions);
                            console.log(answers)
                            const isFormValid = questions.every((question, index) => {
                                if (question.questionType === 'Checkboxgrid' && question.Required) {
                                    const rowHasChecked = questions[index].rows.every((row, rowIndex) => {
                                        return answers[index]?.checkboxGridAnswers?.some((text) => text.startsWith(`R${rowIndex}`));
                                    });
                                    return rowHasChecked;
                                }
                                return true; // For other question types or when not required
                            });
                            const isCheckboxesValid = questions.every((question, index) => {
                                if (question.questionType === 'Checkbox' && question.Required) {
                                    console.log(answers[index])
                                    return answers[index]?.CheckboxesAnswers?.length > 0 ? true : false
                                } else {
                                    return true
                                }
                            })
                            console.log(isCheckboxesValid)
                            if (!isFormValid || !isCheckboxesValid) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: 'Kindly, Select at least one checkbox in each question !',
                                    confirmButtonText: 'OK.'
                                })
                            } else {
                                alertManager();
                            }
                        }}>
                            <div className='w-100'>
                                <p className='text-black'>Document Type</p>
                                <div>
                                    <input autoComplete='off' value={dataToSend?.DocumentType} className='w-100 overflow-x-handler' name='FormName' type="text" readOnly />
                                </div>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Department</p>
                                <div>
                                    <input autoComplete='off' value={dataToSend?.Department.DepartmentName} className='w-100 overflow-x-handler' name='FormName' type="text" readOnly />
                                </div>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Maintenance Frequency</p>
                                <div>
                                    <input autoComplete='off' value={dataToSend?.MaintenanceFrequency} className='w-100 overflow-x-handler' name='FormName' type="text" readOnly />
                                </div>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Form Name</p>
                                <div>
                                    <input autoComplete='off' value={dataToSend?.FormName} className='w-100 overflow-x-handler' name='FormName' type="text" readOnly />
                                </div>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Form Description</p>
                                <div>
                                    <input autoComplete='off' value={dataToSend?.FormDescription} className='w-100 overflow-x-handler' name='FormDescription' type="text" readOnly />
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
                                                <input autoComplete='off' value={dataToSend?.questions[index]?.questionText} style={{
                                                    borderRadius: '0px'
                                                }} name='questionText' className='border-bottom overflow-x-handler border-secondary bg-light mt-2 mb-3 w-100 p-3' readOnly />
                                            </div>
                                        </div>
                                        {(questions[index].questionType === 'ShortText') && (
                                            <div className='pe-4'>
                                                <span>Short Answer :</span>
                                                <input autoComplete='off' onChange={(e) => {
                                                    const updatedAnswers = [...answers]
                                                    if (!updatedAnswers[index]) {
                                                        updatedAnswers[index] = {};
                                                    }
                                                    updatedAnswers[index].question = questions[index]._id;
                                                    updatedAnswers[index].shortTextAnswer = e.target.value;
                                                    setAnswers(updatedAnswers);
                                                }} style={{
                                                    borderRadius: '0px'
                                                }} className='bg-light overflow-x-handler border-bottom border-secondary p-1 my-1  w-100' type='text' {...(questions[index].Required ? { required: true } : {})} />
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
                                                }} rows={3} name='longTextAnswer' className='w-100 overflow-x-handler bg-light border-0 p-1 border-bottom border-secondary' {...(questions[index].Required ? { required: true } : {})} />
                                            </div>
                                        )}
                                        {(questions[index].questionType === 'Multiplechoicegrid') && (
                                            <>
                                                <div className={`${style.gridCover}`}>
                                                    <table className='table table-bordered'>
                                                        <thead>
                                                            <tr>
                                                                <th style={{
                                                                    minWidth: '120px'
                                                                }}>R\C</th>
                                                                {questions[index]?.columns.map((column, colIndex) => {
                                                                    return (
                                                                        <th style={{
                                                                            minWidth: '80px'
                                                                        }}>
                                                                            <input autoComplete='off' value={dataToSend?.questions[index].columns[colIndex].colTitle} className={`bg-light overflow-x-handler border-bottom border-secondary d-inline py-0 px-1 mx-1 ${style.noRadius}`} type='text' readOnly />
                                                                        </th>
                                                                    )
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {questions[index]?.rows?.map((row, rowIndex) => {
                                                                return (
                                                                    <tr>
                                                                        <td>
                                                                            <span>{rowIndex + 1}.</span>
                                                                            <input autoComplete='off' value={dataToSend?.questions[index].rows[rowIndex].rowTitle} name='rowTitle' type='text' style={{
                                                                                borderRadius: '0px'
                                                                            }} className='bg-light border-bottom border-secondary px-2 py-0 d-inline' readOnly />
                                                                        </td>
                                                                        {questions[index]?.columns.map((colnum, colIndex) => {
                                                                            return (
                                                                                <td>
                                                                                    <input
                                                                                        onChange={(e) => {
                                                                                            const updatedAnswers = [...answers];
                                                                                            if (!updatedAnswers[index]) {
                                                                                                updatedAnswers[index] = {};
                                                                                            }
                                                                                            updatedAnswers[index].question = questions[index]._id;
                                                                                            if (!updatedAnswers[index].multipleChoiceGridAnswers) {
                                                                                                updatedAnswers[index].multipleChoiceGridAnswers = [];
                                                                                            }
                                                                                            const radioValue = `R${rowIndex}-C${colIndex}`;
                                                                                            // Remove all other values from the same row
                                                                                            updatedAnswers[index].multipleChoiceGridAnswers = updatedAnswers[index].multipleChoiceGridAnswers.filter(
                                                                                                (answer) => !answer.startsWith(`R${rowIndex}-`)
                                                                                            );
                                                                                            if (e.target.checked) {
                                                                                                updatedAnswers[index].multipleChoiceGridAnswers.push(radioValue);
                                                                                            }
                                                                                            setAnswers(updatedAnswers);
                                                                                        }}
                                                                                        className='mx-2'
                                                                                        style={{
                                                                                            width: '20px',
                                                                                            height: '20px',
                                                                                        }}
                                                                                        name={`R${rowIndex}`}
                                                                                        type='radio'
                                                                                        {...(questions[index].Required ? { required: true } : {})}
                                                                                    />
                                                                                </td>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}
                                        {(questions[index].questionType === 'Checkboxgrid') && (
                                            <>
                                                <div className={`${style.gridCover}`}>
                                                    <table className='table table-bordered'>
                                                        <thead>
                                                            <tr>
                                                                <th style={{
                                                                    minWidth: '120px'
                                                                }}>R\C</th>
                                                                {questions[index]?.columns.map((column, colIndex) => {
                                                                    return (
                                                                        <th style={{
                                                                            minWidth: '80px'
                                                                        }}>
                                                                            <input autoComplete='off' value={dataToSend?.questions[index].columns[colIndex].colTitle} className={`bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ${style.noRadius}`} type='text' readOnly />
                                                                        </th>
                                                                    )
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {questions[index]?.rows?.map((row, rowIndex) => {
                                                                return (
                                                                    <tr>
                                                                        <td>
                                                                            <span>{rowIndex + 1}.</span>
                                                                            <input autoComplete='off' value={dataToSend?.questions[index].rows[rowIndex].rowTitle} type='text' style={{
                                                                                borderRadius: '0px'
                                                                            }} className='bg-light border-bottom border-secondary  px-2 py-0 d-inline' readOnly />
                                                                        </td>
                                                                        {questions[index]?.columns.map((colnum, colIndex) => {
                                                                            return (
                                                                                <td>
                                                                                    <input autoComplete='off' onChange={(e) => {
                                                                                        const updatedAnswers = [...answers]
                                                                                        if (!updatedAnswers[index]) {
                                                                                            updatedAnswers[index] = {};
                                                                                        }
                                                                                        updatedAnswers[index].question = questions[index]._id;
                                                                                        if (!updatedAnswers[index].checkboxGridAnswers) {
                                                                                            updatedAnswers[index].checkboxGridAnswers = [];
                                                                                        }
                                                                                        if (e.target.checked) {
                                                                                            updatedAnswers[index].checkboxGridAnswers.push(`R${rowIndex}-C${colIndex}`)
                                                                                        } else {
                                                                                            updatedAnswers[index].checkboxGridAnswers = updatedAnswers[index].checkboxGridAnswers.filter((text) => {
                                                                                                return (
                                                                                                    text !== `R${rowIndex}-C${colIndex}`
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                        setAnswers(updatedAnswers);
                                                                                    }} className='mx-2' type='checkbox' />
                                                                                </td>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
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
                                                            <input autoComplete='off' onChange={(e) => {
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
                                                            }} className='mx-2 mt-1' type='checkbox' />                                                            <input autoComplete='off' type='text' value={dataToSend?.questions[index]?.options[optindex].optionText} style={{
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
                                                            <input autoComplete='off' onChange={((e) => {
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
                                                            <input autoComplete='off' type='text' value={option.optionText} style={{
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
                                                <input autoComplete='off' onChange={(e) => {
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
                                                <input autoComplete='off' onChange={(e) => {
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
                                                <input autoComplete='off' className='ms-3' name='IsPass' type="checkbox" checked={dataToSend?.questions[index].Required} />
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
