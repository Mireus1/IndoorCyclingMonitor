import {
  Button,
  List,
  ListItem,
  ListItemContent,
  Modal,
  ModalClose,
  Sheet,
  Stack,
  Typography
} from '@mui/joy'
import { useEffect, useState } from 'react'

interface Sensor {
  name: string // unique key, e.g. "PowerMeter_5_7504"
  pretty: string // human‐friendly, e.g. "PowerMeter:7504"
}

export function SensorModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connected, setConnected] = useState<Set<string>>(new Set())

  // Fetch sensor list when modal opens
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('http://127.0.0.1:8000/sensors')
      .then((res) => res.json())
      .then((data: Sensor[]) => setSensors(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [open])

  const handleConnect = (sensor: Sensor) => {
    setConnecting(sensor.name)
    fetch(
      `http://127.0.0.1:8000/sensors/${encodeURIComponent(
        sensor.name
      )}/connect`,
      {
        method: 'POST'
      }
    )
      .then((res) => {
        console.log(res)
        if (!res.ok) throw new Error('Connect failed')
        return res.json()
      })
      .then(() => {
        setConnected(new Set(connected).add(sensor.name))
      })
      .catch((err) => {
        console.error(err)
        alert(`Could not connect to ${sensor.pretty}`)
      })
      .finally(() => {
        setConnecting(null)
      })
  }

  return (
    <Modal
      aria-labelledby='modal-title'
      aria-describedby='modal-desc'
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Sheet
        variant='outlined'
        sx={{
          maxWidth: '90vw',
          width: 400,
          borderRadius: 'md',
          p: 2,
          boxShadow: 'lg'
        }}
      >
        <ModalClose
          variant='plain'
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
        <Typography id='modal-title' level='h4' mb={1}>
          Connect your sensors
        </Typography>
        <Typography id='modal-desc' mb={2}>
          Select a sensor below and hit “Connect.”
        </Typography>

        {loading ? (
          <Typography>Scanning for sensors…</Typography>
        ) : sensors.length === 0 ? (
          <Typography>No sensors found.</Typography>
        ) : (
          <List>
            {sensors.map((sensor) => {
              const isConnecting = connecting === sensor.name
              const isConnected = connected.has(sensor.name)
              return (
                <ListItem key={sensor.name} sx={{ py: 1 }}>
                  <ListItemContent>
                    <Stack
                      direction='row'
                      alignItems='center'
                      justifyContent='space-between'
                    >
                      <Typography>{sensor.pretty}</Typography>
                      <Button
                        size='sm'
                        variant={isConnected ? 'soft' : 'outlined'}
                        disabled={isConnecting || isConnected}
                        onClick={() => handleConnect(sensor)}
                      >
                        {isConnected
                          ? 'Connected'
                          : isConnecting
                          ? 'Connecting…'
                          : 'Connect'}
                      </Button>
                    </Stack>
                  </ListItemContent>
                </ListItem>
              )
            })}
          </List>
        )}
      </Sheet>
    </Modal>
  )
}
