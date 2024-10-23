import scoreUpdates from "./img/ScoreUpdates.png"
import steamIcon from "./img/steamicon.png"
import singlplayerIcon from "./img/Singleplayer.png"
import fullGameRunsIcon from "./img/running_large.png"
import aggregatedIcon from "./img/aggregated.png"
import coopIcon from "./img/Co-op.png"
import {
  Grid,
  AppBar,
  Toolbar,
  Typography,
  // Button,
  Switch
} from "@material-ui/core"
import { BrowserRouter, Link } from "react-router-dom"
import { useStyles, CustomButton } from "./style.js"
import Dropdown from "./Dropdown"
import { ModeToggle } from "@/components/mode-toggle"
import React from "react"
import { Button, buttonVariants } from "@/components/ui/button"
/**
 * @name - Header
 * @desc - Contains the toolbar for header. Displays the website title. Shows links for home page,
 *         single player scores, cooperative scores, aggregated (overall, single player, and cooperative),
 *         full game runs website, and a steam sign in for the website.
 * @author - Mitchell Baker
 * @date - 3/17/21
 * @version - 1.0
 * @param -
 * @return -
 */

// Data for buttons
const buttonData = [
  {
    variant: 'text',
    href: '/',
    src: scoreUpdates,
    text: 'Score Updates'
  },
  {
    variant: 'text',
    href: '/sp',
    src: singlplayerIcon,
    text: 'Single Player'
  },
  {
    variant: 'text',
    href: '/coop',
    src: coopIcon,
    text: 'Cooperative'
  },
  {
    variant: 'text',
    href: '/agg-selector',
    src: aggregatedIcon,
    text: 'Aggregated'
  },
  {
    variant: 'text',
    href: 'https://www.speedrun.com/Portal_2',
    src: fullGameRunsIcon,
    text: 'Full Game Runs'
  },
  {
    variant: 'text',
    href: 'https://steamcommunity.com/openid/login?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.mode=checkid_setup&openid.return_to=http%3A%2F%2Fboard.iverb.me%2Flogin&openid.realm=http%3A%2F%2Fboard.iverb.me&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select',
    src: steamIcon,
    text: 'Sign In'
  }
];

const HeaderButton = ({ variant = "default", href, src, text, iconClassName }) => {
  return (
      <a href={href} className="flex flex-row items-center space-x-2 m-2 hover:bg-opacity-10 bg-white bg-opacity-0 duration-150 transition-all rounded-lg p-4">
        <img src={src} alt={text} className={`${iconClassName} aspect-square h-8`} />
        <span className="hidden sm:inline">{text}</span>
      </a>
  )
}

const Header = ({ handleChange, themeStatus }) => {
  const classes = useStyles();

  return (
    <div className="bg-secondary text-white flex justify-between items-center px-4">
      <div className="flex items-center space-x-4 font-semibold">
        <h5>
          Portal 2 Leaderboards
        </h5>
        {buttonData.map((button, index) => (
          <HeaderButton
            key={index}
            variant={button.variant}
            href={button.href}
            src={button.src}
            text={button.text}
          />
        ))}
      </div>
      
      <ModeToggle />
    </div>
  );
};

export default Header;