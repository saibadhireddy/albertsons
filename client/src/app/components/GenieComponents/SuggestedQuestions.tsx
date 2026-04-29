import { Box, Typography, Stack, Chip } from '@mui/material';

export default function SuggestedQuestions({ questions, onQuestionClick, disabled }: { questions: string[], onQuestionClick?: (q: string) => void, disabled?: boolean }) {
  return (
    <Box sx={{ mt: 2, mb: 1, pointerEvents: disabled ? 'none' : 'auto', 
      opacity: disabled ? 0.7 : 1,
      transition: 'opacity 0.2s ease' }}>
      <Typography sx={{ fontSize: '11px', color: 'grey', mb: 1, fontWeight: 600, opacity: disabled ? 0.5 : 1  }}>
        SUGGESTED QUESTIONS
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {questions.map((q, i) => (
          <Chip
            key={i} label={q}
            onClick={() => onQuestionClick?.(q)}
            sx={{
              fontSize: '12px', backgroundColor: '#f0f2ff',
              color: '#444795', border: '1px solid #d0d7ff',
              cursor: disabled ? 'default !important' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              '&:hover': { 
                backgroundColor: disabled ? '#f0f2ff' : '#e0e4ff', 
                borderColor: disabled ? '#d0d7ff' : '#444795' 
              },
              '&.MuiChip-clickable': {
                cursor: disabled ? 'default !important' : 'pointer',
              }
            }}
            size="small"
          />
        ))}
      </Stack>
    </Box>
  );
}