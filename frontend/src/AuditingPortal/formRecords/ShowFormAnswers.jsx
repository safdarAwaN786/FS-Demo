import style from './formView.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { BiMenuAltLeft, BiTimeFive } from 'react-icons/bi'
import { BsTextParagraph, BsFillGrid3X3GapFill, BsGrid3X3, BsArrowLeftCircle } from "react-icons/bs"
import { MdRadioButtonChecked, MdOutlineCheckBox, MdOutlineDateRange } from 'react-icons/md';
import { IoIosArrowDropdown } from 'react-icons/io';
import { AiOutlineLine } from 'react-icons/ai';
import { FaMinus } from 'react-icons/fa'
import Select from 'react-select';
import { BiPlus } from 'react-icons/bi'
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';

function ShowFormAnswers() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [answers, setAnswers] = useState([]);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

 

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-record-by-recordId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            setDataToSend(res.data.data);
            setAnswers(res.data.data.answers);
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






    const customStyles = {
        control: (provided) => ({
            ...provided,
            height: '40px', // Set your desired height here
        }),
    };




    return (
        <>
            <div className={style.parent}>
                <div className={`${style.form} mt-5 `}>
                    <div className='d-flex flex-row bg-white px-lg-3  px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'List of Forms' }))
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
                                    <input value={dataToSend?.Form.FormName} className='w-100' name='FormName' type="text" readOnly />
                                </div>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Form Description</p>
                                <div>
                                    <input value={dataToSend?.Form.FormDescription} className='w-100' name='FormDescription' type="text" readOnly />
                                </div>
                            </div>

                            {answers.map((answer, index) => {
                                return (
                                    <div style={{
                                        borderRadius: '6px'
                                    }} className='bg-white my-4 p-3'>
                                        <div className='d-flex bg-white justify-content-between '>
                                            <div style={{
                                                width: '100%'
                                            }} className=' me-3 d-flex flex-column'>
                                                <input value={answer.question.questionText} style={{
                                                    borderRadius: '0px'
                                                }} name='questionText' className='border-bottom border-secondary bg-light mt-2 mb-3 w-100 p-3' readOnly />

                                            </div>
                                            {/* <div style={{
                                                width: '40%'
                                            }} className=' mt-2'>
                                                

                                            </div> */}
                                        </div>


                                        {(answer.question.questionType === 'ShortText') && (
                                            <div className='pe-4'>
                                                <span>Short Answer :</span>

                                                <input value={answer.shortTextAnswer}  className='bg-light border-bottom border-secondary py-1 my-1  w-100' type='text' readOnly/>

                                            </div>

                                        )}
                                        {(answer.question.questionType === 'LongText') && (
                                            <div className='pe-4'>
                                                <span>Long Answer :</span>
                                                <textarea value={answer.longTextAnswer}  rows={3} name='longTextAnswer' className='w-100 bg-light border-0 p-1 border-bottom border-secondary' readOnly/>

                                            </div>

                                        )}

                                        {(answer.question.questionType === 'Multiplechoicegrid') && (
                                            <div className=' d-flex flex-column'>
                                                <div className='d-flex my-2 flex-row'>
                                                    <span className='me-5 pe-4 px-2 py-0 d-inline'>R\C</span>
                                                    {answer?.question.columns.map((column, colIndex) => {
                                                        return (
                                                            <input value={column.colTitle} className='bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ' type='text' readOnly />
                                                        )
                                                    })}
                                                </div>


                                                {answer?.question.rows?.map((row, rowIndex) => {
                                                    return (

                                                        <div className='my-2 d-flex flex-row'>


                                                            <span>{rowIndex + 1}.</span>

                                                            <input value={row.rowTitle} name='rowTitle' type='text' style={{
                                                                borderRadius: '0px'
                                                            }} className='bg-light border-bottom border-secondary w-25 px-2 py-0 d-inline' readOnly />
                                                            <div className='d-flex justify-content-between w-75'>


                                                                {answer.question?.columns.map((colnum, colIndex) => {
                                                                    return (
                                                                        <input checked={answer.multipleChoiceGridAnswers.includes(`R${rowIndex}-C${colIndex}`)} name={`R${rowIndex}`} type='radio' readOnly />
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {(answer.question.questionType === 'Checkboxgrid') && (
                                            <div className=' d-flex flex-column'>
                                                <div className='d-flex my-2 flex-row'>
                                                    <span className='me-25 pe-25 px-2 py-0 d-inline'>R\C</span>
                                                    {answer.question?.columns.map((column, colIndex) => {
                                                        return (
                                                            <input value={column.colTitle} className='bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ' type='text' readOnly />
                                                        )
                                                    })}
                                                </div>


                                                {answer.question?.rows?.map((row, rowIndex) => {
                                                    return (

                                                        <div className='my-2 d-flex flex-row'>


                                                            <span>{rowIndex + 1}.</span>

                                                            <input value={row.rowTitle} type='text' style={{
                                                                borderRadius: '0px'
                                                            }} className='bg-light border-bottom border-secondary w-50 px-2 py-0 d-inline' readOnly />

                                                            <div className='d-flex justify-content-between w-75'>

                                                                {answer.question?.columns.map((colnum, colIndex) => {
                                                                    return (
                                                                        <input value={answer.checkboxGridAnswers.includes(`R${rowIndex}-C${colIndex}`)}  className='mx-2' type='checkbox' readOnly/>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

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


                                                            <input value={answer.CheckboxesAnswers.includes(option.optionText)}  className='mx-2 mt-1' type='checkbox' readOnly/>                                               <input type='text' value={option.optionText} style={{
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
                                                            <input value={(answer.multipleChoiceAnswer === option.optionText)}  style={{
                                                                width: '23px'
                                                            }} className='mx-2' type='radio' name={`question-${index}`} readOnly />

                                                            <input type='text' value={option.optionText} style={{
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
                                                <input value={answer.dateAnswer}  type='date' className='w-50 bg-light p-2 border-0 border-bottom border-secondary'  readOnly/>



                                            </div>

                                        )}

                                        {answer.question.questionType === 'Time' && (
                                            <div className=' d-flex my-3 flex-column pe-4'>

                                                <input value={answer.timeAnswer}  type='time' className='w-50 bg-light p-2 border-0 border-bottom border-secondary'  readOnly/>
                                            </div>

                                        )}




                                        <div className='my-2 mt-4 d-flex justify-content-end'>
                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input className='ms-3' name='IsPass' type="checkbox" checked={answer.question.Required} />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>

                                        </div>
                                    </div>
                                )
                            })}


                            {/* <div className='d-flex flex-row'>

                                <a onClick={addQuestion} className='btn btn-outline-danger my-4 fs-4 w-100'>Add Question</a>
                                {questions.length > 0 && (

                                    <a style={{
                                        borderRadius: '100px',
                                        width: '40px',
                                        height: '40px',

                                    }} onClick={clearLastQuestion} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
                                )}
                            </div> */}







                            {/* <div className={style.btns}>

                                <button className='mt-3' type='submit'>Submit</button>
                            </div> */}
                        </form>
                    </div>

                </div>
            </div>
            {/* {
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
            } */}

        </>
    )
}

export default ShowFormAnswers
