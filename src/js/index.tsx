import * as React from "react";
import * as ReactDOM from "react-dom";
import * as NetlifyIdentityWidget from "netlify-identity-widget";

import ImageAdder from "./components/ImageAdder";

NetlifyIdentityWidget.init();

const App = () => {
    const [user, setUser] = React.useState(NetlifyIdentityWidget.currentUser());
    React.useEffect(() => {
        NetlifyIdentityWidget.open("login");
        NetlifyIdentityWidget.on("login", (user) => {
            setUser(user);
        });
    }, []);
    if (!user) {
        return null;
    }
    return <ImageAdder />;
};

ReactDOM.render(<App />, document.getElementById("app"));
