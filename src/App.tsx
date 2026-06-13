import { avatarCutout, avatarFigure, githubAccounts, heroScene, layers } from './data'

const githubIconPath =
  'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
import { usePlaybook } from './hooks/usePlaybook'

export default function App() {
  usePlaybook()

  return (
    <>
      <div className="content-wrap">
        <header>
          <h1 className="fluid">
            Projects
            <br />
            Library
          </h1>
        </header>
        <main>
          <section>
            <div className="content">
              <img
                className="hero-scene"
                src={heroScene}
                alt=""
                aria-hidden="true"
                decoding="async"
                fetchPriority="high"
              />
              <div className="grid">
                {layers.map((projects, layerIndex) => (
                  <div className="layer" key={layerIndex}>
                    {projects.map((project) => (
                      <div key={project.href}>
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`${project.name} on GitHub`}
                        >
                          <img
                          src={project.src}
                          alt={project.name}
                          loading="lazy"
                          decoding="async"
                        />
                        </a>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="scaler">
                  <div className="flip">
                    <div className="flip-inner">
                      <div className="flip-face flip-front">
                        <div className="figure-clip">
                          <img
                            className="hero-figure"
                            src={avatarFigure}
                            alt=""
                            aria-hidden="true"
                            decoding="async"
                          />
                        </div>
                        <img
                          className="card-cutout"
                          src={avatarCutout}
                          alt="Naman Shrimal working on a laptop"
                          decoding="async"
                          fetchPriority="high"
                        />
                      </div>
                      <div className="flip-face flip-back">
                        <p className="flip-title">Find me on GitHub</p>
                        {githubAccounts.map((account) => (
                          <a
                            key={account.handle}
                            href={account.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            aria-label={`${account.handle} on GitHub`}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d={githubIconPath} />
                            </svg>
                            @{account.handle}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h2 className="fluid">Thank you for visiting!</h2>
          </section>
        </main>
      </div>
      <footer>
        <p className="footer-name">Naman Shrimal</p>
        <nav className="socials" aria-label="Social links">
          <a
            href="https://github.com/Namans12"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={githubIconPath} />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/naman-shrimal12/"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
            </svg>
          </a>
          <a href="mailto:Namanshrimal12@gmail.com" aria-label="Email">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </a>
        </nav>
      </footer>
    </>
  )
}
