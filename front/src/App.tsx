import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom'

import Home from './pages/Home'
import NotFound from './pages/NotFound'
import WorkoutSelector from './pages/WorkoutSelector'

export default function App() {
  const routes = (
    <Routes>
      <Route path='/' element={<Navigate to='/select' replace />} />
      <Route path='/home' element={<Home />} />
      <Route path='/select' element={<WorkoutSelector />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )

  return window.location.protocol === 'file:' ? (
    <HashRouter>{routes}</HashRouter>
  ) : (
    <BrowserRouter>{routes}</BrowserRouter>
  )
}
