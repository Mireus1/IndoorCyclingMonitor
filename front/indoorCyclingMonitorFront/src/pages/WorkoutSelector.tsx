import SearchIcon from '@mui/icons-material/Search'
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
import { CssVarsProvider } from '@mui/joy/styles'
import { useState } from 'react'

const workouts = [
  { title: 'Hold 200 W for 2 minutes', duration: '2:00' },
  { title: 'Sprint 400 W for 30 sec', duration: '0:30' },
  { title: 'Recovery Ride at 100 W', duration: '5:00' },
  { title: 'Hill Climb Simulation', duration: '3:00' },
  { title: 'Cadence Drill at 90 RPM', duration: '4:00' },
  { title: 'Tempo Ride at 180 W', duration: '10:00' },
  { title: 'Endurance Block', duration: '20:00' },
  { title: 'VO2 Max Burst', duration: '1:00' },
  { title: 'Warm Up', duration: '5:00' },
  { title: 'Cool Down', duration: '5:00' }
]

export default function WorkoutSelector() {
  const [filteredWorkouts, setFilteredWorkouts] = useState(workouts)

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
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography level='h4'>Select Workout</Typography>
          <Autocomplete
            options={workouts.map((w) => w.title)}
            placeholder='Search workouts...'
            onInputChange={(event, value) => {
              const filtered = workouts.filter((w) =>
                w.title.toLowerCase().includes(value.toLowerCase())
              )
              setFilteredWorkouts(filtered.length ? filtered : workouts)
            }}
            sx={{ width: '50%' }}
            startDecorator={<SearchIcon />}
            variant='outlined'
          />
        </Sheet>

        {/* Grid section */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            width: '100%'
          }}
        >
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
              gap: 3,
              width: '100%',
              height: '100%'
            }}
          >
            {filteredWorkouts.map((workout, index) => (
              <Card
                key={index}
                size='lg'
                variant='outlined'
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 'lg'
                  }
                }}
              >
                <CardContent>
                  <Typography level='title-md' mb={1}>
                    {workout.title}
                  </Typography>
                  <Typography level='body-sm' color='neutral'>
                    Duration: {workout.duration}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={() => alert(`Selected: ${workout.title}`)}
                    sx={{ mb: 1 }}
                  >
                    View Workout
                  </Button>
                  <Button
                    fullWidth
                    variant='solid'
                    color='success'
                    onClick={() => alert(`Selected: ${workout.title}`)}
                  >
                    Start
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </CssVarsProvider>
  )
}
