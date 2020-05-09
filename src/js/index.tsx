import * as React from "react";
import * as ReactDOM from "react-dom";
import netlifyIdentity from "netlify-identity-widget";
import App from "./components/App";

window["netlifyIdentity"] = netlifyIdentity;

netlifyIdentity.init();

ReactDOM.render(<App />, document.getElementById("app"));
