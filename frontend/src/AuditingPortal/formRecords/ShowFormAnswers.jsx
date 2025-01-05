import style from './formView.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from "react-icons/bs"
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function ShowFormAnswers() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [answers, setAnswers] = useState([]);
    const user = useSelector(state => state.auth.user)
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-record-by-recordId/${idToWatch}`, { headers: { Authorization: `${user._id}` } }).then((res) => {
            setDataToSend(res.data.data);
            console.log(res.data.data)
            setAnswers(res.data.data?.answers);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            console.log(err);
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

    return (
        <>
            <div className={style.parent}>
                <div className={`${style.form} mt-5 `}>
                    <div className='d-flex flex-row bg-white px-lg-3  px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Master List of Records/Forms' }))
                                }
                            }} />
                    </div>
                    <div className={style.headers}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={style.para}>
                            Filled Form
                        </div>
                    </div>
                    <div className={`${style.sec1}  px-3`}>
                        <form encType='multipart/form-data' onSubmit={(event) => {
                            event.preventDefault();
                            alertManager();
                        }}>
                            <div className='w-100'>
                                <p className='text-black'>Form Name</p>
                                <div>
                                    <input autoComplete='off' value={dataToSend?.Form.FormName} className='w-100' name='FormName' type="text" readOnly />
                                </div>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Form Description</p>
                                <div>
                                    <input autoComplete='off' value={dataToSend?.Form.FormDescription} className='w-100' name='FormDescription' type="text" readOnly />
                                </div>
                            </div>
                            {answers?.map((answer, index) => {
                                return (
                                    <div style={{
                                        borderRadius: '6px'
                                    }} className='bg-white my-4 p-3'>
                                        <div className='d-flex bg-white justify-content-between '>
                                            <div style={{
                                                width: '100%'
                                            }} className=' me-3 d-flex flex-column'>
                                                <input autoComplete='off' value={answer.question.questionText} style={{
                                                    borderRadius: '0px'
                                                }} name='questionText' className='border-bottom border-secondary bg-light mt-2 mb-3 w-100 p-3' readOnly />

                                            </div>
                                        </div>
                                        {(answer.question.questionType === 'ShortText') && (
                                            <div className='pe-4'>
                                                <span>Short Answer :</span>
                                                <input autoComplete='off' value={answer.shortTextAnswer} className='bg-light border-bottom border-secondary py-1 my-1  w-100' type='text' readOnly />
                                            </div>
                                        )}
                                        {(answer.question.questionType === 'LongText') && (
                                            <div className='pe-4'>
                                                <span>Long Answer :</span>
                                                <textarea value={answer.longTextAnswer} rows={3} name='longTextAnswer' className='w-100 bg-light border-0 p-1 border-bottom border-secondary' readOnly />
                                            </div>
                                        )}
                                        {(answer.question.questionType === 'Multiplechoicegrid') && (
                                            <>
                                                <div className={`${style.gridCover}`}>
                                                    <table className='table table-bordered'>
                                                        <thead>
                                                            <tr>
                                                                <th style={{
                                                                    minWidth: '120px'
                                                                }}>R\C</th>
                                                                {answer?.question.columns.map((column, colIndex) => {
                                                                    return (
                                                                        <th style={{
                                                                            minWidth: '80px'
                                                                        }}>
                                                                            <input autoComplete='off' value={column.colTitle} className={`bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ${style.noRadius}`} type='text' readOnly />
                                                                        </th>
                                                                    )
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {answer?.question.rows?.map((row, rowIndex) => {
                                                                return (
                                                                    <tr>
                                                                        <td>
                                                                            <span>{rowIndex + 1}.</span>
                                                                            <input autoComplete='off' value={row.rowTitle} name='rowTitle' type='text' style={{
                                                                                borderRadius: '0px'
                                                                            }} className='bg-light border-bottom border-secondary  px-2 py-0 d-inline' readOnly />
                                                                        </td>
                                                                        {answer.question?.columns.map((colnum, colIndex) => {
                                                                            return (
                                                                                <td>
                                                                                    <input autoComplete='off' style={{
                                                                                        width: '20px',
                                                                                        height: '20px'
                                                                                    }} checked={answer.multipleChoiceGridAnswers.includes(`R${rowIndex}-C${colIndex}`)} name={`R${rowIndex}`} type='radio' readOnly />
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
                                        {(answer.question.questionType === 'Checkboxgrid') && (
                                            <>
                                                <div className={`${style.gridCover}`}>
                                                    <table className='table table-bordered'>
                                                        <thead>
                                                            <tr>
                                                                <th style={{
                                                                    minWidth: '120px'
                                                                }}>R\C</th>
                                                                {answer.question?.columns.map((column, colIndex) => {
                                                                    return (
                                                                        <th style={{
                                                                            minWidth: '80px'
                                                                        }}>
                                                                            <input autoComplete='off' value={column.colTitle} className={`bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ${style.noRadius}`} type='text' readOnly />
                                                                        </th>
                                                                    )
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {answer.question?.rows?.map((row, rowIndex) => {
                                                                return (
                                                                    <tr>
                                                                        <td>
                                                                            <span>{rowIndex + 1}.</span>
                                                                            <input autoComplete='off' value={row.rowTitle} type='text' style={{
                                                                                borderRadius: '0px'
                                                                            }} className='bg-light border-bottom border-secondary  px-2 py-0 d-inline' readOnly />
                                                                        </td>
                                                                        {answer.question?.columns.map((colnum, colIndex) => {
                                                                            return (
                                                                                <td>
                                                                                    <input autoComplete='off' style={{
                                                                                        width: '20px',
                                                                                        height: '20px'
                                                                                    }} checked={answer.checkboxGridAnswers.includes(`R${rowIndex}-C${colIndex}`)} className='mx-2' type='checkbox' readOnly />
                                                                                </td>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className=' d-flex flex-column'>
                                                    <div className='d-flex my-2 flex-row'>
                                                        <span className='me-25 pe-25 px-2 py-0 d-inline'>R\C</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {(answer.question.questionType === 'Dropdown') && (
                                            <div className=' d-flex flex-column'>
                                                <div className='my-2 d-flex flex-row'>
                                                    <span>Dropdown Answer : <b>{answer.dropdownAnswer}</b></span>
                                                </div>
                                            </div>
                                        )}
                                        {(answer.question.questionType === 'Checkbox') && (
                                            <div className=' d-flex flex-column'>
                                                {answer.question?.options?.map((option, optindex) => {
                                                    return (
                                                        <div className='my-2 d-flex flex-row'>
                                                            <input autoComplete='off' checked={answer.CheckboxesAnswers.includes(option.optionText)} className='mx-2 mt-1' type='checkbox' readOnly />                                               <input autoComplete='off' type='text' value={option.optionText} style={{
                                                                borderRadius: '0px'
                                                            }} name='optionText' className='bg-light border-bottom border-secondary w-50 px-2 py-0 d-inline' readOnly />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        {(answer.question.questionType === 'Multiplechoice') && (
                                            <div className=' d-flex flex-column'>
                                                {answer.question?.options?.map((option, optindex) => {
                                                    return (
                                                        <div className='my-2 d-flex flex-row'>
                                                            <input autoComplete='off' checked={(answer.multipleChoiceAnswer === option.optionText)} style={{
                                                                width: '23px'
                                                            }} className='mx-2' type='radio' name={`question-${index}`} readOnly />
                                                            <input autoComplete='off' type='text' value={option.optionText} style={{
                                                                borderRadius: '0px'
                                                            }} name='optionText' className='bg-light border-bottom border-secondary w-50 px-2 py-0 d-inline' readOnly />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        {answer.question.questionType === 'Linearscale' && (
                                            <div className=' d-flex my-3 flex-column pe-4'>
                                                <span>Minimum Value : {answer.question.minValue}</span>
                                                <span>Selected Value : {answer.linearScaleAnswer}</span>
                                                <span>Maximum Value : {answer.question.maxValue}</span>
                                            </div>
                                        )}
                                        {answer.question.questionType === 'Date' && (
                                            <div className=' d-flex my-3 flex-column pe-4'>
                                                <span>Selected Date :</span>
                                                <input autoComplete='off' value={answer.dateAnswer} type='date' className='w-50 bg-light p-2 border-0 border-bottom border-secondary' readOnly />
                                            </div>
                                        )}
                                        {answer.question.questionType === 'Time' && (
                                            <div className=' d-flex my-3 flex-column pe-4'>
                                                <input autoComplete='off' value={answer.timeAnswer} type='time' className='w-50 bg-light p-2 border-0 border-bottom border-secondary' readOnly />
                                            </div>
                                        )}
                                        <div className='my-2 mt-4 d-flex justify-content-end'>
                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input autoComplete='off' className='ms-3' name='IsPass' type="checkbox" checked={answer.question.Required} />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>
                                        </div>
                                    </div>
                                )
                            })}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ShowFormAnswers
