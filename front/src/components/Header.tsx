import Avatar from '@mui/joy/Avatar'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import DialogTitle from '@mui/joy/DialogTitle'
import Drawer from '@mui/joy/Drawer'
import Dropdown from '@mui/joy/Dropdown'
import IconButton from '@mui/joy/IconButton'
import ListDivider from '@mui/joy/ListDivider'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import ModalClose from '@mui/joy/ModalClose'
import Stack from '@mui/joy/Stack'
import { useColorScheme } from '@mui/joy/styles'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'
import * as React from 'react'

import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import HelpRoundedIcon from '@mui/icons-material/HelpRounded'
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'

import { useNavigate } from 'react-router-dom'

import Navigation from './Navigation'

type HeaderProps = {
  workoutElapsedSeconds?: number
  workoutTotalSeconds?: number
  isWorkoutRunning?: boolean
  hasWorkoutStarted?: boolean
  isWorkoutFinished?: boolean
}

function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) {
    return <IconButton size='sm' variant='outlined' color='primary' />
  }
  return (
    <Tooltip title='Change theme' variant='outlined'>
      <IconButton
        data-screenshot='toggle-mode'
        size='sm'
        variant='plain'
        color='neutral'
        sx={{ alignSelf: 'center' }}
        onClick={() => {
          if (mode === 'light') {
            setMode('dark')
          } else {
            setMode('light')
          }
        }}
      >
        {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  )
}

const formatClock = (seconds?: number) => {
  if (seconds == null || Number.isNaN(seconds)) return '--:--'
  const totalSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds
  ).padStart(2, '0')}`
}

export default function Header({
  workoutElapsedSeconds,
  workoutTotalSeconds,
  isWorkoutRunning,
  hasWorkoutStarted,
  isWorkoutFinished
}: HeaderProps) {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const timerDisplay =
    workoutTotalSeconds && workoutTotalSeconds > 0
      ? `${formatClock(workoutElapsedSeconds)} / ${formatClock(
          workoutTotalSeconds
        )}`
      : formatClock(workoutElapsedSeconds)

  let statusLabel = 'Idle'
  let statusColor: 'neutral' | 'success' | 'warning' | 'primary' = 'neutral'

  if (isWorkoutRunning) {
    statusLabel = 'Running'
    statusColor = 'success'
  } else if (isWorkoutFinished) {
    statusLabel = 'Complete'
    statusColor = 'primary'
  } else if (hasWorkoutStarted) {
    statusLabel = 'Paused'
    statusColor = 'warning'
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between' }}>
      <Stack
        direction='row'
        spacing={1}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          display: { xs: 'none', sm: 'flex' }
        }}
      >
        <IconButton
          size='md'
          variant='outlined'
          color='neutral'
          onClick={() => navigate('/select')}
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            borderRadius: '50%'
          }}
        >
          <LanguageRoundedIcon />
        </IconButton>
      </Stack>
      <Box sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
        <IconButton
          variant='plain'
          color='neutral'
          onClick={() => setOpen(true)}
        >
          <MenuRoundedIcon />
        </IconButton>
        <Drawer
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          open={open}
          onClose={() => setOpen(false)}
        >
          <ModalClose />
          <DialogTitle>Cyclindoors</DialogTitle>
          <Box sx={{ px: 1 }}>
            <Navigation />
          </Box>
        </Drawer>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1.5,
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            minWidth: 150
          }}
        >
          <Typography
            level='body-xs'
            textColor='text.tertiary'
            sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}
          >
            Workout Timer
          </Typography>
          <Typography level='title-md'>{timerDisplay}</Typography>
          <Chip size='sm' variant='soft' color={statusColor}>
            {statusLabel}
          </Chip>
        </Box>
        <ColorSchemeToggle />
        <Dropdown>
          <MenuButton
            variant='plain'
            size='sm'
            sx={{
              maxWidth: '32px',
              maxHeight: '32px',
              borderRadius: '9999999px'
            }}
          >
            <Avatar
              src='R'
              srcSet='R'
              sx={{ maxWidth: '32px', maxHeight: '32px' }}
            />
          </MenuButton>
          <Menu
            placement='bottom-end'
            size='sm'
            sx={{
              zIndex: '99999',
              p: 1,
              gap: 1,
              '--ListItem-radius': 'var(--joy-radius-sm)'
            }}
          >
            <MenuItem>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src='R' srcSet='R' sx={{ borderRadius: '50%' }} />
                <Box sx={{ ml: 1.5 }}>
                  <Typography level='title-sm' textColor='text.primary'>
                    Remi Poulenard
                  </Typography>
                  <Typography level='body-xs' textColor='text.tertiary'>
                    remi@email.com
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <ListDivider />
            <MenuItem>
              <HelpRoundedIcon />
              Help
            </MenuItem>
            <MenuItem>
              <SettingsRoundedIcon />
              Settings
            </MenuItem>
            <ListDivider />
            <MenuItem>
              <LogoutRoundedIcon />
              Log out
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </Box>
  )
}
