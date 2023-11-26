import style from './MaintananceRect2.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';


function MaintananceRect2() {
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [machine, setMachine] = useState();
    const [maintenances, setMaintenances] = useState(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const dateType = useSelector(state => state.appData.dateType);
    const idToWatch = useSelector(state => state.idToProcess);



    const handleDownloadImage = async (imageURL) => {
        try {
            dispatch(setLoading(true));
            const response = await axios.get('/download-image', {
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


    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`/readMachinery/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            setMachine(res.data.data)
            if(maintenances){
                dispatch(setLoading(false))
            }
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        });
        axios.get(`/getMaintenanceByMachineId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            const allMaintenances = res.data.data;
            setMaintenances(allMaintenances.filter((maintenance) => maintenance.dateType === dateType));
            if(machine){
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
    }, [])

    useEffect(() => {
        console.log(maintenances);
    }, [maintenances])




    return (
        <>

            <div className={style.subparent}>
                <div className='d-flex flex-row bg-white px-lg-5  px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tabb: 'Machinery' }));
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
                            <input type="text" value={machine?.machineCode} />
                        </div>
                        <div>
                            <p>Machine name</p>
                            <input type="text" value={machine?.machineName} />
                        </div>
                        <div>
                            <p>Date type</p>
                            <input type="text" value={dateType} />
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div>
                            <p>Machine location</p>
                            <input type="text" value={machine?.machinaryLocation} />
                        </div>
                        <div>
                            <p>Maintainance type</p>
                            <input type="text" value='Preventive' />
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
                            <th>Certificate</th>
                        </tr>
                        {
                            maintenances?.map((maintenance, i) => {
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
                                        <td ><button onClick={() => { handleDownloadImage(maintenance.uploadImage) }} className={style.btn}>Download</button></td>
                                        <td ><button className={style.btn}>Generate</button></td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>
                <div className={style.btnparent}>
                    <button className={style.download}>Download</button>
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

export default MaintananceRect2
