import React from "react"
import ReactDOM from "react-dom"
import App from "./App.jsx"
import CssBaseline from "@material-ui/core/CssBaseline"
import './index.css';
// import theme from "./Theme"

/**
 * @name - index
 * @desc - Sets the base theme for Material UI and the html and body tag
 * @author - Mitchell Baker
 * @date - 3/17/21
 * @version - 1.0
 * @param -
 * @return -
 */
ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>,
  document.getElementById("root")
)
