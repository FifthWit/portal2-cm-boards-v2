import { Grid, Paper } from "@material-ui/core"
import React, { useState, useContext, useEffect } from "react"
import { HashLink as Link } from "react-router-hash-link"
import { useStyles } from "./style.js"
import ScoreLists from "./ScoreLists"
import Graph from "./Graph"
import Filters from "./Filters"
import { ThemeContext } from "../../../App.jsx"

const ENDPOINT = "http://localhost:8080/api/v1/changelog"

/**
 * @name - ChangeLog
 * @desc - ChangeLog page for the website.
 *          TODO:
 *                - Add graph of upload activity
 *                - Display list of upload activity
 *                - Display options for filter
 * @author - Mitchell Baker
 * @date - 3/17/21
 * @version - 1.0
 * @param -
 * @return -
 */
const ChangeLog = () => {
  const classes = useStyles()
  const themeContext = useContext(ThemeContext)
  const [changelogData, setChangelogData] = useState([])
  const [filters, setFilters] = useState([])

  //fetching changelog data on first component load
  useEffect(() => {
    const fetchData = async () => {
      let response = await fetch(ENDPOINT)

      return response.json()
    }

    fetchData()
      .then(data => setChangelogData(data))
      .catch(error => console.log(error))
  }, [])

  const handleChangeFilters = e => {
    setFilters(e)
  }

  console.log(filters)
  return (
      <div className="flex flex-col p-4 *:my-2">
            <Filters
              themeStatus={themeContext.themeStatus}
              theme={themeContext.theme}
              onChangeFilters={handleChangeFilters}
            />
            <Graph
              themeContext={themeContext}
              filters={filters}
              changelogData={changelogData}
            />
            <ScoreLists
              filters={filters}
              changelogData={changelogData}
              themeStatus={themeContext.themeStatus}
              theme={themeContext.theme}
            />
      </div>
  )
}

export default ChangeLog
