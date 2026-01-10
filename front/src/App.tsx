import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import Home from './pages/Home'
import NotFound from './pages/NotFound'
import WorkoutSelector from './pages/WorkoutSelector'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to='/select' replace />} />
        <Route path='/home' element={<Home />} />
        <Route path='/select' element={<WorkoutSelector />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Router>
  )
}
