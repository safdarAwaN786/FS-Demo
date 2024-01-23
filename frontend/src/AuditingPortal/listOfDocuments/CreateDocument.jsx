
import style from './CreateDocument.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import JoditEditor from 'jodit-react';
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function CreateDocument() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    useEffect(() => {
        console.log(dataToSend);
    }, [dataToSend])

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
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const makeRequest = () => {
        if (dataToSend.EditorData) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-document`, {...dataToSend, createdBy : user.Name}, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                setDataToSend(null);
                dispatch(setSmallLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Master List of Documents' }))
                    }
                })
            }).catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Try filling data again',
                    confirmButtonText: 'OK.'
                })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Kindly Fill some Data in Text Editor',
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
                                    dispatch(updateTabData({ ...tabData, Tab: 'Master List of Documents' }))
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
                            Create Document
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();
                    }}>
                        <div className={style.myBox}>

                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Title</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} value={dataToSend?.DocumentTitle} name='DocumentTitle' className='text-dark' type="text" placeholder='Title Here' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>
                                        </div>
                                        <div>
                                            <select className='form-select  form-select-lg' onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} value={dataToSend?.Department} name='Department' style={{ width: "100%" }} required>
                                                <option value="" selected disabled>Choose Department</option>
                                                {departmentsToShow?.map((depObj) => {
                                                    return (
                                                        <option value={depObj._id}>{depObj.DepartmentName}</option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Type</p>
                                        </div>
                                        <div>
                                            <select className='form-select  form-select-lg' value={dataToSend?.DocumentType} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} name='DocumentType' style={{ width: "100%" }} required >
                                                <option value="" selected disabled>Choose Type</option>
                                                <option value="Manuals">Manuals</option>
                                                <option value="Procedures">Procedures</option>
                                                <option value="SOPs">SOPs</option>
                                                <option value="Forms">Forms</option>
                                            </select>

                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className=' p-5'>

                                <JoditEditor value={dataToSend?.EditorData} onChange={(content) => {
                                    setDataToSend({ ...dataToSend, EditorData: content });
                                }} />
                            </div>
                        </div>


                        <div className={style.btn}>
                            <button type='submit' >Submit</button>
                        </div>
                    </form>
                </div>
            </div>
            {
                alert ?
                    <div className={style.alertparent}>
                        <div className={style.alert}>
                            <p className={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest();

                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cencel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default CreateDocument
