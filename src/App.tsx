import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Day1Upload } from './pages/Day1Upload';
import { Day2Mapping } from './pages/Day2Mapping';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Day1Upload />} />
          <Route path="/map" element={<Day2Mapping />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
