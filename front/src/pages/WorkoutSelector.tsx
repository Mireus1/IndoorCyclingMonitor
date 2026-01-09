import SearchIcon from '@mui/icons-material/Search'
import Sensors from '@mui/icons-material/Sensors'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Sheet,
  Typography
} from '@mui/joy'
import IconButton from '@mui/joy/IconButton'
import { CssVarsProvider } from '@mui/joy/styles'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FTPModal } from '../components/FtpModal'
import { SensorModal } from '../components/SensorModal'
import { ViewWorkoutModal } from '../components/ViewWorkoutModal'
import useCyclingDataStore from '../store/useCyclingDataStore'
import useWorkoutStore from '../store/useWorkoutStore'

// Step shape based on your example
type Step = {
  ftp_percent: number | null
  duration: number // seconds
  rpm: number | null
  progressive_range: { from: number; to: number } | null
}

// One workout per file
type WorkoutItem = {
  id: string // slug from filename (e.g. "workout1")
  title: string // humanized from filename (e.g. "Workout 1")
  durationLabel: string // computed MM:SS
  steps: Step[] // the JSON array
}

function secondsToClock(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}`
}

function humanizeFileName(fileName: string): string {
  const base = fileName.replace(/\.json$/i, '')
  // replace separators with spaces and title-case
  return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function WorkoutSelector() {
  const { setWorkout } = useWorkoutStore()
  const [allWorkouts, setAllWorkouts] = useState<WorkoutItem[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutItem[]>([])
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
  const [openSensorModal, setOpenSensorModal] = useState(false)
  const [openViewWorkoutModal, setOpenViewWorkoutModal] = useState(false)
  const [openFTPModal, setOpenFTPModal] = useState(false)
  const [viewWorkout, setViewWorkout] = useState<WorkoutItem | null>(null)

  const userFTP = useCyclingDataStore((s) => s.userFTP)

  const navigate = useNavigate()

  // Load all workouts from src/constants/*.json
  useEffect(() => {
    const modules = import.meta.glob('../constants/workouts/*.json', {
      eager: true
    })

    const items: WorkoutItem[] = Object.entries(modules).map(([path, mod]) => {
      // Vite eager JSON modules expose the value on `default`
      const maybeModule = mod as any
      const steps: Step[] = Array.isArray(maybeModule?.default)
        ? maybeModule.default
        : Array.isArray(maybeModule)
        ? maybeModule
        : []

      const fileName = path.split('/').pop() || 'workout'
      const id = fileName.replace(/\.json$/i, '')
      const title = humanizeFileName(fileName)

      const totalSeconds = steps.reduce((acc, s) => acc + (s?.duration ?? 0), 0)

      return {
        id,
        title,
        durationLabel: secondsToClock(totalSeconds),
        steps
      }
    })

    // Keep only valid arrays
    const valid = items.filter(
      (w) => Array.isArray(w.steps) && w.steps.length > 0
    )

    // Sort for stability
    valid.sort((a, b) => a.title.localeCompare(b.title))

    setAllWorkouts(valid)
    setFilteredWorkouts(valid)
  }, [])

  const workoutTitles = useMemo(
    () => filteredWorkouts.map((w) => w.title),
    [filteredWorkouts]
  )

  const handleSearch = (_: unknown, value: string) => {
    const v = value.trim().toLowerCase()
    if (!v) {
      setFilteredWorkouts(allWorkouts)
      return
    }
    const filtered = allWorkouts.filter(
      (w) => w.title.toLowerCase().includes(v) || w.id.toLowerCase().includes(v)
    )
    setFilteredWorkouts(filtered.length ? filtered : allWorkouts)
  }

  const handleStartWorkout = (workout: WorkoutItem, index: number) => {
    setLoadingIndex(index)
    // Your store expects the steps array (your JSON shape)
    setWorkout(workout.steps)

    setTimeout(() => {
      setLoadingIndex(null)
      navigate('/home')
    }, 600)
  }

  const handleViewWorkout = (workout: WorkoutItem) => {
    setViewWorkout(workout)
    setOpenViewWorkoutModal(true)
  }

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: 'background.body'
        }}
      >
        {/* Top bar */}
        <Sheet
          variant='solid'
          color='neutral'
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography level='h4'>Select Workout</Typography>

          <Autocomplete
            options={workoutTitles}
            placeholder='Search workouts...'
            onInputChange={handleSearch}
            sx={{ width: '50%' }}
            startDecorator={<SearchIcon />}
            variant='outlined'
            freeSolo
          />

          <IconButton
            variant='solid'
            color='primary'
            size='lg'
            onClick={() => setOpenFTPModal(true)}
          >
            {userFTP ? userFTP : 'SET'} FTP
          </IconButton>

          <FTPModal
            open={openFTPModal}
            onClose={() => setOpenFTPModal(false)}
          />

          <IconButton
            variant='solid'
            color='primary'
            size='lg'
            onClick={() => setOpenSensorModal(true)}
          >
            <Sensors />
          </IconButton>

          <SensorModal
            open={openSensorModal}
            onClose={() => setOpenSensorModal(false)}
          />
        </Sheet>

        {/* Grid */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, width: '100%' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
                xl: 'repeat(5, 1fr)'
              },
              gap: 3
            }}
          >
            {filteredWorkouts.map((workout, index) => (
              <Card
                key={workout.id}
                size='lg'
                variant='outlined'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 'lg' }
                }}
              >
                <CardContent>
                  <Typography level='title-md' mb={1}>
                    {workout.title}
                  </Typography>
                  <Typography level='body-sm' color='neutral'>
                    Duration: {workout.durationLabel}
                  </Typography>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => handleViewWorkout(workout)}
                    sx={{ mb: 1 }}
                  >
                    View Workout
                  </Button>
                  <Button
                    fullWidth
                    variant='solid'
                    color='success'
                    loading={loadingIndex === index}
                    onClick={() => handleStartWorkout(workout, index)}
                  >
                    Start
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Single modal instance bound to the selected workout */}
      <ViewWorkoutModal
        open={openViewWorkoutModal}
        onClose={() => setOpenViewWorkoutModal(false)}
        title={viewWorkout?.title ?? ''}
        steps={viewWorkout?.steps ?? []}
      />
    </CssVarsProvider>
  )
}
