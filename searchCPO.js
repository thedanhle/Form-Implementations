import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import {API, Auth} from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
// import "./NewCPO.css";
import Nav from "react-bootstrap/Nav";
import config from "../config";
import { useAppContext } from "../libs/contextLib";


export default function SearchCPO() {
    const [cpos, setCPOs] = useState([]);
    const [queryString, setQueryString] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAppContext();
    const [isAdminState, setIsAdminState] = useState(false);

    const titleText = 'Edit Projects'
    const memberLoginText = 'You do not have permissions to access this page. Please request access or return to the home page'

    useEffect(() => {
        async function getAdminState() {
            const user = await Auth.currentAuthenticatedUser();
            let group = user.signInUserSession.accessToken.payload["cognito:groups"]
            //console.log(group)
            if(group === undefined) {
                return false
            }
            if (!group.includes('project_admin')) {
                //console.log('user is not an admin')
                setIsAdminState(false);
                return false
            }
            //console.log('user is an admin. Proceed')
            setIsAdminState(true);
            return true
        }
        async function onLoad() {
            /*      if (!isAuthenticated) {
                    return;
                  }
            */
            try {
                await getAdminState()
                if (isAdminState === false) {
                    //console.log('not an admin');
                    return false;
                }
                const cpo_set = await getAllCpos();
                setCPOs(cpo_set)
            }   catch(e) {
                onError(e);
            }

            setIsLoading(false);
        }

        onLoad();
    }, [isAuthenticated, isAdminState]);

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
            h_ref = 'new_project?' + name.Name + '|' + name.parentCPO + '|' + name.Description + '|' + name.Status + '|' + name.LifecycleState + '|' + name.CompleteDateTimeStamp + '|' + name.DocumentPath + '|' + name.ImagePath + '|' + name.Id;
        }
        return h_ref;
    }

    async function retrieve(value) {
        let retrieval = await API.get(config.projects.apiGateway.NAME, value);
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
        return API.get(config.projects.apiGateway.NAME, path);
    }

    function getAllCpos() {
        let path = "/all_cpos"
        return API.get(config.projects.apiGateway.NAME, path);
    }

    function renderDenyAccess() {
        //TODO make Request Access button send an email to an admin to add user to admin group
        return (
            <div className="wrapper wrapper_midLimit">
                <div className="contentBlock">
                    <div className="contentBlock-hd">
                        <h2 className="hdg hdg_2">{titleText}</h2>
                    </div>
                    <div className="contentBlock-bd contentBlock-bd_push">

                        <p>{memberLoginText} </p>
                        <div className="block block_2up mix-block_gutter">
                            <div className="block-item">
                                <div className="btns">
                                    <a href="/login">Return to Home</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="SearchCPO">
            <Form inline onSubmit={handleSubmit}>
                <Form.Group controlId="CPOname">
                    <Form.Control
                        value={queryString}
                        type="text"
                        onChange={(e) => setQueryString(e.target.value)}
                        hidden={!isAdminState}
                    />
                </Form.Group>

                <LoaderButton
                    variant="outline-success"
                    type="submit"
                    isLoading={isLoading}
                    disabled={!validateForm()}
                    hidden={!isAdminState}
                >
                    Search
                </LoaderButton>
            </Form>
            <Nav className="justify-content-end" activeKey="/new_cpo">
                <Nav.Item>
                    <Nav.Link href="/new_cpo" hidden={!isAdminState}>Create CPO</Nav.Link>
                </Nav.Item>
            </Nav>
            {isAdminState ? renderCPOs(cpos) : renderDenyAccess()}
        </div>
    );
}
