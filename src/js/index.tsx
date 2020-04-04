import * as React from "react";
import * as ReactDOM from "react-dom";
import netlifyIdentity from "netlify-identity-widget";

import ImageAdder from "./components/ImageAdder";
import Button from "./components/Button";

window["netlifyIdentity"] = netlifyIdentity;

netlifyIdentity.init();

const App = () => {
    const [user, setUser] = React.useState(netlifyIdentity.currentUser());

    React.useEffect(() => {
        netlifyIdentity.on("login", (user) => {
            setUser(user);
            netlifyIdentity.close();
        });
        netlifyIdentity.on("logout", () => {
            setUser(null);
        });
        netlifyIdentity.on("error", (err) => console.error("Error", err));
    });

    if (!user) {
        return (
            <div className="modal">
                <div className="modal__inner">
                    <div className="login">
                        <h2>Login to continue</h2>
                        <Button
                            onClick={() => {
                                netlifyIdentity.open("login");
                            }}
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    return <ImageAdder user={user} />;
};

ReactDOM.render(<App />, document.getElementById("app"));
