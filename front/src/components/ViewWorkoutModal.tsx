import {
  Box,
  Chip,
  Divider,
  Modal,
  ModalClose,
  Sheet,
  Stack,
  Typography
} from '@mui/joy'
import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'

type ProgressiveRange = { from: number; to: number } | null

type Step = {
  ftp_percent: number | null
  duration: number // seconds
  rpm: number | null
  progressive_range: ProgressiveRange
}

function secToMMSS(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function sumDurations(steps: Step[]) {
  return steps.reduce((acc, s) => acc + s.duration, 0)
}

function avgIntensity(step: Step) {
  if (step.progressive_range) {
    return (step.progressive_range.from + step.progressive_range.to) / 2
  }
  return step.ftp_percent ?? 0
}

function zoneFor(ftpPercent: number) {
  if (ftpPercent <= 60) return { label: 'Recovery', color: 'neutral' as const }
  if (ftpPercent <= 75) return { label: 'Endurance', color: 'primary' as const }
  if (ftpPercent <= 90) return { label: 'Tempo', color: 'info' as const }
  if (ftpPercent <= 105)
    return { label: 'Threshold', color: 'warning' as const }
  if (ftpPercent <= 120) return { label: 'VO₂', color: 'danger' as const }
  return { label: 'Anaerobic', color: 'danger' as const }
}

function segmentStyle(
  step: Step,
  totalDuration: number,
  idx: number,
  lastIdx: number
) {
  const widthPct = (step.duration / totalDuration) * 100
  const isFirst = idx === 0
  const isLast = idx === lastIdx

  const baseSx: any = {
    width: `${Math.max(widthPct, 0.5)}%`, // prevent ultra-thin gaps
    height: 16,
    // use borders instead of inset boxShadow (cheaper to paint)
    borderRight: isLast
      ? 'none'
      : '1px solid var(--joy-palette-neutral-outlinedBorder)'
  }

  if (step.progressive_range) {
    baseSx.background =
      'linear-gradient(90deg, var(--joy-palette-info-softBg), var(--joy-palette-warning-softBg))'
  } else {
    const ftp = step.ftp_percent ?? 0
    const zone = zoneFor(ftp)
    baseSx.bgcolor =
      step.ftp_percent === null ? 'neutral.softBg' : `${zone.color}.solidBg`
  }

  if (isFirst) baseSx.borderRadius = '10px 0 0 10px'
  if (isLast) baseSx.borderRadius = isFirst ? '10px' : '0 10px 10px 0'

  return baseSx
}

export function ViewWorkoutModal({
  open,
  onClose,
  title = 'Workout',
  steps = []
}: {
  open: boolean
  onClose: () => void
  title?: string
  steps?: Step[]
}) {
  const total = React.useMemo(() => sumDurations(steps), [steps])
  const totalMins = Math.round(total / 60)

  // Precompute cheap, serializable row data to avoid recomputing on scroll
  const rows = React.useMemo(() => {
    return steps.map((s, i) => {
      const isProg = !!s.progressive_range
      const intensityLabel = isProg
        ? `${s.progressive_range!.from} → ${s.progressive_range!.to}%`
        : s.ftp_percent !== null
        ? `${s.ftp_percent}%`
        : '—'
      const z = zoneFor(avgIntensity(s))
      const zoneLabel = isProg ? 'Progressive' : z.label
      const zoneColor = isProg ? 'success' : z.color
      return {
        i,
        duration: secToMMSS(s.duration),
        rpm: s.rpm,
        intensityLabel,
        isProg,
        zoneLabel,
        zoneColor
      }
    })
  }, [steps])

  return (
    <Modal
      aria-labelledby='modal-title'
      aria-describedby='modal-desc'
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
    >
      <Sheet
        variant='outlined'
        sx={{
          width: '95vw',
          height: '80vh',
          maxWidth: '95vw',
          borderRadius: 'xl',
          p: { xs: 1.5, sm: 2.5 },
          boxShadow: 'lg',
          position: 'relative',
          bgcolor: 'background.surface'
        }}
      >
        <ModalClose
          variant='plain'
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12 }}
        />

        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent='space-between'
          mb={1}
        >
          <Stack spacing={0.5}>
            <Typography id='modal-title' level='h3' sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography id='modal-desc' level='body-sm' color='neutral'>
              {steps.length} steps • {secToMMSS(total)} total ({totalMins} min)
            </Typography>
          </Stack>
        </Stack>

        <Divider />

        <Box
          sx={{
            mt: 1,
            height: 600, // fixed viewport for Virtuoso
            borderRadius: 'md',
            overflow: 'hidden',
            border: '1px solid var(--joy-palette-neutral-outlinedBorder)'
          }}
        >
          {/* Sticky header */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: '56px 120px 1fr 120px 140px',
              gap: 0,
              alignItems: 'center',
              px: 1,
              py: 0.75,
              bgcolor: 'background.level1',
              borderBottom:
                '1px solid var(--joy-palette-neutral-outlinedBorder)'
            }}
          >
            <Typography level='body-xs' sx={{ fontWeight: 700 }}>
              #
            </Typography>
            <Typography level='body-xs' sx={{ fontWeight: 700 }}>
              Duration
            </Typography>
            <Typography level='body-xs' sx={{ fontWeight: 700 }}>
              Intensity
            </Typography>
            <Typography level='body-xs' sx={{ fontWeight: 700 }}>
              RPM
            </Typography>
            <Typography level='body-xs' sx={{ fontWeight: 700 }}>
              Zone
            </Typography>
          </Box>

          <Virtuoso
            data={rows}
            style={{ height: 600 }}
            itemContent={(_, row) => (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '56px 120px 1fr 120px 140px',
                  alignItems: 'center',
                  px: 1,
                  py: 0.75,
                  borderBottom:
                    '1px solid var(--joy-palette-neutral-outlinedBorder)',
                  '&:hover': { bgcolor: 'background.level1' }
                }}
              >
                <Typography
                  level='body-sm'
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {row.i + 1}
                </Typography>
                <Typography level='body-sm' fontWeight={600}>
                  {row.duration}
                </Typography>
                <Chip
                  size='sm'
                  variant='soft'
                  color={row.isProg ? 'success' : 'neutral'}
                >
                  {row.intensityLabel} FTP
                </Chip>
                {row.rpm !== null ? (
                  <Chip size='sm' variant='outlined'>
                    {row.rpm} rpm
                  </Chip>
                ) : (
                  <Typography level='body-sm' color='neutral'>
                    —
                  </Typography>
                )}
                <Chip size='sm' variant='soft' color={row.zoneColor as any}>
                  {row.zoneLabel}
                </Chip>
              </Box>
            )}
          />
        </Box>
      </Sheet>
    </Modal>
  )
}
