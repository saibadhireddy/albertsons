/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Avatar,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import { SparkleRectangleIcon } from "@databricks/design-system";

// Your API Services
import {
  createMessage,
  fetchSpaceInfo,
  startConversation,
  streamChatPost,
} from "../../../services/GenieApi/GenieApi";
import { useUser } from "../../../context/UserContext";

// Local Constants
const CACHE_KEY = "genie_spaces_metadata";
const HEADER_GRADIENT = "linear-gradient(to right, #2374C4, #0F2359)";
const SPACES = [
  { id: "0", name: "MULTI_AGENT", display_name: "Multi Agent", type: "agent", description: "Ask questions to this supervisor and it re-routes the question to relevant genie." },
  { id: "1", name: "MARGE", display_name: "Marge", type: "space", description: "Explore Outcomes, Campaign Data, Account & Contact Details." },
  { id: "3", name: "MARDI", display_name: "Mardi", type: "space", description: "Understand digital performance through insights on campaigns." },
  { id: "5", name: "PLANNING_GENIE", display_name: "Maple", type: "space", description: "Understand marketing plans and campaign taxonomy." },
];

// Lazy load the MessageCard
const MessageCard = lazy(() => import("../../GenieComponents/MessageCard"));

const createConversationId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

// ─── FAB2 Chat View ───────────────────────────────────────────────────────────

