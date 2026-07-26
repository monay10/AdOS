import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Product } from './pages/Product';
import { Security } from './pages/Security';
import { LocalAI } from './pages/LocalAI';
import { Offline } from './pages/Offline';
import { OnPrem } from './pages/OnPrem';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Demo } from './pages/Demo';
import { Privacy } from './pages/legal/Privacy';
import { Cookies } from './pages/legal/Cookies';
import { Terms } from './pages/legal/Terms';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'product', element: <Product /> },
      { path: 'security', element: <Security /> },
      { path: 'solutions/local-ai', element: <LocalAI /> },
      { path: 'solutions/on-prem-offline', element: <OnPrem /> },
      { path: 'solutions/offline', element: <Offline /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'company/about', element: <About /> },
      { path: 'company/contact', element: <Contact /> },
      { path: 'demo', element: <Demo /> },
      { path: 'legal/privacy', element: <Privacy /> },
      { path: 'legal/cookies', element: <Cookies /> },
      { path: 'legal/terms', element: <Terms /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
