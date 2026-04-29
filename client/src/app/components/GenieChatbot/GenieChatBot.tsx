/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useEffect, useState, useRef, lazy } from "react";
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import type { GridColDef } from '@mui/x-data-grid';
import { useUser } from '../../context/UserContext';
import { getCookie } from '../../services/csrfCookie/csrf';
import { useTheme, useMediaQuery } from '@mui/material';
import { sxStyle } from './GenieSxStyle';

const MessageCard = lazy(() => import("../GenieComponents/MessageCard"));
const SparkleRectangleIcon = lazy(() =>
  import("@databricks/design-system").then(mod => ({ default: mod.SparkleRectangleIcon }))
);
const ArrowLeftIcon = lazy(() =>
  import("@databricks/design-system").then(mod => ({ default: mod.ArrowLeftIcon }))
);
const CloseSmallIcon = lazy(() =>
  import("@databricks/design-system").then(mod => ({ default: mod.CloseSmallIcon }))
);
const DashIcon = lazy(() =>
  import("@databricks/design-system").then(mod => ({ default: mod.DashIcon}))
);
const SendIcon = lazy(() =>
  import("@databricks/design-system").then(mod => ({ default: mod.SendIcon}))
);
const NewWindowIcon  = lazy(() =>
  import("@databricks/design-system").then(mod => ({ default: mod.NewWindowIcon }))
);
const ChevronRightIcon  = lazy(() =>
  import("@databricks/design-system").then(mod => ({ default: mod.ChevronRightIcon }))
);



interface ChatMessage {
    name: string;
    message: string;
    message_id?: string;
    attachment_id?: string;
    table_data?: { columns: GridColDef[]; data: any[] };
    query?: string;
    query_parameters?:any[];
    row_count?: number;
    suggested_questions?: string[];
    skipAnimation: boolean;
    content:string;
    error?: any;
}

interface SpaceMetadata {
    [key: string]: {
        description: string;
        suggested_questions: string[];
        title: string;
        space_id: string;
        warehouse_id:string;
    };
}

const API_URL = import.meta.env.VITE_API_BASE_URL || "";
const CACHE_KEY = "genie_spaces_metadata";

const SPACES = [
    { id: '0', name: 'MULTI_AGENT', display_name: "Multi Agent Supervisor", description: 'One Stop Solution' },
    { id: '1', name: 'MARGE', display_name: "Marge", description: 'Explore Outcomes, Campaign Data, Account & Contact Details, $DBU Consumption' },
    { id: '3', name: 'MARDI', display_name: "Mardi", description: 'Understand digital performance through insights on campaigns, offers, and trends' },
    { id: '5', name: 'PLANNING_GENIE', display_name: "Maple", description: 'Understand marketing plans and campaign taxonomy' },
];

