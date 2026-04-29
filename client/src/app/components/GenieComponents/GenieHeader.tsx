// src/components/genie/GenieHeader.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import {
  SparkleRectangleIcon,
  ArrowLeftIcon,
  CloseSmallIcon,
  DashIcon
} from '@databricks/design-system';

interface GenieHeaderProps {
  currentView: 'list' | 'chat';
  selectedSpaceName: string | null;
  title: string;
  onBack: () => void;
  onMinimize: () => void;
  onClose: () => void;
  sxStyle: any;
}

export function GenieHeader({
  currentView,
  title,
  onBack,
  onMinimize,
  onClose,
  sxStyle,
}: GenieHeaderProps) {
  return (
    <Box sx={sxStyle.chatTitleContainer}>
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        {currentView === 'chat' && (
          <IconButton onClick={onBack} sx={{ color: '#fff', mr: 1, p: '4px' }}>
            <ArrowLeftIcon
              style={{ fontSize: '18px', color: '#fff' }}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </IconButton>
        )}
        <SparkleRectangleIcon
          style={{ fontSize: '24px', color: '#fff' }}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
        <Typography sx={sxStyle.titleText} style={{ marginLeft: '10px' }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex' }}>
        <Tooltip title="Minimize">
          <IconButton onClick={onMinimize} sx={{ color: '#fff', p: '8px' }}>
            <DashIcon
              style={{ marginTop: '10px' }}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </IconButton>
        </Tooltip>

        <Tooltip title="Close and Reset">
          <IconButton onClick={onClose} sx={{ color: '#fff', p: '8px', fontSize: '18px' }}>
            <CloseSmallIcon
              style={{ fontSize: '20px', color: '#fff' }}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
