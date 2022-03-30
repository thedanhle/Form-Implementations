import React, { useState, useEffect } from "react";
import {API, Auth} from "aws-amplify";
import ListGroup from "react-bootstrap/ListGroup";
import { onError } from "../libs/errorLib";
import { useAppContext } from "../libs/contextLib";
import Carousel from "../components/FadeCarousel";
import config from "../config";

export default function EventInfo() {
    const [initial, setInitial] = useState(true);
    const [eventInfo, setEventInfo] = useState([]);
    const { isAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isAdminState, setIsAdminState] = useState(false);

    useEffect(() => {
        async function onLoad() {
            /*      if (!isAuthenticated) {
                    return;
                  }
            */
            try {
                await getAdminState();
                let queryString = window.location.search.substring(1)
                const eventinfo = await loadEventInfo(queryString);
                setEventInfo(eventinfo)
            } catch (e) {
                onError(e);
            }
            setIsLoading(false);
        }
        onLoad();
    }, [isAuthenticated]);

    function loadEventInfo(event_id) {
        let path = "/event_info?event_id=" + event_id;
        //console.log(path)
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

    function renderEventsList(eventInfo) {
        // TODO: Look into utilizing correct array-callback-return for this funciton, throwing a warning and needs to be refactored properly.

        console.log(eventInfo);
        return eventInfo.map(info => {
            return(
                 <>
                 <div key={info.Id} className="cell">
                            <div className="cell-int cell-int_md">
                                <span>{info.Name}</span>
                            </div>
                            <div className="cell-int cell-int_bd">
                                <>
                                    <div className="cell cell_int" data-status={info.Status}>
                                        <div className="cell-int cell-int_md">
                                            <p>{info.Value}</p>
                                        </div>
                                    </div>
                                </>
                            </div>
                        </div>
                     </>
            )
        })
    }

    function renderEvents() {
        return (
            <div className="notes">
                <div className="cell mix-cell_top">
                    <div className="cell-int cell-int_md">
                        <span className="hdg hdg_3">Name</span>
                    </div>
                    <div className="cell-int cell-int_bd">
                        <div className="cell cell_int">
                            <div className="cell-int cell-int_md">
                                <span className="hdg hdg_3">Value</span>
                            </div>
                        </div>
                    </div>
                </div>
                <ListGroup>{!isLoading && renderEventsList(eventInfo)}</ListGroup>
            </div>
        );
    }

    return (
        <div className="ActivEvent">
            <Carousel />
            <div className="wrapper">
                <div className="grid">
                    <div className="grid-col grid-col_3of12">
                        <div className="btns">
                            <a href="/">Event Home</a>
                        </div>
                    </div>

                    <div className="grid-col grid-col_6of12">
                    </div>
                    {!isLoading &&
                        <div className="grid-col grid-col_3of12">
                            <div className="btns">
                                <a href="/edit_event?new" hidden={!isAdminState}>Edit Event</a>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div className="wrapper wrapper_midLimit">
                <div className="contentBlock">
                    <div className="contentBlock-hd contentBlock-hd_wordpress">
                        <h2 className="hdg hdg_2">Current Events</h2>
                    </div>
                    <div className="contentBlock-bd contentBlock-bd_push">
                        <p>***** helps to develop prototypes and proofs of concept that support the USSOCOM warfighter needs. The data below is a list of the events we are currently undertaking. To receive additional information on a specific event, please contact us here.</p>
                    </div>
                </div>
            </div>
            <div className="wrapper">
                {renderEvents()}
            </div>
        </div>
    );
}
