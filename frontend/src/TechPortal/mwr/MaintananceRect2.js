import style from './MaintananceRect2.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function MaintananceRect2() {
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [machine, setMachine] = useState();
    const [maintenances, setMaintenances] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const dateType = useSelector(state => state.appData.dateType);
    const idToWatch = useSelector(state => state.idToProcess);

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


    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMachinery/${idToWatch}`).then((res) => {
            setMachine(res.data.data)
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        });
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getMaintenanceByMachineId/${idToWatch}`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            const allMaintenances = res.data.data;
            setMaintenances(allMaintenances.filter((maintenance) => maintenance.dateType === dateType));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])


    return (
        <>
            <div className='d-flex flex-row bg-white px-lg-5  px-2 py-2'>
                <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                    {
                        dispatch(updateTabData({ ...tabData, Tab: 'Master List of Machinery' }));
                    }
                }} />

            </div>
            <div className={`${style.headers} mt-1 `}>
                <div className={style.spans}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className={style.para}>
                    Maintainance Record
                </div>

            </div>
            <div className={style.form}>
                <div className={style.sec1}>
                    <div>
                        <p>Machine Id</p>
                        <input autoComplete='off' type="text" value={machine?.machineCode} />
                    </div>
                    <div>
                        <p>Machine name</p>
                        <input autoComplete='off' type="text" value={machine?.machineName} />
                    </div>
                    <div>
                        <p>Date type</p>
                        <input autoComplete='off' type="text" value={dateType} />
                    </div>
                </div>
                <div className={style.sec2}>
                    <div>
                        <p>Machine location</p>
                        <input autoComplete='off' type="text" value={machine?.machinaryLocation} />
                    </div>
                    <div>
                        <p>Maintainance type</p>
                        <input autoComplete='off' type="text" value='Preventive' />
                    </div>
                </div>
            </div>
            <div className={style.tableParent}>
                <table className={style.table}>
                    <tr className={style.tableHeader}>
                        <th>Maintainance ID</th>
                        <th>Last Date</th>
                        <th>Next Date</th>
                        <th>Nature of Fault</th>
                        <th>Root Cause of Breakdown</th>
                        <th>Detail Of Work</th>
                        <th>Replacement</th>
                        <th>Image</th>
                        {/* <th>Certificate</th> */}
                    </tr>
                    {
                        maintenances?.map((maintenance, i) => {
                            console.log(maintenance);

                            return (
                                <tr key={i}>
                                    <td>{maintenance.maintenanceCode}</td>
                                    <td>{maintenance?.lastMaintainanceDate.slice(0, 10).split('-')[2]}/{maintenance.lastMaintainanceDate.slice(0, 10).split('-')[1]}/{maintenance?.lastMaintainanceDate.slice(0, 10).split('-')[0]}</td>
                                    <td>{maintenance?.nextMaintainanceDate.slice(0, 10).split('-')[2]}/{maintenance.nextMaintainanceDate.slice(0, 10).split('-')[1]}/{maintenance?.nextMaintainanceDate.slice(0, 10).split('-')[0]}</td>
                                    <td><button className={style.btn} onClick={() => {
                                        setPopUpData(maintenance.natureOfFault);
                                        alertManager();
                                        console.log('clicked')

                                    }}>View</button></td>
                                    <td ><button className={style.btn} onClick={() => {
                                        setPopUpData(maintenance.rootCause);
                                        alertManager();

                                    }}>View</button></td>
                                    <td ><button className={style.btn} onClick={() => {
                                        setPopUpData(maintenance.detailOfWork);
                                        alertManager();

                                    }}>View</button></td>
                                    <td ><button className={style.btn} onClick={() => {
                                        setPopUpData(maintenance.replacement);
                                        alertManager();

                                    }}>View</button></td>
                                    <td ><button onClick={() => { if(maintenance.uploadImage){ handleDownloadImage(maintenance.uploadImage)} }} className={style.btn}>Download</button></td>
                                    {/* <td ><button className={style.btn}>Generate</button></td> */}
                                </tr>
                            )
                        })
                    }
                </table>
            </div>
            {/* <div className={style.btnparent}>
                    <button className={style.download}>Download</button>
                </div> */}

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft: '120px',
                                    marginTop: '25px'
                                }} onClick={alertManager} className={style.btn2}>OK.</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default MaintananceRect2
