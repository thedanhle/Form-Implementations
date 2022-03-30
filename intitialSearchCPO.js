import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { API } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
// import "./NewCPO.css";
import Nav from "react-bootstrap/Nav";
import config from "../config";

//testing commit
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

    function setHref(name){
        var h_ref = 'cpo_details?' + name;
        return h_ref;
    }

    function renderCPOs(){
        if (renderList) {

            return cpos['Items'].map(cpo => {

                return (
                    <>
                        <br/>
                        <a href = {setHref(cpo.Name)}>
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
