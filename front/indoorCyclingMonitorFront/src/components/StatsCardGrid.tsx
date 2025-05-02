import { Box, Card, CardContent, Typography } from '@mui/joy'
import { CardStat } from '../entities/cardStat'

interface StatCardGridProps {
  stats: CardStat[]
}

const StatCardGrid = ({ stats }: StatCardGridProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3
      }}
    >
      {stats.map(({ color, title, value }, index) => (
        <Card
          key={index}
          variant='solid'
          color={color}
          invertedColors
          size='sm'
          sx={{
            border: '1px solid',
            borderColor: 'var(--joy-palette-neutral-outlinedBorder)',
            borderRadius: '8px',
            minHeight: { xs: 250, md: '30vh' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Typography level='title-lg'>{title}</Typography>
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <Typography component='h1' level='h1'>
              {value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export default StatCardGrid
