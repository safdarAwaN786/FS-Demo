import style from './ResultsHistory.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setLoading } from '../../redux/slices/loading';


function AuditsHistory() {

    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [checklistResults, setChecklistResults] = useState(null);
    const [checklistData, setChecklistData] = useState(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess)

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`/get-conduct-audits-by-ChecklistId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            console.log(res.data);
            setChecklistResults(res.data.data);
            setChecklistData(res.data.data[0]?.Checklist);
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

    return (
        <>
            <div className={style.subparent}>
                <div className='mx-lg-5 px-2 mx-md-4 mx-2 mt-5 mb-1 '>
                    <BsArrowLeftCircle onClick={(e) => {
                        dispatch(updateTabData({...tabData, Tab : 'Conduct Audit'}))
                    }} className='fs-3 text-danger mx-1' role='button' />
                </div>
                <div className={`${style.headers} mt-0`}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                        Audit Records
                    </div>

                </div>
                <div className={style.form}>
                    <div className={style.sec1}>
                        <div>
                            <p>Checklist Id</p>
                            <input value={checklistData?.ChecklistId} type="text" readOnly />
                        </div>
                        <div>
                            <p>Created By</p>
                            <input value={checklistData?.CreatedBy} type="text" readOnly />
                        </div>
                        <div>
                            <p>Creation Date</p>
                            {checklistData?.CreationDate ? (

                                <input value={`${checklistData?.CreationDate?.slice(0, 10).split('-')[2]}/${checklistData?.CreationDate?.slice(0, 10).split('-')[1]}/${checklistData?.CreationDate?.slice(0, 10).split('-')[0]}`} type="text" readOnly />
                            ) : (
                                <input value='- - -' />
                            )}
                        </div>
                    </div>
                    <div className={style.sec2}>
                        
                        <div>
                            <p>Approved By</p>
                            <input value={checklistData?.ApprovedBy || '- - -'} type="text" readOnly />
                        </div>
                        <div>
                            <p>Approval Date</p>
                            {checklistData?.ApprovalDate !== undefined ? (

                                <input type="text" value={`${checklistData?.ApprovalDate?.slice(0, 10).split('-')[2]}/${checklistData?.ApprovalDate?.slice(0, 10).split('-')[1]}/${checklistData?.ApprovalDate?.slice(0, 10).split('-')[0]}`} />
                            ) : (
                                <input type="text" value={`- - -`} />
                            )}
                        </div>
                    </div>
                </div>
                <div className={style.tableParent}>
                    <table className={style.table}>
                        <tr className={style.tableHeader}>
                            <th>Audit Date</th>
                            <th>TargetDate</th>
                            <th>Audit By</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Action</th>

                        </tr>
                        {
                            checklistResults?.map((result, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{result.AuditDate}</td>
                                        
                                        
                                        <td>{result?.TargetDate?.slice(0, 10).split('-')[2]}/{result?.TargetDate?.slice(0, 10).split('-')[1]}/{result?.TargetDate?.slice(0, 10).split('-')[0]}</td>
                                        <td>{result.AuditBy}</td>
                                        <td>{result.User.Department.DepartmentName}</td>
                                        <td>{result.User.Designation}</td>

                                        <td><button className={style.btn} onClick={() => {
                                            dispatch(updateTabData({...tabData, Tab : 'viewAuditAnswers'}))
                                            dispatch(changeId(result._id));
                                        }}>View Audit</button></td>
                                       

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

export default AuditsHistory
