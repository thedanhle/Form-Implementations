import React, { useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import config from "../config";
import { s3Upload } from "../libs/awsLib";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
// import "./NewProject.css";

export default function NewProject() {
    const file1 = useRef(null);
    const file2 = useRef(null);
    const [activeProject, setActiveProject] = useState(setDefaultLifecycleState(window.location.search.substring(1)));
    const [originalLifecycleState, setOriginalLifecycleState] = useState(getLifecycleState(window.location.search.substring(1)));
    const history = useHistory();
    const [projectName, setProjectName] = useState(getProjectName(window.location.search.substring(1)));
    const [lifecycleState, setLifecycleState] = useState(getLifecycleState(window.location.search.substring(1)));
    const [description, setDescription] = useState(getDescription(window.location.search.substring(1)));
    const [status, setStatus] = useState(getStatus(window.location.search.substring(1)));
    const [parentCPO, setParentCPO] = useState(getParentCPO(window.location.search.substring(1)));
    const [isLoading, setIsLoading] = useState(false);
    const [completionDate, setCompletionDate] = useState(null)


    function validateForm() {
        return projectName.length > 0;
    }

    function handleFile1Change(event) {
        file1.current = event.target.files[0];
    }

    function handleFile2Change(event) {
        file2.current = event.target.files[0];
    }

    function handleFileType(file) {
        var name = file.current['name']
        var fileType = name.substring(name.indexOf('.') + 1);
        return fileType;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if(lifecycleState !== 'Active' && completionDate === null) {
            alert(
                'Please provide completion date for completed projects'
            );
            return;
        }

        if(file1.current) {
            if(handleFileType(file1) !== 'pdf') {
                alert(
                    'Make sure the document is a .pdf file'
                );
                return;
            }
        }

        if(file2.current) {
            if(handleFileType(file2) !== 'jpg' && handleFileType(file2) !== 'png') {
                console.log(handleFileType(file2))
                alert(
                    'Make sure the image is a .jpg or .png file'
                );
                return;
            }
        }

        if(originalLifecycleState === 'Active' && lifecycleState !== 'Active' && (file1.current === null || file2.current === null)) {
            alert(
              'Please include a file for the document and image for a transitioned or completed project'
            );
            return;
        }

        if (file1.current && file1.current.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000} MB.`
            );
            return;
        }

        if (file2.current && file2.current.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000} MB.`
            );
            return;
        }
        setIsLoading(true);

        try {

            const documentName = file1.current ? await s3Upload(file1.current) : "None";
            const imageName = file2.current ? await s3Upload(file2.current) : "None";



            await createProject({ projectName, lifecycleState, status, parentCPO, description, documentName, imageName, completionDate});

            history.push("/");
        }   catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function createProject(project) {
        return API.post(config.apiGateway.NAME, "/projects", {
            body: project
        });
    }

    function getProjectName(str){
        if (str !== "") {
            var a = str.split("|");
            return a[0].replace(/%20/g, " ");
        }else{
            return str;
        }
    }

    function getParentCPO(str){
        if (str !== "") {
            var a = str.split("|");
            return a[1].replace(/%20/g, " ");
        }else{
            return str;
        }
    }

    function getDescription(str){
        if (str !== "") {
            var a = str.split("|");
            return a[2].replace(/%20/g, " ");
        }else{
            return str;
        }
    }
    function getStatus(str){
        if (str !== "") {
            var a = str.split("|");
            if(a[3] === 'undefined' || a[3] === 'green') {
                a[3] = 'green';
                return a[3];
            }
            return a[3].replace(/%20/g, " ");
        }else{
            return str;
        }
    }

    function getLifecycleState(str){
        if (str !== "") {
            var a = str.split("|");
            if(a[4] === 'undefined' || a[4] === 'Active') {
                a[4] = 'Active';
                return a[4];
            }
            return a[4].replace(/%20/g, " ");
        }else{
            return str;
        }
    }

    function setDefaultLifecycleState(str) {
        var a = str.split("|");
        if(a[4] === "Active" || a[4] === "undefined") {
            return true;
        }
        else {
            return false;
        }
    }

    function handleSelect(value) {
        if(value === 'undefined') {
            setOriginalLifecycleState(value)
        }

        setLifecycleState(value)
        var selected = value;
        if (selected === "Active") {
            setActiveProject(true);
        }
        else {
            setActiveProject(false);
        }
    }
    //console.log('Original Lifecycle State:   ' + originalLifecycleState)
    //console.log('Lifecyclestate:   ' +  lifecycleState);

    function epoch(date) {
        //var test = Date.parse(date)
        // console.log('Selected Date:   ' + test);
        return Date.parse(date)
    }


    return (
        <div className="NewProject">
            <Form onSubmit={handleSubmit}>
                <h2>Project Name</h2>
                <Form.Group controlId="projectName">
                    <Form.Control
                        defaultValue={getProjectName(window.location.search.substring(1))}
                        as="textarea"
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                </Form.Group>
                <h2>Parent CPO Name</h2>
                <Form.Group controlId="parentCPO">
                    <Form.Control
                        defaultValue={getParentCPO(window.location.search.substring(1))}
                        as="textarea"
                        onChange={(e) => setParentCPO(e.target.value)}
                    />
                </Form.Group>
                <h2>Project Status</h2>
                <Form.Group controlId="status">
                    <Form.Control
                        //defaultValue={getStatus(window.location.search.substring(1))}
                        value={status}
                        as="select"
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option>green</option>
                        <option>yellow</option>
                        <option>red</option>
                    </Form.Control>
                </Form.Group>
                <h2>Project Lifecycle State</h2>
                <Form.Group controlId="lifecycleState">
                    <Form.Control
                        value={lifecycleState}
                        as="select"
                        onChange={(e) => handleSelect(e.target.value)}
                    >
                        <option>Active</option>
                        <option>Transitioned</option>
                        <option>Completed</option>
                    </Form.Control>
                </Form.Group>
                <h2>Project Description</h2>
                <Form.Group controlId="description">
                    <Form.Control
                        defaultValue={getDescription(window.location.search.substring(1))}
                        as="textarea"
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>
                <h2>Completion Date</h2>
                <Form.Group controlId="completionDate" hidden={activeProject}>
                    <DatePicker
                            placeholderText="MM/dd/yyyy"
                            selected={completionDate}
                            onChange={date => setCompletionDate(epoch(date))}
                            dateFormat='MM/dd/yyyy'
                    />
                </Form.Group>
                <Form.Group controlId="file1" hidden={activeProject}>
                    <Form.Label>Document</Form.Label>
                    <Form.Control onChange={handleFile1Change} type="file" />
                </Form.Group>
                <Form.Group controlId="file2" hidden={activeProject}>
                    <Form.Label>Image</Form.Label>
                    <Form.Control onChange={handleFile2Change} type="file" />
                </Form.Group>
                <LoaderButton
                    block
                    type="submit"
                    size="lg"
                    variant="primary"
                    isLoading={isLoading}
                    disabled={!validateForm()}
                >
                    Submit
                </LoaderButton>
            </Form>
        </div>
    );
}
