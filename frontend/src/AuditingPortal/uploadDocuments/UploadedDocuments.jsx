
import style from './UploadedDocuments.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setSmallLoading } from '../../redux/slices/loading'

function UploadedDocuments() {

    const [documentsList, setDocumentsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [approve, setApprove] = useState(false);
    const [idForAction, setIdForAction] = useState(null);
    const [reason, setReason] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [disApprove, setDisApprove] = useState(false);
    const [review, setReview] = useState(false);
    const [allDataArr, setAllDataArr] = useState(null);
    const [uploadDoc, setUploadDoc] = useState(false);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readAllDocuments`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {

            setAllDataArr(response.data.data)
            setDocumentsList(response.data.data.slice(startIndex, endIndex));
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readAllDocuments`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            console.log(response);
            setAllDataArr(response.data.data)
            setDocumentsList(response.data.data.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            console.log(err);
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }


    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {

        setDocumentsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>

                obj.DocumentId.includes(event.target.value) || obj.DocumentName.includes(event.target.value)
            )
            console.log(searchedList);
            setDocumentsList(searchedList);
        } else {
            setDocumentsList(allDataArr?.slice(startIndex, endIndex))
        }
    }


    
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


    return (
        <>

       

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Document by name' />
                    </div>
                    {tabData?.Creation && (

                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'uploadDocument' }))
                        }}>
                            <img src={add} alt="" />
                            <p>Upload Document</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!documentsList || documentsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Document ID</td>
                                <td>Document Name</td>
                                <td>Department</td>
                                <td>Revision No.</td>
                                <td>Document Type</td>
                                <td>Created By</td>
                                <td>Reason</td>
                                <td>Take Action</td>
                                <td>Document</td>
                                {/* <td>Document Rocords</td> */}
                                <td>Approved By</td>
                                <td>Approval Date</td>
                                <td>Creation Date</td>
                                <td>Reviewed Date</td>
                                <td>Document History</td>
                                <td>Status</td>
                                {tabData?.Approval && (
                                    <td></td>
                                )}
                                {tabData?.Review && (
                                    <td></td>
                                )}
                            </tr>
                            {
                                documentsList?.map((document, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td ><p style={{
                                                backgroundColor: "#f0f5f0",
                                                padding: "2px 5px",
                                                borderRadius: "10px",
                                                fontFamily: "Inter",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                lineHeight: "20px",
                                            }}>{document.DocumentId}</p></td>
                                            <td className={style.simpleContent}>{document.DocumentName}</td>
                                            <td>{document.Department.DepartmentName}</td>
                                            <td>{document.RevisionNo}</td>
                                            <td>{document.DocumentType}</td>
                                            <td>{document.CreatedBy}</td>
                                            <td >

                                                <p onClick={() => {
                                                    if (document.Status === 'Disapproved' || document.Status === 'Rejected') {
                                                        setDataToShow(document.Reason)
                                                    } else {
                                                        setDataToShow('Process is nor DisApproved neither Rejected.')
                                                    }
                                                    setShowBox(true);
                                                }} className={style.redclick}>View</p>
                                            </td>
                                            <td >

                                                <p onClick={() => {
                                                    setIdForAction(document._id);
                                                    setUploadDoc(true);
                                                }} className='btn btn-outline-primary px-1'>Upload Document</p>
                                            </td>
                                            <td >

                                                <p onClick={() => {
                                                    handleDownloadImage(document.UploadedDocuments[document.UploadedDocuments.length - 1].DocumentUrl)
                                                }} className='btn btn-outline-danger'>Download</p>
                                            </td>
                                            {/* <td >

                                                <p onClick={() => {
                                                    // setShowBox(true);
                                                    // setDataToShow(training.EvaluationCriteria)
                                                }} className='btn btn-outline-warning'>Click Here</p>
                                            </td> */}
                                            <td>{document.ApprovedBy || '--'}</td>
                                            {document.ApprovalDate ? (

                                                <td>{document.ApprovalDate?.slice(0, 10).split('-')[2]}/{document.ApprovalDate?.slice(0, 10).split('-')[1]}/{document.ApprovalDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>---</td>
                                            )}
                                            <td>{document.CreationDate?.slice(0, 10).split('-')[2]}/{document.CreationDate?.slice(0, 10).split('-')[1]}/{document.CreationDate?.slice(0, 10).split('-')[0]}</td>
                                            {document.ReviewDate ? (

                                                <td>{document.ReviewDate?.slice(0, 10).split('-')[2]}/{document.ReviewDate?.slice(0, 10).split('-')[1]}/{document.ReviewDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td>- - -</td>
                                            )}
                                            <td >
                                                <p onClick={() => {
                                                    dispatch(updateTabData({ ...tabData, Tab: 'documentHistory' }));
                                                    dispatch(changeId(document._id))
                                                }} className={style.redclick}>View</p>
                                            </td>
                                            <td><div className={`text-center ${document.Status === 'Approved' && style.greenStatus} ${document.Status === 'Disapproved' && style.redStatus} ${document.Status === 'Rejected' && style.redStatus} ${document.Status === 'Pending' && style.yellowStatus} ${document.Status === 'Reviewed' && style.blueStatus} `}><p>{document.Status}</p></div></td>

                                            {tabData?.Approval && (



                                                <td >

                                                    <p onClick={() => {
                                                        if (document.Status === 'Approved' || document.Status === 'Rejected') {
                                                            setDataToShow('Document is already Approved or Rejected!');
                                                            setShowBox(true)
                                                        } else {

                                                            setApprove(true);
                                                            setIdForAction(document._id)
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Approve</p>
                                                    <p onClick={() => {
                                                        if (document.Status === 'Approved' || document.Status === 'Disapproved' || document.Status === 'Rejected') {
                                                            setDataToShow(`Document is already ${document.Status}!`);
                                                            setShowBox(true);
                                                        } else {

                                                            setDisApprove(true);
                                                            setIdForAction(document._id);
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Disapprove</p>
                                                </td>
                                            )}
                                            {tabData?.Review && (

                                                <td className='ms-4' >

                                                    <p onClick={() => {
                                                        if (document.Status === 'Reviewed') {
                                                            setDataToShow('Document is already Reviewed!');
                                                            setShowBox(true);
                                                        } else {

                                                            setReview(true);
                                                            setIdForAction(document._id)
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-danger pt-0 px-1`}>Review</p>
                                                    <p onClick={() => {
                                                        if (document.Status === 'Rejected' || document.Status === 'Reviewed') {
                                                            setDataToShow('Document is already Rejected or Reviewed');
                                                            setShowBox(true);
                                                        } else {
                                                            setReject(true);
                                                            setIdForAction(document._id)
                                                        }
                                                    }} style={{
                                                        height: '28px'

                                                    }} className={`btn btn-outline-primary pt-0 px-1`}>Reject</p>
                                                </td>
                                            )}



                                        </tr>

                                    )

                                })
                            }
                        </table>
                    )}
                </div>
                <div className={style.Btns}>
                    {startIndex > 0 && (

                        <button onClick={backPage}>
                            {'<< '}Back
                        </button>
                    )}
                    {allDataArr?.length > endIndex && (

                        <button onClick={nextPage}>
                            next{'>> '}
                        </button>
                    )}
                </div>
            {
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>{dataToShow}</p>

                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    setShowBox(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }
            {
                uploadDoc && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setUploadDoc(false)
                                dispatch(setSmallLoading(true))
                                const formData = new FormData(e.target);
                                axios.put(`${process.env.REACT_APP_BACKEND_URL}/replaceDocument/${idForAction}`, {...formData, user : user}).then(() => {
                                    dispatch(setSmallLoading(false))
                                    refreshData();
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Submitted Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    });
                                    setUploadDoc(false);
                                }).catch(err => {
                                    dispatch(setSmallLoading(false));
                                    console.log(err)
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'OOps..',
                                        text: 'Something went wrong, Try Again!'
                                    })
                                })
                                setUploadDoc(false)
                            }}>

                                <input type='file' name='file' className='btn btn-danger mx-5 my-4 px-2 py-1' required />

                                <div className={style.alertbtns}>

                                    <button type='submit' className={style.btn2}>Submit</button>
                                    <a className='btn btn-outline-danger px-2 py-1 m-2 ' onClick={() => {
                                        setUploadDoc(false);

                                    }} >Close</a>

                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                approve ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Approve this Document?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approve-uploaded-document`, { documentId: idForAction, approvedBy : user.Name }).then(() => {
                                        dispatch(setSmallLoading(false))
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        });
                                        setApprove(false);
                                    }).catch(err => {
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })
                                    setApprove(false)


                                }} className={style.btn1}>Approve</button>


                                <button onClick={() => {
                                    setApprove(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                review ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to Review this Document?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setReview(false);
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/review-uploaded-document`, { documentId: idForAction, reviewBy : user.Name }).then(() => {
                                        dispatch(setSmallLoading(false))
                                        refreshData();
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        });
                                    }).catch(err => {
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })
                                    setReview(false)
                                }} className={style.btn1}>Review</button>


                                <button onClick={() => {
                                    setReview(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }

            {
                disApprove && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setDisApprove(false);
                                dispatch(setSmallLoading(true))
                                axios.patch(`/disapprove-uploaded-document`, { documentId: idForAction, reason: reason, disapprovedBy : user.Name }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'DisApproved Successfully',
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
                                    setReason(e.target.value);
                                }} name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />


                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Disapprove</button>
                                    <a onClick={() => {
                                        setDisApprove(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</a>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {
                reject && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setReject(false);
                                dispatch(setSmallLoading(true))
                                axios.patch(`/reject-uploaded-document`, { documentId: idForAction, reason: reason, rejectBy : user.Name }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Rejected Successfully',
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
                                    setReason(e.target.value);
                                }} name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />


                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Reject</button>
                                    <a onClick={() => {
                                        setReject(false);
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

export default UploadedDocuments
