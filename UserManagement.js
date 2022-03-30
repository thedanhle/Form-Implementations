import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
// import "./_cell.scss"
// import "./_wrapper.scss"
import { useHistory } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
// import { useAppContext } from "../libs/contextLib";
// import { useFormFields } from "../libs/hooksLib";
// import { onError } from "../libs/errorLib";
// import { Auth } from "aws-amplify";
import {API, Auth} from "aws-amplify";
// import { LinkContainer } from "react-router-bootstrap";
// import Button from "react-bootstrap/Button";
// import "../sass/containers/Profile.scss"
// import {Auth} from "aws-amplify";
import {onError} from "../libs/errorLib";
import ListGroup from "react-bootstrap/ListGroup";
import config from "../config";

export default function UserManagement() {

    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [showRequests, setShowRequests] = useState(false)
    const [showUsers, setShowUsers] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [initial, setInitial] = useState(true)
    // const [queryString, setQueryString] = useState("");
    // const [searchField, setSearchField] = useState("null");
    const [isAdminState, setIsAdminState] = useState(false);

    const history = useHistory();
    // const { userHasAuthenticated } = useAppContext();
    const titleText = 'User Management'
    const memberLoginText = 'You do not have permissions to access this page. Please request access or return to the home page'


    useEffect(() => {
        async function getAllUsers () {
            const users = await API.get(config.projects.apiGateway.NAME, "/users/all_users");
            // console.log(users)
            setUsers(users);
            setShowUsers(true)
        }
        async function getUserRequests () {
            const requests = await API.get(config.projects.apiGateway.NAME, "/users/user_requests");
            // console.log(requests)
            setRequests(requests);
            setShowRequests(true)
        }
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
            try {
                await getAdminState()
                if (isAdminState === false) {
                    //console.log('not an admin');
                    return false;
                }
                setIsLoading(false);
                setInitial(false)
                await getAllUsers()
                await getUserRequests()
                setIsLoading(false)
            } catch (e) {
                onError(e);
            }

            setIsLoading(false);
        }
        if (initial) {
            onLoad();
        }}, [initial, isAdminState]);


    function declineUserRequest(userInfo){
        // let path = "/users/user_requests?user_id=" + userInfo.
        return API.del(config.projects.apiGateway.NAME, "/users/user_requests", { body: userInfo})
    }
    function handleSubmit(event) {
        // event.preventDefault();
        // setIsLoading(true);
        console.log("Submit info goes here")
    }
    // function userRequests () {
    //     return API.get(config.projects.apiGateway.NAME, "/users/user_requests");
    // }

    function createUser (userInfo) {
        return API.post(config.projects.apiGateway.NAME, "/users", { body: userInfo});
    }

    // function allUsers () {
    //     return API.get(config.projects.apiGateway.NAME, "/users/all_users");
    // }
    // async function getUserRequests () {
    //     const requests = await userRequests();
    //     setRequests(requests);
    //     // console.log(requests)
    //     setShowRequests(true)
    // }

    function formatUser(userinfo) {
        let params = {
            Username : userinfo.Username,
            GovernmentEmail : userinfo.GovernmentEmail,
            Organization : userinfo.Organization,
            FirstName : userinfo.FirstName,
            LastName : userinfo.LastName,
            Id : userinfo.Id
            // MemberLevel : userinfo.memberLevel
        }
        return params;

    }

    async function declineRequest (userinfo) {
        let user = formatUser(userinfo)
        console.log(user)
        history.push("/")

        await declineUserRequest(user)
        // console.log(response)
        // window.location.reload()
        // history.push("/")

    }

    async function createNewUser (userinfo) {
        // console.log("Inside create User + " + userinfo.FirstName)
        let user = formatUser(userinfo)
        // console.log(user)
        await createUser(user);
        // setShowRequests(false)
        window.location.reload()
    }
    // async function getAllUsers () {
    //     const users = await allUsers();
    //     setUsers(users);
    //     // console.log(users)
    //     setShowUsers(true)
    // }

    function renderUserRequests(requests)
    {
        // console.log(requests)
        if (requests.length > 0) {
            return requests.map(request => {
                // console.log(request)
                return (
                    <>
                        <div key={request.Username} className="cell">
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{request.Username}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{request.GovernmentEmail}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{request.FirstName}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{request.LastName}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{request.Organization}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <LoaderButton
                                     size="lg"
                                     type="button"
                                     onClick={(e) => {
                                         createNewUser(request)
                                     }}
                                     // isLoading={isLoading}
                                 >Create User
                                 </LoaderButton>
                                 ||
                                  <LoaderButton
                                     size="lg"
                                     type="button"
                                     onClick={(e) => {
                                         declineRequest(request)
                                     }}
                                     // isLoading={isLoading}
                                 >Decline Request
                                 </LoaderButton>
                             </div>
                         </div>
                    </>
                )
            })
        }
        else{
             return (
                 <>
                    <div>
                        <span>No current user requests</span>
                    </div>
                 </>
             )
        }
    }

    function renderRequestLayout()
    {
        return (
            <div className="userRequests">
                <div className="cell mix-cell_top">
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Username</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Email</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">First Name</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Last Name</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Organization</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Action</span>
                    </div>
                </div>
                <ListGroup>{renderUserRequests(requests)}</ListGroup>
            </div>
        )
    }

    function renderUserLayout()
    {
        return (
            <div className="currentUsers">
                <div className="cell mix-cell_top">
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Username</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Email</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">First Name</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Last Name</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Organization</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Status</span>
                    </div>
                    <div className="cell-int cell-int_sm mix-cell-int_label">
                        <span className="hdg hdg_3">Action</span>
                    </div>
                </div>
                <ListGroup>{renderUsers(users)}</ListGroup>
            </div>
        )
    }
     // function renderSearchUsers () {
     //     return (
     //         <div>
     //             <div className="wrapper wrapper_midLimit">
     //                 <Form  className="searchBlock" onSubmit={handleSubmit}>
     //                     <Form.Group  className="searchBlock-split" controlId="UserNameSearch">
     //                         <Form.Control
     //                             value={queryString}
     //                             type="text"
     //                             onChange={(e) => setQueryString(e.target.value)}
     //                         />
     //                         <div className="btns">
     //                            <input
     //                                type="submit"
     //                                isLoading={isLoading}
     //                                disabled={false}
     //                                value="Search"
     //                            />
     //                        </div>
     //                     </Form.Group>
     //
     //                     <Form.Group controlId="searchCat">
     //                         <Form.Control
     //                             value={searchField}
     //                             as="select"
     //                             onChange={(e) => setSearchField(e.target.value)}
     //                         >
     //                             <option>Sort by: </option>
     //                             <option>Username</option>
     //                             <option>Email</option>
     //                             <option>First Name</option>
     //                             <option>Last Name</option>
     //                         </Form.Control>
     //                     </Form.Group>
     //                 </Form>
     //             </div>
     //             {renderUsers(users)}
     //         </div>
     //     )
     // }

    const redText = {
        color: "red"
    };
    const greenText = {
        color: "green"
    }
    function renderUsers(users)
    {
        // console.log(users)
         if (users.length > 0) {
             return users.map(user => {
                 // console.log(user)
                 let userLink = "?"+user.Username+"|"+user.email+"|"+user.name+"|"+user.family_name+"|"+user["custom:organization"]+"|"+user.Enabled
                 let editUserLink = "/edit_user"+userLink
                 let statusText = "here"
                 if(user.Enabled){
                     statusText = <span style={greenText}>Enabled</span>
                 }
                 else{
                     statusText = <span style={redText}>Disabled</span>
                 }
                 return (
                     <>
                         <div key={user.Username} className="cell">
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{user.Username}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{user.email}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{user.name}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{user.family_name}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <span>{user["custom:organization"]}</span>
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 {/*<span>{statusText}</span>*/}
                                 {statusText}
                             </div>
                             <div className="cell-int cell-int_sm mix-cell-int_label">
                                 <div className="block-item">
                                     <div className="btns">
                                         <a href={editUserLink}>Edit User</a>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </>
                 );
             })
         }
        else{
             return (
                 <>
                    <div>
                        <span>No users </span>
                    </div>
                 </>
             )
        }
    }

    function renderUserManagement() {
        return (
             <div>
                <div className="wrapper wrapper_midLimit">
                    <h2 className="hdg hdg_2">{titleText}</h2>
                </div>
                 <br/>
                 <div className="wrapper wrapper_midLimit">
                    <h3 className="hdg hdg_3">User Requests</h3>
                </div>
                <div className="wrapper wrapper_small">
                    {showRequests && renderRequestLayout()}
                </div>
                <br/>
                 <div className="wrapper wrapper_midLimit">
                    <h3 className="hdg hdg_3">Current Users</h3>
                </div>                <br/>
                <div className="wrapper wrapper_small">
                    {showUsers && renderUserLayout()}
                </div>
                <br/>
             </div>
        );
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

        <div className="UserManagement">
            <br/>
            <br/>
            {isAdminState ? renderUserManagement() : renderDenyAccess()}
        </div>
    )
}
