import FlashOnIcon from '@mui/icons-material/FlashOn'
import TimerIcon from '@mui/icons-material/Timer'
import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import Chip from '@mui/joy/Chip'
import ListItem from '@mui/joy/ListItem'
import Typography from '@mui/joy/Typography'
import { useEffect, useRef } from 'react'
import { Step } from '../entities/Step'
import useCyclingDataStore from '../store/useCyclingDataStore'

interface WorkoutListProps {
  workoutData: Step[]
  currentStep: Step
  currentStepIndex: number
}

// Function to format time (e.g., 120 seconds → "02:00")
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const wattsFromPercent = (percent: number, ftp: number) =>
  Math.round((percent / 100) * ftp)

export default function WorkoutList({
  workoutData,
  currentStep,
  currentStepIndex
}: WorkoutListProps) {
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const userFTP = useCyclingDataStore((s) => s.userFTP)
  const hasUserFtp = userFTP != null && Number.isFinite(userFTP)

  useEffect(() => {
    const activeRef = itemRefs.current[currentStepIndex]
    if (activeRef) {
      activeRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentStepIndex])
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100vh',
        overflowY: 'auto'
      }}
    >
      <Typography level='h4' sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        Workout Intervals
      </Typography>

      {workoutData && workoutData.length > 0 ? (
        workoutData.map((interval, index) => {
          const isCurrent = index === currentStepIndex
          const isPowerTarget =
            interval.ftp_percent !== null && interval.ftp_percent !== undefined
          const isProgressive =
            interval.progressive_range !== null &&
            interval.progressive_range !== undefined
          const ftpValue = hasUserFtp ? userFTP! : null

          return (
            <ListItem
              key={index}
              sx={{ width: '100%' }}
              ref={(el) => (itemRefs.current[index] = el)}
            >
              <Card
                variant={isCurrent ? 'outlined' : 'solid'}
                color={isCurrent ? 'primary' : ''}
                outline-color={isCurrent ? 'primary' : 'neutral'}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  width: '100%',
                  borderRadius: '8px',
                  transition: '0.3s ease-in-out',
                  boxShadow: isCurrent ? 'lg' : 'sm'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimerIcon fontSize='small' />
                  <Typography>{formatTime(interval.duration)}</Typography>
                </Box>

                {isPowerTarget && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlashOnIcon fontSize='small' />
                    <Typography>
                      {ftpValue
                        ? `${wattsFromPercent(interval.ftp_percent!, ftpValue)} W`
                        : `${interval.ftp_percent} % FTP`}
                    </Typography>
                  </Box>
                )}

                {isProgressive && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlashOnIcon fontSize='small' />
                    <Typography>
                      {ftpValue
                        ? `Progressive ${wattsFromPercent(
                            interval.progressive_range!.from,
                            ftpValue
                          )} → ${wattsFromPercent(
                            interval.progressive_range!.to,
                            ftpValue
                          )} W`
                        : `Progressive ${interval.progressive_range!.from} → ${interval.progressive_range!.to} % FTP`}
                    </Typography>
                  </Box>
                )}

                {isCurrent && (
                  <Chip size='sm' color='success'>
                    Active
                  </Chip>
                )}
              </Card>
            </ListItem>
          )
        })
      ) : (
        <ListItem sx={{ justifyContent: 'center' }}>
          <Typography level='body-md' color='neutral'>
            No workout data available.
          </Typography>
        </ListItem>
      )}

      {/* <List
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
              variant={index === currentStepIndex ? 'solid' : 'outlined'}
              color={index === currentStepIndex ? 'primary' : 'neutral'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                width: '100%',
                borderRadius: '8px',
                transition: '0.3s ease-in-out',
                boxShadow: index === currentStepIndex ? 'lg' : 'sm'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon fontSize='small' />
                <Typography>{formatTime(interval.duration)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlashOnIcon fontSize='small' />
                <Typography>{interval.ftp_percent} W</Typography>
              </Box>
              {index === currentStepIndex && (
                <Chip size='sm' color='success'>
                  Active
                </Chip>
              )}
            </Card>
          </ListItem>
        ))}
      </List> */}
    </Box>
  )
}
