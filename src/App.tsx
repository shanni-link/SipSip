import { HashRouter, Routes, Route } from 'react-router-dom';
import { CalendarPage } from './pages/CalendarPage';
import { ListPage } from './pages/ListPage';
import { NewRecordPage } from './pages/NewRecordPage';
import { EditPage } from './pages/EditPage';
import { HistoryPage } from './pages/HistoryPage';
import TestCutout from './pages/TestCutout';
import DemoPage from './pages/DemoPage';
import { ToastContainer } from './components/modal';
import './App.css';
import './components/modal/Toast.css';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/new/*" element={<NewRecordPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/test" element={<TestCutout />} />
          <Route path="/demo" element={<DemoPage />} />
        </Routes>
        <ToastContainer />
      </div>
    </HashRouter>
  );
}

export default App;
