import React, { useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { useHistory } from "react-router-dom";
import { API } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import config from "../config";
import { s3Upload } from "../libs/awsLib";
// import "./NewProject.css";

export default function NewProject() {
    const file1 = useRef(null);
    const file2 = useRef(null);
    const history = useHistory();
    const [projectName, setProjectName] = useState(getProjectName(window.location.search.substring(1)));
    const [lifecycleState, setLifecycleState] = useState(getLifecycleState(window.location.search.substring(1)));
    const [description, setDescription] = useState(getDescription(window.location.search.substring(1)));
    const [status, setStatus] = useState(getStatus(window.location.search.substring(1)));
    const [parentCPO, setParentCPO] = useState(getParentCPO(window.location.search.substring(1)));
    const [isLoading, setIsLoading] = useState(false);

    function validateForm() {
        return projectName.length > 0;
    }

    function handleFile1Change(event) {
        file1.current = event.target.files[0];
    }

    function handleFile2Change(event) {
        file2.current = event.target.files[0];
    }

    async function handleSubmit(event) {
        event.preventDefault();

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



            await createProject({ projectName, lifecycleState, status, parentCPO, description, documentName, imageName});

            history.push("/");
        }   catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function createProject(project) {
        console.log(project)
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
            return a[3].replace(/%20/g, " ");
        }else{
            return str;
        }
    }

    function getLifecycleState(str){
        if (str !== "") {
            var a = str.split("|");
            return a[4].replace(/%20/g, " ");
        }else{
            return str;
        }
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
                        <option>Select</option>
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
                        onChange={(e) => setLifecycleState(e.target.value)}
                    >
                        <option>Select</option>
                        <option>Active</option>
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
                <Form.Group controlId="file1">
                    <Form.Label>Document</Form.Label>
                    <Form.Control onChange={handleFile1Change} type="file" />
                </Form.Group>
                <Form.Group controlId="file2">
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
