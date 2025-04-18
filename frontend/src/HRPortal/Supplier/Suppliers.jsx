import style from './Suppliers.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-suppliers`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            dispatch(setSmallLoading(false))
            setAllDataArr(response.data.data);
            console.log(response.data);
            setSuppliers(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const statusUpdated = () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-suppliers`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            dispatch(setSmallLoading(false))
            setAllDataArr(response.data.data);
            setSuppliers(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setSmallLoading(false));
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
        setSuppliers(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.Name.includes(event.target.value) || obj.SupplierCode.includes(event.target.value)
            )
            setSuppliers(searchedList);
        } else {
            setSuppliers(allDataArr?.slice(startIndex, endIndex))
        }
    }

    const [popUpData, setPopUpData] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);



    const [alert, setalert] = useState(false)
    const [alert2, setalert2] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const alertManager2 = () => {
        setalert2(!alert2)
    }

    const formatDate = (date) => {

        const newDate = new Date(date);
        const formatDate = newDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return formatDate;
    }


    return (
        <>
            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search by Name or Code ' />
                </div>
                {tabData?.Creation && (
                    <div className='d-flex'>
                        <div onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'addSupplier' }));
                        }} className={style.sec2}>
                            <img src={add} alt="" />
                            <p>Add New</p>
                        </div>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>

                {!suppliers || suppliers?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <tr className={style.headers}>
                            {/* <td>Supplier Code</td> */}
                            <td>Name</td>
                            <td>Phone #</td>
                            <td>Phone 2 #</td>
                            <td>Contact Person</td>
                            <td>Address</td>
                            <td>Due Date</td>
                            <td>Risk Category</td>
                            <td>Current Approval Date</td>
                            <td>Next Approval Date</td>
                            <td>Created By</td>
                            <td>Creation Date</td>
                            <td>Service Offered</td>
                            {tabData?.Approval && (
                                <td>Action</td>
                            )}
                            <td></td>
                            <td>Status</td>
                            <td>Reason</td>
                            <td>Approved By</td>
                            <td>Approval Date</td>
                            <td>DisApproved By</td>
                            <td>DisApproval Date</td>
                        </tr>
                        {
                            suppliers?.map((supplier, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        {/* <td className={style.textStyle2}>{supplier.SupplierCode}</td> */}
                                        <td className={style.textStyle3}>{supplier.Name}</td>
                                        <td className={style.textStyle3}>{supplier.PhoneNumber}</td>
                                        <td className={style.textStyle3}>{supplier.PhoneNumber2}</td>
                                        <td className={style.textStyle3}>{supplier.ContactPerson}</td>
                                        <td className={style.textStyle3}>{supplier.Address}</td>
                                        <td className={style.textStyle3}>{supplier.DueDate}</td>
                                        <td className={style.textStyle3}>{supplier.RiskCategory}</td>
                                        <td>{formatDate(supplier.CurrentApprovalDate)}</td>
                                        <td>{formatDate(supplier.NextApprovalDate)}</td>

                                        <td className={style.textStyle3}>{supplier.CreatedBy}</td>
                                        <td>{formatDate(supplier.CreationDate)}</td>
                                        <td ><button onClick={() => {
                                            setPopUpData(supplier.ProductServiceOffered);
                                            setShowBox(true);
                                        }} className={style.viewBtn}>View</button>
                                        </td>
                                        {tabData?.Approval && (
                                            <td>
                                                <button onClick={() => {
                                                    setDataToSend({
                                                        id: supplier._id,
                                                    });
                                                    alertManager2();
                                                }} className={`${style.viewBtn2} mx-1`}>Approve</button>
                                                <button onClick={() => {
                                                    if (supplier.Status === 'Approved') {
                                                        setPopUpData('Sorry! Supplier is already Approved!')
                                                        setShowBox(true)
                                                    } else {
                                                        setDataToSend({
                                                            id: supplier._id,
                                                        });
                                                        setalert(!alert)

                                                    }


                                                }} className={`${style.orangebtn} mx-1`}>Disapprove</button>



                                            </td>
                                        )}
                                        <td className={style.textStyle3}></td>
                                        <td><div className={` text-center ${supplier.Status === 'Pending' && (style.yellowStatus)} ${supplier.Status === 'Approved' && (style.greenStatus)} ${supplier.Status === 'Disapproved' && (style.redStatus)}`}><p>{supplier.Status}</p></div></td>
                                        <td ><button onClick={() => {
                                            if (supplier.Status === "Approved") {
                                                setPopUpData("This Application is Approved.");
                                            } else if (supplier.Status === "Disapproved") {
                                                setPopUpData(supplier.Reason);
                                            } else {
                                                setPopUpData("Application is pending still.")
                                            }
                                            setShowBox(true);
                                        }} className={style.viewBtn}>View</button>
                                        </td>
                                        <td>{supplier.ApprovedBy || '--'}</td>
                                        {supplier.ApprovalDate ? (
                                            <td>{supplier.ApprovalDate?.slice(0, 10).split('-')[2]}/{supplier.ApprovalDate?.slice(0, 10).split('-')[1]}/{supplier.ApprovalDate?.slice(0, 10).split('-')[0]}</td>
                                        ) : (
                                            <td>- -</td>
                                        )}
                                        <td>{supplier.DisapprovedBy || '--'}</td>
                                        {supplier.DisapprovalDate ? (
                                            <td>{supplier.DisapprovalDate?.slice(0, 10).split('-')[2]}/{supplier.DisapprovalDate?.slice(0, 10).split('-')[1]}/{supplier.DisapprovalDate?.slice(0, 10).split('-')[0]}</td>
                                        ) : (
                                            <td>- -</td>
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
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                dispatch(setSmallLoading(true))
                                axios.patch(`${process.env.REACT_APP_BACKEND_URL}/disapprove-supplier`, { ...dataToSend, disapprovedBy: user.Name }).then(() => {
                                    dispatch(setSmallLoading(false))
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Submitted Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            statusUpdated();
                                        }
                                    })
                                }).catch(err => {
                                    dispatch(setSmallLoading(false));
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'OOps..',
                                        text: 'Something went wrong, Try Again!'
                                    })
                                })
                                setalert(false);
                            }}>

                                <textarea onChange={(e) => {
                                    setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                }} name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />
                                <div className={style.alertbtns}>
                                    <button type='submit' className={style.btn1}>Submit</button>
                                    <button onClick={() => {
                                        setalert(!alert)
                                    }} className={style.btn2}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div> : null
            }
            {
                alert2 ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p>Are you sure to submit ?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setSmallLoading(true))
                                    axios.patch(`${process.env.REACT_APP_BACKEND_URL}/approve-supplier`, { ...dataToSend, approvedBy: user.Name }).then(() => {
                                        statusUpdated()
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Status Updated Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        })
                                    }).catch(err => {
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })

                                    alertManager2();
                                }} className={style.btn3}>Submit</button>
                                <button onClick={alertManager2} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                showBox &&
                <div class={style.alertparent}>
                    <div class={style.alert}>
                        <div className='overflow-y-handler'>
                        <p className={style.msg} >{popUpData}</p>
                        </div>
                        <div className={style.alertbtns}>

                            <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={() => {
                                setShowBox(false);
                            }} className={style.btn2}>Ok.</button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}



