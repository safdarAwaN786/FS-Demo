import style from './CreateChecklist.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { FaMinus } from 'react-icons/fa'
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Select from 'react-select';
import { setSmallLoading } from '../../redux/slices/loading';

function EditChecklist() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState({});
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const user = useSelector(state => state.auth.user);
    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getChecklistById/${idToWatch}`).then((response) => {
            setDataToSend(response.data.data);
            setQuestions(response.data.data.ChecklistQuestions);
            if (departmentsToShow) {
                dispatch(setSmallLoading(false))
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

    const updateDataToSend = (event) => {
        setDataToSend({ ...dataToSend, [event.target.name]: event.target.value })
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

    const alertManager = () => {
        setalert(!alert)
    }

    const [departmentsToShow, SetDepartmentsToShow] = useState(null);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
            if (questions) {
                dispatch(setSmallLoading(false))
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
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        setDataToSend({ ...dataToSend, ChecklistQuestions: questions })
    }, [questions])
    const addQuestion = () => {
        const updatedQuestions = [...questions];
        updatedQuestions.push({ questionText: '' });
        setQuestions(updatedQuestions);

    };
    const clearLastQuestion = () => {
        if (questions.length > 0) {
            const updatedQuestions = [...questions];
            updatedQuestions.pop(); // Remove the last element
            setQuestions(updatedQuestions);
        }
    };
    const options = [
        { value: 'GradingSystem', label: <div> Grading System (1 - 10) </div> },
        { value: 'Yes/No', label: <div><span className={`p-1 mx-2 px-2  ${style.successAns}`}>Yes</span><span className={`p-1 mx-2 px-2  ${style.dangerAns}`}>No</span><span className={`p-1 mx-2 px-2  ${style.secondaryAns}`}>N/A</span></div> },
        { value: 'Pass/Fail', label: <div><span className={`p-1 mx-2 px-2  ${style.successAns}`}>Pass</span><span className={`p-1 mx-2 px-2  ${style.dangerAns}`}>Fail</span><span className={`p-1 mx-2 px-2  ${style.secondaryAns}`}>N/A</span></div> },
        { value: 'Safe/AtRisk', label: <div><span className={`p-1 mx-2 px-2  ${style.successAns}`}>Safe</span><span className={`p-1 mx-2 px-2  ${style.dangerAns}`}>At Risk</span><span className={`p-1 mx-2 px-2  ${style.secondaryAns}`}>N/A</span></div> },
        { value: 'Compliant/NonCompliant', label: <div><span className={`p-1 mx-2 px-2  ${style.successAns}`}>Compliant</span><span className={`p-1 mx-2 px-2  ${style.dangerAns}`}>Non Compliant</span><span className={`p-1 mx-2 px-2  ${style.secondaryAns}`}>N/A</span></div> },
        { value: 'Good/Fair/Poor', label: <div><span className={`p-1 mx-2 px-2  ${style.successAns}`}>Good</span><span className={`p-1 mx-2 px-2  ${style.warningAns}`}>Fair</span><span className={`p-1 mx-2 px-2  ${style.dangerAns}`}>Poor</span><span className={`p-1 mx-2 px-2  ${style.secondaryAns}`}>N/A</span></div> },
        {
            value: 'Conform/MinorNonComform/MajorNonConform/CriticalNonConform/Observation', label: <div className='d-flex flex-column'>
                <div className='my-2'><span className={`p-1 my-1 mx-2 px-2  ${style.successAns}`}>Conform</span><span className={`p-1 my-1 mx-2 px-2  ${style.warningAns}`}>Minor Non Conform</span></div><div className='my-2'><span className={`p-1 my-1 mx-2 px-2  ${style.primaryAns}`}>Critical Non-Conform</span><span className={`p-1 my-1 mx-2 px-2  ${style.dangerAns}`}>Major Non Conform</span></div><div className='my-2'><span className={`p-1 my-1 mx-2 px-2  ${style.pinkAns} `}>Observation</span><span className={`p-1 my-1 mx-2 px-2  ${style.secondaryAns}`}>N/A</span></div></div>
        },
    ]

    useEffect(() => {
        console.log(dataToSend);
    }, [dataToSend])
    const makeRequest = () => {
        if (dataToSend) {
            dispatch(setSmallLoading(true))
            axios.put(`${process.env.REACT_APP_BACKEND_URL}/updateChecklist`, dataToSend).then(() => {
                console.log("request made !");
                setDataToSend(null);
                setQuestions([])
                dispatch(setSmallLoading(false));
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Internal Audit Check List' }))
                    }
                })

            }).catch(err => {
                dispatch(setSmallLoading(false));
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

    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Internal Audit Check List' }))
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
                            Edit Checklist
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        if (dataToSend.ChecklistQuestions.length > 0) {
                            alertManager();

                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Sorry..',
                                text: 'Kindly Add at least one Clause.',
                                confirmButtonText: 'OK.'
                            })
                        }
                    }}>
                        <div className={`${style.myBox} pb-4`}>
                            <div className={style.formDivider}>
                                
                            </div>
                            <div className={`${style.formDivider} flex-column justify-content-center`}>
                                {questions?.map((question, index) => {
                                    return (
                                        <div style={{
                                            borderRadius: '6px',
                                            width: '700px'
                                        }} className='bg-white mx-auto my-4 p-3'>
                                            <div className='d-flex bg-white justify-content-center flex-column '>
                                                <div style={{
                                                    width: '100%'
                                                }} className=' me-3 d-flex flex-column'>
                                                    <input autoComplete='off' value={dataToSend?.ChecklistQuestions[index]?.questionText} onChange={(e) => {
                                                        const updatedQuestions = [...questions];
                                                        updatedQuestions[index][e.target.name] = e.target.value;
                                                        setQuestions(updatedQuestions);
                                                    }} style={{
                                                        borderRadius: '0px'
                                                    }} name='questionText' placeholder='Untitled Question' className='border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3' required />
                                                </div>
                                                <div>
                                                    Compliance Type : {question.ComplianceType}
                                                </div>
                                                <div style={{
                                                    width: '100%'
                                                }} className=' mt-2 d-flex flex-row'>
                                                    <div style={{
                                                        width: '80%'
                                                    }}>

                                                        <Select menuPosition="fixed" onChange={(selectedOption) => {
                                                            const updatedQuestions = [...questions]
                                                            updatedQuestions[index].ComplianceType = selectedOption.value;

                                                            setQuestions(updatedQuestions);
                                                        }} options={options} />
                                                    </div>
                                                    <p className='mx-2 mt-1' style={{
                                                        fontFamily: 'Inter',
                                                        color: 'black'
                                                    }}>Required</p>
                                                    <label className={style.switch}>
                                                        <input autoComplete='off' checked={question?.Required} className='ms-3' name='Required' type="checkbox" onChange={(event) => {
                                                            const updatedQuestions = [...questions];
                                                            updatedQuestions[index].Required = event.target.checked;

                                                            setQuestions(updatedQuestions);
                                                        }} />
                                                        <span className={`${style.slider} ${style.round}`} ></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div className='d-flex flex-row mx-auto'>
                                    <a onClick={addQuestion} className='btn btn-outline-danger my-4 fs-4 w-100'>Add Question</a>
                                    {questions.length > 0 && (
                                        <a style={{
                                            borderRadius: '100px',
                                            width: '40px',
                                            height: '40px',
                                        }} onClick={clearLastQuestion} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
                                    )}
                                </div>
                            </div>
                        </div>





                        <div className={style.btn}>
                            <button>Submit</button>
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

export default EditChecklist
