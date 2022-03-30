import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { API } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
// import "./NewCPO.css";
import Nav from "react-bootstrap/Nav";
import config from "../config";


export default function SearchCPO() {
    const [cpos, setCPOs] = useState([]);
    const [queryString, setQueryString] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [renderList, setRenderList] = useState(false)

    function validateForm() {
        return queryString.length > 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);

        try {

            const cpo_set = await searchCPO(queryString);
            setCPOs(cpo_set)
            setIsLoading(false);
            setRenderList(true);
        }   catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function setHref(name) {
        let h_ref = ' ';

        if (name.Type === 'CollaborativeProjectOrder') {
            h_ref = 'cpo_details?' + name.Name;
            //console.log(h_ref);

        }
        else {
            let path = "/get_cpo?userInput=" + name.CollaborateProjectOrderId;
            let cpoName = retrieve(path);

            console.log('cpoName Function Test' + cpoName);

            if(cpoName != null) {
                console.log('Printing cpo name: ' + cpoName.Name);
                h_ref = 'new_project?' + name.Name + '|' + cpoName.Name + '|' + name.Description + '|' + name.Status + '|' + name.LifecycleState;
                console.log('h_ref: ' + h_ref);
            }
        }
        return h_ref; //this is returning an object promise. Needs to return the value of h_ref. How do we do that within an async function? Other options?
    }

    async function retrieve(value) {
        let retrieval = await API.get(config.apiGateway.NAME, value);
        if(retrieval != null) {
            //console.log('Printing retrieval ' + retrieval);
            console.log('Retrieval Name   ' + retrieval.Name);
            return retrieval;
        }
    }

    function renderCPOs(){
        if (renderList) {
            return cpos['Items'].map(cpo => {
                return (
                    <>
                        <br/>
                        <a href = {setHref(cpo)}>
                        <h4 className="CPOName">{cpo.Name}</h4>
                        </a>
                    </>
                );
            })
        }
    }

    function searchCPO(cpo) {
        let path = "/search_cpos?userInput=" + cpo;
        return API.get(config.apiGateway.NAME, path);
    }

    return (
        <div className="SearchCPO">
            <Form inline onSubmit={handleSubmit}>
                <Form.Group controlId="CPOname">
                    <Form.Control
                        value={queryString}
                        type="text"
                        onChange={(e) => setQueryString(e.target.value)}
                    />
                </Form.Group>

                <LoaderButton
                    variant="outline-success"
                    type="submit"
                    isLoading={isLoading}
                    disabled={!validateForm()}
                >
                    Search
                </LoaderButton>
            </Form>
            <Nav className="justify-content-end" activeKey="/new_cpo">
                <Nav.Item>
                    <Nav.Link href="/new_cpo">Create CPO</Nav.Link>
                </Nav.Item>
            </Nav>
            {renderCPOs()}
        </div>
    );
}