function GenieChatbot() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const messageWindowRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
    const [syncingSpaces, setSyncingSpaces] = useState<Set<string>>(new Set());
    const [spacesMetadata, setSpacesMetadata] = useState<SpaceMetadata>({});
    const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
    const [selectedSpaceName, setSelectedSpaceName] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [qnsTextBox, setQnsTextBox] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [conversationId, setConversationId] = useState('');

    const { currentUser } = useUser();
    const userName = currentUser?.name || "User";
    const isChatView = currentView === 'chat';
   
    const [restrictedSpaces, setRestrictedSpaces] = useState<Set<string>>(new Set());

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsChatOpen(false);
            }
        }
        if (isChatOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isChatOpen]);

    const initializeMetadata = async (signal?: AbortSignal) => {
        const today = new Date().toDateString();
        const cached = localStorage.getItem(CACHE_KEY);
        
        if (cached) {
            const parsed = JSON.parse(cached);
            const cacheDate = new Date(parsed.timestamp).toDateString();
            // Added check to ensure parsed.data actually exists and has keys
            if (cacheDate === today && Object.keys(parsed.data || {}).length > 0) {
                setSpacesMetadata(parsed.data);
                return; 
            }
        }

        setIsLoadingMetadata(true);
    const metadataMap: SpaceMetadata = {};
    const restricted = new Set<string>();
    setSyncingSpaces(new Set(SPACES.map(s => s.name)));
    
    try {
        await Promise.all(SPACES.map(async (space) => {
            try {
                const response = await fetch(`${API_URL}/genie/space-info?space_name=${space.name}`, {
                    method: 'GET', credentials: 'include', signal: signal
                });
                const res = await response.json();
                
                if (res.status === "success") {
                    metadataMap[space.name] = {
                        description: res.data.description,
                        suggested_questions: res.data.suggested_questions || [],
                        title: res.data.title,
                        space_id: res.data.space_id,
                        warehouse_id: res.data.warehouse_id,
                    };
                } else if (res.message === "SPACE_ACCESS_DENIED") {
                    restricted.add(space.name);
                }
            } catch (error) { console.error(error); }
            finally {
                setSyncingSpaces(prev => {
                    const next = new Set(prev);
                    next.delete(space.name);
                    return next;
                });
            }
        }));
        setSpacesMetadata(metadataMap);
        setRestrictedSpaces(restricted);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: metadataMap }));
        } finally {
            setIsLoadingMetadata(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        initializeMetadata(controller.signal);
        return () => controller.abort();
    }, []);

    useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    
    // Trigger only when the last message is the "Loading" placeholder
    if (lastMsg && lastMsg.message === "Loading" && selectedSpaceId && messages.length >= 2) {
        const userPrompt = messages[messages.length - 2].message;
        
        /* FIX: Use conversationId presence to determine endpoint.
           If the first call fails, conversationId remains empty, 
           ensuring the retry hits 'start-conversation' again.
        */
        const endpoint = !conversationId ? '/genie/start-conversation' : '/genie/create-message';

        const fetchGenieData = async () => {
            try {
                const response = await fetch(`${API_URL}${endpoint}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('XSRF-TOKEN') || '',
                    },
                    body: JSON.stringify({
                        space_name: selectedSpaceName,
                        message: userPrompt,
                        // Only send conversation_id if we actually have one
                        ...(conversationId && { conversation_id: conversationId })
                    }),
                });

                const data = await response.json();

                if (data.status === "error" || response.status >= 400) {
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { 
                            name: "Genie", 
                            message: "Error", 
                            error: data,
                            skipAnimation: true,
                            content: "" 
                        };
                        return updated;
                    });
                    return;
                }

                // Success logic
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        name: "Genie",
                        message: data.answer || "",
                        message_id: data.message_id,
                        table_data: data.table_data,
                        query: data.query,
                        query_parameters: data.query_parameter || null,
                        row_count: data.row_count,
                        attachment_id: data.attachment_id,
                        suggested_questions: data.suggested_questions || [],
                        skipAnimation: false,
                        content: data.content,
                    };
                    return updated;
                });

                // Set ID so subsequent messages use /create-message
                if (!conversationId && data.conversation_id) {
                    setConversationId(data.conversation_id);
                }

            } catch (error: any) {
                console.error({ error });
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { 
                        name: "Genie", 
                        message: "Error", 
                        error: error,
                        skipAnimation: true,
                        content: "" 
                    };
                    return updated;
                });
            }
        };
        fetchGenieData();
    }
        if (messageWindowRef.current) {
            messageWindowRef.current.scrollTop = messageWindowRef.current.scrollHeight;
        }
    }, [messages, selectedSpaceId, conversationId, selectedSpaceName]);

    const handleSelectSpace = (space: any) => {
        setSelectedSpaceId(space.id);
        setSelectedSpaceName(space.name);
        setCurrentView('chat');
        setConversationId('');

        const metadata = spacesMetadata[space.name];
        setMessages([{
            name: "Genie",
            message: metadata?.description || space.description,
            suggested_questions: metadata?.suggested_questions || [],
            skipAnimation: true,
            content: "",
        }]);
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedSpaceId(null);
        setSelectedSpaceName(null);
        setMessages([]);
        setConversationId('');
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
        handleBackToList();
    };

    const handleSubmit = (e: any, manualMsg?: string) => {
        if (e) e.preventDefault();
        const textToSubmit = manualMsg || qnsTextBox;
        if (!textToSubmit.trim() || !selectedSpaceId) return;
        setMessages(prev => [...prev, { name: userName, message: textToSubmit, skipAnimation: false,content:"" }, { name: "Genie", message: "Loading", skipAnimation: false,content:"" }]);
        setQnsTextBox('');
    };

    const handleSuggestedQuestionClick = (question: string) => {
        if (isMessageLoading) return;
        setQnsTextBox(question);
        setTimeout(() => handleSubmit(null, question), 10);
    };

    const isMessageLoading = messages.length > 0 && messages[messages.length - 1].message === "Loading";
    const isChatLoading = messages.length > 0 && messages[messages.length - 1].message === "Loading";

    if (!currentUser) return null;

    const currentSpaceData = selectedSpaceName ? spacesMetadata[selectedSpaceName] : null;
    const redirectUrl = currentSpaceData?.space_id
        ? (conversationId
            ? `https://adb-2548836972759138.18.azuredatabricks.net/genie/rooms/${currentSpaceData.space_id}/chats/${conversationId}`
            : `https://adb-2548836972759138.18.azuredatabricks.net/genie/rooms/${currentSpaceData.space_id}`)
        : null;

    return (
        <Box ref={containerRef}>
            {!isChatOpen && (
                <Tooltip title="Ask Genie">
                    <Box sx={sxStyle.genieFAB(isMobile)} onClick={() => setIsChatOpen(true)}>
                        <SparkleRectangleIcon style={{ fontSize: isMobile ? '28px' : '32px', color: '#fff' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                    </Box>
                </Tooltip>
            )}

            <Paper sx={{ ...sxStyle.chatPopUp(isChatView, isMobile), display: isChatOpen ? 'flex' : 'none' }} elevation={6}>
                <Box sx={sxStyle.chatTitleContainer}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                        {currentView === 'chat' && (
                            <IconButton onClick={handleBackToList} sx={{ color: '#fff', mr: 1, p: '4px' }}>
                               <ArrowLeftIcon style={{fontSize:'18px',color: '#fff',}} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                            </IconButton>
                        )}
                        <SparkleRectangleIcon style={{ fontSize: '24px', color: "#fff" }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                        <Typography sx={sxStyle.titleText} style={{ marginLeft: '10px' }}>
                            {currentView === 'list' ? 'Marketing Genie Spaces' : SPACES.find(s => s.name === selectedSpaceName)?.display_name || selectedSpaceName}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex' }}>
                        <Tooltip title="Minimize">
                            <IconButton onClick={() => setIsChatOpen(false)} sx={{ color: '#fff', p: '8px' }}>
                                <DashIcon style={{marginTop:'10px'}} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Close and Reset">
                            <IconButton onClick={handleCloseChat} sx={{ color: '#fff', p: '8px', fontSize:'18px' }}>
                                <CloseSmallIcon style={{fontSize:'20px',color: '#fff',}} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#fff' }}>
                   {currentView === 'list' ? (
                        <Box sx={sxStyle.spaceListContainer}>
                            <List sx={{ p: 0 }}>
                                {SPACES.map((space) => {
                                    const isSyncing = syncingSpaces.has(space.name);
                                    const hasMetadata = !!spacesMetadata[space.name];
                                    const isRestricted = restrictedSpaces.has(space.name);

                                    return (
                                        <ListItem key={space.id} disablePadding sx={sxStyle.spaceItem}>
                                            <ListItemButton 
                                                onClick={() => !isRestricted && handleSelectSpace(space)}
                                                disabled={isRestricted}
                                                sx={{ opacity: isRestricted ? 0.7 : 1 }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {space.display_name}
                                                            {isSyncing && <CircularProgress size={12} thickness={5} sx={{ color: '#6490f0' }} />}
                                                            {isRestricted && (
                                                                <Typography sx={{ fontSize: '10px', color: '#d32f2f', fontWeight: 700, bgcolor: '#ffebee', px: 1, borderRadius: '4px' }}>
                                                                    NO ACCESS TO THIS GENIE
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        isRestricted 
                                                            ? "You do not have permission to access this space in Databricks." 
                                                            : (isSyncing && !hasMetadata ? "Syncing..." : space.description)
                                                    }
                                                />
                                                {!isRestricted && (
                                                    <ChevronRightIcon 
                                                        style={{ color: hasMetadata ? '#143d4a' : '#cbd5e1', fontSize: '20px' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                                                    />
                                                )}
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </List>
                            {!isLoadingMetadata && Object.keys(spacesMetadata).length === 0 && (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Button size="small" variant="text" onClick={() => initializeMetadata()} sx={{ fontSize: '11px' }}>
                                        Retry Sync
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <>
                            {redirectUrl && (
                                <Box sx={sxStyle.proBanner}>
                                    <Typography sx={{ fontSize: '11px', color: '#143d4a', fontWeight: 600, display: isMobile ? 'none' : 'block' }}>
                                        Need the full genie experience?
                                    </Typography>
                                    <Button
                                        component="a" href={redirectUrl} target="_blank" rel="noopener noreferrer"
                                        size="small" variant="outlined"
                                        endIcon={ <NewWindowIcon  style={{ fontSize: '13px' }} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                                        sx={{
                                            fontSize: '10px', py: 0.5, px: 2, fontWeight: 700, borderRadius: '6px',
                                            textTransform: 'none', borderColor: '#143d4a', color: '#143d4a',
                                            flexGrow: isMobile ? 1 : 0,
                                            textAlign: 'center'
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
                                        key={index} name={msg.name} message={msg.message}
                                        conversationId={conversationId} messageId={msg.message_id}
                                        attachmentId={msg.attachment_id} tableData={msg.table_data}
                                        content={msg.content}
                                        query={msg.query} rowCount={msg.row_count} query_parameter={msg.query_parameters}
                                        lastMessage={index === messages.length - 1}
                                        disabled={isChatLoading}
                                        suggestedQuestions={msg.suggested_questions}
                                        onQuestionClick={handleSuggestedQuestionClick}
                                        skipAnimation={msg.skipAnimation}
                                        selectedSpaceName={selectedSpaceName} 
                                        error={msg.error} 
                                        onRetry={() => {
                                            // Find the last user message to retry with that text
                                            const lastUserMsg = [...messages].reverse().find(m => m.name === userName);
                                            if (lastUserMsg) {
                                                handleSubmit(null, lastUserMsg.message);
                                            }
                                        }}
                                        />
                                ))}
                            </Box>

                            <Box sx={{ p: isMobile ? 1 : 1.5, borderTop: '1px solid #eee', backgroundColor: '#fff' }}>
                                <TextField
                                    fullWidth size="small" placeholder={isMessageLoading ? "Genie is thinking..." : "Ask your Question"}
                                    value={qnsTextBox}
                                    disabled={isMessageLoading}
                                    onChange={(e) => setQnsTextBox(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isMessageLoading && handleSubmit(e)}
                                    sx={sxStyle.textField}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton 
                                                // Disable the button and change color when loading
                                                disabled={isMessageLoading || !qnsTextBox.trim()} 
                                                onClick={(e) => handleSubmit(e)}
                                                sx={{ p: 0 }}
                                            >
                                            <SendIcon 
                                                style={{ 
                                                    cursor: (qnsTextBox.trim() && !isMessageLoading) ? 'pointer' : 'default', 
                                                    color: (qnsTextBox.trim() && !isMessageLoading) ? '#143d4a' : 'grey', 
                                                    fontSize: '20px' 
                                                }} 
                                                onPointerEnterCapture={undefined} 
                                                onPointerLeaveCapture={undefined} 
                                            />
                                        </IconButton>
                                        </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default GenieChatbot;