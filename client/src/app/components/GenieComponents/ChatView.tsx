/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type { MutableRefObject } from 'react';

const NewWindowIcon = (await import('@databricks/design-system')).NewWindowIcon;
const SendIcon = (await import('@databricks/design-system')).SendIcon;

interface ChatMessage {
  name: string;
  message: string;
  message_id?: string;
  attachment_id?: string;
  table_data?: { columns: any[]; data: any[] };
  query?: string;
  query_parameters?: any[] | '';
  row_count?: number;
  suggested_questions?: string[];
  skipAnimation: boolean;
  content: string;
  error?: any;
  functionCall?: {
    name: string;
    sql: string;
    raw: any;
  };
}

interface ChatViewProps {
  messages: ChatMessage[];
  conversationId: string;
  selectedSpaceName: string | null;
  redirectUrl: string | null;
  isMobile: boolean;
  isMessageLoading: boolean;
  isChatLoading: boolean;
  qnsTextBox: string;
  onChangeText: (val: string) => void;
  onSubmit: (e: any, manualMsg?: string) => void;
  onSuggestedQuestionClick: (q: string) => void;
  userName: string;
  sxStyle: any;
  messageWindowRef: MutableRefObject<HTMLDivElement | null>;
  MessageCard: React.ComponentType<any>;
}

export function ChatView({
  messages,
  conversationId,
  redirectUrl,
  isMobile,
  isMessageLoading,
  isChatLoading,
  qnsTextBox,
  onChangeText,
  onSubmit,
  onSuggestedQuestionClick,
  userName,
  sxStyle,
  messageWindowRef,
  MessageCard,
  selectedSpaceName,
}: ChatViewProps) {
  const inputDisabled = isChatLoading || isMessageLoading;

  return (
    <>
      {redirectUrl && (
        <Box sx={sxStyle.proBanner}>
          <Typography
            sx={{
              fontSize: '11px',
              color: '#143d4a',
              fontWeight: 600,
              display: isMobile ? 'none' : 'block',
            }}
          >
            Need the full genie experience?
          </Typography>
          <Button
            component="a"
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            variant="outlined"
            endIcon={
              <NewWindowIcon
                style={{ fontSize: '13px' }}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              />
            }
            sx={{
              fontSize: '10px',
              py: 0.5,
              px: 2,
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              borderColor: '#143d4a',
              color: '#143d4a',
              flexGrow: isMobile ? 1 : 0,
              textAlign: 'center',
            }}
          >
            Go to Databricks
          </Button>
        </Box>
      )}

      <Box ref={messageWindowRef} sx={sxStyle.messageChat}>
        {messages.map((msg, index) => (
          <MessageCard
            isFirstMessage={index === 0}
            key={index}
            name={msg.name}
            message={msg.message}
            conversationId={conversationId}
            messageId={msg.message_id}
            attachmentId={msg.attachment_id}
            tableData={msg.table_data}
            content={msg.content}
            query={msg.query}
            rowCount={msg.row_count}
            query_parameter={msg.query_parameters}
            lastMessage={index === messages.length - 1}
            disabled={isChatLoading}
            suggestedQuestions={msg.suggested_questions}
            onQuestionClick={onSuggestedQuestionClick}
            skipAnimation={msg.skipAnimation}
            selectedSpaceName={null}
            error={msg.error}
            functionCall={msg.functionCall}
            onRetry={() => {
              const lastUserMsg = [...messages].reverse().find(m => m.name === userName);
              if (lastUserMsg) {
                onSubmit(null, lastUserMsg.message);
              }
            }}
          />
        ))}

        {isChatLoading && selectedSpaceName === 'MULTI_AGENT' && (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
        <Box
          sx={{
            maxWidth: '70%',
            px: 1.5,
            py: 1,
            borderRadius: 2,
            display: 'inline-flex',
            alignItems: 'center',
            marginLeft: 8,
            gap: 1,
          }}
        >
          <CircularProgress size={16} thickness={5} sx={{ color: '#143d4a' }} />
          <Typography sx={{ fontSize: '12px', color: '#143d4a' }}>
            Thinking...
          </Typography>
        </Box>
      </Box>
    )}
      </Box>

      <Box
        sx={{
          p: isMobile ? 1 : 1.5,
          borderTop: '1px solid #eee',
          backgroundColor: '#fff',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={
            isChatLoading || isMessageLoading ? 'Genie is thinking...' : 'Ask your Question'
          }
          value={qnsTextBox}
          disabled={inputDisabled}
          onChange={e => onChangeText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !inputDisabled && onSubmit(e)}
          sx={sxStyle.textField}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  disabled={inputDisabled || !qnsTextBox.trim()}
                  onClick={e => onSubmit(e)}
                  sx={{ p: 0 }}
                >
                  <SendIcon
                    style={{
                      cursor:
                        qnsTextBox.trim() && !inputDisabled ? 'pointer' : 'default',
                      color:
                        qnsTextBox.trim() && !inputDisabled ? '#143d4a' : 'grey',
                      fontSize: '20px',
                    }}
                    onPointerEnterCapture={undefined}
                    onPointerLeaveCapture={undefined}
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );
}
