import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Navbar from './components/Navbar';
import Home from './components/Home.jsx';
import ApplicationForm from './components/ApplicationForm.jsx';
import ApplicationsList from './components/ApplicationsList.jsx';
import CheckMark from './components/CheckMark.jsx';
import DigitalSignatures from './components/DigitalSignatures.jsx';
import Cartridges from './components/Cartridges.jsx';
import WriteOffAct from './components/ActForm.jsx';
import Barcodes from './components/Barcodes.jsx';
import ReportsPage from './components/ReportPage.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/application-form" element={<ApplicationForm />} />
          <Route path="/applications" element={<ApplicationsList />} />
          <Route path="/check-mark" element={<CheckMark />} />
          <Route path="/digital-signatures" element={<DigitalSignatures />} />
          <Route path="/cartridges" element={<Cartridges />} />
          <Route path="/acts" element={<WriteOffAct />} />
          <Route path="/barcodes" element={<Barcodes />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;