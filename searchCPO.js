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
        }   catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function setHref(name) {
        let h_ref = ' ';

        if (name.Type === 'CollaborativeProjectOrder') {
            h_ref = 'cpo_details?' + name.Name;

        }
        else {
            h_ref = 'new_project?' + name.Name + '|' + name.parentCPO + '|' + name.Description + '|' + name.Status + '|' + name.LifecycleState + '|' + name.CompleteDateTimeStamp;
        }
        return h_ref;
    }

    async function retrieve(value) {
        let retrieval = await API.get(config.apiGateway.NAME, value);
        if(retrieval != null) {
            //console.log('Printing retrieval ' + retrieval);
            console.log('Retrieval Name   ' + retrieval.Name);
            return retrieval;
        }
    }

    function renderCPOs(cpos){
        return cpos.map(cpo => {
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
            {renderCPOs(cpos)}
        </div>
    );
}
