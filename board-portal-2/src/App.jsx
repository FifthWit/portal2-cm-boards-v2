import React, { useState, useContext } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles"
import { useMediaQuery, Box } from "@material-ui/core"
// import { theme } from "./Theme"
import Footer from "./components/Footer/Footer"
import Header from "./components/Header/Header"
import Changelog from "./components/Body/ChangeLog/ChangeLog"
import About from "./components/Body/About/About"
import WallOfShame from "./components/Body/Wall_of_Shame/WallOfShame"
import Error from "./components/Error"
import Donators from "./components/Body/Donators/Donators"
import SinglePlayer from "./components/Body/SinglePlayer/SinglePlayer"
import Cooperative from "./components/Body/Cooperative/Cooperative"
import { useStyles } from "./style.js"
import AggregatedSelector from "./components/Body/Aggregated_Selector/AggregatedSelector"
import AggregatedOverall from "./components/Body/Aggregated_Overall/AggregatedOverall"
import MapPage from "./components/Body/MapPage/MapPage"
import { ShadThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

/**
 * @name - App
 * @desc - React Component that holds the theme, Header, Body(Routes), and Footer components
 *
 *        (Currently defaults to light mode as in dev mode, useMediaQuery is ran twice with
 *          the first value being false, should work in production.)
 * @author - Mitchell Baker
 * @date - 3/17/21
 * @version - 1.0
 * @param -
 * @return -
 */

export const ThemeContext = React.createContext({})

function App() {
  return (
    <ShadThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Router>
              <Header />
              <Switch>
                {/* Insert the routes to other pages here as:
                <Route path='/(page name) component={(component name)}*/}
                <Route exact path='/' component={Changelog} />
                <Route path='/about' component={About} />
                <Route path='/agg-selector' component={AggregatedSelector} />
                <Route path='/agg-overall' component={AggregatedOverall} />
                <Route path='/donators' component={Donators} />
                <Route path='/wall_of_shame' component={WallOfShame} />
                <Route path='/sp' exact component={SinglePlayer} />
                <Route path='/coop' exact component={Cooperative} />
                <Route path='/sp/:map_id' component={MapPage} />
                <Route path='/coop/:map_id' component={MapPage} />
                <Route component={Error} />
              </Switch>
              <Footer />
            </Router>
    </ShadThemeProvider>
  )
}

export default App
