
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Assignments from './pages/Assignments';
import Categories from './pages/Categories';
import Locations from './pages/Locations';
import Statistics from './pages/Statistics';
import Interpreters from './pages/Interpreters';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/toaster';
import { DataProvider } from './contexts/DataContext';

function App() {
  // Basispfad für das Routing
  const basePath = '/interpreter-app';

  return (
    <DataProvider>
      <Router basename={basePath}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/interpreters" element={<Interpreters />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </DataProvider>
  );
}

export default App;
