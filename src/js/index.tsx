import * as React from "react";
import * as ReactDOM from "react-dom";
import netlifyIdentity from "netlify-identity-widget";

import ImageAdder from "./components/ImageAdder";
import Button from "./components/Button";

import StackMailLogo from "../images/stackmail-logo.svg";

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
                        <div className="login__lockup">
                            <img
                                src={StackMailLogo}
                                alt="StackMail Logo"
                                className="login__logo"
                            />
                        </div>
                        <Button
                            className="login__button"
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
    return (
        <div>
            <ImageAdder user={user} />
            <Button
                size="small"
                color="red"
                style={{
                    position: "fixed",
                    right: 30,
                    bottom: 30,
                }}
                onClick={() => {
                    netlifyIdentity.logout();
                }}
            >
                Logout
            </Button>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById("app"));
