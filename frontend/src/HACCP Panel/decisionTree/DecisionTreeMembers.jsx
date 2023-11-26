
import style from './DecisionTreeMembers.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function DecisionTreeMembers() {

    const [members, setMembers] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [decisionTree, setDecisionTree] = useState(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`/get-decision-tree/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            setDecisionTree(response.data.data);
            console.log(response.data.data);
            setMembers(response.data.data?.ConductHaccp.Members?.slice(startIndex, endIndex));
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

        setMembers(decisionTree?.ConductHaccp.Members?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = decisionTree?.ConductHaccp.Members.filter((obj) =>

                obj.Name.includes(event.target.value)
            )
            console.log(searchedList);
            setMembers(searchedList);
        } else {
            setMembers(decisionTree?.ConductHaccp.Members.slice(startIndex, endIndex))
        }
    }

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

    return (
        <>
            
            <div className={style.subparent}>
            <div className='d-flex flex-row bg-white px-lg-5  px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({...tabData, Tab : 'Decision Tree'}))
                                }
                            }} />

                    </div>
                <div className={`${style.searchbar} mt-1 `}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Member by name' />
                    </div>
                    
                </div>
                <div className={style.tableParent}>
                    {!members || members?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Name</td>
                                <td>Education</td>
                                <td>Designation</td>
                                <td>Experience</td>
                                <td>Department</td>
                                <td>Role in Team</td>
                                <td>Trainings Attended</td>
                                <td>Date of Training</td>
                                <td>Document</td>
                            </tr>
                            {
                                members?.map((member, i) => {
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
                                            }}>{member.Name}</p></td>
                                            <td className={style.simpleContent}>{member.Education}</td>
                                            <td>{member.Designation}</td>
                                            <td>{member.Experience}</td>
                                            <td>{member.Department.DepartmentName}</td>
                                            <td>{member.RoleInTeam}</td>
                                            <td>{member.TrainingsAttended}</td>
                                            <td>{member.TrainingDate?.slice(0, 10).split('-')[2]}/{member.TrainingDate?.slice(0, 10).split('-')[1]}/{member.TrainingDate?.slice(0, 10).split('-')[0]}</td>
                                            <td><button onClick={()=>{
                                            if(member.Document ){
                                                console.log(member.Document)
                                                handleDownloadImage(member.Document)
                                            } else {
                                                setDataToShow('No File Uploaded Here');
                                                setShowBox(true);
                                            }
                                           }} className='btn btn-outline-danger p-1 '>Download</button></td>
                                           


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
                    {decisionTree?.ConductHaccp.Members.length > endIndex && (

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

export default DecisionTreeMembers
