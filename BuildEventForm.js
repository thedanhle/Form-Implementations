import $ from "jquery";
import React, { Component, createRef } from "react";
import ReactDOM from "react-dom";
import "../../src/test.css";
//Fix CSS. BuildEventForm and EventForm Overlap
window.jQuery = $;
window.$ = $;

require("jquery-ui-sortable");
require("formBuilder")


const formData = [
/*    {
        type: "header",
        subtype: "h1",
        label: "formBuilder in React"
    },
    {
        type: "paragraph",
        label: "This is a demonstration of formBuilder running in a React project."
    }*/
];

document.body.style.margin = "30px";
 //TODO add API call to send JSON | Need to get JSON object from built form

class FormBuilder extends Component {
    fb = createRef();
    componentDidMount() {
        $(this.fb.current).formBuilder({formData});
    }

    render() {
        return <div id="fb-editor" ref={this.fb} />;
    }
}

function App() {
    return (
        <FormBuilder/>
    );
}

export default App;
