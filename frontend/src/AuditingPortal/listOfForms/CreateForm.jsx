import style from './CreateForm.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BiMenuAltLeft, BiTimeFive } from 'react-icons/bi'
import { BsTextParagraph, BsFillGrid3X3GapFill, BsGrid3X3, BsArrowLeftCircle } from "react-icons/bs"
import { MdRadioButtonChecked, MdOutlineCheckBox, MdOutlineDateRange } from 'react-icons/md';
import { IoIosArrowDropdown } from 'react-icons/io';
import { AiOutlineLine } from 'react-icons/ai';
import { FaMinus } from 'react-icons/fa'
import Select from 'react-select';
import { BiPlus } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function CreateForm() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [questions, setQuestions] = useState([]);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
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
    const addQuestion = () => {
        const updatedQuestions = [...questions];
        updatedQuestions.push({ questionType: 'ShortText' });
        setQuestions(updatedQuestions);

    };
    const clearLastQuestion = () => {
        if (questions.length > 0) {
            const updatedQuestions = [...questions];
            updatedQuestions.pop(); // Remove the last element
            setQuestions(updatedQuestions);
        }
    };

    useEffect(() => {
        setDataToSend({ ...dataToSend, questions: questions })
    }, [questions])


    const options = [
        { value: 'ShortText', label: <div><BiMenuAltLeft /> Short Answer </div> },
        { value: 'LongText', label: <div><BsTextParagraph /> Long Answer </div> },
        { value: 'Multiplechoice', label: <div><MdRadioButtonChecked /> Multiple Choice </div> },
        { value: 'Checkbox', label: <div><MdOutlineCheckBox /> Checkboxes </div> },
        { value: 'Dropdown', label: <div><IoIosArrowDropdown /> Dropdown </div> },
        { value: 'Linearscale', label: <div><AiOutlineLine /> Linear scale </div> },
        { value: 'Multiplechoicegrid', label: <div><BsFillGrid3X3GapFill /> Multiple choice Grid </div> },
        { value: 'Checkboxgrid', label: <div><BsGrid3X3 /> Checkbox Grid </div> },
        { value: 'Date', label: <div><MdOutlineDateRange /> Date </div> },
        { value: 'Time', label: <div><BiTimeFive /> Time </div> },
    ]

    const customStyles = {
        control: (provided) => ({
            ...provided,
            height: '40px', // Set your desired height here
        }),
    };

    const makeRequest = () => {
        if (dataToSend?.questions.length > 0) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-form`, {...dataToSend, createdBy : user.Name}, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                dispatch(setSmallLoading(false))
                setDataToSend(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Master List of Records/Forms' }))
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
                text: 'Kindly, Add at least one question ',
                confirmButtonText: 'OK.'
            })
        }
    }


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
                            Create Form
                        </div>

                    </div>
                    <div className={`${style.sec1}  px-3`}>
                        <form encType='multipart/form-data' onSubmit={(event) => {
                            event.preventDefault();

                            alertManager();
                        }}>

                            <div className='mb-4'>
                                <p className='text-black'>Department</p>
                                <div>
                                    <select value={dataToSend?.Department} onChange={(e) => {
                                        setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                    }} name='Department' className={`form-select  form-select-lg `} aria-label="Large select example" required>
                                        <option disabled selected>Choose Department</option>
                                        {departmentsToShow?.map((depObj) => {
                                            return (
                                                <option value={depObj._id}>{depObj.DepartmentName}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <p className='text-black'>Document Type</p>
                                <select value={dataToSend?.DocumentType} onChange={(e) => {
                                    setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                }} name='DocumentType' className={`form-select  form-select-lg mb-3`} aria-label="Large select example" required>
                                    <option disabled selected>Choose Type</option>
                                    <option value="Manuals">Manuals</option>
                                    <option value="Procedures">Procedures</option>
                                    <option value="SOPs">SOPs</option>
                                    <option value="Forms">Forms</option>

                                </select>
                            </div>
                            <div>
                                <p className='text-black'>Maintenance Frequency</p>
                                <select value={dataToSend?.MaintenanceFrequency} onChange={(e) => {
                                    setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                }} name='MaintenanceFrequency' className={`form-select  form-select-lg mb-3`} aria-label="Large select example" required>
                                    <option disabled selected>Choose Frequecy</option>
                                    <option value="1 Hour">1 Hour</option>
                                    <option value="2 Hour">2 Hour</option>
                                    <option value="3 Hour">3 Hour</option>
                                    <option value="4 Hour">4 Hour</option>
                                    <option value="5 Hour">5 Hour</option>
                                    <option value="6 Hour">6 Hour</option>
                                    <option value="7 Hour">7 Hour</option>
                                    <option value="8 Hour">8 Hour</option>
                                    <option value="9 Hour">9 Hour</option>
                                    <option value="10 Hour">10 Hour</option>
                                    <option value="11 Hour">11 Hour</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Yearly">Yearly</option>

                                </select>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Form Name</p>
                                <div>
                                    <input autoComplete='off' value={dataToSend?.FormName} onChange={(e) => {
                                        setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                    }} className='w-100' name='FormName' type="text" required />
                                </div>
                            </div>
                            <div className='w-100'>
                                <p className='text-black'>Form Description</p>
                                <div>

                                    <input autoComplete='off' onChange={(e) => {
                                        setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                    }} value={dataToSend?.FormDescription} className='w-100' name='FormDescription' type="text" required />
                                </div>
                            </div>


                            {questions.map((question, index) => {
                                return (
                                    <div style={{
                                        borderRadius: '6px'
                                    }} className='bg-white my-4 p-3'>
                                        <div className='d-flex bg-white justify-content-between '>
                                            <div style={{
                                                width: '60%'
                                            }} className=' me-3 d-flex flex-column'>
                                                <input autoComplete='off' value={dataToSend?.questions[index]?.questionText} onChange={(e) => {
                                                    const updatedQuestions = [...questions];
                                                    updatedQuestions[index][e.target.name] = e.target.value;
                                                    setQuestions(updatedQuestions);
                                                }} style={{
                                                    borderRadius: '0px'
                                                }} name='questionText' placeholder='Untitled Question' className='border-bottom border-secondary bg-light mt-2 mb-3 w-100 p-3' required />

                                            </div>
                                            <div style={{
                                                width: '40%'
                                            }} className=' mt-2'>
                                                <Select defaultValue={options[0]} menuPosition="fixed" onChange={(selectedOption) => {
                                                    const updatedQuestions = [...questions]



                                                    if (selectedOption.value === 'Multiplechoice' || selectedOption.value === 'Dropdown' || selectedOption.value === 'Checkbox') {
                                                        updatedQuestions[index].questionType = selectedOption.value;
                                                        updatedQuestions[index].options = [{ optionText: '' }, { optionText: '' }];

                                                    } else if (selectedOption.value === 'Multiplechoicegrid' || selectedOption.value === 'Checkboxgrid') {
                                                        updatedQuestions[index].questionType = selectedOption.value;
                                                        updatedQuestions[index].rows = [{ rowTitle: '' }, { rowTitle: '' }];
                                                        updatedQuestions[index].columns = [{ colTitle: '' }, { colTitle: '' }];
                                                    } else {
                                                        updatedQuestions[index].questionType = selectedOption.value;
                                                    }
                                                    setQuestions(updatedQuestions);

                                                }} style={customStyles} options={options} />

                                            </div>
                                        </div>


                                        {(questions[index].questionType === 'ShortText' || questions[index].questionType === 'LongText') && (
                                            <div>

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
                                                                            <input autoComplete='off' value={dataToSend?.questions[index].columns[colIndex].colTitle} onChange={(e) => {
                                                                                const updatedQuestions = [...questions];
                                                                                updatedQuestions[index].columns[colIndex].colTitle = e.target.value;
                                                                                setQuestions(updatedQuestions);
                                                                            }} className={`bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ${style.noRadius}`} type='text' required />
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
                                                                            <input autoComplete='off' value={dataToSend?.questions[index].rows[rowIndex].rowTitle} onChange={(e) => {
                                                                                const updatedQuestions = [...questions];
                                                                                updatedQuestions[index].rows[rowIndex].rowTitle = e.target.value;
                                                                                setQuestions(updatedQuestions);
                                                                            }} name='rowTitle' type='text' style={{
                                                                                borderRadius: '0px'
                                                                            }} className='bg-light border-bottom border-secondary  px-2 py-0 d-inline' />
                                                                        </td>
                                                                        {questions[index]?.columns.map((colnum, colIndex) => {
                                                                            return (
                                                                                <td>
                                                                                    <input autoComplete='off' className='mx-2' style={{
                                                                                        width: '20px',
                                                                                        height: '20px'
                                                                                    }} name={`R${rowIndex}`} type='radio' />
                                                                                </td>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>




                                                <div className='d-flex justify-content-between mt-3'>

                                                    <div>


                                                        <a onClick={() => {
                                                            const updatedQuestions = [...questions];

                                                            updatedQuestions[index].rows.push({ rowTitle: '' });
                                                            setQuestions(updatedQuestions)
                                                        }} className='btn px-1 py-1 btn-primary'><BiPlus className='text-white' />Row</a>
                                                        {questions[index]?.rows.length > 1 && (

                                                            <a style={{
                                                                borderRadius: '50px',
                                                                width: '30px',
                                                                height: '30px'
                                                            }} onClick={() => {
                                                                const updatedQuestions = [...questions];
                                                                updatedQuestions[index].rows.pop();


                                                                setQuestions(updatedQuestions);
                                                            }} className='btn mx-1 p-0 btn-outline-primary'><FaMinus /></a>
                                                        )}
                                                    </div>
                                                    <div>

                                                        {questions[index]?.columns.length > 1 && (

                                                            <a style={{
                                                                borderRadius: '50px',
                                                                width: '30px',
                                                                height: '30px'
                                                            }} onClick={() => {

                                                                const updatedQuestions = [...questions]
                                                                updatedQuestions[index].columns.pop();
                                                                setQuestions(updatedQuestions);
                                                            }} className='btn mx-1 p-0 btn-outline-primary'><FaMinus /></a>
                                                        )}


                                                        <a onClick={() => {

                                                            const updatedQuestions = [...questions];
                                                            updatedQuestions[index].columns.push({ colTitle: '' });

                                                            setQuestions(updatedQuestions)
                                                        }} className='btn px-1 py-1 btn-primary'><BiPlus className='text-white' />Column</a>

                                                    </div>

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
                                                                            <input autoComplete='off' value={dataToSend?.questions[index].columns[colIndex].colTitle} onChange={(e) => {
                                                                                const updatedQuestions = [...questions];
                                                                                updatedQuestions[index].columns[colIndex].colTitle = e.target.value;
                                                                                setQuestions(updatedQuestions);
                                                                            }} className={`bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ${style.noRadius}`} type='text' required />
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
                                                                            <input autoComplete='off' value={dataToSend?.questions[index].rows[rowIndex].rowTitle} onChange={(e) => {
                                                                                const updatedQuestions = [...questions];
                                                                                updatedQuestions[index].rows[rowIndex].rowTitle = e.target.value;
                                                                                setQuestions(updatedQuestions);
                                                                            }} name='rowTitle' type='text' style={{
                                                                                borderRadius: '0px'
                                                                            }} className='bg-light border-bottom border-secondary  px-2 py-0 d-inline' required/>
                                                                        </td>
                                                                        {questions[index]?.columns.map((colnum, colIndex) => {
                                                                            return (
                                                                                <td>
                                                                                    <input autoComplete='off' className='mx-2' style={{
                                                                                        width: '20px',
                                                                                        height: '20px'
                                                                                    }}  type='checkbox' />
                                                                                </td>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                

                                                <div className='d-flex justify-content-between mt-3'>
                                                    <div>
                                                        <a onClick={() => {
                                                            const updatedQuestions = [...questions];

                                                            updatedQuestions[index].rows.push({});
                                                            setQuestions(updatedQuestions)
                                                        }} className='btn px-1 py-1 btn-primary'><BiPlus className='text-white' />Row</a>
                                                        {questions[index]?.rows.length > 1 && (

                                                            <a style={{
                                                                borderRadius: '50px',
                                                                width: '30px',
                                                                height: '30px'
                                                            }} onClick={() => {
                                                                const updatedQuestions = [...questions];
                                                                updatedQuestions[index].rows.pop();
                                                                setQuestions(updatedQuestions);
                                                            }} className='btn mx-1 p-0 btn-outline-primary'><FaMinus /></a>
                                                        )}
                                                    </div>
                                                    <div>

                                                        {questions[index]?.columns.length > 1 && (
                                                            <a style={{
                                                                borderRadius: '50px',
                                                                width: '30px',
                                                                height: '30px'
                                                            }} onClick={() => {
                                                                const updatedQuestions = [...questions]
                                                                updatedQuestions[index].columns.pop();
                                                                setQuestions(updatedQuestions);
                                                            }} className='btn mx-1 p-0 btn-outline-primary'><FaMinus /></a>
                                                        )}

                                                        <a onClick={() => {
                                                            const updatedQuestions = [...questions];
                                                            updatedQuestions[index].columns.push({ colTitle: '' });

                                                            setQuestions(updatedQuestions)
                                                        }} className='btn px-1 py-1 btn-primary'><BiPlus className='text-white' />Column</a>

                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {(questions[index].questionType === 'Dropdown' || questions[index].questionType === 'Checkbox' || questions[index].questionType === 'Multiplechoice') && (
                                            <div className=' d-flex flex-column'>
                                                {questions[index]?.options?.map((option, optindex) => {
                                                    return (
                                                        <div className='my-2 d-flex flex-row'>
                                                            <span>{optindex + 1}.</span>
                                                            <input autoComplete='off' onChange={(e) => {
                                                                const updatedQuestions = [...questions];
                                                                updatedQuestions[index].options[optindex][e.target.name] = e.target.value;
                                                                setQuestions(updatedQuestions);
                                                            }} type='text' value={dataToSend?.questions[index]?.options[optindex].optionText} style={{
                                                                borderRadius: '0px'
                                                            }} name='optionText' className='bg-light border-bottom border-secondary w-50 px-2 py-0 d-inline' />
                                                        </div>
                                                    )
                                                })}
                                                <div className='d-flex justify-content-end'>
                                                    {questions[index]?.options?.length > 2 && (
                                                        <a style={{
                                                            borderRadius: '50px',
                                                            width: '30px',
                                                            height: '30px'
                                                        }} onClick={() => {
                                                            const updatedQuestions = [...questions];
                                                            updatedQuestions[index].options.pop();
                                                            setQuestions(updatedQuestions);
                                                        }} className='btn me-2 p-0 btn-outline-primary'><FaMinus /></a>
                                                    )}
                                                    <a onClick={() => {
                                                        const updatedQuestions = [...questions];
                                                        updatedQuestions[index].options.push({ optionText: '' });
                                                        setQuestions(updatedQuestions)
                                                    }} className='btn p-1 btn-primary'>Add option</a>
                                                </div>
                                            </div>
                                        )}
                                        {questions[index].questionType === 'Linearscale' && (
                                            <div className=' d-flex flex-column'>
                                                <div className='d-flex flex-row '>
                                                    <div className='d-flex flex-column'>
                                                        <span>Low :</span>
                                                        <Select onChange={(selected) => {
                                                            const updatedQuestions = [...questions]
                                                            updatedQuestions[index].minValue = selected.value;
                                                            setQuestions(updatedQuestions);
                                                        }} options={[
                                                            { value: '0', label: 0 },
                                                            { value: '1', label: 1 },
                                                            { value: '2', label: 2 },
                                                            { value: '3', label: 3 },
                                                            { value: '4', label: 4 },
                                                            { value: '5', label: 5 },
                                                            { value: '6', label: 6 },
                                                            { value: '7', label: 7 },
                                                            { value: '8', label: 8 },
                                                            { value: '9', label: 9 },
                                                            { value: '10', label: 10 },
                                                        ]} />
                                                    </div>
                                                    <div className='d-flex flex-column'>
                                                        <span>-</span>
                                                        <span className='mx-2'>To</span>
                                                    </div>
                                                    <div className='d-flex flex-column'>
                                                        <span>High :</span>
                                                        <Select onChange={(selected) => {
                                                            const updatedQuestions = [...questions]
                                                            updatedQuestions[index].maxValue = selected.value;
                                                            setQuestions(updatedQuestions);
                                                        }} options={[
                                                            { value: '0', label: 0 },
                                                            { value: '1', label: 1 },
                                                            { value: '2', label: 2 },
                                                            { value: '3', label: 3 },
                                                            { value: '4', label: 4 },
                                                            { value: '5', label: 5 },
                                                            { value: '6', label: 6 },
                                                            { value: '7', label: 7 },
                                                            { value: '8', label: 8 },
                                                            { value: '9', label: 9 },
                                                            { value: '10', label: 10 },
                                                        ]} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className='my-2 mt-4 d-flex justify-content-end'>
                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input autoComplete='off' className='ms-3' name='IsPass' type="checkbox" onChange={(event) => {
                                                    const updatedQuestions = [...questions];
                                                    updatedQuestions[index].Required = event.target.checked;
                                                    setQuestions(updatedQuestions);
                                                }} />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>
                                        </div>
                                    </div>
                                )
                            })}
                            <div className='d-flex flex-row'>
                                <a onClick={addQuestion} className='btn btn-outline-danger my-4 fs-4 w-100'>Add Question</a>
                                {questions.length > 0 && (
                                    <a style={{
                                        borderRadius: '100px',
                                        width: '40px',
                                        height: '40px',

                                    }} onClick={clearLastQuestion} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
                                )}
                            </div>
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

export default CreateForm
