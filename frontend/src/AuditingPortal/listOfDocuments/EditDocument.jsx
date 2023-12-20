
import style from './CreateDocument.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import JoditEditor from 'jodit-react';
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';

function EditDocument() {

    const [documentData, setDocumentData] = useState(null);
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess)

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-documentById/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            setDocumentData(response.data.data);
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

    const makeRequest = () => {
        if (documentData.EditorData) {
            dispatch(setLoading(true))
            axios.put(`${process.env.REACT_APP_BACKEND_URL}/updateDocument`, documentData, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                console.log("request made !");
                setDocumentData(null);
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({...tabData, Tab : 'Master List of Documents'}))
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
                            Edit Document
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();

                    }}>
                        <div className={style.myBox}>

                            <div className={style.formDivider}>



                                <div className='p-5'>

                                    <JoditEditor value={documentData?.EditorData} onChange={(content) => {
                                        setDocumentData({ ...documentData, EditorData: content });
                                    }} />
                                </div>
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
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
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

export default EditDocument
