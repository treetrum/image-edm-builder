import * as React from "react";
import * as ReactDOM from "react-dom";
import * as netlifyIdentity from "netlify-identity-widget";

import ImageAdder from "./components/ImageAdder";

window["netlifyIdentity"] = netlifyIdentity;

netlifyIdentity.init();

const App = () => {
    const [user, setUser] = React.useState(netlifyIdentity.currentUser());

    React.useEffect(() => {
        netlifyIdentity.on("login", (user) => {
            setUser(user);
            netlifyIdentity.close();
            console.log("login", user);
        });
        netlifyIdentity.on("logout", () => {
            console.log("Logged out");
            setUser(null);
        });
        netlifyIdentity.on("error", (err) => console.error("Error", err));
        netlifyIdentity.on("open", () => console.log("Widget opened"));
        netlifyIdentity.on("close", () => console.log("Widget closed"));
    });

    React.useEffect(() => {
        if (!user) {
            netlifyIdentity.close();
            netlifyIdentity.open();
        }
    }, [user]);

    if (!user) {
        return null;
    }
    return <ImageAdder />;
};

ReactDOM.render(<App />, document.getElementById("app"));
