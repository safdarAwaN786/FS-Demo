import style from './DocumentHistory.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function DocumentHistory() {
    const [commentBox, setCommentBox] = useState(false);
    const [comment, setComment] = useState(null);
    const [indexForAction, setIndexForAction] = useState(null);
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [documentData, setDocumentData] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const user = useSelector(state => state.auth.user);
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readDocumentById/${idToWatch}`).then((res) => {
            console.log(res.data.data);
            setDocumentData(res.data.data);
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

    const refreshData = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readDocumentById/${idToWatch}`).then((res) => {
            console.log(res.data.data);
            setDocumentData(res.data.data);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }





    return (
        <>


           
                <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                    <BsArrowLeftCircle
                        role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Upload Document Manually' }))
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
                        Document Record
                    </div>

                </div>
                <div className={style.form}>
                    <div className={style.sec1}>
                        <div>
                            <p>Document Id</p>
                            <input autoComplete='off' type="text" value={documentData?.DocumentId} readOnly />
                        </div>
                        <div>
                            <p>Department</p>
                            <input autoComplete='off' type="text" value={documentData?.Department?.DepartmentName} readOnly />
                        </div>

                    </div>
                    <div className={style.sec2}>
                        <div>
                            <p>Document Name</p>
                            <input autoComplete='off' type="text" value={documentData?.DocumentName} readOnly />
                        </div>
                        <div>
                            <p>Document Type</p>
                            <input autoComplete='off' type="text" value={documentData?.DocumentType} readOnly />
                        </div>

                    </div>
                </div>
                <div className={style.tableParent}>
                    <table className={style.table}>
                        <tr className={style.tableHeader}>
                            <th>Revision No</th>
                            <th>Created By</th>
                            <th>Creation date</th>
                            <th>Reviewed By</th>
                            <th>Reviewed date</th>
                            <th>Approved By</th>
                            <th>Approved date</th>
                            <th>Document</th>
                            <th>Comment</th>
                        </tr>
                        {
                            documentData?.UploadedDocuments?.map((docObj, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{docObj.RevisionNo}</td>
                                        <td>{docObj.CreatedBy}</td>
                                        <td>{docObj?.CreationDate?.slice(0, 10).split('-')[2]}/{docObj.CreationDate?.slice(0, 10).split('-')[1]}/{docObj?.CreationDate?.slice(0, 10).split('-')[0]}</td>
                                        <td>{docObj.ReviewedBy}</td>
                                        {docObj.ReviewDate ? (

                                            <td>{docObj?.ReviewDate?.slice(0, 10).split('-')[2]}/{docObj.ReviewDate.slice(0, 10).split('-')[1]}/{docObj?.ReviewDate.slice(0, 10).split('-')[0]}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}
                                        <td>{docObj.ApprovedBy}</td>
                                        {docObj.ApprovalDate ? (

                                            <td>{docObj?.ApprovalDate.slice(0, 10).split('-')[2]}/{docObj.ApprovalDate.slice(0, 10).split('-')[1]}/{docObj?.ApprovalDate.slice(0, 10).split('-')[0]}</td>
                                        ) : (
                                            <td>- - -</td>
                                        )}




                                        <td ><button onClick={() => {
                                            handleDownloadImage(docObj.DocumentUrl)
                                        }} className={style.btn}>Download</button></td>
                                        <td >
                                            <button onClick={() => {
                                                setIndexForAction(i);
                                                setCommentBox(true);
                                            }} className={`${style.btn} my-1`}>Add</button>
                                            <button onClick={() => {
                                                setPopUpData(docObj.Comment || 'No Comment Added');
                                                setalert(true)
                                            }} className={`${style.btn} my-1`}>View</button>
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
            

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={alertManager} className={style.btn2}>OK.</button>
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
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/comment-document/${idToWatch}`, { objIndex: indexForAction, comment: comment }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Added Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    })
                                    refreshData();
                                }).catch(err => {
                                    dispatch(setSmallLoading(false));
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
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Add</button>
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

export default DocumentHistory
