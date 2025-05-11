import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import CssBaseline from '@mui/joy/CssBaseline'
import Stack from '@mui/joy/Stack'
import { CssVarsProvider } from '@mui/joy/styles'
import Typography from '@mui/joy/Typography'
import * as React from 'react'
import { useEffect } from 'react'

import Header from '../components/Header'
import Layout from '../components/Layout'
import Navigation from '../components/Navigation'
import StatCardGrid from '../components/StatsCardGrid'
import { CardStat } from '../entities/cardStat'
import { Step } from '../entities/step'

import trainingData from '../constants/workout1.json'
import { useWorkoutPlayer } from '../hooks/useWorkoutPlayer'
import useCyclingDataStore from '../store/useCyclingDataStore'

export default function Home() {
  const { power, heartRate, cadence, setCyclingData } = useCyclingDataStore()
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const {
    currentStep,
    timeLeft,
    isRunning,
    isFinished,
    start,
    stop,
    next,
    stepCounter,
    reset
  } = useWorkoutPlayer(trainingData)

  type FtpZone = {
    name: string
    maxRatio: number // upper bound of the zone, as a fraction of FTP
    color: string // CSS color (hex or named)
  }

  const FTP_ZONES: FtpZone[] = [
    { name: 'Zone 1', maxRatio: 0.55, color: 'secondary' }, // Grey
    { name: 'Zone 2', maxRatio: 0.75, color: 'primary' }, // Blue
    { name: 'Zone 3', maxRatio: 0.9, color: 'success' }, // Green
    { name: 'Zone 4', maxRatio: 1.05, color: 'warning' }, // Orange
    { name: 'Zone 5', maxRatio: Infinity, color: 'danger' } // Red
  ]

  /**
   * Given current wattage and FTP, returns the CSS color for your power zone.
   * Zones are defined as:
   *   Zone 1: ≤ 55% FTP → Grey
   *   Zone 2: > 55%–75%   → Blue
   *   Zone 3: > 75%–90%   → Green
   *   Zone 4: > 90%–105%  → Orange
   *   Zone 5: > 105%      → Red
   */
  function getPowerZoneColor(currentWatt: number, ftpUser: number): string {
    const ratio = currentWatt / ftpUser

    // Find the first zone whose maxRatio >= our ratio
    const zone = FTP_ZONES.find((z) => ratio <= z.maxRatio)
    // Fallback just in case
    console.log(
      'Current color:',
      zone?.color ?? FTP_ZONES[FTP_ZONES.length - 1].color
    )
    return zone?.color ?? FTP_ZONES[FTP_ZONES.length - 1].color
  }

  function getFtpTarget(
    step: Step,
    ftpUser: number = 250,
    timeLeft: number
  ): number {
    const elapsedTime = step.duration - Math.round(timeLeft)
    // 1) Hard override if they give an absolute percent
    if (step.ftp_percent != null) {
      return Math.round((step.ftp_percent / 100) * ftpUser)
    }

    // 2) Progressive‐range mode: fixed 10 W steps every 10 s
    if (
      step.progressive_range &&
      typeof step.duration === 'number' &&
      step.duration > 0
    ) {
      const { from, to } = step.progressive_range

      // Compute start and max wattages
      const startW = Math.round((from / 100) * ftpUser)
      const maxW = Math.round((to / 100) * ftpUser)

      // Clamp elapsedTime to [0, duration]
      const t = Math.min(Math.max(elapsedTime, 0), step.duration)

      // How many full 10s intervals have passed?
      const intervals = Math.floor(t / 10)

      // Tentative target = start + 10 W per interval
      const target = startW + intervals * 10

      // Never go above the defined max
      return Math.min(target, maxW)
    }

    throw new Error(
      'Invalid step configuration: no ftp_percent or progressive_range'
    )
  }

  function formatSecondsToMinutes(seconds: number): string {
    const totalSeconds = Math.round(seconds) // <- This fixes the floating-point mess
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const statsData: CardStat[] = [
    {
      color: 'neutral',
      title: 'Watts ⚡️',
      value: 200
    },
    {
      color: 'neutral',
      title: 'Heart Rate (BPM) ❤️',
      value: 120
    },
    {
      color: 'neutral',
      title: 'Cadence (RPM) 🔄',
      value: 80
    }
  ]

  useEffect(() => {
    const fetchVitals = async () => {
      const response = await fetch('/api/vitals')
      const data = await response.json()
      setCyclingData({
        power: data.power,
        heartRate: data.heartRate,
        cadence: data.cadence
      })
    }

    fetchVitals()

    const interval = setInterval(fetchVitals, 500)
    return () => clearInterval(interval)
  }, [setCyclingData])

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />

      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation />
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
          drawerOpen && {
            height: '100vh',
            overflow: 'hidden'
          }
        ]}
      >
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation />
        </Layout.SideNav>
        <Layout.Main>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 3
              }}
            >
              <div>
                {isFinished ? (
                  <h1>Workout Complete!</h1>
                ) : (
                  <div>
                    <h2>Current Step {stepCounter}:</h2>
                    <pre>{JSON.stringify(currentStep, null, 2)}</pre>
                    <h3>Time Left: {formatSecondsToMinutes(timeLeft)}</h3>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button color='success' onClick={start}>
                    Start
                  </Button>
                  <Button color='primary' onClick={next}>
                    Next
                  </Button>
                  <Button color='danger' onClick={stop}>
                    Stop
                  </Button>
                  <Button color='warning' onClick={reset}>
                    Reset
                  </Button>
                </div>
              </div>
              <Card size='lg' orientation='horizontal' sx={{ width: '100%' }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  <Typography component='h2' level='h2'>
                    {formatSecondsToMinutes(timeLeft)}
                  </Typography>
                </CardContent>
              </Card>
              <Card
                size='lg'
                orientation='horizontal'
                sx={{ width: '100%' }}
                variant='outlined'
                color={
                  getPowerZoneColor(
                    getFtpTarget(currentStep, 250, timeLeft),
                    250
                  )
                    ? getPowerZoneColor(
                        getFtpTarget(currentStep, 250, timeLeft),
                        250
                      )
                    : 'neutral'
                }
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  <Typography component='h2' level='h2'>
                    Hold {getFtpTarget(currentStep, 250, timeLeft)} W for{' '}
                    {formatSecondsToMinutes(timeLeft)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <StatCardGrid stats={statsData} />
          </Box>
        </Layout.Main>
      </Layout.Root>
    </CssVarsProvider>
  )
}
