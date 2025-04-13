import style from './GenerateMWR.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Swal from 'sweetalert2';
import { setSmallLoading } from '../../redux/slices/loading';

function GenerateMWR2() {
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [request, setRequest] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getWorkRequestById/${idToWatch}`).then((res) => {
            setRequest(res.data.data);
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
    
    const handleDownloadImage = async (imageURL) => {
       try {
           if (imageURL) {

               dispatch(setSmallLoading(true))
               const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                   params: {
                       url: imageURL,
                   },
                   responseType: 'blob' // Specify the response type as 'blob' to handle binary data
               });


               let blob;

               blob = new Blob([response.data]);
               // }

               // Create a temporary anchor element
               const link = document.createElement('a');
               link.href = window.URL.createObjectURL(blob);

               // Set the download attribute and suggested filename for the downloaded image
               link.download = `${user.Department.DepartmentName}-FSMS${imageURL.substring(imageURL.lastIndexOf('.'))}`;

               // Append the anchor element to the document body and click it to trigger the download
               document.body.appendChild(link);
               dispatch(setSmallLoading(false))
               link.click();
               // Clean up by removing the temporary anchor element
               document.body.removeChild(link);
           } else {
               Swal.fire({
                   icon: 'error',
                   title: 'OOps..',
                   text: 'No any file uploaded here!'
               })
           }
       } catch (error) {
           dispatch(setSmallLoading(false))
           Swal.fire({
               icon: 'error',
               title: 'OOps..',
               text: 'Something went wrong, Try Again!'
           })
       }

   };





    return (
        <>
                <div className='d-flex flex-row bg-white px-lg-5 mx-1 px-2 py-2'>
                    <BsArrowLeftCircle
                        role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({...tabData, Tab : 'Generate MWR Corrective'}))
                            }
                        }} />

                </div>
                <div className={`${style.headers} mt-1`}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                         MWR Details
                    </div>

                </div>
                <div className={style.form}>
                    <div className={style.sec1}>
                        <div>
                            <p className='mt-2'>Area</p>
                            <div className={style.dropdownfield}>
                                <p>{request?.Area}</p>

                            </div>
                        </div>

                        <div >
                            <p className='mt-2'>Priority</p>
                            <div className={style.dropdownfield}>
                                <p>{request?.Priority}</p>

                            </div>
                        </div>

                        <div >
                            <p className='mt-2'>
                                Description of work
                            </p>
                            <textarea value={request?.Description} type="text" readOnly />
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div >
                            <p className='mt-2'>Machine Name</p>
                            <div className={style.dropdownfield}>
                                <p>{request?.Machinery.machineName}</p>

                            </div>
                        </div>

                        <div>
                            <p className='mt-2'>Discipline</p>
                            <div className={style.dropdownfield}>
                                {request?.Discipline?.map((value) => {
                                    return (
                                        <p className='d-block w-100'>{value}</p>
                                    )
                                })}

                            </div>
                        </div>

                        <div>
                            <p className='mt-2'>
                                Special Instruction
                            </p>
                            <textarea value={request?.SpecialInstruction} type="text" readOnly />
                        </div>
                    </div>
                </div>
                <div className={style.btnparent}>
                    <p>Image</p>
                    <button onClick={() => { handleDownloadImage(request?.imageURL) }} className={style.download}>Download</button>
                </div>

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                        <div className='overflow-y-handler'>
                            <p class={style.msg}>{popUpData}</p>
                        </div>
                            <div className={style.alertbtns}>

                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={alertManager} className={style.btn2}>OK.</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default GenerateMWR2
