import { Link } from 'react-router-dom';
import { Wordmark } from '../../components/Logo';
import { useDocumentTitle } from '../../lib/hooks';
import { MONO } from '../../lib/logic';
import HardwareContent from './HardwareContent';

const navLink = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 44,
  padding: '0 14px',
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 15,
  textDecoration: 'none',
} as const;

export default function Hardware() {
  useDocumentTitle('LUMEN · How it works: Hardware');
  return (
    <div className="grid-bg">
      <a className="skip-link" href="#top">
        Skip to content
      </a>
      <div className="page" style={{ paddingBottom: 64 }}>
        <header
          className="site-header"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '24px 0' }}
        >
          <Link to="/" aria-label="LUMEN home" style={{ textDecoration: 'none' }}>
            <Wordmark />
          </Link>
          <nav aria-label="Site" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
            <Link className="nav-link" to="/" style={{ ...navLink, color: '#FFFFFF' }}>
              Live floors
            </Link>
            <a href="#top" aria-current="page" style={{ ...navLink, color: '#0B1B3A', background: '#F4B601' }}>
              How it works: Hardware
            </a>
          </nav>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.06em',
              color: '#C9D6EE',
              background: '#0A2150',
              border: '1px solid rgba(117,173,234,0.25)',
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            CONCEPT · PLAN FOR THE PROTOTYPE
          </span>
        </header>

        <main>
          <HardwareContent />
        </main>

        <footer
          style={{
            marginTop: 64,
            paddingTop: 24,
            borderTop: '1px solid rgba(117,173,234,0.2)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#75ADEA', letterSpacing: '0.02em' }}>LUMEN</span>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', color: '#C9D6EE' }}>
              A STUDENT DESIGN CONCEPT FOR THE SLC · HARDWARE PLAN
            </span>
          </div>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              padding: '0 18px',
              borderRadius: 10,
              background: '#F4B601',
              color: '#0B1B3A',
              fontWeight: 900,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            ← Back to live floors
          </Link>
        </footer>
      </div>
    </div>
  );
}
