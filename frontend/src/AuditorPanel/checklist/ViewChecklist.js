import style from './CreateChecklist.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';

function ViewChecklist() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState({});
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getChecklistById/${idToWatch}`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            setDataToSend(response.data.data);
            setQuestions(response.data.data.ChecklistQuestions)
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


    const alertManager = () => {
        setalert(!alert)
    }

    


    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        setDataToSend({ ...dataToSend, ChecklistQuestions: questions })
    }, [questions])

    

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
                            View Checklist
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
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Type</p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <input value={dataToSend?.DocumentType} className='w-100' type="text" readOnly />
                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <input value={dataToSend?.Department?.DepartmentName} className='w-100' name='FormDescription' type="text" readOnly />
                                        </div>
                                    </div>
                                </div>
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
                                                    <input value={question.questionText} onChange={(e) => {
                                                        const updatedQuestions = [...questions];
                                                        updatedQuestions[index][e.target.name] = e.target.value;
                                                        setQuestions(updatedQuestions);
                                                    }} style={{
                                                        borderRadius: '0px'
                                                    }} name='questionText' placeholder='Untitled Question' className='border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3' required readOnly />

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

                                                       
                                                    </div>
                                                    <p className='mx-2 mt-1' style={{
                                                        fontFamily: 'Inter',
                                                        color: 'black'
                                                    }}>Required</p>
                                                    <label className={style.switch}>
                                                        <input checked={question?.Required} className='ms-3' name='Required' type="checkbox" onChange={(event) => {
                                                            const updatedQuestions = [...questions];
                                                            updatedQuestions[index].Required = event.target.checked;

                                                            setQuestions(updatedQuestions);
                                                        }} readOnly />
                                                        <span className={`${style.slider} ${style.round}`} ></span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                
                            </div>
                        </div>
                    </form>
                </div>
            </div>
           

        </>
    )
}

export default ViewChecklist