function Fab2ChatView({ onMinimize, onClose }: any) {
  const { currentUser } = useUser();
  const userName = currentUser?.name || "User";

  const [selectedSpace, setSelectedSpace] = useState(SPACES[0]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [spacesMetadata, setSpacesMetadata] = useState<any>({});
  const [multiAgentHistory, setMultiAgentHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Metadata with Caching
  useEffect(() => {
    const initializeMetadata = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (new Date(parsed.timestamp).toDateString() === new Date().toDateString()) {
          setSpacesMetadata(parsed.data);
          return;
        }
      }
      const metadataMap: any = {};
      await Promise.all(SPACES.map(async (s) => {
        if (s.name === "MULTI_AGENT") {
          metadataMap[s.name] = { description: s.description, suggested_questions: [], title: s.display_name };
          return;
        }
        try {
          const res = await fetchSpaceInfo(s.name);
          if (res.status === "success") metadataMap[s.name] = res.data;
        } catch (e) { console.error(e); }
      }));
      setSpacesMetadata(metadataMap);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: metadataMap }));
    };
    initializeMetadata();
  }, []);

  // 2. Initial State when switching Spaces via Chips
  useEffect(() => {
    const meta = spacesMetadata[selectedSpace.name];
    setMessages([{
      name: selectedSpace.display_name,
      message: meta?.description || selectedSpace.description,
      suggested_questions: meta?.suggested_questions || [],
      skipAnimation: true,
      content: "",
    }]);
    setConversationId("");
    setMultiAgentHistory([]);
  }, [selectedSpace, spacesMetadata]);

  useEffect(() => {
    if (chatAreaRef.current) chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Multi-Agent SSE logic
  const handleMultiAgentItem = (item: any) => {
    setMultiAgentHistory((prev) => [...prev, item]);

    if (item.type === "function_call") {
      const rawArgs = typeof item.arguments === "string" ? JSON.parse(item.arguments) : item.arguments;
      const sqlText = rawArgs.genie_query || rawArgs.sql || rawArgs.query;

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          functionCall: {
            name: item.name,
            sql: sqlText,
            thought: last.tempThought || "",
            raw: item
          },
        };
        return updated;
      });
      return;
    }

    if (item.type === "message" && item.role === "assistant") {
      const textParts = item.content?.filter((c: any) => c.type === "output_text").map((c: any) => c.text) || [];
      const fullText = textParts.join("\n").trim();

      if (!fullText) return;

      const isInternalName = fullText.includes("<name>");
      const isThought = fullText.includes("I'll query") || fullText.includes("Thinking");
      const isRawTable = fullText.trim().startsWith("|") && !fullText.includes("Analysis:");

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];

        // Check if this text is already stored in our thoughts bucket
        const alreadyInThought = last.tempThought?.includes(fullText);

        if (isInternalName || isThought || isRawTable) {
          if (!alreadyInThought) {
            last.tempThought = (last.tempThought || "") + "\n\n" + fullText;
          }
          return updated;
        }
        if (alreadyInThought) {
          return updated;
        }
        const base = last?.message === "" ? "" : (last?.message || "");
        if (base.includes(fullText)) {
          return updated;
        }

        updated[updated.length - 1] = { ...last, name: "Agent", message: base + fullText };
        return updated;
      });
    }
  };

  const buildStackedMessagesPayload = (history: any[], userPrompt: string) => {
    const msgs: any[] = [];
    for (const item of history) {
      if (item.type === "message") {
        msgs.push({
          type: "message",
          role: item.role || "assistant",
          content: item.content ?? [],
          id: item.id,
        });
      } else if (item.type === "function_call") {
        msgs.push({
          type: "function_call",
          name: item.name,
          call_id: item.call_id,
          arguments: item.arguments,
          id: item.id,
        });
      }
    }
    msgs.push({
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: userPrompt }],
    });
    return msgs;
  };

  const handleSend = async (manualMsg?: string) => {
    const text = manualMsg || inputText;
    if (!text.trim()) return;

    setMessages(prev => [
      ...prev,
      { name: userName, message: text, skipAnimation: false, content: "" },
      { name: selectedSpace.display_name, message: "", skipAnimation: false, content: "" }
    ]);
    setInputText("");
    setIsTyping(true);

    try {
      if (selectedSpace.name === "MULTI_AGENT") {
        let convId = conversationId;
        if (!convId) {
          convId = createConversationId();
          setConversationId(convId);
        }

        const stackedMsgs = buildStackedMessagesPayload(multiAgentHistory, text);

        await streamChatPost({ messages: stackedMsgs, conversation_id: convId },
          (raw: string) => {
            let chunk: any;
            try {
              if (raw.startsWith("{") && raw.includes("_isError")) {
                chunk = JSON.parse(raw);
                if (chunk._isError) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    updated[updated.length - 1] = {
                      ...last,
                      name: selectedSpace.display_name,
                      message: `Error: ${chunk.message || "Unknown error"}`,
                      error: chunk,
                      skipAnimation: true,
                      content: "",
                    };
                    return updated;
                  });
                  setIsTyping(false);
                  return;
                }
              }
              chunk = JSON.parse(raw);
            } catch {
              // Handle non-JSON chunks as direct text updates
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  message: (last.message || "") + raw,
                  content: (last.content || "") + raw,
                };
                return updated;
              });
              return;
            }
            const item = chunk.item ?? chunk;
            handleMultiAgentItem(item);
          },
          () => setIsTyping(false)
        );
      } else {
        const data = !conversationId
          ? await startConversation(selectedSpace.name, text)
          : await createMessage(selectedSpace.name, text, conversationId);

        setMessages(prev => {
          const up = [...prev];
          up[up.length - 1] = {
            name: "Genie", message: data.answer || "", table_data: data.table_data,
            query: data.query, suggested_questions: data.suggested_questions, message_id: data.message_id,
            skipAnimation: false, content: data.content || ""
          };
          return up;
        });
        if (data.conversation_id) setConversationId(data.conversation_id);
        setIsTyping(false);
      }
    } catch (e) {
      setIsTyping(false);
      console.error(e);
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Header */}
      <Box sx={{ px: 1, pl: 0.5, background: HEADER_GRADIENT, minHeight: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton onClick={() => setSelectedSpace(SPACES[0])} size="small" sx={{ color: "common.white" }}><ArrowBackIcon fontSize="small" /></IconButton>
          <Avatar sx={{ width: 32, height: 32, bgcolor: selectedSpace.type === "agent" ? "#EA580C" : "#2563EB", fontSize: 14, color: "#fff" }}>
            {selectedSpace.type === "agent" ? "A" : "G"}
          </Avatar>
          <Typography variant="subtitle2" sx={{ color: "common.white", ml: 0.75, fontWeight: 600 }}>{selectedSpace.display_name}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton onClick={onMinimize} size="small" sx={{ color: "common.white" }}><RemoveIcon fontSize="small" /></IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: "common.white" }}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box ref={chatAreaRef} sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#F3F4F6" }}>
        <Suspense fallback={<CircularProgress size={20} />}>
          {messages.map((msg, idx) => (
            <MessageCard
              key={idx}
              isFirstMessage={idx === 0}
              name={msg.name}
              message={msg.message}
              tableData={msg.table_data}
              query={msg.query}
              suggestedQuestions={msg.suggested_questions}
              onQuestionClick={(q: string) => handleSend(q)}
              skipAnimation={msg.skipAnimation}
              lastMessage={idx === messages.length - 1}
              conversationId={conversationId}
              messageId={msg.message_id}
              selectedSpaceName={selectedSpace.name}
              functionCall={msg.functionCall}
              error={msg.error}
              content={msg.content || ""}
            />
          ))}

          {isTyping && (
            <Box display="flex" alignItems="center" gap={1.5} mt={2} ml={"55px"}>
              <Avatar sx={{ width: 28, height: 28, background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                <CircularProgress size={14} thickness={5} sx={{ color: '#7C3AED' }} />
              </Avatar>
              <Typography variant="caption" sx={{ color: "#6B7280", fontStyle: 'italic', fontWeight: 500 }}>
                {selectedSpace.display_name} is processing...
              </Typography>
            </Box>
          )}
        </Suspense>
      </Box>

      {/* FAB2 Specific Chips Row */}
      <Box sx={{ bgcolor: "#FFFFFF", borderTop: "1px solid #F0F0F0", px: 1.5, pt: 1.25, pb: 0.75, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", mb: 0.75 }}>
          Switch Space or Agent
        </Typography>
        <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { display: "none" } }}>
          {SPACES.map((opt) => {
            const isActive = opt.name === selectedSpace.name;
            const color = opt.type === "agent" ? "#EA580C" : "#2563EB";
            return (
              <Chip
                key={opt.id}
                clickable={!isActive}
                onClick={() => !isActive && setSelectedSpace(opt)}
                label={opt.display_name}
                icon={<Avatar sx={{ width: 18, height: 18, bgcolor: color, fontSize: 10, color: "#FFFFFF !important" }}>{opt.type === "agent" ? "A" : "G"}</Avatar>}
                sx={{
                  borderRadius: "999px", pl: 0.25, fontSize: 12, fontWeight: isActive ? 700 : 500,
                  bgcolor: isActive ? (opt.type === "agent" ? "#FFF3EE" : "#EFF6FF") : "#F8F9FA",
                  border: isActive ? `2px solid ${color}` : "1.5px solid #E5E7EB",
                  color: isActive ? color : "#4B5563",
                  "&:hover": { bgcolor: isActive ? undefined : (opt.type === "agent" ? "#FFF3EE" : "#EFF6FF") }
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Input Area */}
      <Box sx={{ px: 1.5, pb: 1.5, pt: 1, bgcolor: "#FFFFFF", borderTop: "1px solid #F0F0F0", flexShrink: 0 }}>
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Ask ${selectedSpace.display_name}…`}
            size="small" fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13, bgcolor: "#F9FAFB" } }}
          />
          <IconButton
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            sx={{ borderRadius: 2, bgcolor: inputText.trim() ? "#EA580C" : "#E5E7EB", color: "#FFFFFF", "&:hover": { bgcolor: "#C2410C" } }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

// ─── FAB2 Modal Wrapper ───────────────────────────────────────────────────────

export function Fab2Modal({ onClose, onMinimize, isMobile }: any) {
  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 13000, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }} onClick={onClose}>
      <Paper elevation={16} sx={{
        position: "fixed", right: isMobile ? 0 : 20, bottom: isMobile ? 0 : 90,
        width: isMobile ? "100%" : 800, height: isMobile ? "100%" : "76vh",
        maxHeight: isMobile ? "100%" : 780, borderRadius: isMobile ? 0 : 3,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }} onClick={(e) => e.stopPropagation()}>
        <Fab2ChatView onMinimize={onMinimize} onClose={onClose} isMobile={isMobile} />
      </Paper>
    </Box>
  );
}


export function Fab2Button({
  onClick,
  isMobile,
}: {
  onClick: () => void;
  isMobile: boolean;
}) {
  const size = isMobile ? 50 : 58;
  return (
    <button
      onClick={onClick}
      title="Multi Agent Chat"
      style={{
        position: "fixed",
        right: isMobile ? "15px" : "20px",
        bottom: isMobile ? "85px" : "105px",
        zIndex: 9999,
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2.5px solid #0F172A",
        background: "linear-gradient(135deg, #a5b4fc 0%, #da70d6 50%, #f472b6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 18px rgba(194,65,12,0.45)",
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.transform = "scale(1.1)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
      }
      aria-label="Open Multi Agent Chat"
    >

      <SparkleRectangleIcon
        style={{ fontSize: isMobile ? "28px" : "32px", color: "#fff" }}
        onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
    </button>
  );
}