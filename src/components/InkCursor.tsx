import { useEffect } from 'react'
import { Color, Polyline, Renderer, Transform, Vec3 } from 'ogl'

// ── Shaders ───────────────────────────────────────────────────────────────────
const vertex = /* glsl */ `
  precision highp float;

  attribute vec3 position;
  attribute vec3 next;
  attribute vec3 prev;
  attribute vec2 uv;
  attribute float side;

  uniform vec2 uResolution;
  varying vec2 vUv;

  vec4 getPosition() {
    vec2 aspect   = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 nextScr  = next.xy * aspect;
    vec2 prevScr  = prev.xy * aspect;
    vec2 tangent  = normalize(nextScr - prevScr);
    vec2 normal   = vec2(-tangent.y, tangent.x);
    normal /= aspect;
    // Thin ink stroke — tapered sharply at both ends
    float taper = 1.0 - pow(abs(uv.y - 0.5) * 2.0, 1.4);
    normal *= taper * 0.012;
    vec4 current = vec4(position, 1.0);
    current.xy  -= normal * side;
    return current;
  }

  void main() {
    vUv         = uv;
    gl_Position = getPosition();
  }
`

const fragment = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    // Head (vUv.y = 0) opaque → tail (vUv.y = 1) transparent
    float alpha  = pow(1.0 - vUv.y, 1.3) * 0.88;
    gl_FragColor = vec4(uColor, alpha);
  }
`

// ── Cursor image ──────────────────────────────────────────────────────────────
// Hotspot from the .cur file directory entries (in CSS pixels / 1x image coords)
const HOT_X = 0   // 16px image hotspot x
const HOT_Y = 1   // 16px image hotspot y

function isDarkMode(): boolean {
  const theme = document.documentElement.getAttribute('data-theme')
  return (
    theme === 'dark' ||
    (!theme && matchMedia('(prefers-color-scheme: dark)').matches)
  )
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Draw the cursor PNG to canvas, optionally inverting RGB (preserves alpha)
function toCursorURL(img: HTMLImageElement, invert: boolean): string {
  const canvas = document.createElement('canvas')
  canvas.width  = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  if (invert) {
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < d.data.length; i += 4) {
      d.data[i]   = 255 - d.data[i]
      d.data[i+1] = 255 - d.data[i+1]
      d.data[i+2] = 255 - d.data[i+2]
      // d.data[i+3] = alpha — untouched
    }
    ctx.putImageData(d, 0, 0)
  }
  return canvas.toDataURL('image/png')
}

// ── Trail constants ───────────────────────────────────────────────────────────
const POINT_COUNT = 20
const SPRING      = 0.065
const FRICTION    = 0.82
const LERP        = 0.88

// ── Component ─────────────────────────────────────────────────────────────────
export default function InkCursor() {
  useEffect(() => {
    // ── Cursor image (theme-aware, always active) ──────────────────────────
    const style = document.createElement('style')
    document.head.appendChild(style)

    // 1x (32px) and 2x (64px) variants for each theme
    let light32 = '', light64 = ''   // dark pen  → light mode
    let dark32  = '', dark64  = ''   // light pen → dark  mode

    const applyTheme = () => {
      if (!light32) return
      const u32 = isDarkMode() ? dark32 : light32
      const u64 = isDarkMode() ? dark64 : light64
      // -webkit-image-set: 32px at 1x DPR, 64px at 2x DPR (retina)
      // Fallback url() for Firefox which doesn't support image-set on cursor
      style.textContent =
        `*,*::before,*::after{cursor:` +
        `-webkit-image-set(url('${u32}') 1x,url('${u64}') 2x) ${HOT_X} ${HOT_Y},` +
        `url('${u32}') ${HOT_X} ${HOT_Y},auto!important}`
    }

    Promise.all([
      loadImg('/cursors/pen-16.png'),
      loadImg('/cursors/pen-32.png'),
    ]).then(([img16, img32]) => {
      light32 = toCursorURL(img16, false)
      light64 = toCursorURL(img32, false)
      dark32  = toCursorURL(img16, true)
      dark64  = toCursorURL(img32, true)
      applyTheme()
    })

    // React to theme changes (data-theme attribute or media query)
    const mo = new MutationObserver(applyTheme)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const mq = matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', applyTheme)

    const cleanupCursor = () => {
      style.remove()
      mo.disconnect()
      mq.removeEventListener('change', applyTheme)
    }

    // Skip the ink trail for users who prefer reduced motion
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return cleanupCursor
    }

    // ── OGL ink trail ──────────────────────────────────────────────────────
    const renderer = new Renderer({
      alpha:     true,
      dpr:       Math.min(devicePixelRatio, 2),
      antialias: false,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)

    const cv = gl.canvas
    cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;'
    document.body.appendChild(cv)

    const scene  = new Transform()
    const points: Vec3[] = Array.from({ length: POINT_COUNT }, () => new Vec3(-2, -2, 0))

    const inkColor = new Color('#000000')
    const polyline = new Polyline(gl, {
      points,
      vertex,
      fragment,
      uniforms: { uColor: { value: inkColor } },
    })
    polyline.mesh.setParent(scene)
    polyline.mesh.visible = false   // hidden until first mouse entry

    const mouse    = new Vec3(-2, -2, 0)
    const velocity = new Vec3()
    const tmp      = new Vec3()
    let entered = false

    const onMove = (e: MouseEvent) => {
      const ndcX = (e.clientX / window.innerWidth)  *  2 - 1
      const ndcY = (e.clientY / window.innerHeight) * -2 + 1

      if (!entered) {
        points.forEach(p => p.set(ndcX, ndcY, 0))
        mouse.set(ndcX, ndcY, 0)
        velocity.set(0, 0, 0)
        polyline.mesh.visible = true
        entered = true
      }

      mouse.set(ndcX, ndcY, 0)
    }

    window.addEventListener('mousemove', onMove)

    const onResize = () => renderer.setSize(window.innerWidth, window.innerHeight)
    onResize()
    window.addEventListener('resize', onResize)

    let animId: number

    const loop = () => {
      animId = requestAnimationFrame(loop)

      const dark = isDarkMode()
      inkColor[0] = dark ? 1 : 0
      inkColor[1] = dark ? 1 : 0
      inkColor[2] = dark ? 1 : 0

      for (let i = points.length - 1; i >= 0; i--) {
        if (i === 0) {
          tmp.copy(mouse).sub(points[0]).multiply(SPRING)
          velocity.add(tmp).multiply(FRICTION)
          points[0].add(velocity)
        } else {
          points[i].lerp(points[i - 1], LERP)
        }
      }

      polyline.updateGeometry()
      renderer.render({ scene })
    }

    animId = requestAnimationFrame(loop)

    return () => {
      cleanupCursor()
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      cv.remove()
    }
  }, [])

  return null
}
