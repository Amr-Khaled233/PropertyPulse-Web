// Footer.

export function Footer() {
  return (
    <footer className="between wrap" style={{ borderTop: '1px solid var(--border)', padding: '22px 0', marginTop: 40, gap: 14 }}>
      <span className="muted" style={{ fontSize: '0.85rem' }}>
        <b className="serif">PropertyPulse</b> · © {new Date().getFullYear()} PropertyPulse Institutional. All rights reserved.
      </span>
      <div className="center-row muted" style={{ gap: 20, fontSize: '0.82rem' }}>
        <a href="#privacy">Privacy</a>
        <a href="#terms">Terms</a>
        <a href="#regulatory">Regulatory</a>
        <a href="#contact">Contact</a>
      </div>
    </footer>
  );
}
