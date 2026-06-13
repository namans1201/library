import { useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

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
      const fit = Number.parseFloat(styles.getPropertyValue('--hero-fit')) || 1
      const availableWidth = Math.max(1, window.innerWidth - gutter * 2)
      const availableHeight = Math.max(1, window.innerHeight - gutter * 2)
      const startScale =
        fit *
        Math.max(1, Math.min(availableWidth / width, availableHeight / height))

      scaler.style.setProperty('--hero-start-scale', String(startScale))

      const heroCardWidth = width * startScale
      const heroCardHeight = height * startScale
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

      const HERO = { w: 1672, h: 941 }
      const FIG = { w: 1536, h: 1024 }
      const FIG2SCENE = { scale: 0.841, ox: 170.7, oy: 16.8 }

      const vw = window.innerWidth
      const vh = window.innerHeight
      const isCover = window.innerWidth <= window.innerHeight
      const sceneScale = isCover
        ? Math.max(sceneBoxWidth / HERO.w, sceneBoxHeight / HERO.h)
        : Math.min(sceneBoxWidth / HERO.w, sceneBoxHeight / HERO.h)
      const sceneW = HERO.w * sceneScale
      const sceneH = HERO.h * sceneScale
      const letterboxX = (vw - sceneW) / 2
      const letterboxY = (vh - sceneH) / 2

      if (isCover) {
        root.style.setProperty('--hero-img-inset-x', '0%')
        root.style.setProperty('--hero-img-inset-y', '0%')
      } else {
        root.style.setProperty(
          '--hero-img-inset-x',
          `${(((sceneBoxWidth - sceneW) / 2 / sceneBoxWidth) * 100).toFixed(3)}%`
        )
        root.style.setProperty(
          '--hero-img-inset-y',
          `${(((sceneBoxHeight - sceneH) / 2 / sceneBoxHeight) * 100).toFixed(3)}%`
        )
      }

      const figVisW = FIG.w * FIG2SCENE.scale * sceneScale
      const figCenterX =
        letterboxX + (FIG2SCENE.ox + (FIG.w / 2) * FIG2SCENE.scale) * sceneScale
      const figCenterY =
        letterboxY + (FIG2SCENE.oy + (FIG.h / 2) * FIG2SCENE.scale) * sceneScale
      const dxVisual = figCenterX - vw / 2
      const dyVisual = figCenterY - vh / 2

      root.style.setProperty('--hero-figure-width', `${(figVisW / startScale).toFixed(2)}px`)
      root.style.setProperty('--hero-figure-dx', `${(dxVisual / startScale).toFixed(2)}px`)
      root.style.setProperty('--hero-figure-dy', `${(dyVisual / startScale).toFixed(2)}px`)

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

    const settleAt = hasScrollSupport ? 1.2 : 0.8
    const onScroll = () => {
      const settled =
        section.getBoundingClientRect().bottom <=
        window.innerHeight * settleAt + 1
      section.toggleAttribute('data-settled', settled)
    }
    updateHeroScale()
    onScroll()
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
