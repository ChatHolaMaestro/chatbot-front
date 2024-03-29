import { useState, useEffect } from 'react';
import TextFieldAtom from '../../atoms/TextField.js';
import SelectInput from '../../atoms/SelectInput.js';
import ButtonAtom from '../../atoms/Button.js';
import TextAtom from "../../atoms/Text.js";
import CheckAtom from '../../atoms/CheckAtom.js';
import MdiIconAtom from '../../atoms/MDI.js';
import { mdiClose } from '@mdi/js';
import { API_ENDPOINT } from "../../../config.js";


const tempRelatives = [null,null];

export default function NewUser(props) {
  let { fields } = props;
  const [selectedValues, setSelectedValues] = useState({});
  const [checkboxValues, setCheckboxValues] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showingValues, setShowingValues] = useState({});
 
  const checkFormValidity = () => {
    for (const field of fields) {
      if (field.required && (!checkboxValues[field.name] || checkboxValues[field.name] === "") && field.type === 'checkbox') {
        setIsFormValid(false);
        return;
      }
      if (field.required && (!selectedValues[field.name] || selectedValues[field.name] === "") && field.type !== 'checkbox') {
        setIsFormValid(false);
        return;
      }
    }
    setIsFormValid(true);
  };

  useEffect(() => {
    // Set initial data if received as props
    if (!isObjectEmpty(props.initialData)) {
      setSelectedValues(props.initialData);
    }
     checkFormValidity();
  }, [props.initialData]);


  const handleAdd = () => {
    // Add logic here
    props.toggleModal(); // Call the toggleModal function passed from the parent
  };

  const handleCheckboxChange = (fieldName, checked) => {
    checkFormValidity()
    setCheckboxValues({
      ...checkboxValues,
      [fieldName]: checked
    });
    checkFormValidity();
  };
  const handleSelectChange = (fieldName, value) => {
    checkFormValidity()
    setSelectedValues({
      ...selectedValues,
      [fieldName]: value
    });
    checkFormValidity();
  };

  const handleTextFieldChange = (fieldName, value) => {
    checkFormValidity()
    setSelectedValues({
      ...selectedValues,
      [fieldName]: value
    });
    checkFormValidity();
  };

  const handleSearchBoxChange = (fieldName, value) => {
    checkFormValidity()
    setShowingValues({
      ...showingValues,
      [fieldName]: value
    });
    checkFormValidity()
  };

  function onSearchClick(searchTerm, fieldNameSh, fieldNameRes, position){
    checkFormValidity()
    setShowingValues({
      ...showingValues,
      [fieldNameSh]: searchTerm.data
    });

    tempRelatives[position] = searchTerm.id;

    setSelectedValues({
      ...selectedValues,
      [fieldNameRes]: tempRelatives
    });
    checkFormValidity()

    //Clean null spaces 
    tempRelatives.forEach((item, index) => {
      if(item === null){
        tempRelatives.splice(index, 1);
      }
    });

  }


  function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  const buttonText = isObjectEmpty(props.initialData) ? 'Nuevo' : 'Editar';
  const handleSave = async () => {

    if (!isFormValid) {
      return;
    }
    const mergedValues = { ...selectedValues, ...checkboxValues };
    let url = '';
    let urlUser = '/api/users/users/';
    let methodUsed = 'POST';
    let methodUserUsed = 'POST';
    switch (props.selectedUser.index) {
      case 0:
        url = `/api/students/students/`;
        break;
      case 1:
        url = `/api/teachers/teachers/`;
        break;
      case 2:
        url = `/api/schools/school_managers/`;
        break;
      case 3:
        url = `/api/students/relatives/`;
        break;
      default:
        break;
    }

    if(props.selectedUser.index === 0 || props.selectedUser.index === 3){
    if(!isObjectEmpty(props.initialData)){
      url = url + props.initialData.id + '/';
      methodUsed = 'PUT';
      //delete id object in selectedValues
      delete selectedValues.id;
    }
    const response = await fetch(API_ENDPOINT + url, {
      method: methodUsed,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedValues)
    });
    if(response.status === 201 || response.status === 200){
      props.handleFetchResponse({ success: true});
    }else{
      props.handleFetchResponse({ success: false});
    }

  } else if (props.selectedUser.index === 1){
    if(!isObjectEmpty(props.initialData)){
      url = url + props.initialData.id + '/';
      urlUser = urlUser + props.initialData.idUser + '/';
      methodUsed = 'PUT';
      methodUserUsed = 'PUT';
      //delete id object in selectedValues
      delete selectedValues.id;
    }
    
    const response = await fetch(API_ENDPOINT + urlUser, {
      method: methodUserUsed,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedValues)
    });

    const result = await response.json();
    const idUser = result.id;
    const dataTeacher = {
      user: idUser,
      subjects: mergedValues['subjects'] ?? [],
      schedules: [],
    }

    const responseData = await fetch(API_ENDPOINT + url, {
      method: methodUsed,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataTeacher)
    });

    if(responseData.status === 201 || responseData.status === 200){
      props.handleFetchResponse({ success: true});
    }else{
      props.handleFetchResponse({ success: false});
    }
  
  } else if(props.selectedUser.index === 2){
      if(!isObjectEmpty(props.initialData)){
        url = url + props.initialData.id + '/';
        urlUser = urlUser + props.initialData.idUser + '/';
        methodUsed = 'PUT';
        methodUserUsed = 'PUT';
        //delete id object in selectedValues
        delete mergedValues.id;
      }
    const response = await fetch(API_ENDPOINT + urlUser, {
      method: methodUserUsed,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedValues)
    });

    const result = await response.json();
    const idUser = result.id;
    const dataManager = {
      user: idUser,
      school: selectedValues['school'],
    }
    const responseData = await fetch(API_ENDPOINT + url, {
      method: methodUsed,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataManager)
    });
    if(responseData.status === 201 || responseData.status === 200){
      props.handleFetchResponse({ success: true});
    }else{
      props.handleFetchResponse({ success: false});
    }
  
  }

    // Reset selectedValues state
    setSelectedValues({});

    // Close modal
    props.toggleModal();
  };

  return (
    <div className="new-user">
      <div className="d-flex justify-content-between mb-3">
        <TextAtom text={`${buttonText} ${props.selectedUser.singleName}`} weight="bold" align="left" size="22px"/>
        <MdiIconAtom onClick={handleAdd} path={mdiClose} size={1} spin={false} cursor="pointer"/>
      </div>
      <div className="new-user__fields">
        {fields.map((field, index) => (
          field.type === 'select' ? (
            <SelectInput
              key={index}
              label={field.label}
              value={selectedValues[field.name] || ''}
              onChange={(event) => handleSelectChange(field.name, event.target.value)}
              required={false}
              options={field.options}
              isObject={field.isObject}
            />
          ) :  field.type === "checkbox" ? (
            <CheckAtom
              key={index}
              label={field.label}
              checked={checkboxValues[field.name] || []}
              onChange={(checkedValues) => handleCheckboxChange(field.name, checkedValues)}
              options={field.options.map(option => ({ id: option.id, name: option.name }))} // Update the options prop
            />
          ):  field.type === "addSearch" ? (
            <div className="dropdown-items">
              <h6>{field.label}</h6>
              <div className="search-container">
              <div className="search-inner">
              <TextFieldAtom
                  key={index}
                  label={field.sing_label + ' 1'}
                  type={field.type}
                  minLength="1"
                  maxLength="100"
                  value={showingValues[field.name+'1'] || ''}
                  onChange={(event) => handleSearchBoxChange(field.name+'1', event.target.value)}
                />
              </div>
              <div className="dropdown">
                {field.info.filter(item => {
                  try {
                    const searchTerm = showingValues[field.name+1].toLowerCase();
                    const fullName = item.data.toLowerCase();
                    return searchTerm && fullName.includes(searchTerm) && fullName !== searchTerm;
                  } catch (error) {
                  }

                })
                .map((item)=> (<div className='dropdown-row' onClick={() => onSearchClick(item,field.name+'1',field.name,0)}>
                  {item.data}
                </div>)).slice(0, 3)}
              </div>
            </div> 
            <div className="search-container">
              <div className="search-inner">
              <TextFieldAtom
                  key={index}
                  label={field.sing_label + ' 2'}
                  type={field.type}
                  minLength="1"
                  maxLength="100"
                  value={showingValues[field.name+'2'] || ''}
                  onChange={(event) => handleSearchBoxChange(field.name+'2', event.target.value)}
                />
              </div>
              <div className="dropdown">
                {field.info.filter(item => {
                  try {
                    const searchTerm = showingValues[field.name+2].toLowerCase();
                    const fullName = item.data.toLowerCase();
                    return searchTerm && fullName.includes(searchTerm) && fullName !== searchTerm;
                  } catch (error) {
                  }

                })
                .map((item)=> (<div className='dropdown-row' onClick={() => onSearchClick(item,field.name+'2',field.name,1)}>
                  {item.data}
                </div>)).slice(0, 3)}
              </div>
            </div> 
            </div>
          ) : ( <TextFieldAtom
                  key={index}
                  label={field.label}
                  type={field.type}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  value={selectedValues[field.name] || ''}
                  onChange={(event) => handleTextFieldChange(field.name, event.target.value)}
                />
          )
        ))}
      </div>
      <div className='new-user__save'>
        <ButtonAtom label="Guardar" variant='contained' textColor={'white'} width={'200px'} onClick={handleSave} disabled={!isFormValid}/>
      </div>
    </div>
  );
}
