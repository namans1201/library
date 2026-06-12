import { useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

/**
 * The effect is pure CSS scroll-driven animation; the settings are baked in as
 * defaults on the <html> element (see index.html). The hero card scales down
 * from a large hero size into its grid cell as the section scrolls. GSAP
 * ScrollTrigger is used only as a fallback for browsers that lack scroll-driven
 * animation support.
 *
 * This hook also toggles data-settled on the sticky section once the hero
 * card has finished shrinking into its grid cell — the flip interaction is
 * gated on that attribute so the card can't flip mid-scroll.
 */
export function usePlaybook() {
  useEffect(() => {
    const section = document.querySelector('main section:first-of-type')
    const scaler = section?.querySelector<HTMLElement>('.scaler')
    if (!section || !scaler) return

    const updateHeroScale = () => {
      const { width, height } = scaler.getBoundingClientRect()
      if (!width || !height) return

      const styles = getComputedStyle(document.documentElement)
      const gutter = Number.parseFloat(styles.getPropertyValue('--gutter')) || 32
      const availableWidth = Math.max(1, window.innerWidth - gutter * 2)
      const availableHeight = Math.max(1, window.innerHeight - gutter * 2)
      const startScale = Math.max(
        1,
        Math.min(availableWidth / width, availableHeight / height)
      )

      scaler.style.setProperty('--hero-start-scale', String(startScale))

      // The landscape hero starts full-bleed and then narrows horizontally
      // (clip-path insets growing from both sides) until the visible window
      // exactly matches the avatar card at its hero scale. Compute those
      // target insets here so the curtain closes onto the card, whatever the
      // viewport size, then expose them to the keyframes.
      const heroCardWidth = width * startScale
      const heroCardHeight = height * startScale
      const clipX = Math.max(
        0,
        ((window.innerWidth - heroCardWidth) / 2 / window.innerWidth) * 100
      )
      const clipY = Math.max(
        0,
        ((window.innerHeight - heroCardHeight) / 2 / window.innerHeight) * 100
      )
      const root = document.documentElement
      root.style.setProperty('--hero-clip-x', `${clipX.toFixed(3)}%`)
      root.style.setProperty('--hero-clip-y', `${clipY.toFixed(3)}%`)

      // Align the center cut-out avatar (a different render) onto the avatar in
      // the hero scene using their measured face landmarks, so that at the
      // card's hero scale the cut-out's face lands exactly on the scene's face
      // (same position and size). The card then scales this figure straight
      // down into its grid cell, so the alignment holds through the whole
      // scroll. Landmarks are fractions of each source image, measured offline.
      const HERO = { w: 1672, h: 941, faceCx: 0.459, faceCy: 0.3539, faceW: 0.1591 }
      const CUT = { w: 1536, h: 1024, faceCx: 0.4642, faceCy: 0.3687, faceW: 0.1986 }
      const cutAspect = CUT.w / CUT.h

      const vw = window.innerWidth
      const vh = window.innerHeight
      // The scene is object-fit: contain in the viewport.
      const sceneScale = Math.min(vw / HERO.w, vh / HERO.h)
      const sceneW = HERO.w * sceneScale
      const sceneH = HERO.h * sceneScale
      const letterboxX = (vw - sceneW) / 2
      const letterboxY = (vh - sceneH) / 2

      // Hero face on screen.
      const heroFaceX = letterboxX + HERO.faceCx * sceneW
      const heroFaceY = letterboxY + HERO.faceCy * sceneH
      const heroFaceW = HERO.faceW * sceneW

      // Size the cut-out so its face width matches the hero's face width.
      const figVisW = heroFaceW / CUT.faceW
      const figVisH = figVisW / cutAspect
      // Place the cut-out's face on the hero's face, then derive the figure's
      // centre offset from the viewport centre (which is the card centre).
      const figCenterX = heroFaceX - CUT.faceCx * figVisW + figVisW / 2
      const figCenterY = heroFaceY - CUT.faceCy * figVisH + figVisH / 2
      const dxVisual = figCenterX - vw / 2
      const dyVisual = figCenterY - vh / 2

      // Express in the card's base (cell) coordinates; the card's scale carries
      // these to hero size and back down to the cell.
      root.style.setProperty('--hero-figure-width', `${(figVisW / startScale).toFixed(2)}px`)
      root.style.setProperty('--hero-figure-dx', `${(dxVisual / startScale).toFixed(2)}px`)
      root.style.setProperty('--hero-figure-dy', `${(dyVisual / startScale).toFixed(2)}px`)
    }

    const hasScrollSupport = CSS.supports(
      '(animation-timeline: view()) and (animation-range: 0 100%)'
    )

    // The CSS animation-range ends at `exit -20%`, i.e. when the section's
    // bottom edge sits 20% of the viewport below the fold. The GSAP fallback
    // timeline ends at 'bottom 80%' instead, so settle later there.
    const settleAt = hasScrollSupport ? 1.2 : 0.8
    const onScroll = () => {
      const settled =
        section.getBoundingClientRect().bottom <=
        window.innerHeight * settleAt + 1
      section.toggleAttribute('data-settled', settled)
    }
    updateHeroScale()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateHeroScale)
    window.addEventListener('resize', onScroll)

    let cleanupGsap: (() => void) | undefined

    if (!hasScrollSupport) {
      gsap.registerPlugin(ScrollTrigger)
      console.info('GSAP ScrollTrigger registered')

      const scalerTl = gsap
        .timeline({
          scrollTrigger: {
            trigger: 'main section:first-of-type',
            start: 'top -10%',
            end: 'bottom 80%',
            scrub: true,
          },
        })
        .from(
          '.scaler .flip',
          {
            scale: () =>
              Number.parseFloat(
                getComputedStyle(scaler).getPropertyValue('--hero-start-scale')
              ) || 1,
            ease: 'power2.inOut',
          },
          0
        )
        // Narrow the landscape scene horizontally into the avatar card frame,
        // then cross-fade to the card (mirrors the CSS hero-scene-narrow
        // keyframes for browsers without scroll-driven animation support).
        .to(
          '.hero-scene',
          {
            clipPath: () => {
              const s = getComputedStyle(document.documentElement)
              const x = s.getPropertyValue('--hero-clip-x').trim() || '27%'
              const y = s.getPropertyValue('--hero-clip-y').trim() || '5%'
              return `inset(${y} ${x} ${y} ${x} round 16px)`
            },
            ease: 'power2.inOut',
            duration: 0.5,
          },
          0
        )
        .to(
          '.hero-scene',
          { opacity: 0, ease: 'power1.out', duration: 0.12 },
          0.5
        )

      const layersTl = gsap
        .timeline({
          scrollTrigger: {
            trigger: 'main section:first-of-type',
            start: 'top -40%',
            end: 'bottom bottom',
            scrub: true,
          },
        })
        .from('.layer:nth-of-type(1)', { opacity: 0, ease: 'sine.out' }, 0)
        .from('.layer:nth-of-type(1)', { scale: 0, ease: 'power1.inOut' }, 0)
        .from('.layer:nth-of-type(2)', { opacity: 0, ease: 'sine.out' }, 0)
        .from('.layer:nth-of-type(2)', { scale: 0, ease: 'power3.inOut' }, 0)
        .from('.layer:nth-of-type(3)', { opacity: 0, ease: 'sine.out' }, 0)
        .from('.layer:nth-of-type(3)', { scale: 0, ease: 'power4.inOut' }, 0)

      cleanupGsap = () => {
        scalerTl.kill()
        layersTl.kill()
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateHeroScale)
      window.removeEventListener('resize', onScroll)
      cleanupGsap?.()
    }
  }, [])
}
