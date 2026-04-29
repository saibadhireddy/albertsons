import { useState } from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const MessageCardStyle = {
  feedbackContainer: {
    mt: 2, pt: 1, borderTop: '1px solid #f0f0f0',
    display: 'flex', alignItems: 'center', gap: 1,
  },
  feedbackText: { fontSize: '12px', color: '#666', fontWeight: 500, mr: 1 },
  feedbackButton: {
    textTransform: 'none' as const, fontSize: '12px', padding: '2px 8px', borderRadius: '6px',
    '& .MuiButton-startIcon': { marginRight: '4px' }
  }
};

interface GenieFeedbackProps {
  messageId: string | undefined;
  conversationId: string | undefined;
  selectedSpaceName: string | null;
  lastMessage: boolean;
  hasData: boolean;
  apiUrl: string;
}

export default function GenieFeedback({ messageId, conversationId, selectedSpaceName, lastMessage, hasData, apiUrl }: GenieFeedbackProps) {
  const [currentRating, setCurrentRating] = useState<string>("NONE");

  const handleFeedback = async (newRating: "POSITIVE" | "NEGATIVE") => {
    const ratingToSend = currentRating === newRating ? "NONE" : newRating;
    try {
      await fetch(`${apiUrl}/genie/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: selectedSpaceName,
          conversation_id: conversationId,
          message_id: messageId,
          rating: ratingToSend
        }),
      });
      setCurrentRating(ratingToSend);
    } catch (error) {
      console.error("Failed to send Genie feedback", error);
    }
  };

  return (
    <Box sx={MessageCardStyle.feedbackContainer}>
      <Typography sx={MessageCardStyle.feedbackText}>
        {lastMessage ? "Is this correct?" : "Was this correct?"}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button 
          variant={currentRating === "POSITIVE" ? "contained" : "outlined"}
          color="success" onClick={() => handleFeedback("POSITIVE")}
          startIcon={<CheckCircleOutlineIcon fontSize="small" />}
          sx={MessageCardStyle.feedbackButton}
        >
          {hasData ? "Yes" : ""}
        </Button>
        <Button 
          variant={currentRating === "NEGATIVE" ? "contained" : "outlined"}
          color="error" onClick={() => handleFeedback("NEGATIVE")}
          startIcon={<HighlightOffIcon fontSize="small" />}
          sx={MessageCardStyle.feedbackButton}
        >
          {hasData ? "No" : ""}
        </Button>
      </Stack>
    </Box>
  );
}