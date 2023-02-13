import {
  provideHeadless,
  SearchHeadlessProvider,
} from '@yext/search-headless-react';
import { Navbar } from './components/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AnalyticsProvider } from '@yext/search-ui-react';
import acquireSessionId from './utils/acquireSessionId';
import { config } from './config';
import { BeveragesPage } from './pages/BeveragesPage';

const searcher = provideHeadless(config);

searcher.setSessionTrackingEnabled(true);
const sessionId = acquireSessionId();
sessionId && searcher.setSessionId(sessionId);

function App() {
  return (
    <div className='p-4'>
      <SearchHeadlessProvider searcher={searcher}>
        <AnalyticsProvider {...config}>
          <BrowserRouter>
            {/* <Navbar /> */}
            <Routes>
              <Route index element={<BeveragesPage />} />
              {/* <Route path='people' element={<PeoplePage />} />
              <Route path='products' element={<ProductsPage />} />
              <Route path='locations' element={<LocationsPage />} /> */}
            </Routes>
          </BrowserRouter>
        </AnalyticsProvider>
      </SearchHeadlessProvider>
    </div>
  );
}

export default App;
