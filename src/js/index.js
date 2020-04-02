import React from "react";
import ReactDOM from "react-dom";

import ImageAdder from "./components/ImageAdder";

const App = () => {
    return <ImageAdder />;
};

ReactDOM.render(<App />, document.getElementById("app"));
