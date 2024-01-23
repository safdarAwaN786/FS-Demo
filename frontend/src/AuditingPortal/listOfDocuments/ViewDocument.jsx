
import style from './CreateDocument.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function ViewDocument() {

    const [documentData, setDocumentData] = useState(null);
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-documentById/${idToWatch}`).then((response) => {
            setDocumentData(response.data.data);
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


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({...tabData, Tab : 'Master List of Documents'}))
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
                            View Document
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();

                    }}>
                        <div className={style.myBox}>

                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Document Title</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' className='text-dark' value={documentData?.DocumentTitle} readOnly />

                                        </div>
                                    </div>

                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Revision No.</p>

                                        </div>
                                        <div>
                                            <input autoComplete='off' className='text-dark'  value={documentData?.RevisionNo} readOnly />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Department</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' className='text-dark'  value={documentData?.Department.DepartmentName} readOnly />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Created Date</p>
                                        </div>
                                        <div>
                                            <input autoComplete='off' className='text-dark'  value={`${documentData?.CreationDate?.slice(0, 10).split('-')[2]}/${documentData?.CreationDate?.slice(0, 10).split('-')[1]}/${documentData?.CreationDate?.slice(0, 10).split('-')[0]}`} readOnly />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Review Date</p>

                                        </div>
                                        <div>
                                            {documentData?.ReviewDate ? (
                                                <input autoComplete='off' className='text-dark'  value={`${documentData?.ReviewDate?.slice(0, 10).split('-')[2]}/${documentData?.ReviewDate?.slice(0, 10).split('-')[1]}/${documentData?.ReviewDate?.slice(0, 10).split('-')[0]}`} readOnly />
                                            ) : (
                                                <input autoComplete='off' className='text-dark'  value='- - -' />
                                            )}

                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Approval Date</p>

                                        </div>
                                        <div>
                                        {documentData?.ApprovalDate ? (

                                            <input autoComplete='off' className='text-dark'  value={`${documentData?.ApprovalDate?.slice(0, 10).split('-')[2]}/${documentData?.ApprovalDate?.slice(0, 10).split('-')[1]}/${documentData?.ApprovalDate?.slice(0, 10).split('-')[0]}`} readOnly />
                                        ) : (
                                            <input autoComplete='off' className='text-dark'  value='- - -' />
                                        )}


                                        </div>
                                    </div>


                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Document ID</p>

                                        </div>
                                        <div>
                                            <input autoComplete='off' className='text-dark'  value={documentData?.DocumentId} readOnly />


                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Document Type</p>

                                        </div>
                                        <div>
                                            <input autoComplete='off' className='text-dark'  value={documentData?.DocumentType} readOnly />


                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Created By</p>

                                        </div>
                                        <div>
                                        
                                            <input autoComplete='off' className='text-dark'  value={documentData?.CreatedBy} readOnly />


                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Reviewed By</p>

                                        </div>
                                        <div>
                                        {documentData?.ReviewedBy ? (

                                            <input autoComplete='off' className='text-dark'  value={documentData?.ReviewedBy} readOnly />
                                        ) : (
                                            <input autoComplete='off' value='- - -' />
                                        )}


                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p className='text-black'>Approved By</p>

                                        </div>
                                        <div>
                                        {documentData?.ApprovedBy ? (

                                            <input autoComplete='off' className='text-dark'  value={documentData?.ApprovedBy} readOnly />
                                        ) : (
                                            <input autoComplete='off' className='text-dark'  value='- - -' />
                                        )}


                                        </div>
                                    </div>



                                </div>
                            </div>
                            <div className='mx-2 p-lg-5 p-3'>

                                <div className='bg-white p-3' style={{
                                    height: '250px',
                                    overflowY: 'scroll',
                                    border: '2px solid silver'
                                }} dangerouslySetInnerHTML={{ __html: documentData?.EditorData }} />
                            </div>
                        </div>


                    </form>
                </div>
            </div>
            

        </>
    )
}

export default ViewDocument
