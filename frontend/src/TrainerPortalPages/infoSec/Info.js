import style from './Info.module.css'
import clock from '../../assets/images/viewtrainings/Clock.svg'
import star from '../../assets/images/viewtrainings/Star.svg'
import mos from '../../assets/images/viewtrainings/mos.svg'
import copy from '../../assets/images/employeeProfile/CopyP.svg'
import calender from '../../assets/images/employeeProfile/Calendar.svg'
import office from '../../assets/images/employeeProfile/Office.svg'
import cnic from '../../assets/images/employeeProfile/UserCard.svg'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setLoading } from '../../redux/slices/loading'

function Info() {
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const [popUpData, setPopUpData] = useState(null);
    const [assignedTrainingToShow, setassignedTrainingToShow] = useState(null);
    const fileInputRef = useRef(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess)

    useEffect(() => {
        dispatch(setLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyPlan`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            const assignedTrainingsList = response.data.data;
            setassignedTrainingToShow(assignedTrainingsList.find((training) => training._id === idToWatch));
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
    const [alert2, setAlert2] = useState(false);
    const [images, setImages] = useState(null);
    const handleImageClick = () => {

        fileInputRef.current.click(); // Trigger the click event on the file input
    };

    const handleImageChange = (event) => {
        console.log(event.target.files);
        setImages(Array.from(event.target.files))
        setAlert2(true);
    };

    const makeRequest = () => {
        if (images) {
            dispatch(setLoading(true))
            const formData = new FormData();
            formData.append("planId", idToWatch);
            images.forEach((image, index) => {
                formData.append("Images", image); // Use the correct field name "Images"
            });
            console.log(formData);
            axios.patch(`${process.env.REACT_APP_BACKEND_URL}/upload-images`, formData, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                console.log("request made !");
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Images Uploaded successfully',
                    icon: 'success',
                    confirmButtonText: 'Ok.',
                })
            }).catch(err => {
                dispatch(setLoading(false));
                Swal.fire({
                    icon : 'error',
                    title : 'OOps..',
                    text : 'Something went wrong, Try Again!'
                })
            })
            setImages(null);
            document.getElementById("imagesInput").value = null;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Try Uploading Images Again',
                confirmButtonText: 'OK.'
            })
        }
    }


    const handleDownloadImage = async (imageURL) => {
        try {
            dispatch(setLoading(true));
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                params: {
                    url: imageURL,
                },
                responseType: 'blob', headers: { Authorization: `Bearer ${userToken}` }  // Specify the response type as 'blob' to handle binary data
            });

            // Create a Blob object from the response data
            const blob = new Blob([response.data]);

            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            // Set the download attribute and suggested filename for the downloaded image
            link.download = `file-homage${imageURL.substring(imageURL.lastIndexOf('.'))}`;
            // Append the anchor element to the document body and click it to trigger the download
            document.body.appendChild(link);
            dispatch(setLoading(false));
            link.click();
            // Clean up by removing the temporary anchor element
            document.body.removeChild(link);
        } catch (error) {
            dispatch(setLoading(false))
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        }

    };
    console.log(assignedTrainingToShow);
    return (
        <>


            <div className={style.subparent}>
                <div className='d-flex flex-row px-4'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            if (assignedTrainingToShow?.TrainingResultStatus === 'Conducted') {
                                dispatch(updateTabData({...tabData, Tab : 'Completed Tasks'}))
                            } else {
                                dispatch(updateTabData({...tabData, Tab : 'Pending Tasks'}))
                            }
                        }
                    }} />
                    <p className={style.headingtxt}>Training Information</p>
                </div>
                <div className={style.cardParent}>
                    <div className={style.card1headers}>
                        <div>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div>
                            <p>Info</p>
                        </div>
                    </div>
                    <div className={style.cardbody}>
                        <div className={style.sec1} >
                            <div>
                                <img src={calender} alt="" />
                                <div>
                                    <p className={style.card1para}>Plan Date</p>
                                    <p className={style.card1para2}>{assignedTrainingToShow?.Date}-{assignedTrainingToShow?.Month}-{assignedTrainingToShow?.Year}</p>
                                </div>
                            </div>
                            {assignedTrainingToShow?.ActualDate && (

                                <div>
                                    <img src={calender} alt="" />
                                    <div>
                                        <p className={style.card1para}>Actual Date</p>
                                        <p className={style.card1para2}>{assignedTrainingToShow?.ActualDate?.slice(0, 10).split('-')[2]}-{assignedTrainingToShow?.ActualDate?.slice(0, 10).split('-')[1]}-{assignedTrainingToShow?.ActualDate?.slice(0, 10).split('-')[0]}</p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <img src={clock} alt="" />
                                <div>
                                    <p className={style.card1para}>Time</p>
                                    <p className={style.card1para2}>{assignedTrainingToShow?.Time}</p>
                                </div>
                            </div>
                            <div>
                                <img src={star} alt="" />
                                <div>
                                    <p className={style.card1para}>Month Name</p>
                                    <p className={style.card1para2}>{assignedTrainingToShow?.Month}</p>
                                </div>
                            </div>
                            <div>
                                <img src={star} alt="" />
                                <div>
                                    <p className={style.card1para}>Description</p>
                                    <p onClick={() => {
                                        setPopUpData(assignedTrainingToShow?.Training.Description);
                                        alertManager();
                                    }} className={style.bluetxt}>View</p>
                                </div>
                            </div>


                        </div>
                        <div className={style.sec2} >
                            <div>
                                <img src={mos} alt="" />
                                <div>
                                    <p className={style.card1para}>Venue </p>
                                    <p className={style.card1para2}>{assignedTrainingToShow?.Venue}</p>
                                </div>
                            </div>
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Evaluation Criteriaa</p>
                                    <p onClick={() => {
                                        setPopUpData(assignedTrainingToShow?.Training.EvaluationCriteria)
                                        alertManager();

                                    }
                                    } className={style.bluetxt}>View</p>
                                </div>
                            </div>
                            <div>
                                <img src={copy} alt="" />
                                <div>
                                    <p className={style.card1para}>Internal/External</p>
                                    <p className={style.card1para2}>{assignedTrainingToShow?.InternalExternal}</p>
                                </div>
                            </div>

                            <div>
                                <img src={office} alt="" />
                                <div>
                                    <p className={style.card1para}>Trainer Name</p>
                                    <p className={style.card1para2}>{assignedTrainingToShow?.Trainer?.Name}</p>
                                </div>
                            </div>
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Training Status</p>
                                    <p onClick={() => {
                                        dispatch(changeId(assignedTrainingToShow?._id))
                                       dispatch(updateTabData({...tabData, Tab : 'conductTraining'}))
                                 


                                    }} style={assignedTrainingToShow?.TrainingResultStatus === "Conducted" ? {
                                        color: "green",
                                    } : {
                                        color: "red"
                                    }}><b>{assignedTrainingToShow?.TrainingResultStatus}</b></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style.cardsBtn}>
                        <input
                            type="file"
                            id="imagesInput"
                            name='Image'
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            multiple
                        />
                        <div className={style.cardbtn1}><p className={style.btntxt}>Images</p><button onClick={handleImageClick}>Upload</button></div>
                        <div className={style.cardbtn2}><p className={style.btntxt}>Training Material</p><button onClick={() => {
                            handleDownloadImage(assignedTrainingToShow?.Training.TrainingMaterial)
                        }}>Download</button></div>

                    </div>
                </div>
                <div className={style.bottomside}>
                    {assignedTrainingToShow?.TrainingResultStatus === 'Conducted' ? (
                        <>

                            <p className={style.bheading}>Employess who are getting trained</p>
                            <button onClick={() => {
                                dispatch(updateTabData({...tabData, Tab : 'trainedEmployeesForTrainer'}))
                               dispatch(changeId(assignedTrainingToShow?._id))
                               

                            }} className={style.bottombtn}>Click Here</button>
                        </>
                    ) : (
                        <>

                            <p className={style.bheading}>Conduct This Traininng Now!</p>
                            <button onClick={() => {
                               
                                dispatch(updateTabData({...tabData, Tab : 'conductTraining'}))
                                dispatch(changeId(assignedTrainingToShow?._id))

                            }} className={style.bottombtn}>Click Here</button>
                        </>

                    )}

                </div>

            </div>

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>

                                <button onClick={alertManager} className={style.btn2}>OK.</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                alert2 ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Upload images ?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setAlert2(false);
                                    makeRequest();

                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={() => {
                                    setAlert2(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default Info
