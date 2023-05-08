//import atoms
import SearchAtom from "../../atoms/Search.js";
import TableAtom from "../../atoms/Table.js";

//import molecules
import LeftMenu from "../../molecules/LeftMenu/leftmenu.js";

//import mui
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

//Import scss
import "./subject_management.scss";

//Import Backend API
import { API_ENDPOINT } from "../../../config.js";

//Import React
import React, { useState, useEffect } from "react";

//Create the table
const tableHeader = [
  "Id", "Nombre materia","Editar"
];
const iterableFields = ["id", "name"];

//Declare empty rows
var rows = [];

function createData(id, name) {
  return { id, name };
}

//Get request data from backend
async function requestGet() {
  let getRequests = "api/subjects/subjects/";

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

//DELETE TABLE ROW WITH ID
async function requestDeleteFromDB(id){

  let deleteRequest = '/api/subjects/subjects/' + id + '/';

  let deleteResponse =await fetch(API_ENDPOINT + deleteRequest, {
    method : 'DELETE'
  }).then((response) => response.json())
  .then((data) => {
    return true;
  }).catch((error) => {
    console.log(error)
    return false;
  });

  return deleteResponse;

}

function organizeTableData(apiData) {
  rows = [];

  apiData.map((rq) => {
    let id, name;
    let resultRowData;
    id = rq.id;
    name = rq.name;
 

    resultRowData = createData(id, name);

    rows.push(resultRowData);
    return resultRowData;
  });
}

//Create a temp variable to store the rows
let tempRows = [];

export default function RequestManagement() {
    const [newTemp,setNewTemp] = useState([rows]);

  //Set background color with js
  document.body.style.backgroundColor = "#F2F4F7";

   //Call functions on component mounting
   useEffect(() => {
    fetchRequestData();
  },[]);

  async function fetchRequestData(){

      
    //Clean up rows
    rows = [];
    tempRows = [];
    //Get data from backend
    await requestGet();
    setInitRowsState();
  }

  function setInitRowsState(){
    //This is just 4 update the render after adding rows
    tempRows = rows.map((row) => row);
    setNewTemp([rows])
  }
  const [search, setSearch] = useState("");
  const [idDelete, setIdDelete] = useState('');


  function handleSearch(searchData) {
    setSearch(searchData);
    tempRows = rows.filter((row) =>
      row.name.toLowerCase().includes(searchData.toLowerCase())
    );
  }

  async function requestDelete(id){
    console.log('Id selected',id);
    setIdDelete(id);
    let deleteResponseStatus = await requestDeleteFromDB(id);

    if(deleteResponseStatus){
      //Delete row from list
      rows = rows.filter((row) => row.id !== id);
      tempRows = rows.map((row) => row);
      setNewTemp([rows]);
    }else{
      alert("Error al eliminar la solicitud");
    }
    
  }

  return (<div class="d-flex">
      <LeftMenu/>
      <div class="w-100">
        <div className="navbar">
          <div className="title">
            <h3>
              <a href="dashboard" className="title-anchor">
                Dashboard
              </a>{" "}
              / Gestión de materias{" "}
            </h3>
          </div>
          <SearchAtom searchEvent={handleSearch}/>
        </div>
        
        <div className="row">
          <div className="col">
            <h4 className="job-subtitle">Gestión de solicitudes</h4>
            <Card className="table-card">
              <CardContent>
                <TableAtom 
                  tableHeader={tableHeader}
                  iterableFields={iterableFields}
                  rows={tempRows}
                  deleteEvent={requestDelete}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    );
  }
