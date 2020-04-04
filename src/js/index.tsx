import * as React from "react";
import * as ReactDOM from "react-dom";
import * as NetlifyIdentityWidget from "netlify-identity-widget";

import ImageAdder from "./components/ImageAdder";

window["netlifyIdentity"] = NetlifyIdentityWidget;

NetlifyIdentityWidget.init();

const App = () => {
    const [user, setUser] = React.useState(NetlifyIdentityWidget.currentUser());
    React.useEffect(() => {
        if (!user) {
            NetlifyIdentityWidget.open("login");
            NetlifyIdentityWidget.on("init", (user) => {
                console.log("INITIED");
                setUser(user);
            });
            NetlifyIdentityWidget.on("login", (user) => {
                console.log("logged in");
                setUser(user);
                NetlifyIdentityWidget.close();
            });
        } else {
            NetlifyIdentityWidget.close();
        }
    }, [user]);
    if (!user) {
        return null;
    }
    return <ImageAdder />;
};

ReactDOM.render(<App />, document.getElementById("app"));
