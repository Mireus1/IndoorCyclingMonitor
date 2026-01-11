import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import SearchIcon from '@mui/icons-material/Search'
import Sensors from '@mui/icons-material/Sensors'
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CssBaseline,
  Sheet,
  Tooltip,
  Typography
} from '@mui/joy'
import IconButton from '@mui/joy/IconButton'
import { CssVarsProvider } from '@mui/joy/styles'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FTPModal } from '../components/FtpModal'
import { SensorModal } from '../components/SensorModal'
import { ViewWorkoutModal } from '../components/ViewWorkoutModal'
import type { Step } from '../entities/step'
import useCyclingDataStore from '../store/useCyclingDataStore'
import useWorkoutStore from '../store/useWorkoutStore'

const FAVORITES_KEY = 'icm:favorites'

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
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [canDeleteWorkouts, setCanDeleteWorkouts] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openSensorModal, setOpenSensorModal] = useState(false)
  const [openViewWorkoutModal, setOpenViewWorkoutModal] = useState(false)
  const [openFTPModal, setOpenFTPModal] = useState(false)
  const [viewWorkout, setViewWorkout] = useState<WorkoutItem | null>(null)

  const userFTP = useCyclingDataStore((s) => s.userFTP)

  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter((id) => typeof id === 'string'))
        }
      }
    } catch {
      setFavorites([])
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch {
      // ignore write errors (private mode, disabled storage)
    }
  }, [favorites])

  useEffect(() => {
    let isMounted = true
    const checkDelete = async () => {
      if (window.icm?.canDeleteWorkouts) {
        const allowed = await window.icm.canDeleteWorkouts()
        if (isMounted) setCanDeleteWorkouts(Boolean(allowed))
      }
    }
    checkDelete()
    return () => {
      isMounted = false
    }
  }, [])

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

  const handleStartWorkout = (workout: WorkoutItem) => {
    setLoadingId(workout.id)
    // Your store expects the steps array (your JSON shape)
    setWorkout(workout.steps)

    setTimeout(() => {
      setLoadingId(null)
      navigate('/home')
    }, 600)
  }

  const handleViewWorkout = (workout: WorkoutItem) => {
    setViewWorkout(workout)
    setOpenViewWorkoutModal(true)
  }

  const toggleFavorite = (workoutId: string) => {
    setFavorites((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId]
    )
  }

  const handleDeleteWorkout = async (workout: WorkoutItem) => {
    if (!window.icm?.deleteWorkout) {
      window.alert('Delete is only available in the desktop app.')
      return
    }
    if (!canDeleteWorkouts) {
      window.alert('Delete is disabled in packaged builds.')
      return
    }
    const confirmDelete = window.confirm(
      `Delete "${workout.title}"? This will remove the JSON file.`
    )
    if (!confirmDelete) return

    setDeletingId(workout.id)
    const result = await window.icm.deleteWorkout(workout.id)
    setDeletingId(null)

    if (!result?.ok) {
      window.alert(`Failed to delete: ${result?.error ?? 'unknown error'}`)
      return
    }

    setAllWorkouts((prev) => prev.filter((w) => w.id !== workout.id))
    setFilteredWorkouts((prev) => prev.filter((w) => w.id !== workout.id))
    setFavorites((prev) => prev.filter((id) => id !== workout.id))

    if (viewWorkout?.id === workout.id) {
      setOpenViewWorkoutModal(false)
      setViewWorkout(null)
    }
  }

  const sortedWorkouts = useMemo(() => {
    const favoriteSet = new Set(favorites)
    return [...filteredWorkouts].sort((a, b) => {
      const aFav = favoriteSet.has(a.id) ? 0 : 1
      const bFav = favoriteSet.has(b.id) ? 0 : 1
      if (aFav !== bFav) return aFav - bFav
      return a.title.localeCompare(b.title)
    })
  }, [favorites, filteredWorkouts])

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
            {sortedWorkouts.map((workout) => {
              const isFavorite = favorites.includes(workout.id)
              return (
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
                <CardContent
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1
                    }}
                  >
                    <Typography level='title-md'>{workout.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip
                        title={isFavorite ? 'Unfavorite' : 'Favorite'}
                      >
                        <IconButton
                          size='sm'
                          variant='plain'
                          color={isFavorite ? 'warning' : 'neutral'}
                          onClick={() => toggleFavorite(workout.id)}
                        >
                          {isFavorite ? (
                            <StarRoundedIcon />
                          ) : (
                            <StarBorderRoundedIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          canDeleteWorkouts
                            ? 'Delete workout file'
                            : 'Delete is disabled here'
                        }
                      >
                        <IconButton
                          size='sm'
                          variant='plain'
                          color='danger'
                          disabled={!canDeleteWorkouts || deletingId === workout.id}
                          onClick={() => handleDeleteWorkout(workout)}
                        >
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
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
                    loading={loadingId === workout.id}
                    onClick={() => handleStartWorkout(workout)}
                  >
                    Start
                  </Button>
                </Box>
              </Card>
            )
            })}
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
