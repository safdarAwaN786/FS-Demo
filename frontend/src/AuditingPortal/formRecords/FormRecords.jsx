
import style from './FormRecords.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function FormRecords() {

    const [formsList, setFormsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [send, setSend] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [allDataArr, setAllDataArr] = useState(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get("/get-all-forms", { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            const approvedForms = response.data.forms.filter((obj) => obj.Status === 'Approved')
            setAllDataArr(approvedForms)
            setFormsList(approvedForms.slice(startIndex, endIndex));
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
            console.log(event.target.value);
            const searchedList = allDataArr.filter((obj) =>
                obj.formId.includes(event.target.value) || obj.FormName.includes(event.target.value)
            )
            console.log(searchedList);
            setFormsList(searchedList);
        } else {
            setFormsList(allDataArr?.slice(startIndex, endIndex))
        }
    }

    

    return (
        <>
            <div className={style.subparent}>      
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search form by name' />
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
                                <td>Result History</td>
                                
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
                                                    dispatch(updateTabData({...tabData, Tab : 'viewResultsHistory'}))
                                                    dispatch(changeId(form._id))
                                                   
                                                }} className={style.redclick}>View</p>
                                            </td>
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
                send && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert} p-3 pt-5`}>
                            <form onSubmit={(e) => {

                            }}>
                                <div className='mx-4 my-4 d-inline'>

                                    <input type='checkbox' className='mx-3 my-2 p-2' /><span>Department 1</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input type='checkbox' className='mx-3 my-2 p-2' /><span>Department 2</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input type='checkbox' className='mx-3 my-2 p-2' /><span>Department 3</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input type='checkbox' className='mx-3 my-2 p-2' /><span>Department 4</span>
                                </div>
                                

                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Send</button>
                                    <button onClick={() => {
                                        setSend(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</button>
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
