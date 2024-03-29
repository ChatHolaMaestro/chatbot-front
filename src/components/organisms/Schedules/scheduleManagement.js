//import atoms
import SearchAtom from "../../atoms/Search.js";
import TableAtom from "../../atoms/Table.js";
import ButtonAtom from '../../atoms/Button.js';
import TextAtom from "../../atoms/Text.js";
import Toast from '../../atoms/Toast.js';

//import molecules
import LeftMenu from "../../molecules/LeftMenu/leftmenu.js";
import NewSchedule from '../../molecules/Dashboard/NewSchedule.js';

//import mui
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";


//Import Backend API
import { API_ENDPOINT } from "../../../config.js";

//Import React
import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { mdiPlus } from '@mdi/js';


//Create the table
const tableHeader = ["Id", "Día", "Hora inicial", "Hora final", "Tipo de Solicitud", "Id Profesor", "Nombre Profesor"];
const iterableFields = ["id", "day", "start_hour", "end_hour", "request_type", "teacher_id", "teacher_name"];

//Declare empty rows
var rows = [];

function createData(id, day, start_hour, end_hour, request_type, teacher_id, teacher_name) {
    return { id, day, start_hour, end_hour, request_type, teacher_id, teacher_name };
}

//Get request data from backend
async function requestGet() {
    let getRequests = "api/teachers/schedules/";

    organizeTableData(
        await fetch(API_ENDPOINT + getRequests, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                return data;
            })
    );
}

async function getTeachersPreAdd() {

    let teachersList = [];

    let getTeachers = 'api/teachers/teachers/'

    let teachersData = await fetch(API_ENDPOINT + getTeachers, {
        method: 'GET'
    }).then((response) => response.json())
        .then((data) => {
            return data;
        }).catch((error) => {
            alert("Error al obtener los profesores");
        });

    teachersData.map((teacher) => {
        let teacherObject = {
            id: teacher.id,
            data: teacher.user?.first_name + ' ' + teacher.user?.last_name + ' | ' + teacher.user?.identification_number
        }
        teachersList.push(teacherObject);
    })

    return teachersList;
}

//DELETE TABLE ROW WITH ID
async function requestDeleteFromDB(id) {

    let deleteRequest = '/api/teachers/schedules/' + id + '/';

    let deleteResponse = await fetch(API_ENDPOINT + deleteRequest, {
        method: 'DELETE'
    }).then((response) => response.json())
        .then((data) => {
            return true;
        }).catch((error) => {
            return false;
        });

    return deleteResponse;

}

function organizeTableData(apiData) {
    rows = [];

    apiData.map((rq) => {
        let id, day, start_hour, end_hour, request_type, teacher_id, teacher_name;
        let resultRowData;
        id = rq.id;
        day = rq.day
        start_hour = rq.start_hour;
        end_hour = rq.end_hour;
        request_type = rq.request_type;
        teacher_id = rq.teacher.id;
        teacher_name = rq.teacher.user?.first_name;

        resultRowData = createData(id, day, start_hour, end_hour, request_type, teacher_id, teacher_name);

        rows.push(resultRowData);
        return resultRowData;
    });
}

//Create a temp variable to store the rows
let tempRows = [];
let subjectInformation = {};
let teacherList = [];


