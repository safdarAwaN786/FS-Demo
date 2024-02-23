import style from './AddDecisionTree.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import html2pdf from 'html2pdf.js';

const formatDate = (date) => {
    const newDate = new Date(date);
    const formatDate = newDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    return formatDate;
}

function ViewDecisionTree() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user)
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
                        pdf.text(`Address : ${user.Company.Address}`, (1), (pdf.internal.pageSize.getHeight() / 2) + 0.5);
                        pdf.setLineWidth(0.1); // Example line width
                        pdf.line(0.1, (pdf.internal.pageSize.getHeight() / 2) + 1, pdf.internal.pageSize.getWidth() - 0.2, (pdf.internal.pageSize.getHeight() / 2) + 1)
                        pdf.text("Document Id", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text(`${dataToSend.DocumentId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text("Created By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text(`${dataToSend.CreatedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text("Creation Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text(`${formatDate(dataToSend.CreationDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text("Revision Number", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        pdf.text(`${dataToSend.RevisionNo}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        if (dataToSend.Status == 'Approved') {

                            pdf.text("Approved By", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text(`${dataToSend.ApprovedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text("Approval Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                            pdf.text(`${formatDate(dataToSend.ApprovalDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                        }
                        if (dataToSend.ReviewedBy) {

                            pdf.text("Reviewed By", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text(`${dataToSend.ReviewedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text("Reviewed Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                            pdf.text(`${formatDate(dataToSend.ReviewDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    pdf.setFontSize(15)
                    pdf.text('Powered By Feat Technology', (pdf.internal.pageSize.getWidth() / 2) - 1.3, 0.5);
                    pdf.setFontSize(10);
                    pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                    pdf.text('Decision Tree', pdf.internal.pageSize.getWidth() - 2, 0.5);
                    pdf.text(`${dataToSend.DocumentId}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                    pdf.text(`Revision No :${dataToSend.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                    pdf.text(`Creation : ${formatDate(dataToSend.CreationDate)}`, pdf.internal.pageSize.getWidth() - 2, 1.1);
                }
            }
        }).save();

    };

    const alertManager = () => {
        setalert(!alert)
    }
    const idToWatch = useSelector(state => state.idToProcess);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-decision-tree/${idToWatch}`).then((res) => {
            setDataToSend(res.data.data);
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


    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Identify CCP/OPRP' }))
                                }
                            }} />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Decison Tree for CCP/ORP Selection
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();
                    }}>
                        <div id='printable' className={`${style.myBox} bg-light pb-3`}>
                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Type</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <input autoComplete='off' value={dataToSend?.DocumentType} type='text' className='w-100 text-dark' readOnly />

                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Decision tree for Hazards of :</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <input autoComplete='off' value={dataToSend?.ConductHaccp?.Process?.ProcessName} type='text' className='w-100 text-dark' readOnly />

                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <input autoComplete='off' value={dataToSend?.Department.DepartmentName} type='text' className='w-100 text-dark' readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {dataToSend?.Decisions?.map((decision, index) => {
                                return (
                                    <>
                                        <div className={`bg-danger row mx-lg-4 mx-md-3 mx-1 mt-4 py-3  `}>
                                            <div className=' col-lg-6 col-md-6 col-12'>
                                                <div className={`${style.heading} ms-3 `}>
                                                    {decision.Hazard.Process.ProcessNum}) {decision.Hazard.Process.Name}
                                                </div>
                                            </div>
                                            <div className='col-lg-6 col-md-6 col-12 d-flex justify-content-end pe-3'>
                                                <div className={`${style.heading} ms-3 `}>
                                                    {decision?.Hazard.type} Hazard
                                                </div>
                                            </div>
                                        </div>
                                        <div className='bg-white  mx-lg-4 mx-md-3 mx-1 p-3'>

                                            <div className='d-flex justify-content-between'>
                                                <div>
                                                    <h5><b>Q1 : </b> Are Control Measures in place for the hazard ?</h5>
                                                </div>
                                                <div>
                                                    {decision.Q1 === true &&
                                                        <span className={`${style.answerSpan} ${decision.Q1 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                            Yes
                                                        </span>
                                                    }
                                                    {decision.Q1 === false &&
                                                        <span className={`${style.answerSpan} ${decision.Q1 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                            No
                                                        </span>
                                                    }
                                                    {decision.Q1 === null &&
                                                        <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                            Not Answered
                                                        </span>
                                                    }
                                                </div>

                                            </div>
                                            {decision.Q1 === false && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 1A : </b> Is control at this step necessary ? </h5>
                                                    </div>
                                                    <div>
                                                        {decision.Q1A === true &&
                                                            <span className={`${style.answerSpan} ${decision.Q1A ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                                Yes

                                                            </span>
                                                        }
                                                        {decision.Q1A === false &&
                                                            <span className={`${style.answerSpan} ${decision.Q1A === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                                No
                                                            </span>
                                                        }
                                                        {decision.Q1A === null &&
                                                            <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                                Not Answered
                                                            </span>
                                                        }
                                                    </div>

                                                </div>
                                            )}
                                            {(decision.Q1 === true || decision.Q1A === true) && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 2 : </b> Is this step specially designed to control the Hazard ?</h5>
                                                    </div>
                                                    <div>
                                                        {decision.Q2 === true &&
                                                            <span className={`${style.answerSpan} ${decision.Q2 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                                Yes
                                                            </span>
                                                        }
                                                        {decision.Q2 === false &&
                                                            <span className={`${style.answerSpan} ${decision.Q2 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                                No
                                                            </span>
                                                        }
                                                        {decision.Q2 === null &&
                                                            <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                                Not Answered
                                                            </span>
                                                        }

                                                    </div>

                                                </div>
                                            )}
                                            {decision.Q2 === false && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 3 : </b> Could Hazard increase if not stopped at the point ?</h5>
                                                    </div>
                                                    <div>
                                                        {decision.Q3 === true &&
                                                            <span className={`${style.answerSpan} ${decision.Q3 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                                Yes
                                                            </span>
                                                        }
                                                        {decision.Q3 === false &&
                                                            <span className={`${style.answerSpan} ${decision.Q3 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                                No
                                                            </span>
                                                        }
                                                        {decision.Q3 === null &&
                                                            <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                                Not Answered
                                                            </span>
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                            {decision.Q3 === true && (

                                                <div className='d-flex justify-content-between'>
                                                    <div>
                                                        <h5><b>Q 4 : </b> Will the subsequent step eliminate the hazard ?</h5>
                                                    </div>
                                                    <div>
                                                        {decision.Q4 === true &&
                                                            <span className={`${style.answerSpan} ${decision.Q4 ? 'bg-success' : 'bg-secondary'} m-1`} >
                                                                Yes
                                                            </span>
                                                        }
                                                        {decision.Q4 === false &&
                                                            <span className={`${style.answerSpan} ${decision.Q4 === false ? 'bg-danger' : 'bg-secondary'} m-1`} >
                                                                No
                                                            </span>
                                                        }
                                                        {decision.Q4 === null &&
                                                            <span className={`${style.answerSpan} 'bg-secondary'} m-1`} >
                                                                Not Answered
                                                            </span>
                                                        }
                                                    </div>

                                                </div>
                                            )}
                                            <p className='text-center fw-bold'>
                                                {decision.Q1A === false && 'Stop✋! it is not a CCP.'}
                                                {decision.Q2 === true && 'Stop✋! CCP Identified.'}
                                                {decision.Q3 === false && 'Stop✋! it is not a CCP.'}
                                                {decision.Q4 === false && 'CCP Identified.'}
                                                {decision.Q4 === true && 'OPRP Identified.'}
                                            </p>
                                        </div>
                                    </>
                                )
                            })}
                        </div>
                    </form>
                    <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-center`}>
                        <button onClick={downloadPDF} type='button' >Download</button>
                    </div>
                </div>
            </div>
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default ViewDecisionTree
