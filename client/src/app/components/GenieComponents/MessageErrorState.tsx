import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface MessageErrorStateProps {
  error: any;
  onRetry?: () => void;
}

const MessageErrorState: React.FC<MessageErrorStateProps> = ({ error, onRetry }) => {
  // 1. Identify if it's a "Technical" error vs a "Friendly" error
  const rawMessage = (error?.message || "").toLowerCase();
  const isTechnical = 
    rawMessage.includes("sql") || 
    rawMessage.includes("argument") || 
    rawMessage.includes("syntax") || 
    rawMessage.includes("missing") ||
    rawMessage.includes("error");

  // 2. Determine what to show the user
  const displayMessage = isTechnical 
    ? "Something went wrong on our end. Please try again." 
    : (error?.message || "We couldn't process your request.");

  const requestId = 
    error?.meta?.request_id || 
    error?.response?.data?.meta?.request_id;

  return (
    <Paper 
      elevation={0}
      sx={{ 
        mt: 1.5, p: 2, 
        border: '1px solid #FCA5A5', 
        bgcolor: '#FEF2F2', 
        borderRadius: '12px',
        width: '100%',
        textAlign: 'left'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <ErrorOutlineIcon sx={{  mt: 0.2 }} fontSize="small" />
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Technical Error
          </Typography>
          
          <Typography variant="body2" sx={{  lineHeight: 1.5 }}>
            {displayMessage}
          </Typography>

          {/* Keep the Ref ID so the user can still provide it to support if needed */}
          {requestId && (
            <Box 
              sx={{ 
                display: 'inline-flex', alignItems: 'center', gap: 1, 
                bgcolor: '#FEE2E2', px: 1, py: 0.5, borderRadius: '4px',
                border: '1px solid #FECACA', mt: 1.5
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
                REF ID:
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                {requestId}
              </Typography>
            </Box>
          )}

          {onRetry && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<ReplayIcon />}
                onClick={(e) => {
                    e.stopPropagation();
                    onRetry();
                }}
                sx={{
                  bgcolor: '#DC2626', color: 'white', textTransform: 'none',
                  fontSize: '0.75rem', fontWeight: 600,
                  '&:hover': { bgcolor: '#991B1B' }
                }}
              >
                Try Again
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default MessageErrorState;