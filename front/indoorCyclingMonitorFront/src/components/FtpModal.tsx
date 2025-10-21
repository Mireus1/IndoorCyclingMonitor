// FTPModal.tsx
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  Sheet,
  Stack,
  Typography
} from '@mui/joy'
import { useEffect, useMemo, useState } from 'react'
import useCyclingDataStore from '../store/useCyclingDataStore'

export function FTPModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const userFTP = useCyclingDataStore((s) => s.userFTP)
  const setUserFTP = useCyclingDataStore((s) => s.setUserFTP)

  // Local input state (string to allow empty / partial typing)
  const [ftpInput, setFtpInput] = useState<string>('')

  useEffect(() => {
    if (open) setFtpInput(userFTP != null ? String(userFTP) : '')
  }, [open, userFTP])

  const parsed = useMemo(() => {
    const n = Number(ftpInput)
    return Number.isFinite(n) ? n : NaN
  }, [ftpInput])

  const errorText = useMemo(() => {
    if (ftpInput.trim() === '') return ''
    if (Number.isNaN(parsed)) return 'Enter a valid number'
    // Gentle bounds: allow 50–600W (covers almost all athletes)
    if (parsed < 50) return 'That seems too low (min 50 W)'
    if (parsed > 600) return 'That seems too high (max 600 W)'
    return ''
  }, [ftpInput, parsed])

  const canSave = ftpInput.trim() !== '' && !Number.isNaN(parsed) && !errorText

  const handleSave = () => {
    if (!canSave) return
    setUserFTP(parsed)
    onClose()
  }

  const handleClear = () => {
    setUserFTP(null)
    setFtpInput('')
  }

  return (
    <Modal
      aria-labelledby='ftp-modal-title'
      aria-describedby='ftp-modal-desc'
      open={open}
      onClose={onClose}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Sheet
        variant='outlined'
        sx={{
          maxWidth: '90vw',
          width: 420,
          borderRadius: 'md',
          p: 2.5,
          boxShadow: 'lg',
          position: 'relative'
        }}
      >
        <ModalClose
          variant='plain'
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />

        <Typography id='ftp-modal-title' level='h4' mb={1}>
          Set your FTP
        </Typography>
        <Typography id='ftp-modal-desc' mb={2}>
          Enter your Functional Threshold Power (in watts). We'll store it and
          show it in your workouts.
        </Typography>

        <FormControl error={!!errorText} sx={{ mb: 2 }}>
          <FormLabel>FTP (W)</FormLabel>
          <Input
            type='number'
            value={ftpInput}
            onChange={(e) => setFtpInput(e.target.value)}
            slotProps={{
              input: { min: 50, max: 600, step: 1, inputMode: 'numeric' }
            }}
            placeholder='e.g. 250'
          />
        </FormControl>

        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          {userFTP != null && (
            <Button variant='outlined' color='neutral' onClick={handleClear}>
              Clear
            </Button>
          )}
          <Button variant='soft' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </Stack>
      </Sheet>
    </Modal>
  )
}
