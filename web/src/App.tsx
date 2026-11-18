import { lazy, Suspense, useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { FloorsProvider } from './lib/floors';
import { useDocumentTitle } from './lib/hooks';
import FloorScreen from './pages/FloorScreen';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Phone from './pages/Phone';

// The hardware page is long and static: load it only when someone opens it.
const Hardware = lazy(() => import('./pages/hardware/Hardware'));

/** New page: start at the top, or at the #section in the URL once it has rendered. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Lazy pages render a moment later, so look for the target for up to 2 seconds.
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer = 0;
    const find = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
      else if (tries++ < 40) timer = window.setTimeout(find, 50);
    };
    find();
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}

function NotFound() {
  useDocumentTitle('LUMEN · Page not found');
  return (
    <div className="grid-bg">
      <main className="page" style={{ paddingTop: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 48, fontWeight: 900 }}>Page not found.</h1>
        <p style={{ margin: 0, fontSize: 18, color: '#C9D6EE' }}>That LUMEN page does not exist.</p>
        <Link to="/" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 44, fontWeight: 700 }}>
          ← Back to live floors
        </Link>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <FloorsProvider>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/hardware"
          element={
            <Suspense fallback={<div className="grid-bg" />}>
              <Hardware />
            </Suspense>
          }
        />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/floor/:n" element={<FloorScreen />} />
        <Route path="/phone" element={<Phone />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </FloorsProvider>
  );
}
