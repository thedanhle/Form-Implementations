import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import {API, Auth} from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
// import "./NewCPO.css";
import Nav from "react-bootstrap/Nav";
import config from "../config";
import { useAppContext } from "../libs/contextLib";


export default function SearchEvents() {
    const [events, setEvents] = useState([]);
    const [queryString, setQueryString] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAppContext();
    const [isAdminState, setIsAdminState] = useState(false);

    useEffect(() => {
        async function onLoad() {
            /*      if (!isAuthenticated) {
                    return;
                  }
            */
            try {
                await getAdminState();
                const event_set = await getAllEvents();
                setEvents(event_set)
            }   catch(e) {
                onError(e);
            }

            setIsLoading(false);
        }

        onLoad();
    }, [isAuthenticated]);

    function validateForm() {
        return queryString.length > 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);

        try {

            const event_set = await searchEvent(queryString);
            setEvents(event_set)
            setIsLoading(false);
        }   catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function setHref(event) {
        let h_ref = '/event_info?' + event.Id;
        // let h_ref = '/event_info?' + event.Id;

        // if (event.status === 'active') {
        //     h_ref = 'event_info?' + event.Id;
        //
        // }
        // else {
        //     h_ref = 'new_project?' + name.Name + '|' + name.parentCPO + '|' + name.Description + '|' + name.Status + '|' + name.LifecycleState + '|' + name.CompleteDateTimeStamp + '|' + name.DocumentPath + '|' + name.ImagePath;
        // }
        return h_ref;
    }


    function renderEvents(events){
        return events.map(event => {
            return (
                <>
                    <br/>
                    <a href = {setHref(event)}>
                    <h4 className="EventName">{event.Name}</h4>
                    </a>
                </>
            );
        })
    }

    function searchEvent(eventQuery) {
        let path = "/search_past_events?userInput=" + eventQuery;
        return API.get(config.events.apiGateway.NAME, path);
    }

    function getAllEvents() {
        let path = "/events"
        return API.get(config.events.apiGateway.NAME, path);
    }

    async function getAdminState() {
        const user = await Auth.currentAuthenticatedUser();
        let group = user.signInUserSession.accessToken.payload["cognito:groups"]
        //console.log(group)
        if(group === undefined) {
            return false
        }

        if (!group.includes('event_admin')) {
            //console.log('user is not an admin')
            setIsAdminState(false);
            return false
        }
        //console.log('user is an admin. Proceed')
        setIsAdminState(true);
        return true
    }

    return (
        <div className="SearchEvent">
            <Form inline onSubmit={handleSubmit}>
                <Form.Group controlId="EventName">
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
            <Nav className="justify-content-end" activeKey="/new_event">
                <Nav.Item>
                    {/*<Nav.Link href="/new_event">Create Event</Nav.Link>*/}
                    <Nav.Link href="/edit_event?new" hidden={!isAdminState}>Create Event</Nav.Link>
                </Nav.Item>
            </Nav>
            {renderEvents(events)}
        </div>
    );
}
