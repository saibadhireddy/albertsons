// import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import LockClockIcon from '@mui/icons-material/LockClock';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import './GenieFallback.css'; // Your provided theme + custom overrides

const GeniePermissionFallback = () => {
  
  const handleRefreshApp = () => {
    // 1. Clear Site-Specific Cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // 2. Clear Local and Session Storage
    localStorage.clear();
    sessionStorage.clear();

    // 3. Force Reload from Server
    window.location.reload();
    window.location.href = window.location.origin;
  };

  const openBrowserSettings = () => {
    // Note: Most browsers block direct links to chrome://settings
    // This serves as an alert if the user is on an unsupported browser
    alert("To clear history for the last hour:\n1. Press Ctrl+Shift+Delete\n2. Select 'Last Hour'\n3. Click 'Clear Data'");
  };

  return (
    <div className="detailed-graph-container fallback-page">
      <div className="charts-grid-container">
        <div className="charts-row charts-row-1">
          <Paper className="chart-container permission-card" elevation={0}>
            <Box className="fallback-content">
              <LockClockIcon sx={{ fontSize: 60, color: '#f355a4', mb: 2 }} />
              
              <Typography variant="h5" className="section-title" sx={{ position: 'static', textAlign: 'center' }}>
                Permissions Required
              </Typography>
              
              <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: '#64748b', maxWidth: '500px' }}>
                It looks like your session token doesn't have the <strong>genie</strong> scope. 
                This often happens when browser cache holds an outdated session.
              </Typography>

              <div className="fallback-actions">
                <Button 
                  variant="contained" 
                  startIcon={<RestartAltIcon />}
                  onClick={handleRefreshApp}
                  sx={{ 
                    background: 'linear-gradient(135deg, #6490f0 0%, #f355a4 100%)',
                    borderRadius: '8px',
                    px: 4, py: 1.5,
                    fontWeight: 600
                  }}
                >
                  Clear App Session & Reload
                </Button>

                <Typography variant="caption" sx={{ mt: 3, display: 'block', color: '#94a3b8' }}>
                  If the issue persists, please clear your browser history manually:
                </Typography>
                
                <Button 
                  variant="text" 
                  onClick={openBrowserSettings}
                  sx={{ color: '#084a81', textTransform: 'none', fontWeight: 600 }}
                >
                  How to clear last hour of browser history?
                </Button>
              </div>
            </Box>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default GeniePermissionFallback;