import { ParticleNetwork } from './ParticleNetwork'

export function AuthArtwork() {
  return (
    <aside className="auth-artwork">
      <ParticleNetwork />
      <div className="brand">
        <span>✦</span> Nexus
      </div>
      <div className="floating-messages">
        <div>
          <span className="mini-avatar blue">L</span>The new design looks
          amazing! 🎨
        </div>
        <div>
          Thanks! I'll send the file now{' '}
          <span className="mini-avatar green">T</span>
        </div>
        <div>
          <span className="mini-avatar purple">H</span>The PR is merged. Great
          work! 🎉
        </div>
      </div>
      <div className="auth-artwork-copy">
        <span className="artwork-eyebrow">YOUR TEAM, IN SYNC</span>
        <h1>
          Connect, collaborate,
          <br />
          and move work forward.
        </h1>
        <p>Message, share files, and work better together with Nexus Chat.</p>
      </div>
    </aside>
  )
}
