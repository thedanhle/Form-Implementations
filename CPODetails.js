import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import ListGroup from "react-bootstrap/ListGroup";
import { onError } from "../libs/errorLib";
import { useAppContext } from "../libs/contextLib";
import Nav from "react-bootstrap/Nav";
import config from "../config";

export default function CPODetails() {
    const [projects, setProjects] = useState([]);
    const { isAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function onLoad() {
            /*      if (!isAuthenticated) {
                    return;
                  }
            */
            try {
                let cpo_name = getCPOName(window.location.search.substring(1))
                const projects_list = await loadProjects(cpo_name);
                if (projects_list !== "NULL") {
                    setProjects(projects_list);
                }
            }   catch(e) {
                onError(e);
            }

            setIsLoading(false);
        }

        onLoad();
    }, [isAuthenticated]);

    function loadProjects(cpo_name) {
        let path = "/projects?cpoName=" + cpo_name;
        return API.get(config.apiGateway.NAME, path);
    }

    function renderProjectsList(projects) {
        return projects.map((project, index) => {
            return(
            <>
                <br/>
                <a href = {setHref(project.Name, window.location.search.substring(1), project.Description, project.Status, project.LifecycleState, project.CompleteDateTimeStamp)}>
                    <h4 className="ProjectName">Project {index + 1}: {project.Name}</h4>
                </a>
                <cell className="Description">Description: {project.Description}</cell>
                <cell className="Status">Status: {project.Status}</cell>
                <cell className="Project Lifecycle State">Project Lifecycle State: {project.LifecycleState}</cell>
                <cell className="Completion Date">Completion Date: {project.CompleteDateTimeStamp}</cell>
            </>
            )

        });
    }

    /*
    function renderLander() {
      return (
        <div className="lander">
          <h1>Scratch</h1>
          <p className="text-muted">A simple note taking app</p>
        </div>
      );
    }
  */

    function getCPOName(str){
        return str.replace("%20", " ");
    }

    function setHref(name, CPO, description, status, lifecycleState, completionDate){
        var h_ref = 'new_project?' + name + "|" + CPO + "|" + description + "|" + status + "|" + lifecycleState + "|" + completionDate;
        return h_ref;
    }

    function getHref(str){
        var h_ref = "new_cpo?" + str;
        return h_ref;
    }

    function renderProjects() {
        return (
            <div className="notes">
                <Nav className="justify-content-end" activeKey="/new_cpo">
                    <Nav.Item>
                        <Nav.Link href={getHref(window.location.search.substring(1))}>Edit this CPO</Nav.Link>
                    </Nav.Item>
                </Nav>
                <h2 className="pb-3 mt-4 mb-3 border-bottom">{getCPOName(window.location.search.substring(1))}</h2>
                <Nav className="justify-content-end" activeKey="/new_project">
                    <Nav.Item>
                        <Nav.Link href={setHref("", window.location.search.substring(1) , "")}>Create Project</Nav.Link>
                    </Nav.Item>
                </Nav>
                <ListGroup>{!isLoading && renderProjectsList(projects)}</ListGroup>
            </div>
        );
    }

    return (
        <div className="ActiveCPOs">
            {renderProjects()}
        </div>
    );

    /*
        <div className="ActiveCPOs">
          {isAuthenticated ? renderCPOs() : renderLander()}
      </div>
     */
}
