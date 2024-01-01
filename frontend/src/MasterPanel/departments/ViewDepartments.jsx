
import style from './Departments.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function ViewDepartments() {

    const [departments, setDepartments] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const tabData = useSelector(state => state.tab);
    const idToWatch = useSelector(state => state.idToProcess);
    const dispatch = useDispatch();
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        dispatch(setLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${idToWatch}`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            dispatch(setLoading(false));
            setAllDataArr(response.data.data)
            setDepartments(response.data.data.slice(startIndex, endIndex));
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
        setDepartments(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);
            const searchedList = allDataArr.filter((obj) =>
                obj.DepartmentName.includes(event.target.value)
            )
            console.log(searchedList);
            setDepartments(searchedList);
        } else {
            setDepartments(allDataArr?.slice(startIndex, endIndex))
        }
    }


    return (
        <>
            <div className={style.subparent}>
                <div className='d-flex flex-row px-lg-5 px-2 my-1'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({...tabData, Tab : 'Departments'}))
                            
                        }
                    }} />

                </div>
                <div className={`${style.searchbar} mt-1`}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Department by name' />
                    </div>

                </div>
                <div className={style.tableParent}>
                    {!departments || departments?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Department Id</td>
                                <td>Department Name</td>
                                <td>Short Name</td>




                            </tr>
                            {
                                departments?.map((department, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td>{department.DepartmentId}</td>

                                            <td>{department.DepartmentName}</td>
                                            <td>{department.ShortName}</td>


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

        </>
    )
}

export default ViewDepartments
