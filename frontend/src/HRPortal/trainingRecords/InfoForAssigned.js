import style from './Info.module.css'
import clock from '../../assets/images/viewtrainings/Clock.svg'
import star from '../../assets/images/viewtrainings/Star.svg'
import mos from '../../assets/images/viewtrainings/mos.svg'
import copy from '../../assets/images/employeeProfile/CopyP.svg'
import calender from '../../assets/images/employeeProfile/Calendar.svg'
import office from '../../assets/images/employeeProfile/Office.svg'
import cnic from '../../assets/images/employeeProfile/UserCard.svg'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { BsArrowLeftCircle } from "react-icons/bs"
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function InfoForAssigned() {
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const idToWatch =  useSelector(state => state.idToProcess);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const userToken = Cookies.get('userToken');
    const [assignedTrainingData, setAssignedTrainingData] = useState(null);
    const [popUpData, setPopUpData] = useState(null);

    const { assignedTrainingID } = useParams();


    console.log(assignedTrainingID);
    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyPlan`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            const assignedTrainingsList = response.data.data;
            setAssignedTrainingData(assignedTrainingsList.find((training) => training._id === idToWatch));
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

    const downloadImages = async () => {
        console.log("downloadImages");
        console.log(assignedTrainingData?.Images);

        const images = assignedTrainingData?.Images
        for (let index = 0; index < images.length; index++) {
            await handleDownloadImage(images[index]);
        }

    }
    const user = useSelector(state => state.auth.user)


    const handleDownloadImage = async (imageURL) => {
        try {
            if (imageURL) {

                dispatch(setLoading(true))
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                    params: {
                        url: imageURL,
                    },
                    responseType: 'blob', headers: { Authorization: `Bearer ${userToken}` } // Specify the response type as 'blob' to handle binary data
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
                dispatch(setLoading(false))
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
            dispatch(setLoading(false))
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        }

    };


    return (
        <>


            <div className={style.subparent}>
                <div className='d-flex flex-row px-4'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({...tabData, Tab : 'Training Records'}))
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
                                    <p className={style.card1para2}>{assignedTrainingData?.Date}-{assignedTrainingData?.Month}-{assignedTrainingData?.Year}</p>
                                </div>
                            </div>
                            {assignedTrainingData?.ActualDate !== null && (

                                <div>
                                    <img src={calender} alt="" />
                                    <div>
                                        <p className={style.card1para}>Actual Date</p>
                                        <p className={style.card1para2}>{assignedTrainingData?.ActualDate?.slice(0, 10).split('-')[2]}-{assignedTrainingData?.ActualDate?.slice(0, 10).split('-')[1]}-{assignedTrainingData?.ActualDate?.slice(0, 10).split('-')[0]}</p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <img src={clock} alt="" />
                                <div>
                                    <p className={style.card1para}>Time</p>
                                    <p className={style.card1para2}>{assignedTrainingData?.Time}</p>
                                </div>
                            </div>
                            <div>
                                <img src={star} alt="" />
                                <div>
                                    <p className={style.card1para}>Month Name</p>
                                    <p className={style.card1para2}>{assignedTrainingData?.Month}</p>
                                </div>
                            </div>
                            <div>
                                <img src={star} alt="" />
                                <div>
                                    <p className={style.card1para}>Description</p>
                                    <p onClick={() => {
                                        setPopUpData(assignedTrainingData?.Training.Description);
                                        alertManager();
                                    }
                                    } className={style.bluetxt}>View</p>
                                </div>
                            </div>


                        </div>
                        <div className={style.sec2} >
                            <div>
                                <img src={mos} alt="" />
                                <div>
                                    <p className={style.card1para}>Venue </p>
                                    <p className={style.card1para2}>{assignedTrainingData?.Venue}</p>
                                </div>
                            </div>
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Evaluation Criteriaa</p>
                                    <p onClick={() => {
                                        setPopUpData(assignedTrainingData?.Training.EvaluationCriteria);
                                        alertManager();
                                    }} className={style.bluetxt}>View</p>
                                </div>
                            </div>
                            <div>
                                <img src={copy} alt="" />
                                <div>
                                    <p className={style.card1para}>Internal/External</p>
                                    <p className={style.card1para2}>{assignedTrainingData?.InternalExternal}</p>
                                </div>
                            </div>

                            <div>
                                <img src={office} alt="" />
                                <div>
                                    <p className={style.card1para}>Trainer Name</p>
                                    <p className={style.card1para2}>{assignedTrainingData?.Trainer?.Name}</p>
                                </div>
                            </div>
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Training Status</p>
                                    <p className={style.redtxt}>{assignedTrainingData?.TrainingResultStatus}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style.cardsBtn}>
                        <div className={style.cardbtn1}><p className={style.btntxt}>Images</p><button onClick={downloadImages}  >Download</button></div>
                        <div className={style.cardbtn2}><p className={style.btntxt}>Training Material</p><button onClick={() => {
                            handleDownloadImage(assignedTrainingData?.Training.TrainingMaterial);


                        }}>Download</button></div>

                    </div>
                </div>


                <div className={style.bottomside}>
                    <p className={style.bheading}>Employess who are getting trained</p>
                    <button onClick={() => {
                        dispatch(updateTabData({...tabData, Tab : 'trainedEmployees'}))
                        dispatch(changeId(assignedTrainingData?._id))
                    }} className={style.bottombtn}>Click Here</button>

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
        </>
    )
}

export default InfoForAssigned
