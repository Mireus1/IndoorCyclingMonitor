import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Card from '@mui/joy/Card'
import Chip from '@mui/joy/Chip'
import CssBaseline from '@mui/joy/CssBaseline'
import LinearProgress from '@mui/joy/LinearProgress'
import Stack from '@mui/joy/Stack'
import { CssVarsProvider } from '@mui/joy/styles'
import Typography from '@mui/joy/Typography'
import * as React from 'react'
import { useEffect, useMemo, useRef } from 'react'

import Header from '../components/Header'
import Layout from '../components/Layout'
import Navigation from '../components/Navigation'
import StatCardGrid from '../components/StatsCardGrid'
import { CardStat } from '../entities/cardStat'
import { Step } from '../entities/step'

import trainingDataFallback from '../constants/workout1.json'
import { useWorkoutPlayer } from '../hooks/useWorkoutPlayer'
import useCyclingDataStore from '../store/useCyclingDataStore'
import useWorkoutStore from '../store/useWorkoutStore' // ← add this

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export default function Home() {
  const {
    power,
    heartRate,
    cadence,
    trainerSensorName,
    setCyclingData,
    setTrainerSensorName
  } = useCyclingDataStore()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  // ⬇️ read selected workout from the store
  const { selectedWorkout } = useWorkoutStore()

  // selectedWorkout can be either an array of Step (recommended) or an object with .steps
  const workoutSteps: Step[] = useMemo(() => {
    if (Array.isArray(selectedWorkout)) return selectedWorkout as Step[]
    if (selectedWorkout && Array.isArray((selectedWorkout as any).steps)) {
      return (selectedWorkout as any).steps as Step[]
    }
    return trainingDataFallback as Step[] // fallback if nothing was selected
  }, [selectedWorkout])

  const {
    currentStep,
    currentStepIndex,
    timeLeft,
    elapsedTime,
    totalDuration,
    workoutProgress,
    isRunning,
    isFinished,
    hasStarted,
    start,
    pause,
    resume,
    next,
    stepCounter,
    reset,
    progress
  } = useWorkoutPlayer(workoutSteps) // ← use the selected (or fallback) steps

  type FtpZone = {
    name: string
    maxRatio: number
    color: string
  }

  const FTP_ZONES: FtpZone[] = [
    { name: 'Zone 1', maxRatio: 0.55, color: 'success' },
    { name: 'Zone 2', maxRatio: 0.75, color: 'primary' },
    { name: 'Zone 3', maxRatio: 0.9, color: 'warning' },
    { name: 'Zone 4', maxRatio: 1.05, color: 'danger' },
    { name: 'Zone 5', maxRatio: Infinity, color: 'danger' }
  ]

  function getPowerZoneColor(currentWatt: number, ftpUser: number): string {
    const ratio = currentWatt / ftpUser
    const zone = FTP_ZONES.find((z) => ratio <= z.maxRatio)
    return zone?.color ?? FTP_ZONES[FTP_ZONES.length - 1].color
  }

  function getFtpTarget(
    step: Step,
    ftpUser: number = 250,
    timeLeft: number
  ): number {
    const elapsedTime = step.duration - Math.round(timeLeft)

    if (step.ftp_percent != null) {
      return Math.round((step.ftp_percent / 100) * ftpUser)
    }

    if (
      step.progressive_range &&
      typeof step.duration === 'number' &&
      step.duration > 0
    ) {
      const { from, to } = step.progressive_range
      const startW = Math.round((from / 100) * ftpUser)
      const maxW = Math.round((to / 100) * ftpUser)
      const t = Math.min(Math.max(elapsedTime, 0), step.duration)
      const intervals = Math.floor(t / 10)
      const target = startW + intervals * 10
      return Math.min(target, maxW)
    }

    // If step is not yet available (e.g., before hook initializes), be gentle:
    return Math.round(0.5 * ftpUser)
  }

  function formatSecondsToMinutes(seconds: number): string {
    const totalSeconds = Math.round(seconds)
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  function describePowerTarget(step: Step | null): string {
    if (!step) return 'No interval queued'
    if (step.progressive_range) {
      return `${step.progressive_range.from}% → ${step.progressive_range.to}% FTP`
    }
    if (step.ftp_percent != null) {
      return `${step.ftp_percent}% FTP`
    }
    return 'Recovery ride'
  }

  function describeCadenceTarget(step: Step | null): string {
    if (!step || step.rpm == null) return 'Free cadence'
    return `${step.rpm} rpm`
  }

  const timeRemaining = Math.max(totalDuration - elapsedTime, 0)
  const nextStep = workoutSteps[currentStepIndex + 1] ?? null
  const nextTargetW = nextStep
    ? getFtpTarget(nextStep, 250, nextStep.duration)
    : 0
  const workoutProgressValue = Number.isFinite(workoutProgress)
    ? Math.min(Math.max(workoutProgress ?? 0, 0), 100)
    : 0
  const stepProgressValue = Math.min(Math.max(progress ?? 0, 0), 100)
  const nextStepCounter = nextStep
    ? `${currentStepIndex + 2}/${workoutSteps.length}`
    : null

  // Guard for when currentStep might be undefined momentarily
  const safeStep: Step | null = currentStep ?? workoutSteps[0] ?? null
  const targetW = safeStep ? getFtpTarget(safeStep, 250, timeLeft) : 0
  const zoneColor = safeStep ? getPowerZoneColor(targetW, 250) : 'neutral'

  const primaryButton = (() => {
    if (isFinished) {
      return {
        label: 'Restart workout',
        action: start,
        color: 'success' as const
      }
    }
    if (!hasStarted) {
      return {
        label: 'Start workout',
        action: start,
        color: 'success' as const
      }
    }
    if (isRunning) {
      return { label: 'Pause', action: pause, color: 'warning' as const }
    }
    return { label: 'Resume', action: resume, color: 'success' as const }
  })()

  const canSkipInterval = Boolean(nextStep && hasStarted && !isFinished)
  const ergCommandRef = useRef<string | null>(null)
  const shouldControlErg =
    safeStep && (safeStep.ftp_percent != null || safeStep.progressive_range)

  useEffect(() => {
    let isMounted = true

    const fetchSensorData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/sensors/data`)
        if (!response.ok) {
          throw new Error(`Failed to fetch sensor data (${response.status})`)
        }
        const payload = await response.json()
        if (!isMounted) return

        const sensorReadings: Record<string, any> = payload?.data ?? {}
        let nextPower: number | null = null
        let nextCadence: number | null = null
        let nextHeartRate: number | null = null
        let nextTrainerSensor: string | null = null

        Object.entries(sensorReadings).forEach(([sensorName, reading]) => {
          if (typeof reading?.power === 'number') {
            nextPower = reading.power
            nextTrainerSensor = sensorName
          }
          if (typeof reading?.cadence === 'number') {
            nextCadence = reading.cadence
          }
          if (typeof reading?.heart_rate === 'number') {
            nextHeartRate = reading.heart_rate
          }
        })

        setCyclingData({
          power: nextPower,
          heartRate: nextHeartRate,
          cadence: nextCadence
        })
        if (nextTrainerSensor) {
          setTrainerSensorName(nextTrainerSensor)
        }
      } catch (error) {
        console.error('Failed to load sensor data', error)
      }
    }

    fetchSensorData()
    const interval = setInterval(fetchSensorData, 1000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [setCyclingData, setTrainerSensorName])

  useEffect(() => {
    if (
      !trainerSensorName ||
      !shouldControlErg ||
      !hasStarted ||
      isFinished ||
      !safeStep
    ) {
      return
    }

    const target = Math.round(targetW)
    if (!Number.isFinite(target) || target <= 0) return

    const commandKey = `${trainerSensorName}-${currentStepIndex}-${target}`
    if (ergCommandRef.current === commandKey) return
    ergCommandRef.current = commandKey

    const controller = new AbortController()

    const path = `${API_BASE_URL}/sensors/${encodeURIComponent(
      'FitnessEquipment_5_7504'
    )}/erg/${target}`

    fetch(path, {
      method: 'POST',
      signal: controller.signal
    }).catch((error) => {
      console.error('Failed to update ERG target', error)
    })

    return () => controller.abort()
  }, [
    trainerSensorName,
    shouldControlErg,
    hasStarted,
    isFinished,
    currentStepIndex,
    targetW,
    safeStep
  ])
  const statsData: CardStat[] = [
    {
      color: zoneColor,
      title: 'Power output',
      value: power ?? '--',
      unit: 'W',
      helperText: safeStep ? `Target ${targetW} W` : 'Load a workout'
    },
    {
      color: 'danger',
      title: 'Heart rate',
      value: heartRate ?? '--',
      unit: 'bpm',
      helperText: 'Live heart rate'
    },
    {
      color: 'primary',
      title: 'Cadence',
      value: cadence ?? '--',
      unit: 'rpm',
      helperText: safeStep?.rpm
        ? `Aim for ${safeStep.rpm} rpm`
        : 'No cadence target'
    }
  ]

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />

      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation
            workoutData={workoutSteps} // ← use selected workout
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
          />
        </Layout.SideDrawer>
      )}

      <Stack
        id='tab-bar'
        direction='row'
        spacing={1}
        sx={{
          justifyContent: 'space-around',
          display: { xs: 'flex', sm: 'none' },
          zIndex: 999,
          bottom: 0,
          position: 'fixed',
          width: '100dvw',
          py: 2,
          backgroundColor: 'background.body',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      />

      <Layout.Root
        sx={[
          {
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'minmax(64px, 200px) minmax(450px, 1fr)',
              md: 'minmax(160px, 300px) minmax(600px, 1fr)'
            }
          },
          drawerOpen && { height: '100vh', overflow: 'hidden' }
        ]}
      >
        <Layout.Header>
          <Header
            workoutElapsedSeconds={elapsedTime}
            workoutTotalSeconds={totalDuration}
            isWorkoutRunning={isRunning}
            hasWorkoutStarted={hasStarted}
            isWorkoutFinished={isFinished}
          />
        </Layout.Header>

        <Layout.SideNav>
          <Navigation
            workoutData={workoutSteps} // ← use selected workout
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
          />
        </Layout.SideNav>

        <Layout.Main>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'repeat(2, minmax(0, 1fr))'
                },
                gap: 3
              }}
            >
              <Card
                variant='outlined'
                sx={{
                  p: { xs: 2, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography
                      level='body-sm'
                      textColor='text.tertiary'
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
                    >
                      Session progress
                    </Typography>
                    <Typography level='h3'>
                      {formatSecondsToMinutes(elapsedTime)} /{' '}
                      {formatSecondsToMinutes(totalDuration)}
                    </Typography>
                  </Box>
                  <Chip size='sm' variant='soft' color='neutral'>
                    {stepCounter}
                  </Chip>
                </Box>
                <LinearProgress
                  determinate
                  value={workoutProgressValue}
                  sx={{ borderRadius: 999 }}
                  color='primary'
                />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2
                  }}
                >
                  <Box>
                    <Typography level='body-xs' textColor='text.tertiary'>
                      Elapsed
                    </Typography>
                    <Typography level='title-lg'>
                      {formatSecondsToMinutes(elapsedTime)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography level='body-xs' textColor='text.tertiary'>
                      Remaining
                    </Typography>
                    <Typography level='title-lg'>
                      {formatSecondsToMinutes(timeRemaining)}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    color={primaryButton.color}
                    onClick={primaryButton.action}
                  >
                    {primaryButton.label}
                  </Button>
                  <Button
                    variant='outlined'
                    color='neutral'
                    onClick={next}
                    disabled={!canSkipInterval}
                  >
                    Skip interval
                  </Button>
                  <Button variant='plain' color='neutral' onClick={reset}>
                    Reset
                  </Button>
                </Box>
              </Card>

              <Card
                variant='outlined'
                sx={{
                  p: { xs: 2, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography level='h4'>Current interval</Typography>
                  <Chip size='sm' color={zoneColor as any} variant='soft'>
                    {isFinished ? 'Done' : `Step ${stepCounter}`}
                  </Chip>
                </Box>
                {isFinished ? (
                  <Typography level='body-lg'>
                    Workout complete! Cool down and hydrate.
                  </Typography>
                ) : safeStep ? (
                  <>
                    <Typography level='body-md' textColor='text.tertiary'>
                      {describePowerTarget(safeStep)} ·{' '}
                      {describeCadenceTarget(safeStep)}
                    </Typography>
                    <Typography level='display-xs'>{targetW} W</Typography>
                    <Typography level='body-sm' textColor='text.tertiary'>
                      Time left {formatSecondsToMinutes(timeLeft)}
                    </Typography>
                    <LinearProgress
                      determinate
                      value={stepProgressValue}
                      sx={{ borderRadius: 999 }}
                      color={zoneColor as any}
                    />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(2, minmax(0, 1fr))'
                        },
                        gap: 2
                      }}
                    >
                      <Box>
                        <Typography level='body-xs' textColor='text.tertiary'>
                          Cadence target
                        </Typography>
                        <Typography level='title-lg'>
                          {describeCadenceTarget(safeStep)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography level='body-xs' textColor='text.tertiary'>
                          Interval duration
                        </Typography>
                        <Typography level='title-lg'>
                          {formatSecondsToMinutes(safeStep.duration)}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Typography level='body-md'>
                    Load a workout to get started.
                  </Typography>
                )}
              </Card>
            </Box>

            <Card
              variant='soft'
              sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px' }}
            >
              <Typography level='h4' sx={{ mb: 1 }}>
                Up next
              </Typography>
              {nextStep ? (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  <Typography level='title-lg'>
                    {describePowerTarget(nextStep)}
                  </Typography>
                  <Typography level='body-sm' textColor='text.tertiary'>
                    Duration {formatSecondsToMinutes(nextStep.duration)} ·{' '}
                    {describeCadenceTarget(nextStep)}
                  </Typography>
                  <Typography level='h3'>{nextTargetW} W</Typography>
                  {nextStepCounter && (
                    <Chip
                      size='sm'
                      variant='outlined'
                      color='neutral'
                      sx={{ width: 'fit-content' }}
                    >
                      Step {nextStepCounter}
                    </Chip>
                  )}
                </Box>
              ) : (
                <Typography level='body-md' textColor='text.tertiary'>
                  You are on the final interval. Finish strong!
                </Typography>
              )}
            </Card>

            <StatCardGrid stats={statsData} />
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  )
}
