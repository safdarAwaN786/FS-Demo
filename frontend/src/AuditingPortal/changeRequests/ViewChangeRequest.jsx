import style from './ViewChangeRequest.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function ViewChangeRequest() {

    const [requestData, setRequestData] = useState(null);
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const user = useSelector(state => state.auth.user)
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readChangeRequestById/${idToWatch}`).then((response) => {
            setRequestData(response.data.data);
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

    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5  mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({...tabData, Tab : 'Document Change Creation'}))
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
                            View Document Change Request
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                    }}>
                        <div className={`${style.myBox}`}>
                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Title</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' value={requestData?.Document?.DocumentTitle || requestData?.Document?.DocumentName} className='p-2 overflow-x-handler' type='text' readOnly />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Line no</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' value={requestData?.LineNo} className='p-2 overflow-x-handler' type='text' readOnly />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Paragraph No</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' value={requestData?.ParagraphNo} className='p-2 overflow-x-handler' type='number' readOnly />
                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' value={requestData?.Department.DepartmentName} className='p-2 overflow-x-handler'  readOnly />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Page No</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' value={requestData?.PageNo} className='p-2 overflow-x-handler' type='number' readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='px-5'>
                                <p style={{
                                    fontFamily: 'Inter'
                                }} className='fs-5'>Reason of Change</p>
                                <textarea value={requestData?.ReasonForChange} style={{
                                    borderRadius: '8px',
                                    fontFamily: 'Inter'
                                }} rows={10} className='p-3 w-100 border-0' readOnly />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ViewChangeRequest
