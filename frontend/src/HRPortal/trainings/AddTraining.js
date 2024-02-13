import style from './AddTraining.module.css'
import office from '../../assets/images/employeeProfile/Office.svg'
import copyp from '../../assets/images/employeeProfile/CopyP.svg'
import cnic from '../../assets/images/employeeProfile/UserCard.svg'
import { useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'

function AddTraining() {

    const [alert, setalert] = useState(false);
    const [trainingData, setTrainingData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const documentRef = useRef(null);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const handleDocumentClick = () => {
        documentRef.current.click(); // Trigger the click event on the file input
    };

    const handleDocumentChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedDocument(file.name);
        }
    };

    const makeRequest = () => {
        if (trainingData) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addTraining`, trainingData, { headers: { Authorization: `${user._id}` } }).then(() => {
                dispatch(setSmallLoading(false))
                setTrainingData(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({...tabData, Tab : 'Add Trainings'}))
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


            <div className={`${style.form} mt-5`}>
                <div className='d-flex flex-row bg-white px-lg-3  px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({...tabData, Tab : 'Add Trainings'}))
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
                        Add Training
                    </div>
                </div>
                <div className={style.sec1}>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        const data = new FormData(event.target);
                        setTrainingData(data);
                        alertManager();
                    }}>

                        <div>
                            <p>Training Name</p>
                            <div>
                                <img src={office} alt="" />
                                <input autoComplete='off' name='TrainingName' type="text" required />
                            </div>
                        </div>
                        <div>
                            <p>Description</p>
                            <div>
                                <img src={copyp} alt="" />
                                <textarea name='Description' className={style.fortextarea} type="text" required />
                            </div>
                        </div>
                        <div>
                            <p>Evaluation Criteria</p>
                            <div>
                                <img src={cnic} alt="" />
                                <textarea name='EvaluationCriteria' className={style.fortextarea} type="text" required />
                            </div>
                        </div>
                        <input autoComplete='off' onChange={handleDocumentChange} name='TrainingMaterial' type='file' accept='.pdf' ref={documentRef} style={{ display: 'none' }} />
                        <div className={style.btns}>
                            <p style={{
                                padding: "15px 10px",
                                cursor: 'pointer',
                                width: "246px",
                                height: "58px",
                                flexShrink: "0",
                                borderRadius: "10px",
                                border: "1px solid #ee6a5f",
                                color: "#ee6a5f",
                                fontSize: "17px",
                                fontFamily: "Poppins",
                                fontStyle: "normal",
                                fontWeight: "400",
                                lineHeight: "normal",
                                background: "#fff",
                            }} onClick={handleDocumentClick}>{selectedDocument?.slice(0, 15) || "Upload Training Material"}</p>
                            <button type='submit'>Submit</button>
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
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cencel</button>

                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default AddTraining
