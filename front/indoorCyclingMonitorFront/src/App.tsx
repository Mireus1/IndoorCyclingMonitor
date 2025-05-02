import Box from '@mui/joy/Box'
import Card from '@mui/joy/Card'
import CardContent from '@mui/joy/CardContent'
import CssBaseline from '@mui/joy/CssBaseline'
import Stack from '@mui/joy/Stack'
import { CssVarsProvider } from '@mui/joy/styles'
import Typography from '@mui/joy/Typography'
import * as React from 'react'
import { useEffect } from 'react'

import Header from './components/Header'
import Layout from './components/Layout'
import Navigation from './components/Navigation'
import StatCardGrid from './components/StatsCardGrid'
import { CardStat } from './entities/cardStat'

import trainingData from './constants/workout1.json'
import { useWorkoutPlayer } from './hooks/useWorkoutPlayer'
import useCyclingDataStore from './store/useCyclingDataStore'

export default function FilesExample() {
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
                    <h3>Time Left: {timeLeft}s</h3>
                  </div>
                )}
                <button onClick={start}>Start</button>
                <button onClick={next}>Next</button>
                <button onClick={stop}>Stop</button>
                <button onClick={reset}>Reset</button>
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
                    2:00
                  </Typography>
                </CardContent>
              </Card>
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
                    Hold 200 W for 2 minutes
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
