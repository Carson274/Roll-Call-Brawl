import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage/HomePage';
import ClassPage from './ClassPage/ClassPage';
import SignUpPage from './SignUpPage/SignUpPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/class/:classId" element={<ClassPage />} />
      </Routes>
    </Router>
  );
}

export default App;