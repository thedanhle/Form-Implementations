import jQuery from "jquery";
import $ from "jquery";
import React, { Component, createRef } from "react";
import ReactDOM from "react-dom";
import "../../src/test.css";
//Fix CSS. BuildEventForm and EventForm Overlap
import LoaderButton from "../components/LoaderButton";
import Form from "react-bootstrap/Form";
import config from "../config";
import {s3Upload} from "../libs/awsLib";
import {onError} from "../libs/errorLib";

window.jQuery = $;
window.$ = $;

require("jquery-ui-sortable");
require("formBuilder")
require('formBuilder/dist/form-render.min.js')


jQuery(function($) {
    console.log('SHOULD RUN ONCE')
    var fbRender = document.getElementById('fb-render')
    // TODO formData should be what's retrieved from the form builder via database: GET
    const formData = [
        {
            type: "text",
            label: "Text Field",
            className: "form-control",
            name: "text-1478701075825",
            userData: ["user entered data"]
        },
        {
            type: "checkbox-group",
            label: "Checkbox Group",
            className: "checkbox-group",
            name: "checkbox-group-1478704652409",
            values: [
                {
                    label: "Option 1",
                    value: "option-1",
                    selected: true
                },
                {
                    label: "Option 2",
                    value: "option-2"
                },
                {
                    label: "Option 3",
                    value: "option-3",
                    selected: true
                }
            ]
        },
        {
            type: "select",
            label: "Select",
            className: "form-control",
            name: "select-1478701076382",
            values: [
                {
                    label: "Option 1",
                    value: "option-1",
                    selected: true
                },
                {
                    label: "Option 2",
                    value: "option-2"
                },
                {
                    label: "Option 3",
                    value: "option-3"
                }
            ]
        },
        {
            type: "textarea",
            label: "Text Area",
            className: "form-control",
            name: "textarea-1478701077511"
        }
    ];

    var formRenderOpts = {
        formData,
        dataType: 'json'
    };

    $(fbRender).formRender(formRenderOpts);
});



export default function testFunction() {

    async function handleSubmit(event) {
        //TODO Button should not have to be clicked more than once to see JSON
        console.log('handle submit')
        event.preventDefault();
        const getUserDataBtn = document.getElementById("get-user-data");
        const fbRender = document.getElementById("fb-render");
        const originalFormData = [
            {
                type: "text",
                label: "Text Field",
                className: "form-control",
                name: "text-1478701075825",
                userData: ["user entered data"]
            },
            {
                type: "checkbox-group",
                label: "Checkbox Group",
                className: "checkbox-group",
                name: "checkbox-group-1478704652409",
                values: [
                    {
                        label: "Option 1",
                        value: "option-1",
                        selected: true
                    },
                    {
                        label: "Option 2",
                        value: "option-2"
                    },
                    {
                        label: "Option 3",
                        value: "option-3",
                        selected: true
                    }
                ]
            },
            {
                type: "select",
                label: "Select",
                className: "form-control",
                name: "select-1478701076382",
                values: [
                    {
                        label: "Option 1",
                        value: "option-1",
                        selected: true
                    },
                    {
                        label: "Option 2",
                        value: "option-2"
                    },
                    {
                        label: "Option 3",
                        value: "option-3"
                    }
                ]
            },
            {
                type: "textarea",
                label: "Text Area",
                className: "form-control",
                name: "textarea-1478701077511"
            }
        ];
        //TODO post user form to database: POST
        jQuery(function($) {
            console.log('jquery')
            const formData = JSON.stringify(originalFormData);
            $(fbRender).formRender({formData});
            getUserDataBtn.addEventListener(
                "click",
                () => {
                    window.alert(window.JSON.stringify($(fbRender).formRender("userData")));
                },
                false
            );
        });

    }

    return (
        <div className="testing">
            <Form onSubmit={handleSubmit}>
                <form id={"fb-render"}>

                </form>
                <LoaderButton
                    id = "get-user-data"
                    block
                    type="submit"
                    size="lg"
                    variant="primary"
                >
                    Submit
                </LoaderButton>
            </Form>
        </div>
    );
}
