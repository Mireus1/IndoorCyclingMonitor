import FlashOnIcon from '@mui/icons-material/FlashOn'
import TimerIcon from '@mui/icons-material/Timer'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import Chip from '@mui/joy/Chip'
import List from '@mui/joy/List'
import ListItem from '@mui/joy/ListItem'
import Typography from '@mui/joy/Typography'
import { useEffect, useState } from 'react'

// Sample workout data
const workoutData = [
  { time: 120, watts: 200 },
  { time: 90, watts: 180 },
  { time: 90, watts: 180 },
  { time: 90, watts: 180 },
  { time: 90, watts: 180 },
  { time: 60, watts: 220 },
  { time: 150, watts: 190 }
]

// Function to format time (e.g., 120 seconds → "02:00")
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function WorkoutList() {
  const [currentStep, setCurrentStep] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < workoutData.length - 1 ? prev + 1 : prev
      )
    }, workoutData[currentStep].time * 1000) // Move to the next step after the duration

    return () => clearInterval(interval)
  }, [currentStep])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Typography level='h4' sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        Workout Intervals
      </Typography>

      <List
        size='sm'
        sx={{
          '--ListItem-radius': '8px',
          '--List-gap': '10px',
          height: '80vh',
          overflow: 'auto'
        }}
      >
        {workoutData.map((interval, index) => (
          <ListItem key={index} sx={{ width: '100%' }}>
            <Card
              variant={index === currentStep ? 'solid' : 'outlined'}
              color={index === currentStep ? 'primary' : 'neutral'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                width: '100%',
                borderRadius: '8px',
                transition: '0.3s ease-in-out',
                boxShadow: index === currentStep ? 'lg' : 'sm'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon fontSize='small' />
                <Typography>{formatTime(interval.time)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlashOnIcon fontSize='small' />
                <Typography>{interval.watts} W</Typography>
              </Box>
              {index === currentStep && (
                <Chip size='sm' color='success'>
                  Active
                </Chip>
              )}
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