export default function ScheduleManagement() {
    const [newTemp, setNewTemp] = useState([rows]);

    //Set background color with js
    document.body.style.backgroundColor = "#F2F4F7";

    //Call functions on component mounting
    useEffect(() => {
        fetchRequestData();
    }, []);

    async function fetchRequestData() {
        //Clean up rows
        rows = [];
        tempRows = [];
        teacherList = [];
        //Get data from backend
        await requestGet();
        teacherList = await getTeachersPreAdd();
        setInitRowsState();
    }

    function setInitRowsState() {
        //This is just 4 update the render after adding rows
        tempRows = rows.map((row) => row);
        setNewTemp([rows])
    }
    const [search, setSearch] = useState("");
    const [idDelete, setIdDelete] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);


    function handleSearch(searchData) {
        setSearch(searchData);
        tempRows = rows.filter((row) =>
            row.teacher_name.toLowerCase().includes(searchData.toLowerCase())
        );
    }

    const editableFields = [
        {
            name: "day",
            label: "Día",
            type: "select",
            options: [
                "LUNES",
                "MARTES",
                "MIERCOLES",
                "JUEVES",
                "VIERNES",
                "SABADO",
                "DOMINGO"
            ],
            isObject: true,
            required: true,
        },
        {
            name: "start_hour",
            label: "Hora inicial",
            type: "time",
            required: true,
        },
        {
            name: "end_hour",
            label: "Hora final",
            type: "time",
            required: true,
        },
        {
            name: "request_type",
            label: "Tipo de solicitud",
            type: "select",
            options: [
                "TAREAS",
                "REFUERZO",
            ],
            isObject: true,
            required: true,
        },
        {
            name: "teacher",
            label: "Profesor",
            type: "search",
            info: teacherList,
            required: true,
        },
    ];

    async function requestDelete(id) {
        setIdDelete(id);
        let deleteResponseStatus = await requestDeleteFromDB(id);

        if (deleteResponseStatus) {
            //Delete row from list
            rows = rows.filter((row) => row.id !== id);
            tempRows = rows.map((row) => row);
            setNewTemp([rows]);
        } else {
            alert("Error al eliminar la solicitud");
        }

    }
    const toggleModal = () => {
        if (isModalOpen) {
            subjectInformation = {};
        }
        setIsModalOpen(!isModalOpen); // update state variable to show/hide modal
        updateRowsData();
    };

    async function updateRowsData() {
        //Clean up rows
        rows = [];
        tempRows = [];

        //Get data from backend
        await requestGet();
        setInitRowsState();
        setSearch("");
    }

    const editSubject = (subjectId) => {
        subjectInformation = {};
        subjectInformation = tempRows.find((u) => u.id === subjectId);
        toggleModal();
    };
    // Toast
    const [toastOpen, setToastOpen] = useState(false);
    const [toastSeverity, setToastSeverity] = useState('');
    const [toastTitle, setToastTitle] = useState('');
    const [toastText, setToastText] = useState('');

    const handleOpenToast = () => {
        setToastOpen(true);
    };

    const handleCloseToast = () => {
        setToastOpen(false);
    };
    const handleFetchResponse = (response) => {

        const responseSuccess = {
            severity: 'success',
            title: 'Exitoso',
            text: 'Cambios guardados correctamente',
        };

        const responseError = {
            severity: 'error',
            title: 'Error',
            text: 'Error al guardar los cambios',
        };
        if (response.success) {

            setToastSeverity(responseSuccess.severity);
            setToastTitle(responseSuccess.title);
            setToastText(responseSuccess.text);
            // Handle success
            handleOpenToast();
        } else {
            setToastSeverity(responseError.severity);
            setToastTitle(responseError.title);
            setToastText(responseError.text);
            // Handle error
            handleOpenToast();
        }
    };


    return (<div className="d-flex">
        <LeftMenu />
        <div className="w-100">
            <div className="navbar">
                <div className="title">
                    <h3>
                        <a href="dashboard" className="title-anchor">
                            Dashboard
                        </a>{" "}
                        / Gestión de Horarios{" "}
                    </h3>
                </div>
                <SearchAtom searchEvent={handleSearch} />
            </div>
            <div className="subject__content">
                <div className='d-flex justify-content-between mt-5 mb-4'>
                    <TextAtom text="Gestión de Horarios" weight="bold" align="left" size="22px" />
                    <ButtonAtom onClick={toggleModal} label="Nuevo Horario" variant='contained' iconPath={mdiPlus} size={1} textColor={"white"} />
                </div>
                <div className="row">
                    <div className="col">
                        <Card className="table-card">
                            <CardContent>
                                <TableAtom
                                    tableHeader={tableHeader}
                                    iterableFields={iterableFields}
                                    rows={tempRows}
                                    editEvent={editSubject}
                                    deleteEvent={requestDelete}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
        <Modal
            isOpen={isModalOpen}
            onRequestClose={toggleModal}
            className="users-management--modal"
        >
            {/* labels Array, edit or new, (if edit, send user data, so do GET of the user before sending it) */}
            <NewSchedule
                appElement={document.getElementById('root')}
                toggleModal={toggleModal}
                fields={editableFields}
                initialData={subjectInformation}
                handleFetchResponse={handleFetchResponse}
            />
        </Modal>
        <Toast
            severity={toastSeverity}
            title={toastTitle}
            text={toastText}
            open={toastOpen}
            onClose={handleCloseToast}
        />
    </div>
    );
}
