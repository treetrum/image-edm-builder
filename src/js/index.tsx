import * as React from "react";
import * as ReactDOM from "react-dom";
import * as NetlifyIdentityWidget from "netlify-identity-widget";

import ImageAdder from "./components/ImageAdder";

window["netlifyIdentity"] = NetlifyIdentityWidget;

NetlifyIdentityWidget.init();

const App = () => {
    const [user, setUser] = React.useState(NetlifyIdentityWidget.currentUser());

    React.useEffect(() => {
        NetlifyIdentityWidget.on("login", (user) => {
            setUser(user);
            NetlifyIdentityWidget.close();
            console.log("login", user);
        });
        NetlifyIdentityWidget.on("logout", () => {
            console.log("Logged out");
            setUser(null);
        });
        NetlifyIdentityWidget.on("error", (err) => console.error("Error", err));
        NetlifyIdentityWidget.on("open", () => console.log("Widget opened"));
        NetlifyIdentityWidget.on("close", () => console.log("Widget closed"));
    });

    React.useEffect(() => {
        if (!user) {
            NetlifyIdentityWidget.open("login");
        }
    }, [user]);

    if (!user) {
        return null;
    }
    return <ImageAdder />;
};

ReactDOM.render(<App />, document.getElementById("app"));
