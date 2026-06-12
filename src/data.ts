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

// The settled card image: the avatar + laptop cut out on a transparent
// background. Once the hero card has shrunk into its grid cell, the
// scroll-synced figure hands off to this cut-out, anchored to the card's
// bottom edge and sized to pop out past the card's edges with the full image
// visible — never cropped.
export const avatarCutout = '/avatar-cutout.png'

// The full landing hero scene: the same avatar at his desk, surrounded by the
// lamp, books, phone and Rubik's cube. It fills the viewport on load and then
// dissolves on scroll - the environment fades away while the avatar stays
// locked in place - handing off to the cutout card as it shrinks into the grid.
export const heroScene = '/hero-scene.png'

// The avatar with its background removed, from the same artwork as the hero
// scene but on a different canvas. usePlaybook maps this canvas onto the
// scene's (FIG2SCENE, template-matched against the actual pixels), so the
// figure's outline sits exactly over the scene's avatar and laptop - fading
// the scene out over it reads as the desk dissolving around a stationary
// avatar, no ghosting, no jump.
export const avatarFigure = '/avatar-figure.png'

// Both GitHub accounts, shown on the back of the hero flip card.
export const githubAccounts = [
  { handle: 'Namans12', href: 'https://github.com/Namans12' },
  { handle: 'namans1201', href: 'https://github.com/namans1201' },
]
