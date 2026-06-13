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
      // The whole hero (scene box + card hero scale) shrinks by this factor so
      // the landing image fits the page with a margin instead of going edge to
      // edge. Scaling both by the same factor keeps the scene→card morph aligned.
      const fit = Number.parseFloat(styles.getPropertyValue('--hero-fit')) || 1
      const availableWidth = Math.max(1, window.innerWidth - gutter * 2)
      const availableHeight = Math.max(1, window.innerHeight - gutter * 2)
      const startScale =
        fit *
        Math.max(1, Math.min(availableWidth / width, availableHeight / height))

      scaler.style.setProperty('--hero-start-scale', String(startScale))

      // The landscape hero starts full-bleed and then narrows horizontally
      // (clip-path insets growing from both sides) until the visible window
      // exactly matches the avatar card at its hero scale. Compute those
      // target insets here so the curtain closes onto the card, whatever the
      // viewport size, then expose them to the keyframes.
      const heroCardWidth = width * startScale
      const heroCardHeight = height * startScale
      // The scene element's box is --hero-fit of the viewport (see CSS), so the
      // clip insets are expressed as a fraction of that box, not the viewport.
      const sceneBoxWidth = window.innerWidth * fit
      const sceneBoxHeight = window.innerHeight * fit
      const clipX = Math.max(
        0,
        ((sceneBoxWidth - heroCardWidth) / 2 / sceneBoxWidth) * 100
      )
      const clipY = Math.max(
        0,
        ((sceneBoxHeight - heroCardHeight) / 2 / sceneBoxHeight) * 100
      )
      const root = document.documentElement
      root.style.setProperty('--hero-clip-x', `${clipX.toFixed(3)}%`)
      root.style.setProperty('--hero-clip-y', `${clipY.toFixed(3)}%`)

      // Align the transparent avatar figure (a different render canvas) onto
      // the avatar in the hero scene. FIG2SCENE maps avatar-figure.png canvas
      // pixels onto hero-scene.png canvas pixels (scenePx = offset + scale *
      // figurePx); it was measured by template-matching the two renders'
      // actual pixels, so the figure's outline sits exactly over the scene's
      // avatar and laptop during the cross-fade. The card then scales the
      // figure straight down into its grid cell, so the alignment holds
      // through the whole scroll.
      const HERO = { w: 1672, h: 941 }
      const FIG = { w: 1536, h: 1024 }
      const FIG2SCENE = { scale: 0.841, ox: 170.7, oy: 16.8 }

      const vw = window.innerWidth
      const vh = window.innerHeight
      // The scene is object-fit: contain inside the --hero-fit box, which is
      // centered in the viewport. So it fits to the box, but its letterbox
      // offsets are still measured from the viewport edges (box is centered).
      const sceneScale = Math.min(sceneBoxWidth / HERO.w, sceneBoxHeight / HERO.h)
      const sceneW = HERO.w * sceneScale
      const sceneH = HERO.h * sceneScale
      const letterboxX = (vw - sceneW) / 2
      const letterboxY = (vh - sceneH) / 2

      // The picture is letterboxed inside the --hero-fit box (object-fit:
      // contain), so expose the letterbox as inset fractions of the element
      // box - the clip-path rounds the visible image's own boundary, not the
      // element's corners sitting in the empty letterbox.
      root.style.setProperty(
        '--hero-img-inset-x',
        `${(((sceneBoxWidth - sceneW) / 2 / sceneBoxWidth) * 100).toFixed(3)}%`
      )
      root.style.setProperty(
        '--hero-img-inset-y',
        `${(((sceneBoxHeight - sceneH) / 2 / sceneBoxHeight) * 100).toFixed(3)}%`
      )

      // Figure rect on screen (figure canvas -> scene canvas -> screen), then
      // its centre offset from the viewport centre (which is the card centre).
      const figVisW = FIG.w * FIG2SCENE.scale * sceneScale
      const figCenterX =
        letterboxX + (FIG2SCENE.ox + (FIG.w / 2) * FIG2SCENE.scale) * sceneScale
      const figCenterY =
        letterboxY + (FIG2SCENE.oy + (FIG.h / 2) * FIG2SCENE.scale) * sceneScale
      const dxVisual = figCenterX - vw / 2
      const dyVisual = figCenterY - vh / 2

      // Express in the card's base (cell) coordinates; the card's scale carries
      // these to hero size and back down to the cell.
      root.style.setProperty('--hero-figure-width', `${(figVisW / startScale).toFixed(2)}px`)
      root.style.setProperty('--hero-figure-dx', `${(dxVisual / startScale).toFixed(2)}px`)
      root.style.setProperty('--hero-figure-dy', `${(dyVisual / startScale).toFixed(2)}px`)

      // Two placements for the cut-out, both in the card's cell coordinates:
      //  - ALIGNED: overlays the scroll-synced figure exactly (FIG2CUT,
      //    template-matched against the actual pixels) so the figure→cut-out
      //    swap is seamless - no jump in face position or size.
      //  - POPPED: a fixed fraction of the card (--cutout-pop), bottom-anchored,
      //    so the avatar + laptop pop out the same amount at every viewport.
      // The emerge tweens scale + offset from ALIGNED to POPPED: it swaps in
      // synced, then grows into its popped size. Because the layout size IS the
      // popped size, the drop-shadow renders at scale ~1 (no blown-up halo).
      const CUT = { w: 1047, h: 1173 }
      const FIG2CUT = { scale: 1.1462, ox: -322.6, oy: 115.2 }
      const kFig = figVisW / FIG.w
      const kCut = kFig / FIG2CUT.scale
      const alignedW = (CUT.w * kCut) / startScale
      const alignedDx =
        (dxVisual - (FIG.w / 2) * kFig - (FIG2CUT.ox - CUT.w / 2) * kCut) /
        startScale
      const alignedDy =
        (dyVisual - (FIG.h / 2) * kFig - (FIG2CUT.oy - CUT.h / 2) * kCut) /
        startScale

      const popRatio =
        Number.parseFloat(styles.getPropertyValue('--cutout-pop')) || 1.3
      const poppedW = popRatio * width
      const poppedH = (poppedW * CUT.h) / CUT.w
      // Bottom edge 2% below the card's bottom -> the head pops above the top.
      const poppedDy = 1.02 * height - poppedH / 2 - height / 2

      root.style.setProperty('--cutout-width', `${poppedW.toFixed(2)}px`)
      root.style.setProperty('--cutout-popped-dy', `${poppedDy.toFixed(2)}px`)
      root.style.setProperty('--cutout-aligned-dx', `${alignedDx.toFixed(2)}px`)
      root.style.setProperty('--cutout-aligned-dy', `${alignedDy.toFixed(2)}px`)
      root.style.setProperty('--cutout-swap-scale', (alignedW / poppedW).toFixed(4))
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
    // The cut-out's box (and thus the card-inside-cut-out insets) is only
    // correct once the image has loaded its intrinsic size; recompute then.
    const cutoutImg = scaler.querySelector<HTMLImageElement>('.card-cutout')
    if (cutoutImg && !cutoutImg.complete) {
      cutoutImg.addEventListener('load', updateHeroScale, { once: true })
    }
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
        // Both endpoints are written out explicitly in the same 5-number form
        // so GSAP interpolates them component-wise (the computed style of the
        // var-based start clip may serialize collapsed and fail to match).
        .fromTo(
          '.hero-scene',
          {
            clipPath: () => {
              const s = getComputedStyle(document.documentElement)
              const x = s.getPropertyValue('--hero-img-inset-x').trim() || '0%'
              const y = s.getPropertyValue('--hero-img-inset-y').trim() || '0%'
              return `inset(${y} ${x} ${y} ${x} round 24px)`
            },
          },
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
