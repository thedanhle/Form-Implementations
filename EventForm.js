import jQuery from "jquery";
import $ from "jquery";
import React, {Component, createRef, useEffect, useState} from "react";
import "../../src/test.css";
import LoaderButton from "../components/LoaderButton";
import Form from "react-bootstrap/Form";
import config from "../config";
import {API} from "aws-amplify";

window.jQuery = $;
window.$ = $;

require("jquery-ui-sortable");
require("formBuilder")
require('formBuilder/dist/form-render.min.js')

export default function SubmittableForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const titleText = 'Thank you for your submission'
    const description = 'Your submission has been recorded and is under review'

    useEffect(() => {
        jQuery(async function ($) {
                var fbRender = document.getElementById('fb-render')
                let value = 'formTest8'                                // TODO hard coded form name. Might need to modulate for different rendered forms
                async function getBuiltForm() {
                    let path = "/formBuilder?userInput=" + value
                    // console.log(path)
                    let formData = await API.get(config.projects.apiGateway.NAME, path)            // getting form to be rendered
                    // console.log('getting formData:   ' + formData);
                    return formData
                }

                let builtForm = await getBuiltForm()
                const formData = builtForm['form'];            // getting the built form
                // console.log('formData ' + formData)
                const form_id = builtForm["form_id"]           // getting the built form id so that we know where the submission came from
                // console.log(form_id)

                var formRenderOpts = { //providing options for form to be rendered
                    formData,
                    dataType: 'json'
                };

                $(fbRender).formRender(formRenderOpts);  // rendering the form

                const getUserDataBtn = document.getElementById("get-user-data");
                if (getUserDataBtn === null) {           // fixing error where getUserDataBtn is null
                    return;
                }

                getUserDataBtn.addEventListener( //listen on button
                    "click",
                    () => {
                        let rawData = $(fbRender).formRender("userData")

                        let dataJSON = {}
                        for (const element of rawData) {
                            if(element.userData !== undefined) {
                                //console.log(element)
                                //console.log(element.userData[0])
                                dataJSON[element.label] = element.userData[0];
                            }
                        }

                        dataJSON["form_id"] = form_id                        // adding builtForm id to submission
                        var name = value
                        let path = "/formBuilder/submission?formName=" + name
                        console.log('Submitting...')
                        setIsSubmitted(true)
                        try {
                            //console.log('try')
                            setIsLoading(true)
                            return API.post(config.projects.apiGateway.NAME, path, {
                                body: dataJSON,
                            })
                        } finally {
                            console.log('Submitted')
                        }
                    },
                )
        });
    })

    // TODO need to add form validation to make sure fields are entered correctly
    // TODO need to handle file uploads?

    function renderThankYouPage() { // page after submission
        return (
            <div className="wrapper wrapper_midLimit">
                <div className="contentBlock">
                    <div className="contentBlock-hd">
                        <h2 className="hdg hdg_2">{titleText}</h2>
                    </div>
                    <div className="contentBlock-bd contentBlock-bd_push">

                        <p>{description}</p>
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

    function renderUserForm() { // render form to submit
        return (
            <div className="form-renderer">
                <Form>
                    <form id={"fb-render"}>
                    </form>
                    <LoaderButton
                        id = "get-user-data"
                        block
                        type="submit"
                        size="lg"
                        variant="primary"
                        isLoading={isLoading}
                    >
                        Submit
                    </LoaderButton>
                </Form>
            </div>
        );
    }

    return (
        <div className="SubmittableForm">
            <br/>
            <br/>
            {!isSubmitted ? renderUserForm() : renderThankYouPage()}
        </div>
    );
}