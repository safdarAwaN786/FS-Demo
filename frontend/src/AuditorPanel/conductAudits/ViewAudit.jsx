import style from './AuditConduction.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import JoditEditor from 'jodit-react';
import Select from 'react-select';
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Slider from 'rc-slider';
import { setSmallLoading } from '../../redux/slices/loading';
import html2pdf from 'html2pdf.js';
import dayjs from 'dayjs'


function ViewAudit() {

    const [dataToSend, setDataToSend] = useState({})
    const [finalFormData, setFinalFormData] = useState(null);
    const [checklistData, setChecklistData] = useState(null);
    const [alert, setalert] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [auditData, setAuditData] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-conduct-audit-by-auditId/${idToWatch}`).then((response) => {
            const clonedData = JSON.parse(JSON.stringify(response.data));
            
            console.log(clonedData);
            setDataToSend(clonedData.data);
            setAuditData(clonedData.data);
            setChecklistData(clonedData.data.Checklist);
            setAnswers([...clonedData.data.Answers]);
            console.log(clonedData);
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
 
    const handleDownloadImage = async (imageURL) => {
        try {
            if (imageURL) {

                dispatch(setSmallLoading(true))
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                    params: {
                        url: imageURL,
                    },
                    responseType: 'blob', headers: { Authorization: `${user._id}` } // Specify the response type as 'blob' to handle binary data
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

    const downloadPDF = async () => {
        var element = document.getElementById('printable');
        var opt = {
            margin: [1.3, 0, 0, 0],
            filename: `${user.Department.DepartmentName}-doc.pdf`,
            enableLinks: false,
            pagebreak: { mode: 'avoid-all' },
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 4 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).toPdf().get('pdf').then(async function (pdf) {
            pdf.insertPage(1);

            var totalPages = pdf.internal.getNumberOfPages();
            //print current pdf width & height to console
            console.log("getHeight:" + pdf.internal.pageSize.getHeight());
            console.log("getWidth:" + pdf.internal.pageSize.getWidth());
            for (var i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFillColor(0, 0, 0);
                if (i === 1) {
                    try {
                        console.log(user.Company.CompanyLogo);
                        const response = await fetch(user.Company.CompanyLogo);
                        const blob = await response.blob();
                        const imageBitmap = await createImageBitmap(blob);
                        // create a canvas element and draw the image bitmap on it
                        const canvas = document.createElement('canvas');
                        canvas.width = imageBitmap.width;
                        canvas.height = imageBitmap.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(imageBitmap, 0, 0);
                        // get the data URL of the canvas
                        const dataURL = canvas.toDataURL('image/jpeg');
                        // pass the data URL to the pdf.addImage method
                        pdf.addImage(dataURL, 'JPEG', 1, 2.5, 3, 3);
                        pdf.setFontSize(20);
                        pdf.text(`Company : ${user.Company.CompanyName}`, (1), (pdf.internal.pageSize.getHeight() / 2));
                        pdf.setFontSize(15)
                        const address = `Address : ${user.Company.Address}`;
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const margins = 1; // Adjust margins as needed
                        const maxWidth = pageWidth - margins * 2; // Calculate usable width
                        const wrappedAddress = pdf.splitTextToSize(address, maxWidth);
                        
                        pdf.text(wrappedAddress, 1, (pdf.internal.pageSize.getHeight() / 2) + 0.5);
                        
                        pdf.setFontSize(15);
                        pdf.setLineWidth(0.1); // Example line width
                        pdf.line(0.1, (pdf.internal.pageSize.getHeight() / 2) + 1, pdf.internal.pageSize.getWidth() - 0.2, (pdf.internal.pageSize.getHeight() / 2) + 1)
                        pdf.text("Checklist Id", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text(`${dataToSend.Checklist.ChecklistId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text("Audit By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text(`${dataToSend.AuditBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text("Audit Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text(`${dayjs(dataToSend.AuditDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    pdf.setFontSize(15)
                    pdf.text('Powered By Feat Technology', (pdf.internal.pageSize.getWidth() / 2) - 1.3, 0.5);
                    pdf.setFontSize(10);
                    pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                    pdf.text('Audit', pdf.internal.pageSize.getWidth() - 2, 0.5);
                    pdf.text(`${dataToSend.Checklist.ChecklistId}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                    pdf.text(`Revision No :${dataToSend.Checklist.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                    pdf.text(`Checklist Creation : ${dayjs(dataToSend.Checklist.CreationDate).format('DD/MM/YYYY')}`, pdf.internal.pageSize.getWidth() - 2, 1.1);
                }
            }
        }).save();

    };

    

    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='mx-lg-5 px-4 mx-md-4 mx-2  mb-1 '>
                        <BsArrowLeftCircle onClick={(e) => {
                            dispatch(updateTabData({ ...tabData, Tab: 'Conduct Audit' }))
                        }} className='fs-3 text-danger mx-1' role='button' />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            View Audit
                        </div>
                    </div>
                    <form className='bg-white' encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        // Create a new FormData object
                        const formData = new FormData(event.target);
                        // Append the data to the FormData object
                        formData.append('Checklist', checklistData._id);
                        formData.append('Answers', JSON.stringify(auditData.Answers));
                        setFinalFormData(formData);
                        alertManager();

                    }}>
                        <div id='printable' className={`${style.formDivider} flex-column justify-content-center`}>
                            {answers?.map((answer, index) => {
                                return (
                                    <div style={{
                                        borderRadius: '6px',
                                        width: '700px'
                                    }} className='bg-white mx-auto my-4 p-2'>
                                        <div className='d-flex bg-light p-3 justify-content-center flex-column '>
                                            <div style={{
                                                width: '100%'
                                            }} className=' me-3 d-flex flex-column'>
                                                <input autoComplete='off' value={answer.question.questionText} style={{
                                                    borderRadius: '0px'
                                                }} name='questionText' placeholder='Untitled Question' className='border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3' required readOnly />

                                            </div>
                                            <div>
                                                {answer.question.ComplianceType === 'GradingSystem' && (
                                                    <div className='d-flex flex-row flex-wrap'>
                                                        <p className='my-2 fw-bold'> Selected Value : {answer?.GradingSystemAnswer}</p>
                                                        <div className='d-flex w-100 justify-content-between'>
                                                            <span>1</span>
                                                            <span>10</span></div>
                                                        <Slider
                                                            value={answer.GradingSystemAnswer}
                                                            min={1} // Set your lower value
                                                            max={10} // Set your higher value
                                                            step={1} // Set the step size
                                                            {...(answer.question.Required ? { required: true } : {})} readOnly />
                                                    </div>
                                                )}
                                                {answer.question.ComplianceType === 'Yes/No' && (
                                                    <div className='d-flex flex-row flex-wrap'>

                                                        <input autoComplete='off' checked={answer.YesNoAnswer === 'Yes'} type="radio" class="btn-check" name={answer.question._id} id={`Yes-${index}`} autocomplete="off" readOnly />
                                                        <label class="btn btn-outline-success m-2" for={`Yes-${index}`}>Yes</label>

                                                        <input autoComplete='off' checked={answer.YesNoAnswer === 'No'} type="radio" class="btn-check" name={answer.question._id} id={`No-${index}`} autocomplete="off" readOnly />
                                                        <label class="btn btn-outline-danger m-2" for={`No-${index}`}>No</label>
                                                        <input autoComplete='off' checked={answer.YesNoAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                    </div>
                                                )}
                                                {answer.question.ComplianceType === 'Safe/AtRisk' && (
                                                    <div className='d-flex flex-row flex-wrap'>

                                                        <input autoComplete='off' checked={answer.SafeAtRiskAnswer === 'Safe'} type="radio" class="btn-check" name={answer.question._id} id={`Safe-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-success m-2" for={`Safe-${index}`}>Safe</label>

                                                        <input autoComplete='off' checked={answer.SafeAtRiskAnswer === 'At Risk'} type="radio" class="btn-check" name={answer.question._id} id={`At Risk-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-danger m-2" for={`At Risk-${index}`}>At Risk</label>
                                                        <input autoComplete='off' checked={answer.SafeAtRiskAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                    </div>
                                                )}

                                                {answer.question.ComplianceType === 'Pass/Fail' && (
                                                    <div className='d-flex flex-row flex-wrap'>

                                                        <input autoComplete='off' checked={answer.PassFailAnswer === 'Pass'} type="radio" class="btn-check" name={answer.question._id} id={`Pass-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-success m-2" for={`Pass-${index}`}>Pass</label>

                                                        <input autoComplete='off' checked={answer.PassFailAnswer === 'Fail'} type="radio" class="btn-check" name={answer.question._id} id={`Fail-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-danger m-2" for={`Fail-${index}`}>Fail</label>
                                                        <input autoComplete='off' checked={answer.PassFailAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                    </div>
                                                )}
                                                {answer.question.ComplianceType === 'Compliant/NonCompliant' && (
                                                    <div className='d-flex flex-row flex-wrap'>

                                                        <input autoComplete='off' checked={answer.CompliantNonCompliantAnswer === 'Compliant'} type="radio" class="btn-check" name={answer.question._id} id={`Compliant-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-success m-2" for={`Compliant-${index}`}>Compliant</label>

                                                        <input autoComplete='off' checked={answer.CompliantNonCompliantAnswer === 'Non-Compliant'} type="radio" class="btn-check" name={answer.question._id} id={`Non-Compliant-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-danger m-2" for={`Non-Compliant-${index}`}>Non-Compliant</label>
                                                        <input autoComplete='off' checked={answer.CompliantNonCompliantAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                    </div>
                                                )}
                                                {answer.question.ComplianceType === 'Good/Fair/Poor' && (
                                                    <div className='d-flex flex-row flex-wrap'>

                                                        <input autoComplete='off' checked={answer.GoodFairPoorAnswer === 'Good'} type="radio" class="btn-check" name={answer.question._id} id={`Good-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-success m-2" for={`Good-${index}`}>Good</label>
                                                        <input autoComplete='off' checked={answer.GoodFairPoorAnswer === 'Fair'} type="radio" class="btn-check" name={answer.question._id} id={`Fair-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-warning m-2" for={`Fair-${index}`}>Fair</label>

                                                        <input autoComplete='off' checked={answer.GoodFairPoorAnswer === 'Poor'} type="radio" class="btn-check" name={answer.question._id} id={`Poor-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-danger m-2" for={`Poor-${index}`}>Poor</label>
                                                        <input autoComplete='off' checked={answer.GoodFairPoorAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                    </div>
                                                )}

                                                {answer.question.ComplianceType === 'Conform/MinorNonComform/MajorNonConform/CriticalNonConform/Observation' && (
                                                    <div className='d-flex flex-row flex-wrap'>

                                                        <input autoComplete='off' checked={answer.ConformObservationAnswer === 'Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Conform-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-success m-2" for={`Conform-${index}`}>Conform</label>
                                                        <input autoComplete='off' checked={answer.ConformObservationAnswer === 'Minor Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Minor Non-Conform-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-warning m-2" for={`Minor Non-Conform-${index}`}>Minor Non-Conform</label>

                                                        <input autoComplete='off' checked={answer.ConformObservationAnswer === 'Major Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Major Non-Conform-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-danger m-2" for={`Major Non-Conform-${index}`}>Major Non-Conform</label>
                                                        <input autoComplete='off' checked={answer.ConformObservationAnswer === 'Critical Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Critical Non-Conform-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-primary m-2" for={`Critical Non-Conform-${index}`}>Critical Non-Conform</label>

                                                        <input autoComplete='off' checked={answer.ConformObservationAnswer === 'Observation'} type="radio" class="btn-check" name={answer.question._id} id={`Observation-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-info m-2" for={`Observation-${index}`}>Observation</label>
                                                        <input autoComplete='off' checked={answer.ConformObservationAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                        <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                    </div>
                                                )}
                                                <textarea value={answer.Remarks} rows={3} className='w-100 p-2 my-2' placeholder='Remarks...' required />
                                            </div>

                                            <div style={{
                                                width: '100%'
                                            }} className=' mt-2 d-flex flex-row'>
                                                <div style={{
                                                    width: '80%'
                                                }}>
                                                    {answer.EvidenceDoc && (

                                                        <div className='d-flex flex-column w-50'>
                                                            <label>Evidence Document :</label>
                                                            <a onClick={()=>{
                                                                handleDownloadImage(answer.EvidenceDoc)
                                                            }} className='btn btn-outline-danger' >Download</a>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className='mx-2 mt-1' style={{
                                                    fontFamily: 'Inter',
                                                    color: 'black'
                                                }}>Required</p>
                                                <label className={style.switch}>
                                                    <input autoComplete='off' checked={answer.question?.Required} className='ms-3' name='Required' type="checkbox" readOnly />
                                                    <span className={`${style.slider} ${style.round}`} ></span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </form>
                    <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-center`}>
                        <button onClick={downloadPDF} type='button' >Download</button>
                    </div>
                </div>
            </div>
            
        </>
    )
}

export default ViewAudit
