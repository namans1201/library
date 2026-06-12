// Project screenshots for the three subgrid layers + the central "scaler"
// (hero) image. Each grid image links to its GitHub repository.

export interface Project {
  src: string
  href: string
  name: string
}

export const layers: Project[][] = [
  [
    {
      src: '/images/stocks.png',
      href: 'https://github.com/Namans12/stocks',
      name: 'stocks',
    },
    {
      src: '/images/to-do-better.png',
      href: 'https://github.com/Namans12/to-do-better',
      name: 'to-do-better',
    },
    {
      src: '/images/llm.png',
      href: 'https://github.com/Namans12/llm',
      name: 'llm',
    },
    {
      src: '/images/projects-web.png',
      href: 'https://github.com/Namans12/projects-web',
      name: 'projects-web',
    },
    {
      src: '/images/water-logger.png',
      href: 'https://github.com/Namans12/water-logger',
      name: 'water-logger',
    },
    {
      src: '/images/scraper-downloader-raretoons.png',
      href: 'https://github.com/Namans12/scraper-downloader-raretoons',
      name: 'scraper-downloader-raretoons',
    },
  ],
  [
    {
      src: '/images/musicpipeline--best.png',
      href: 'https://github.com/Namans12/musicpipeline--best',
      name: 'musicpipeline--best',
    },
    {
      src: '/images/videolyzer-dashboard.png',
      href: 'https://github.com/Namans12/videolyzer-dashboard',
      name: 'videolyzer-dashboard',
    },
    {
      src: '/images/wizlight.png',
      href: 'https://github.com/Namans12/wizlight',
      name: 'wizlight',
    },
    {
      src: '/images/clip-clap.png',
      href: 'https://github.com/namans1201/clip-clap',
      name: 'clip-clap',
    },
    {
      src: '/images/Clinic-App.png',
      href: 'https://github.com/Namans12/Clinic-App',
      name: 'Clinic-App',
    },
    {
      src: '/images/duplicate-app-final.png',
      href: 'https://github.com/Namans12/duplicate-app-final',
      name: 'duplicate-app-final',
    },
  ],
  [
    {
      src: '/images/dual_display.png',
      href: 'https://github.com/Namans12/dual_display',
      name: 'dual_display',
    },
    {
      src: '/images/watchlist.png',
      href: 'https://github.com/Namans12/watchlist',
      name: 'watchlist',
    },
  ],
]

// The hero is the transparent avatar cutout sitting on a gray card that matches
// the other project cards. The whole card scales down from a large hero size
// into its grid cell as you scroll, and the avatar is sized to pop out past the
// card's top edge. (Using one image — not a scene→cutout cross-fade — keeps the
// avatar perfectly crisp with no ghosting.)
export const avatarCutout = '/avatar-cutout.png'

// The full landing hero scene: the same avatar at his desk, surrounded by the
// lamp, books, phone and Rubik's cube. It fills the viewport on load and then
// dissolves on scroll - the environment fades away while the avatar stays
// locked in place - handing off to the cutout card as it shrinks into the grid.
export const heroScene = '/hero-scene.png'

// The avatar with its background removed, at the exact same framing as the
// hero scene (same source render, same pixel positions). Because it is
// pixel-aligned with heroScene, fading the scene out over this figure reads as
// the desk dissolving around a stationary avatar - no ghosting, no jump.
export const avatarFigure = '/avatar-figure.png'

// Both GitHub accounts, shown on the back of the hero flip card.
export const githubAccounts = [
  { handle: 'Namans12', href: 'https://github.com/Namans12' },
  { handle: 'namans1201', href: 'https://github.com/namans1201' },
]
