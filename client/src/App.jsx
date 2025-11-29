import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Forget from './pages/Forget';
import Reset from './pages/Reset';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard'

function App() {


  return (
    <BrowserRouter>
      <Routes>

        <Route path='/login' element={<Login/>}/>
        <Route path='/' element={<Signup/>}/>
        <Route path='/forget' element={<Forget/>}/>
        <Route path='/reset/:token' element={<Reset/>}/>

        {/* Protected route */}
        <Route path='/dashboard' element={
          <ProtectedRoute>
          <Dashboard/>
          </ProtectedRoute>
        }
        />

        
      </Routes>
    </BrowserRouter>
  )
}

export default App
