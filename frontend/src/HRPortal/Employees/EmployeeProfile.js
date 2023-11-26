import mail from '../../assets/images/hrprofile/mail.svg'
import Phone from '../../assets/images/employeeProfile/Phone.svg'
import copyp from '../../assets/images/employeeProfile/CopyP.svg'
import Location from '../../assets/images/employeeProfile/Location.svg'
import Office from '../../assets/images/employeeProfile/Office.svg'
import UserCard from '../../assets/images/employeeProfile/UserCard.svg'
import Calendar from '../../assets/images/employeeProfile/Calendar.svg'
import man from '../../assets/images/hrprofile/man.svg'
import { useEffect, useState } from 'react'
import style from '../HRProfile/HRProfile.module.css'
import style2 from './EmployeeProfile.module.css'
import axios from 'axios'
import profile from '../../assets/images/addEmployee/prof.svg'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import Cookies from 'js-cookie'
import { setLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'


function EmployeeProfile() {

    const [plannedTrainings, setPlannedTrainings] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const idToWatch = useSelector(state => state.idToProcess);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const userToken = Cookies.get('userToken');



    useEffect(() => {
        dispatch(setLoading(true));
        axios.get("/readEmployee", { headers: { Authorization: `Bearer ${userToken}` } }).then((Response) => {
            const employeesList = Response.data.data;
            const foundEmployee = employeesList.find((employee) => employee._id === idToWatch)
            if (plannedTrainings) {
                dispatch(setLoading(false));
            }
            if (foundEmployee) {
                setEmployeeData(foundEmployee);
            } else {
                Swal.fire({
                    icon : 'error',
                    title : 'OOps..',
                    text : 'Something went wrong, Try Again!'
                })
            }
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, []);
    const [showIcon, setShowIcon] = useState(false)


    useEffect(() => {
        dispatch(setLoading(true));
        axios.get("/readMonthlyPlan", { headers: { Authorization: `Bearer ${userToken}` } }).then((Response) => {
            const trainings = Response.data.data;
            setPlannedTrainings(trainings);
            if (employeeData) {   
                dispatch(setLoading(false))
            }
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, []);

    const handleDownloadImage = async (imageURL) => {
        try {
            dispatch(setLoading(true));
            const response = await axios.get('/download-image', {
                params: {
                    url: imageURL,

                },
                responseType: 'blob',headers: { Authorization: `Bearer ${userToken}` } // Specify the response type as 'blob' to handle binary data
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

    function findtrainingIndex(trainingId) {
        if (plannedTrainings) {
            const foundTraining = plannedTrainings.find((training) => training._id === trainingId);
            if (foundTraining) {
                return (plannedTrainings.indexOf(foundTraining))
            }
        }
        return null; // Return null if property value is not found in any object
    }

    const [popUpData, setPopUpData] = useState(null);
    const [showBox, setShowBox] = useState(false);




    return (
        <>


            <div className={style.profile}>
                <div className='d-flex flex-row px-lg-5  px-2 my-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tab: 'Employees' }))
                        }
                    }} />

                </div>


                <div className={`${style.hrInfo} mt-1`}>
                    <div>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div>
                        <p>{employeeData?.Name}</p>
                        <p>{employeeData?.Designation}</p>
                    </div>
                    <div >
                        <img style={{
                            backgroundColor: 'white'
                        }} src={showIcon ? profile : employeeData?.EmployeeImage} onError={(e) => {
                            setShowIcon(true)
                        }} alt="" />
                    </div>

                </div>
                <div className={style2.cardParent}>
                    <div className={style2.card1}>
                        <div className={style2.card1headers}>
                            <div>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div>
                                <p>Info</p>
                            </div>
                        </div>
                        <div className={style2.card1body}>
                            <div>


                                <div>
                                    <img src={man} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Name</p>
                                        <p className={style2.card1para2}>{employeeData?.Name}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={mail} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Email</p>
                                        <p className={style2.card1para2}>{employeeData?.Email}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Phone} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Phone</p>
                                        <p className={style2.card1para2}>{employeeData?.PhoneNumber}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Office} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Department</p>
                                        <p className={style2.card1para2}>{employeeData?.DepartmentText}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Office} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Designation</p>
                                        <p className={style2.card1para2}>{employeeData?.Designation}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <img src={Calendar} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Date Of Birth</p>
                                        <p className={style2.card1para2}>{employeeData?.DateOfBirth?.slice(0, 10).split('-')[2]}-{employeeData?.DateOfBirth?.slice(0, 10).split('-')[1]}-{employeeData?.DateOfBirth?.slice(0, 10).split('-')[0]}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={UserCard} alt="" />
                                    <div>
                                        <p className={style2.card1para}>CNIC</p>
                                        <p className={style2.card1para2}>{employeeData?.CNIC}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={copyp} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Qualification</p>
                                        <p className={style2.card1para2}>{employeeData?.Qualification}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Location} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Address</p>
                                        <p className={style2.card1para2}>{employeeData?.Address}</p>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div className={style2.card2}>
                        <table className={style2.table}>
                            <tr>
                                <th className={style2.tableheader}>
                                    <td>Serial #</td>
                                    <td>Training Name</td>
                                    <td>Details</td>
                                </th>
                            </tr>
                            {
                                employeeData?.EmployeeData?.map((data, i) => {
                                    return (
                                        <tr key={i}>
                                            <tb className={style2.tablebody}>
                                                <td className={style2.index}>{i + 1}</td>
                                                {plannedTrainings && (
                                                    <>


                                                        <td className={style2.training}>{plannedTrainings[findtrainingIndex(data.Training)]?.Training.TrainingName}</td>
                                                        <td onClick={() => {
                                                            dispatch(updateTabData({ ...tabData, Tab: 'trainedEmployees' }))
                                                            dispatch(changeId(data.Training))
                                                        }} className={style2.clicker}>Details</td>
                                                    </>
                                                )}
                                            </tb>
                                        </tr>
                                    )
                                })
                            }

                        </table>
                        <div className={style2.btns}>
                            <button ><a onClick={() => {
                                if (!employeeData?.EmployeeCV) {
                                    setPopUpData("File not Uploaded");
                                    setShowBox(true);
                                }
                            }} style={{

                                textDecoration: "none"
                            }} href={employeeData?.EmployeeCV} target="_blank">Print</a></button>



                            <button onClick={() => {

                                handleDownloadImage(employeeData?.EmployeeCV)

                            }}>Download Info</button>





                        </div>

                    </div>
                </div>
            </div>

            {
                showBox ?
                    <div style={{
                        width: "100%",
                        height: "100vh",
                        position: "fixed",
                        top: "0%",
                        left: "0%",
                        zIndex: "10",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "rgba(217, 217, 217, 0.7)",
                    }}>
                        <div style={{
                            width: "438px",
                            height: "224px",
                            flexShrink: "0",
                            borderRadius: "10px",
                            background: "#fff",
                        }}>
                            <p style={{
                                marginTop: "25px",
                                marginLeft: "37px",
                                color: "#000",
                                fontFamily: "Poppins",
                                fontSize: "17px",
                                fontStyle: "normal",
                                fontWeight: "400",
                                lineHeight: "normal",
                            }}>{popUpData}</p>
                            <div style={{
                                marginTop: "84px",
                                marginLeft: "190px",
                            }}>

                                <button style={{
                                    width: "95px",
                                    height: "38px",
                                    flexShrink: "0",
                                    borderRadius: "10px",
                                    color: "#ee6a5f",
                                    background: "#fff",
                                    border: "1px solid #ee6a5f",
                                    fontFamily: "Poppins",
                                    fontSize: "14px",
                                    fontStyle: "normal",
                                    fontWeight: "400",
                                    marginLeft: "28px",
                                    lineHeight: "normal",

                                }} onClick={() => {
                                    setShowBox(false);
                                }} className={style.btn2}>OK.</button>

                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default EmployeeProfile
