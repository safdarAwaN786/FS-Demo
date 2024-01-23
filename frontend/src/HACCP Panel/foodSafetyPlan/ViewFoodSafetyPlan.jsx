
import style from './AddFoodSafetyPlan.module.css'
import { useEffect, useRef, useState } from 'react'
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


function ViewFoodSafetyPlan() {
    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [selectedDecisionTree, setSelectedDecisionTree] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth?.user);
    const idToWatch = useSelector(state => state.idToProcess);


    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-food-safety/${idToWatch}`).then((res) => {
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
                        pdf.addImage(dataURL, 'JPEG', (pdf.internal.pageSize.getWidth() / 2) - 1.5, 2.5, 3, 3);
                        pdf.setFontSize(25);
                        pdf.text(`${user.Company.CompanyName}`, (pdf.internal.pageSize.getWidth() / 2) - 1.5, (pdf.internal.pageSize.getHeight() / 2));
                        pdf.text(`${user.Company.Address}`, (pdf.internal.pageSize.getWidth() / 2) - 1.5, (pdf.internal.pageSize.getHeight() / 2) + 0.5);
                        pdf.setFontSize(15);
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
                    pdf.text('Food Safety Plan', pdf.internal.pageSize.getWidth() - 2, 0.5);
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



    useEffect(() => {
        let CCPDecisions = [];
        if (selectedDecisionTree) {
            console.log(selectedDecisionTree);
            selectedDecisionTree.Decisions.map((decisoinObj) => {
                if (decisoinObj.Q2 === true || decisoinObj.Q4 !== null) {
                    console.log(decisoinObj);
                    const { _id, ...rest } = decisoinObj;
                    CCPDecisions.push({ ...rest, Decision: decisoinObj._id });
                }
            })
            setDataToSend({ ...dataToSend, Plans: CCPDecisions })
        }
    }, [selectedDecisionTree])

   





    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Generate Food Safety Plan' }))
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
                            Generate Food Safety Plan
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

                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Plan for Decisions of :</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <input autoComplete='off' value={dataToSend?.DecisionTree.ConductHaccp.Process.ProcessName} type='text' className='w-100 text-dark' readOnly />


                                        </div>
                                    </div>

                                </div>
                            </div>
                            {dataToSend?.Plans?.map((plan, index) => {
                                return (
                                    <>
                                        <div className={`bg-danger flex-cloumn row mx-lg-4 mx-md-3 mx-1 mt-4 py-3  `}>
                                            <div className={`${style.heading}  col-lg-6 col-md-6 col-12`}>
                                                ({plan.Decision.Hazard.Process.ProcessNum}) {plan.Decision.Hazard.Process.Name}
                                            </div>
                                            <div className={`${style.heading} col-lg-6 col-md-6 col-12 d-flex justify-content-end pe-3`}>
                                                {plan.Decision.Hazard.type} Hazard
                                            </div>
                                        </div>
                                        <div className='bg-white  mx-lg-4 mx-md-3 mx-1 p-3'>
                                            <div className='row '>

                                                <div className='p-3 col-lg-6 col-md-6 col-12'>

                                                    <textarea value={plan?.HazardToControl} onChange={(e) => {
                                                        const updatedCCPHazard = dataToSend.Plans || [];
                                                        updatedCCPHazard[index][e.target.name] = e.target.value;
                                                        setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                    }} name='HazardToControl' rows={3} placeholder='hazard to Control  ' className='my-4 p-2 bg-light w-100 mx-2 border-0' readOnly required />
                                                </div>
                                                <div className='p-3 col-lg-6 col-md-6 col-12'>
                                                    <textarea value={plan.ControlMeasures} onChange={(e) => {
                                                        const updatedCCPHazard = dataToSend.Plans || [];
                                                        updatedCCPHazard[index][e.target.name] = e.target.value;
                                                        setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                    }} name='ControlMeasures' rows={3} placeholder='Control Measures ' className='my-4 p-2 bg-light w-100 mx-2 border-0' readOnly required />
                                                </div>
                                            </div>

                                            <div className='bg-light p-2 my-4'>

                                                <h4 style={{
                                                    fontFamily: 'Inter'
                                                }} className='text-center'>Process Limit</h4>

                                                <div className='row'>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan.ProcessLimit?.TargetRange} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].ProcessLimit) {
                                                                updatedCCPHazard[index].ProcessLimit = {};
                                                            }
                                                            updatedCCPHazard[index].ProcessLimit[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='TargetRange' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='Traget Range' required readOnly />
                                                        <textarea value={plan.ProcessLimit?.CriticalCtrlPoint} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].ProcessLimit) {
                                                                updatedCCPHazard[index].ProcessLimit = {};
                                                            }
                                                            updatedCCPHazard[index].ProcessLimit[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='CriticalCtrlPoint' rows={3} type='text' placeholder='Critical Control Area' className='w-100 p-2 my-3  border-0' readOnly required />
                                                    </div>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>

                                                        <textarea value={plan.ProcessLimit?.ActionPoint} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].ProcessLimit) {
                                                                updatedCCPHazard[index].ProcessLimit = {};
                                                            }
                                                            updatedCCPHazard[index].ProcessLimit[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                        }} name='ActionPoint' rows={3} type='text' placeholder='Action point' className='w-100 p-2 my-3  border-0' required readOnly />

                                                    </div>

                                                </div>
                                            </div>

                                            <textarea value={plan.JustificationLink} onChange={(e) => {
                                                const updatedCCPHazard = dataToSend.Plans || [];
                                                updatedCCPHazard[index][e.target.name] = e.target.value;
                                                setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                            }} name='JustificationLink' rows={3} placeholder='Justification link for CCP ' className='my-4 p-2 bg-light w-100 mx-2 border-0' required readOnly />

                                            <div className='bg-light p-2 my-4'>

                                                <h4 style={{
                                                    fontFamily: 'Inter'
                                                }} className='text-center'>Monitoring Point</h4>

                                                <div className='row'>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan.MonitoringPlan?.Who} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].MonitoringPlan) {
                                                                updatedCCPHazard[index].MonitoringPlan = {};
                                                            }
                                                            updatedCCPHazard[index].MonitoringPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                        }} name='Who' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='Who' readOnly required />
                                                        <textarea value={plan.MonitoringPlan?.What} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].MonitoringPlan) {
                                                                updatedCCPHazard[index].MonitoringPlan = {};
                                                            }
                                                            updatedCCPHazard[index].MonitoringPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                        }} name='What' rows={3} type='text' placeholder='What' className='w-100 p-2 my-3  border-0' required readOnly />
                                                    </div>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan?.MonitoringPlan?.When} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].MonitoringPlan) {
                                                                updatedCCPHazard[index].MonitoringPlan = {};
                                                            }
                                                            updatedCCPHazard[index].MonitoringPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='When' rows={3} type='text' placeholder='When' className='w-100 p-2 my-3  border-0' required readOnly />
                                                        <textarea value={plan?.MonitoringPlan?.How} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];
                                                            if (!updatedCCPHazard[index].MonitoringPlan) {
                                                                updatedCCPHazard[index].MonitoringPlan = {};
                                                            }
                                                            updatedCCPHazard[index].MonitoringPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                        }} name='How' rows={3} type='text' placeholder='How' className='w-100 p-2 my-3  border-0' required readOnly />

                                                    </div>

                                                </div>
                                            </div>

                                            <textarea value={plan?.CorrectiveAction} onChange={(e) => {
                                                const updatedCCPHazard = dataToSend.Plans || [];
                                                updatedCCPHazard[index][e.target.name] = e.target.value;
                                                setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                            }} name='CorrectiveAction' rows={3} placeholder='Corrective Action' className='my-4 p-2 bg-light w-100 mx-2 border-0' required readOnly />

                                            <div className='bg-light p-2 my-4'>

                                                <h4 style={{
                                                    fontFamily: 'Inter'
                                                }} className='text-center'>Verfification Plan</h4>

                                                <div className='row'>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan.VerificationPlan?.Who} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].VerificationPlan) {
                                                                updatedCCPHazard[index].VerificationPlan = {};
                                                            }
                                                            updatedCCPHazard[index].VerificationPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='Who' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='Who' readOnly required />
                                                        <textarea value={plan?.VerificationPlan?.What} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].VerificationPlan) {
                                                                updatedCCPHazard[index].VerificationPlan = {};
                                                            }
                                                            updatedCCPHazard[index].VerificationPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='What' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='What' readOnly required />

                                                    </div>
                                                    <div className='col-lg-6 col-md-6 col-12 p-4'>
                                                        <textarea value={plan?.VerificationPlan?.When} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].VerificationPlan) {
                                                                updatedCCPHazard[index].VerificationPlan = {};
                                                            }
                                                            updatedCCPHazard[index].VerificationPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='When' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='When' readOnly required />
                                                        <textarea value={plan?.VerificationPlan?.How} onChange={(e) => {
                                                            const updatedCCPHazard = dataToSend.Plans || [];

                                                            if (!updatedCCPHazard[index].VerificationPlan) {
                                                                updatedCCPHazard[index].VerificationPlan = {};
                                                            }
                                                            updatedCCPHazard[index].VerificationPlan[e.target.name] = e.target.value;
                                                            setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })

                                                        }} name='How' rows={3} type='text' className='w-100 p-2 my-3  border-0' placeholder='How' readOnly required />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='row '>
                                                <div className='p-3 col-lg-6 col-md-6 col-12'>
                                                    <textarea value={plan?.MonitoringRef} onChange={(e) => {
                                                        const updatedCCPHazard = dataToSend.Plans || [];


                                                        updatedCCPHazard[index][e.target.name] = e.target.value;
                                                        setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                    }} name='MonitoringRef' rows={3} placeholder='Monitoring record refrence' className='my-4 p-2 bg-light w-100 mx-2 border-0' required readOnly />
                                                </div>
                                                <div className='p-3 col-lg-6 col-md-6 col-12'>


                                                    <textarea value={plan?.VerificationRef} onChange={(e) => {
                                                        const updatedCCPHazard = dataToSend.Plans || [];
                                                        updatedCCPHazard[index][e.target.name] = e.target.value;
                                                        setDataToSend({ ...dataToSend, Plans: updatedCCPHazard })
                                                    }} name='VerificationRef' rows={3} placeholder='Verification record refrence' className='my-4 p-2 bg-light w-100 mx-2 border-0' required readOnly />
                                                </div>
                                            </div>
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
                    <div class={style.alertparent} >
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    // makeRequest();

                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cencel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default ViewFoodSafetyPlan
