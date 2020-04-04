import * as React from "react";
import * as ReactDOM from "react-dom";
import * as NetlifyIdentityWidget from "netlify-identity-widget";

import ImageAdder from "./components/ImageAdder";

window.netlifyIdentity = NetlifyIdentityWidget;

NetlifyIdentityWidget.init();

const App = () => {
    const [user, setUser] = React.useState(NetlifyIdentityWidget.currentUser());
    React.useEffect(() => {
        if (!user) {
            NetlifyIdentityWidget.open("login");
            NetlifyIdentityWidget.on("login", (user) => {
                setUser(user);
                NetlifyIdentityWidget.close();
            });
        }
    }, [user]);
    console.log(user);
    if (!user) {
        return null;
    }
    return <ImageAdder />;
};

ReactDOM.render(<App />, document.getElementById("app"));
