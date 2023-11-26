import style from './ShowPersonalRec.module.css'
import { useEffect, useState } from 'react'
import axios from "axios"
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function ShowPersonalRec() {
    const [reqPersonData, setReqPersonData] = useState(null);
    const userToken = Cookies.get('userToken');
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get("/readPersonalRecuisition", { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            const reqPersonsList = response.data.data;
            setReqPersonData(reqPersonsList.find((person) => person._id === idToWatch))
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    })
    return (

        <div className={style.subparent}>
            <div className='d-flex flex-row bg-white px-lg-5  px-2 py-2'>
                <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                    {
                        dispatch(updateTabData({...tabData, Tab : 'showPersonalRec'}));
                    }
                }} />

            </div>
            <div className={style.headers}>
                <div className={style.spans}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className={style.heading}>
                    Hiring Specification
                </div>
            </div>
            <div className={style.formDivider}>
                <div className={style.sec1}>
                    <div className={style.inputParent}>
                        <div className={style.para}>
                            <p>Minimum Qualification Required</p>
                        </div>
                        <div>
                            <p>{reqPersonData?.MiniQualification}</p>

                        </div>
                    </div>
                    <div className={style.inputParent}>
                        <div className={style.para}>
                            <p>Minimum Experience Required</p>
                        </div>
                        <div>
                            <p>{reqPersonData?.MiniExperienced}</p>

                        </div>
                    </div>
                    <div className={style.inputParent}>
                        <div className={style.para}>
                            <p>Industry Specific Experience</p>
                        </div>
                        <div>
                            <p>{reqPersonData?.IndustrySpecificExp}</p>

                        </div>
                    </div>
                    <div className={style.inputParent}>
                        <div className={style.para}>
                            <p>Age Bracket</p>
                        </div>
                        <div>
                            <p>{reqPersonData?.AgeBracket}</p>

                        </div>
                    </div>
                    <div className={style.textareaParent}>
                        <div className={style.para}>
                            <p>Main Job Responsibilities</p>
                        </div>
                        <div style={{ height: '168px !important' }}>
                            <p>{reqPersonData?.MainJobResponsibility}</p>

                        </div>
                    </div>
                    <div className={style.inputParent}>
                        <div className={style.para}>
                            <p>Designation</p>
                        </div>
                        <div>
                            <p>{reqPersonData?.Designation}</p>

                        </div>
                    </div>
                </div>
                <div className={style.sec2}>
                    <div className={` ${style.bg} ${style.checksParent}`}>
                        <div className={style.para}>
                            <p>Computer Skill Level</p>
                        </div>
                        <div className={style.term}>
                            <p>{reqPersonData?.ComputerSkill}</p>
                        </div>
                    </div>
                    <div className={` ${style.bg} ${style.checksParent}`}>
                        <div className={style.para}>
                            <p>Communication Skill Level</p>
                        </div>
                        <div className={style.term}>
                            <p>{reqPersonData?.CommunicationSkill}</p>
                        </div>
                    </div>
                    <div className={` ${style.bg} ${style.checksParent}`}>
                        <div className={style.para}>
                            <p>Justification Level</p>
                        </div>
                        <div className={style.term}>
                            <p>{reqPersonData?.Justification}</p>
                        </div>
                    </div>

                    <div className={style.inputParentSec2}>
                        <div className={style.para}>
                            <p>Others</p>
                        </div>
                        <div>
                            <p>{reqPersonData?.Others}</p>
                        </div>
                    </div>
                    <div className={style.inputParentSec2}>
                        <div className={style.para}>
                            <p>Request Initiated by</p>
                        </div>
                        <div>
                            <p>{reqPersonData?.RequestBy}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className={style.btn}>
                <button onClick={() => {
                    
                    dispatch(changeId(reqPersonData?._id))
                    dispatch(updateTabData({...tabData, Tab : 'showPersonalRec'}))
                }}>Previous Page</button>
            </div>

        </div>

    )
}

export default ShowPersonalRec
