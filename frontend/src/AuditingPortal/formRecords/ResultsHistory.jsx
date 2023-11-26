
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


function ResultsHistory() {

    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [comment, setComment] = useState(null);
    const [commentBox, setCommentBox] = useState(false);
    const [formResults, setFormResults] = useState(null);
    const [idForAction, setIdForAction] = useState(null);
    const [formData, setFormData] = useState(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess)

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`/get-responses-by-formId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            console.log(res.data);
            setFormResults(res.data.data);
            setFormData(res.data.data[0]?.Form);
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])
    const refreshData = () => {
        dispatch(setLoading(true))
        axios.get(`/get-responses-by-formId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            setFormResults(res.data);
            setFormData(res.data[0].Form);
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }


    return (
        <>
            <div className={style.subparent}>
                <div className='mx-lg-5 px-2 mx-md-4 mx-2 mt-5 mb-1 '>
                    <BsArrowLeftCircle onClick={(e) => {
                        dispatch(updateTabData({ ...tabData, Tab: 'Form Records' }))
                    }} className='fs-3 text-danger mx-1' role='button' />
                </div>
                <div className={`${style.headers} mt-0`}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                        Form Record
                    </div>

                </div>
                <div className={style.form}>
                    <div className={style.sec1}>
                        <div>
                            <p>Form Id</p>
                            <input value={formData?.FormId} type="text" readOnly />
                        </div>
                        <div>
                            <p>Created By</p>
                            <input value={formData?.CreatedBy} type="text" readOnly />
                        </div>
                        <div>
                            <p>Creation Date</p>
                            {formData?.CreationDate ? (

                                <input value={`${formData?.CreationDate?.slice(0, 10).split('-')[2]}/${formData?.CreationDate?.slice(0, 10).split('-')[1]}/${formData?.CreationDate?.slice(0, 10).split('-')[0]}`} type="text" readOnly />
                            ) : (
                                <input value='- - -' />
                            )}
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div>
                            <p>Form Name</p>
                            <input value={formData?.FormName} type="text" />
                        </div>
                        <div>
                            <p>Approved By</p>
                            <input value={formData?.ApprovedBy || '- - -'} type="text" readOnly />
                        </div>
                        <div>
                            <p>Approval Date</p>
                            {formData?.ApprovalDate !== undefined ? (

                                <input type="text" value={`${formData?.ApprovalDate?.slice(0, 10).split('-')[2]}/${formData?.ApprovalDate?.slice(0, 10).split('-')[1]}/${formData?.ApprovalDate?.slice(0, 10).split('-')[0]}`} />
                            ) : (
                                <input type="text" value={`- - -`} />
                            )}
                        </div>
                    </div>
                </div>
                <div className={style.tableParent}>
                    <table className={style.table}>
                        <tr className={style.tableHeader}>
                            <th>Time</th>
                            <th>Maintenance Frequency</th>
                            <th>Filled By</th>
                            <th>Fill Date</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Action</th>
                            <th>Comment</th>

                        </tr>
                        {
                            formResults?.map((result, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{result.FillDate}</td>
                                        <td>{formData?.MaintenanceFrequency}</td>
                                        <td>{result?.FillBy}</td>
                                        <td>{result?.FillDate?.slice(0, 10).split('-')[2]}/{result?.FillDate?.slice(0, 10).split('-')[1]}/{result?.FillDate?.slice(0, 10).split('-')[0]}</td>
                                        <td>{formData?.Department.DepartmentName}</td>
                                        <td>{result.User.Designation}</td>

                                        <td><button className={style.btn} onClick={() => {
                                            dispatch(updateTabData({ ...tabData, Tab: 'viewFormAnswers' }))
                                            dispatch(changeId(result._id));
                                        }}>View Form</button></td>
                                        <td >
                                            <button className={`${style.btn} my-1`} onClick={() => {
                                                setIdForAction(result._id);
                                                setCommentBox(true)

                                            }}>Add</button>
                                            <button className={`${style.btn} my-1`} onClick={() => {
                                                setPopUpData(result.Comment || 'No comment added');
                                                alertManager();

                                            }}>View</button>

                                        </td>

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

            {
                commentBox && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setCommentBox(false);
                                dispatch(setLoading(true))
                                axios.patch('/addComment', { resultId: idForAction, comment: comment }, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                    dispatch(setLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Rejected Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    })
                                    refreshData();
                                }).catch(err => {
                                    dispatch(setLoading(false));
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'OOps..',
                                        text: 'Something went wrong, Try Again!'
                                    })
                                })
                            }}>
                                <textarea onChange={(e) => {
                                    setComment(e.target.value);
                                }} name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />


                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Reject</button>
                                    <a onClick={() => {
                                        setCommentBox(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</a>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default ResultsHistory