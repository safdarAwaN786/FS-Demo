
import style from './FormRecords.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function FormRecords() {

    const [formsList, setFormsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth.user)
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-forms-to-fill`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            const approvedForms = response.data.forms;
            setAllDataArr(approvedForms)
            setFormsList(approvedForms.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])
    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }
    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }
    useEffect(() => {
        setFormsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])
    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.formId.includes(event.target.value) || obj.FormName.includes(event.target.value)
            )
            setFormsList(searchedList);
        } else {
            setFormsList(allDataArr?.slice(startIndex, endIndex))
        }
    }

    return (
        <>
                 
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input autoComplete='off' onChange={search} type="text" placeholder='Search form by name' />
                    </div>               
                </div>
                <div className={style.tableParent}>
                    {!formsList || formsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (
                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Form ID</td>
                                <td>Form Name</td>       
                                <td>Form</td>
                            </tr>
                            {
                                formsList?.map((form, i) => {
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
                                            }}>{form.FormId}</p></td>
                                            <td className={style.simpleContent}>{form.FormName}</td>        
                                            <td>
                                                <p onClick={() => {
                                                    dispatch(updateTabData({...tabData, Tab : 'fillForm'}));
                                                    dispatch(changeId(form._id))
                                                }} className='btn btn-outline-primary px-3 py-1'>Fill</p>
                                            </td>
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
                            <div className='overflow-y-handler'>

                            <p class={style.msg}>{dataToShow}</p>
                            </div>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={() => {
                                    setShowBox(false);
                                }} className={style.btn2}>OK</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                reject && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {
                            }}>
                               <textarea name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />
                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Send</button>
                                    <button onClick={() => {
                                        setReject(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default FormRecords
