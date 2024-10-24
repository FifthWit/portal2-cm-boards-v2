import React from "react"


// Shadcn

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Icons
import { Search } from 'lucide-react';
 

const Filters = props => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [anchorEl2, setAnchorEl2] = React.useState(null)
  const [nickname, setNickname] = React.useState(null)
  const [steam, setSteam] = React.useState(null)
  const [chapter, setChapter] = React.useState(null)
  const [chamber, setChamber] = React.useState(null)
  const [check, setCheck] = React.useState({
    singlePlayer: false,
    cooperative: false,
    worldRecord: false,
    demo: false,
    video: false,
    submission: false
  })

  const handleClose1 = e => {
    setAnchorEl(null)
    setChapter(e.target.text)
  }
  const handleClose2 = e => {
    setAnchorEl2(null)
    setChamber(e.target.text)
  }

  const handleNickname = e => {
    setNickname(e.target.value)
  }
  const handleSteam = e => {
    setSteam(e.target.value)
  }

  const handleChange = e => {
    setCheck({ ...check, [e.target.name]: e.target.checked })
  }

  const handleOnClick = () => {
    props.onChangeFilters([nickname, steam, chapter, chamber, check])
  }

  return (
        <form className="w-full flex flex-row items-center p-4 *:m-2 dark:bg-neutral-950">
              <Input className="w-fit dark:text-white" placeholder="Nickname" onChange={(val) => handleNickname(val)}/>
              <Input className="w-fit dark:text-white" placeholder="SteamID" onChange={(val) => handleSteam(val)}/>
          <DropdownMenu>
            <DropdownMenuTrigger className="dark:bg-neutral-950 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md dark:text-white text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">Chapters</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Chapters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Chapter 1</DropdownMenuItem>
              <DropdownMenuItem>Chapter 2</DropdownMenuItem>
              <DropdownMenuItem>Chapter 3</DropdownMenuItem>
              <DropdownMenuItem>Chapter 4</DropdownMenuItem>
              <DropdownMenuItem>Chapter 5</DropdownMenuItem>
              <DropdownMenuItem>Chapter 6</DropdownMenuItem>
              <DropdownMenuItem>Chapter 7</DropdownMenuItem>
              <DropdownMenuItem>Chapter 8</DropdownMenuItem>
              <DropdownMenuItem>Chapter 9</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <FormControlLabel
            className={classes.checkbox}
            labelPlacement='top'
            control={
              <Checkbox
                color='default'
                checked={check.singlePlayer}
                onChange={handleChange}
                name='singlePlayer'
              />
            }
            label='Single Player'></FormControlLabel> */}
          <div className="flex flex-col justify-center items-center *:m-1">
            <Label className="dark:text-white">Single Player</Label>
            <Checkbox
              color='default'
              checked={check.singlePlayer}
              onChange={handleChange}
              name='singlePlayer'
            />
          </div>
          {/* <FormControlLabel
            className={classes.checkbox}
            labelPlacement='top'
            control={
              <Checkbox
                color='default'
                checked={check.cooperative}
                onChange={handleChange}
                name='cooperative'
              />
            }
            label='Cooperative'></FormControlLabel> */}
            <div className="flex flex-col justify-center items-center *:m-1">
              <Label className="dark:text-white">Coop</Label>
              <Checkbox />
            </div>
          {/* <FormControlLabel
            className={classes.checkbox}
            labelPlacement='top'
            control={
              <Checkbox
                color='default'
                checked={check.worldRecord}
                onChange={handleChange}
                name='worldRecord'
              />
            }
            label='World Record'></FormControlLabel> */}
            <div className="flex flex-col justify-center items-center *:m-1">
              <Label className="dark:text-white">World Record</Label>
              <Checkbox />
            </div>
          {/* <FormControlLabel
            className={classes.checkbox}
            labelPlacement='top'
            control={
              <Checkbox
                color='default'
                checked={check.demo}
                onChange={handleChange}
                name='demo'
              />
            }
            label='Demo'></FormControlLabel>
          <FormControlLabel
            className={classes.checkbox}
            labelPlacement='top'
            control={
              <Checkbox
                color='default'
                checked={check.video}
                onChange={handleChange}
                name='video'
              />
            }
            label='Video'></FormControlLabel>
          <FormControlLabel
            className={classes.checkbox}
            labelPlacement='top'
            control={
              <Checkbox
                color='default'
                checked={check.submission}
                onChange={handleChange}
                name='submission'
              />
            }
            label='Submission'></FormControlLabel> */}
          <Button
            onClick={handleOnClick}>
            <Search />Apply
        </Button>
        </form>
  )
}

export default Filters
