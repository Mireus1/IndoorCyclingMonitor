import { Box, Card, LinearProgress, Typography } from '@mui/joy'
import { CardStat } from '../entities/cardStat'

interface StatCardGridProps {
  stats: CardStat[]
}

const StatCardGrid = ({ stats }: StatCardGridProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: 'repeat(auto-fit, minmax(180px, 1fr))',
          sm: 'repeat(3, 1fr)'
        }
      }}
    >
      {stats.map(({ color, title, value, unit, helperText }, index) => (
        <Card
          key={index}
          variant='outlined'
          color={color as any}
          sx={{
            borderRadius: '16px',
            p: 2,
            borderColor: 'divider',
            boxShadow: 'sm',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          <Typography
            level='body-sm'
            textColor='text.tertiary'
            sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography level='h1'>
              {value ?? '--'}
            </Typography>
            {unit && (
              <Typography level='title-sm' textColor='text.tertiary'>
                {unit}
              </Typography>
            )}
          </Box>
          <LinearProgress
            determinate
            size='md'
            thickness={3}
            value={Math.min(
              100,
              typeof value === 'number' ? Math.max(value / 4, 10) : 50
            )}
            color={color as any}
            sx={{ borderRadius: 999 }}
          />
          {helperText && (
            <Typography level='body-sm' textColor='text.tertiary'>
              {helperText}
            </Typography>
          )}
        </Card>
      ))}
    </Box>
  )
}

export default StatCardGrid
