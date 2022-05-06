import $ from "jquery";
import jQuery from "jquery";
import React, {useEffect, useState} from "react";
import "../../src/test.css";
// TODO: I was getting an error when trying to build this out commenting out for push
// import Modal from 'react-modal';
import {API, Auth} from "aws-amplify";
import config from "../config";
import Form from "react-bootstrap/Form";
window.jQuery = $;
window.$ = $;
require("jquery-ui-sortable");
require("formBuilder")

export default function BuildForm() {
    const [modalIsOpen, setModalIsOpen] = useState(false); // for previewing the built form
    const [selectedForm, setSelectedForm] = useState(null);
    const [isAdminState, setIsAdminState] = useState(true);
    const [isLoading, setIsLoading] = useState(false)
    const titleText = 'New Form'
    const memberLoginText = 'You do not have permissions to access this page. Please request access or return to the home page'

    console.log('selectedForm ' +  selectedForm)


    // async function getAdminState() { // TODO need to add admin privileges to this page
    //     const user = await Auth.currentAuthenticatedUser();
    //     let group = user.signInUserSession.accessToken.payload["cognito:groups"]
    //     console.log(group)
    //     if(group === undefined) {
    //         setIsAdminState(false)
    //         return false
    //     }
    //     if (!group.includes('project_admin')) {
    //         //console.log('user is not an admin')
    //         setIsAdminState(false);
    //         return false
    //     }
    //     setIsAdminState(true)
    //     //console.log('user is an admin. Proceed')
    //     return true
    // }



    const defaultForm = [ // TODO we can render a prebuilt form with something like this, so this single page can switch prebuilt forms and render them on the drag and drop
                          // TODO need get function so that we select which pre-built form we want to render.
        // {
        //     type: "header",
        //     subtype: "h1",
        //     label: "formBuilder in React"
        // },
        // {
        //     type: "paragraph",
        //     label: "This is a demonstration of formBuilder running in a React project."
        // },
        // {
        //     type: "paragraph",
        //     label: "This is a demonstration of formBuilder running in a React project."
        // },
    ];


    useEffect(() => {

        jQuery(function($) {
            console.log('jQuery function')
            var fbEditor = document.getElementById('fb-editor'),
                options = {
                    formData: defaultForm,                                             // pre-render default fields
                    onSave: function(evt, formData){saveForm(formData)},            // with the save button, save the built form to the database
                    /*            typeUserDisabledAttrs: {                                    //disabled attributes for checkbox-group
                                    'checkbox-group': [
                                        'name',
                                        'description',
                                        'required',
                                        'inline',
                                        'toggle'
                                    ]
                                }*/
                };
            var formBuilder = $(fbEditor).formBuilder(options);

            document.addEventListener('fieldAdded', function(){
                //console.log(formBuilder.defaultForm);
            });


            function sendForm(formData) {
                let formName = document.getElementById('form-name')
                let path = "/formBuilder?formName=" + formName.value

                return API.post(config.projects.apiGateway.NAME, path, {
                    body: formData,
                });
            }

            async function saveForm(formData) {                                     //showing preview of built form. We can also save to database here
                //console.log('defaultForm' + defaultForm);

                await sendForm(formData); // TODO Also need to add updating functionality to API, since this can create duplicate built forms
                alert('Form Saved')
                // working on previewing the built form

                /*        let formRenderOpts = {
                            dataType: 'json',
                            defaultForm: defaultForm
                            //defaultForm: '<form-template><fields><field name="text-input-1454163102327" class="form-control" label="Text Field" description="" required="false" type="text" /><field name="date-input-1454163105133" class="form-control" label="Date Field" description="" required="false" type="date" /><field name="checkbox-group-1454163056695" label="Checkbox Group" style="multiple" description="" required="false" type="checkbox-group"><option value="option-1">Option 1</option><option value="option-2">Option 2</option></field></fields></form-template>'
                        };
                        let $renderContainer = $('<form/>');
                        $renderContainer.formRender(formRenderOpts);
                        let html = `<!doctype html><title>Form Preview</title><body class="container"><h1>Preview</h1><hr>${$renderContainer.html()}</body></html>`;
                        var formPreviewWindow = window.open('', 'formPreview', 'height=480,width=640,toolbar=no,scrollbars=yes');

                        formPreviewWindow.document.write(html);
                        var style = document.createElement('link');
                        style.setAttribute('href', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css');
                        style.setAttribute('rel', 'stylesheet');
                        style.setAttribute('type', 'text/css');
                        formPreviewWindow.document.head.appendChild(style);*/
            }

            //$(fbEditor).formBuilder(options);
        });
    });

    function rendering() {
        let formRenderOpts = {
            dataType: 'json',
            formData: defaultForm
            //defaultForm: '<form-template><fields><field name="text-input-1454163102327" class="form-control" label="Text Field" description="" required="false" type="text" /><field name="date-input-1454163105133" class="form-control" label="Date Field" description="" required="false" type="date" /><field name="checkbox-group-1454163056695" label="Checkbox Group" style="multiple" description="" required="false" type="checkbox-group"><option value="option-1">Option 1</option><option value="option-2">Option 2</option></field></fields></form-template>'
        };
        let $renderContainer = $('<form/>');
        $renderContainer.formRender(formRenderOpts);
/*        let html = `<!doctype html><title>Form Preview</title><body class="container"><h1>Preview</h1><hr>${$renderContainer.html()}</body></html>`;
        return html;*/
        //document.write($renderContainer.html())
        //var fbRender = document.getElementById("form-tester")
        //console.log(fbRender)
        //fbRender.write(`<!doctype html><title>Form Preview</title><body class="container"><h1>Preview</h1><hr>${$renderContainer.html()}</body></html>`)
        //$renderContainer.html();
    }

    function renderBuiltForm() {
        return (
            <div>
                <h1><strong>Form Builder</strong></h1>
                <h6>Form Name</h6>
                <Form.Group>
                    <Form.Control
                        id="form-name"
                        as="input"
                    />
                </Form.Group>
                <div className="builder">
                    <div id="build-wrap"></div>
                    <div id="fb-editor"></div>
                    {/*<button onClick={() => setModalIsOpen(true)}>Open modal</button>*/}
                    {/* TODO: Modal was causing an error, commenting out for push of canceled addition */}
                    {/* <Modal
                    id = 'modal-thing'
                    isOpen={modalIsOpen}
                    shouldCloseOnOverlayClick={false}
                    onRequestClose={() => setModalIsOpen(false)}
                    style={
                        {
                            overlay: {
                                backgroundColor:'grey'
                            },
                            content: {
                                color: 'orange'
                            },
                        }
                    }
                >
                    <h2>Header</h2>
                    <p>Paragraph</p>
                    <form id={'please-work'}>
                        {rendering()}
                    </form>
                    <div>
                        <button onClick={()=>setModalIsOpen(false)}>
                            Close
                        </button>
                    </div>
                </Modal> */}
                </div>
                <div className="fb-render">
                </div>
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

        <div className="BuiltForm">
            <br/>
            <br/>
            {isAdminState ? renderBuiltForm() : renderDenyAccess()}
        </div>
    )
}