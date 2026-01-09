import Avatar from '@mui/joy/Avatar'
import AvatarGroup from '@mui/joy/AvatarGroup'
import Table from '@mui/joy/Table'
import Typography from '@mui/joy/Typography'

import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded'
import FolderRoundedIcon from '@mui/icons-material/FolderRounded'

export default function TableFiles() {
  return (
    <div>
      <Table
        hoverRow
        size='sm'
        borderAxis='none'
        variant='soft'
        sx={{ '--TableCell-paddingX': '1rem', '--TableCell-paddingY': '1rem' }}
      >
        <thead>
          <tr>
            <th>
              <Typography level='title-sm'>Folder</Typography>
            </th>
            <th>
              <Typography
                level='title-sm'
                endDecorator={<ArrowDropDownRoundedIcon />}
              >
                Last modified
              </Typography>
            </th>
            <th>
              <Typography level='title-sm'>Size</Typography>
            </th>
            <th>
              <Typography level='title-sm'>Users</Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Typography
                level='title-sm'
                startDecorator={<FolderRoundedIcon color='primary' />}
                sx={{ alignItems: 'flex-start' }}
              >
                Travel pictures
              </Typography>
            </td>
            <td>
              <Typography level='body-sm'>21 Oct 2023, 3PM</Typography>
            </td>
            <td>
              <Typography level='body-sm'>987.5MB</Typography>
            </td>
            <td>
              <AvatarGroup
                size='sm'
                sx={{ '--AvatarGroup-gap': '-8px', '--Avatar-size': '24px' }}
              >
                <Avatar
                  src='https://i.pravatar.cc/24?img=6'
                  srcSet='https://i.pravatar.cc/48?img=6 2x'
                />
                <Avatar
                  src='https://i.pravatar.cc/24?img=7'
                  srcSet='https://i.pravatar.cc/48?img=7 2x'
                />
                <Avatar
                  src='https://i.pravatar.cc/24?img=8'
                  srcSet='https://i.pravatar.cc/48?img=8 2x'
                />
                <Avatar
                  src='https://i.pravatar.cc/24?img=9'
                  srcSet='https://i.pravatar.cc/48?img=9 2x'
                />
              </AvatarGroup>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  )
}
