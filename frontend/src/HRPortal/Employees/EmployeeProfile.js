import mail from '../../assets/images/hrprofile/mail.svg'
import Phone from '../../assets/images/employeeProfile/Phone.svg'
import copyp from '../../assets/images/employeeProfile/CopyP.svg'
import Location from '../../assets/images/employeeProfile/Location.svg'
import Office from '../../assets/images/employeeProfile/Office.svg'
import UserCard from '../../assets/images/employeeProfile/UserCard.svg'
import Calendar from '../../assets/images/employeeProfile/Calendar.svg'
import man from '../../assets/images/hrprofile/man.svg'
import { useEffect, useState, useRef } from 'react'
import style from '../HRProfile/HRProfile.module.css'
import style2 from './EmployeeProfile.module.css'
import axios from 'axios'
import profile from '../../assets/images/addEmployee/prof.svg'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function EmployeeProfile() {

    const [plannedTrainings, setPlannedTrainings] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const idToWatch = useSelector(state => state.idToProcess);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const tableRef = useRef(null);
    
    useEffect(() => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readEmployee`, { headers: { Authorization: `${user.Department._id}` } }).then((Response) => {
            const employeesList = Response.data.data;
            const foundEmployee = employeesList.find((employee) => employee._id === idToWatch)
            console.log("foundEmployee here", foundEmployee);

            dispatch(setSmallLoading(false));
            if (foundEmployee) {
                setEmployeeData(foundEmployee);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'Something went wrong, Try Again!'
                })
            }
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, []);
    const [showIcon, setShowIcon] = useState(false)


    useEffect(() => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((Response) => {
            const trainings = Response.data.data;
            setPlannedTrainings(trainings);
            if (employeeData) {
                dispatch(setSmallLoading(false))
            }
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, []);


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

    function findtrainingIndex(trainingId) {
        if (plannedTrainings) {
            const foundTraining = plannedTrainings.find((training) => training._id === trainingId);
            console.log("foundTraining here", foundTraining);

            if (foundTraining) {
                return (plannedTrainings.indexOf(foundTraining))
            }
        }
        return null; // Return null if property value is not found in any object
    }

    const [popUpData, setPopUpData] = useState(null);
    const [showBox, setShowBox] = useState(false);

    // Function to format the date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    };

    // Handle printing functionality
    const handlePrint = () => {
        if (!employeeData) return;
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        
        // Generate the HTML content for printing
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${employeeData.Name || 'Employee'}_Training_Report</title>
                <style>
                    body {
                        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        margin: 0;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        font-size: 24px;
                        color: #333;
                        margin-bottom: 5px;
                    }
                    .employee-info {
                        margin-bottom: 30px;
                        padding: 15px;
                        border: 1px solid #eee;
                        border-radius: 5px;
                        background-color: #f9f9f9;
                    }
                    .employee-info p {
                        margin: 8px 0;
                        font-size: 14px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    th {
                        background-color: #DB5853;
                        color: white;
                        padding: 12px 10px;
                        text-align: left;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    td {
                        padding: 10px;
                        border-bottom: 1px solid #e0e0e0;
                        font-size: 13px;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 11px;
                        font-weight: 600;
                        text-align: center;
                        min-width: 70px;
                    }
                    .status-completed {
                        background-color: #e6f7e6;
                        color: #2e7d32;
                    }
                    .status-pending {
                        background-color: #fff8e1;
                        color: #ff8f00;
                    }
                    .status-failed {
                        background-color: #ffebee;
                        color: #c62828;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .date-printed {
                        margin-top: 5px;
                        font-style: italic;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Employee Training Report</h1>
                </div>
                
                <div class="employee-info">
                    <p><strong>Name:</strong> ${employeeData.Name || 'N/A'}</p>
                    <p><strong>Designation:</strong> ${employeeData.Designation || 'N/A'}</p>
                    <p><strong>Department:</strong> ${employeeData.DepartmentText || 'N/A'}</p>
                    <p><strong>Email:</strong> ${employeeData.Email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${employeeData.PhoneNumber || 'N/A'}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Serial #</th>
                            <th>Training Name</th>
                            <th>Training Date</th>
                            <th>Status</th>
                            <th>Marks</th>
                            <th>Pass/Fail</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employeeData.EmployeeData?.map((data, i) => {
                            const training = plannedTrainings && findtrainingIndex(data.Training) !== null ?
                                plannedTrainings[findtrainingIndex(data.Training)] : null;
                            
                            if (!training) return '';
                            
                            const statusClass = data.EmployeeResultStatus === 'Completed' ? 'status-completed' :
                                data.EmployeeResultStatus === 'Pending' ? 'status-pending' : 'status-failed';
                                
                            const passFailClass = data.IsPass ? 'status-completed' : 'status-failed';
                            
                            const formattedDate = training.ActualDate ? formatDate(training.ActualDate) : 'N/A';
                            
                            return `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td><strong>${training.Training.TrainingName}</strong></td>
                                    <td>${formattedDate}</td>
                                    <td><span class="status-badge ${statusClass}">${data.EmployeeResultStatus}</span></td>
                                    <td>${data.Marks || 'N/A'}</td>
                                    <td><span class="status-badge ${passFailClass}">${data.IsPass ? 'Pass' : 'Fail'}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>This is a system-generated report</p>
                    <p class="date-printed">Date Printed: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                </div>
            </body>
            </html>
        `;
        
        // Write the content to the new window
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Give time for the content to load before printing
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            // Close the window after printing (optional)
            printWindow.onafterprint = function() {
                printWindow.close();
            };
        };
    };

    return (
        <>
            <div className={style.profile}>
                <div className='d-flex flex-row px-lg-5  px-2 my-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tab: 'Employee Registration' }))
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
                <div  className={style2.cardParent}>
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
                                        <p className={`${style2.card1para2} overflow-x-handler`}>{employeeData?.Name}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={mail} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Email</p>
                                        <p className={`${style2.card1para2} overflow-x-handler`}>{employeeData?.Email}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Phone} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Phone</p>
                                        <p className={`${style2.card1para2} overflow-x-handler`}>{employeeData?.PhoneNumber}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Office} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Department</p>
                                        <p className={`${style2.card1para2} overflow-x-handler`}>{employeeData?.DepartmentText}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Office} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Designation</p>
                                        <p className={`${style2.card1para2} overflow-x-handler`}>{employeeData?.Designation}</p>
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
                                        <p className={`${style2.card1para2} overflow-x-handler`}>{employeeData?.CNIC}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={copyp} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Qualification</p>
                                        <p className={`${style2.card1para2} overflow-x-handler`}>{employeeData?.Qualification}</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Location} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Address</p>
                                        <p className={`${style2.card1para2} overflow-x-handler`}>{employeeData?.Address}</p>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div style={{
                        width: '100%',
                        maxWidth: '50%',
                        marginLeft: '20px',
                        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                            padding: '20px',
                            overflow: 'hidden'
                        }}>
                            {/* Table container without ref for printing */}
                            <div style={{
                                width: '100%',
                                marginBottom: '20px',
                                borderRadius: '8px',
                            }}>
                                <div style={{
                                    width: '100%',
                                    overflowX: 'auto',
                                    borderRadius: '8px',
                                }}>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        minWidth: '600px',
                                        borderRadiusTop: '8px',
                                    }}>
                                        <thead>
                                            <tr>
                                                <th style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#ee6a5f',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.5px'
                                                }}>Serial #</th>
                                                <th style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#ee6a5f',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.5px'
                                                }}>Training Name</th>
                                                <th style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#ee6a5f',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.5px'
                                                }}>Training Date</th>
                                                <th style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#ee6a5f',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.5px'
                                                }}>Status</th>
                                                <th style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#ee6a5f',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.5px'
                                                }}>Marks</th>
                                                <th style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#ee6a5f',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.5px'
                                                }}>Pass/Fail</th>
                                                <th style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    backgroundColor: '#ee6a5f',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.8rem',
                                                    letterSpacing: '0.5px',
                                                    '@media print': {
                                                        display: 'none'
                                                    }
                                                }} className="print-button">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employeeData?.EmployeeData?.map((data, i) => {
                                                const training = plannedTrainings && findtrainingIndex(data.Training) !== null ?
                                                    plannedTrainings[findtrainingIndex(data.Training)] : null;

                                                return (
                                                    <tr key={i} style={{
                                                        borderBottom: '1px solid #e0e0e0',
                                                        transition: 'background-color 0.2s',
                                                        ':hover': {
                                                            backgroundColor: '#f9f9f9'
                                                        }
                                                    }}>
                                                        <td style={{
                                                            padding: '12px 15px',
                                                            textAlign: 'left',
                                                            fontSize: '0.9rem',
                                                            color: '#666'
                                                        }}>{i + 1}</td>
                                                        {training && (
                                                            <>
                                                                <td style={{
                                                                    padding: '12px 15px',
                                                                    textAlign: 'left',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '500',
                                                                    color: '#333'
                                                                }}>{training.Training.TrainingName}</td>
                                                                <td style={{
                                                                    padding: '12px 15px',
                                                                    textAlign: 'left',
                                                                    fontSize: '0.9rem',
                                                                    color: '#666'
                                                                }}>{formatDate(training.ActualDate)}</td>
                                                                <td style={{
                                                                    padding: '12px 15px',
                                                                    textAlign: 'left',
                                                                    fontSize: '0.9rem'
                                                                }}>
                                                                    <span style={{
                                                                        display: 'inline-block',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600',
                                                                        textAlign: 'center',
                                                                        minWidth: '70px',
                                                                        backgroundColor: data.EmployeeResultStatus === 'Completed' ? '#e6f7e6' :
                                                                            data.EmployeeResultStatus === 'Pending' ? '#fff8e1' : '#ffebee',
                                                                        color: data.EmployeeResultStatus === 'Completed' ? '#2e7d32' :
                                                                            data.EmployeeResultStatus === 'Pending' ? '#ff8f00' : '#c62828'
                                                                    }}>
                                                                        {data.EmployeeResultStatus}
                                                                    </span>
                                                                </td>
                                                                <td style={{
                                                                    padding: '12px 15px',
                                                                    textAlign: 'left',
                                                                    fontSize: '0.9rem',
                                                                    color: '#666'
                                                                }}>{data.Marks || 'N/A'}</td>
                                                                <td style={{
                                                                    padding: '12px 15px',
                                                                    textAlign: 'left',
                                                                    fontSize: '0.9rem'
                                                                }}>
                                                                    <span style={{
                                                                        display: 'inline-block',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '12px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: '600',
                                                                        textAlign: 'center',
                                                                        minWidth: '70px',
                                                                        backgroundColor: data.IsPass ? '#e6f7e6' : '#ffebee',
                                                                        color: data.IsPass ? '#2e7d32' : '#c62828'
                                                                    }}>
                                                                        {data.IsPass ? 'Pass' : 'Fail'}
                                                                    </span>
                                                                </td>
                                                                <td style={{
                                                                    padding: '12px 15px',
                                                                    textAlign: 'left',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    <a
                                                                        onClick={() => {
                                                                            dispatch(updateTabData({ ...tabData, Tab: 'trainedEmployees' }))
                                                                            dispatch(changeId(data.Training))
                                                                        }}
                                                                        style={{
                                                                            color: '#3f51b5',
                                                                            textDecoration: 'none',
                                                                            cursor: 'pointer',
                                                                            transition: 'color 0.2s',
                                                                            ':hover': {
                                                                                color: '#283593',
                                                                                textDecoration: 'underline'
                                                                            }
                                                                        }}
                                                                    >
                                                                        Details
                                                                    </a>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '15px',
                                marginTop: '20px',
                                '@media (max-width: 768px)': {
                                    flexDirection: 'column',
                                    gap: '10px'
                                }
                            }}>
                                <div 
                                    onClick={handlePrint}
                                    style={{
                                        padding: '10px 30px',
                                        borderRadius: '4px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        border: 'none',
                                        fontSize: '0.9rem',
                                        backgroundColor: '#ee6a5f',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                
                                >
                                    Print Training Report
                                </div>

                                

                            </div>
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