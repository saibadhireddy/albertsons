/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, lazy, Suspense } from "react";
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { SparkleRectangleIcon } from "@databricks/design-system";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

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


const MessageCard = lazy(() => import("../../GenieComponents/MessageCard"));

const createConversationId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

// ─── Space Selector Popup ─────────────────────────────────────────────────────
function SpaceSelectorPopup({ currentItemId, onSelect, onClose }: any) {
  return (
    <Paper elevation={10} sx={{ position: "absolute", right: 0, bottom: "calc(100% + 10px)", width: 300, zIndex: 300, borderRadius: 3, overflow: "hidden", border: "1px solid #E5E7EB" }}>
      <Box sx={{ background: HEADER_GRADIENT, px: 1.75, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesomeIcon sx={{ fontSize: 14, color: "#fff" }} />
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Spaces & Agents</Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
      </Box>
      <Box sx={{ p: 1, maxHeight: 288, overflowY: "auto" }}>
        {SPACES.map((opt) => {
          const isActive = opt.name === currentItemId;
          const isAgent = opt.type === "agent";
          const color = isAgent ? "#EA580C" : "#2563EB";

          return (
            <Box key={opt.id} component="button" onClick={() => { onSelect(opt); onClose(); }}
              sx={{
                width: "100%", textAlign: "left", border: "1.5px solid", mb: 0.75, borderRadius: 3, px: 1.5, py: 1.25, cursor: isActive ? "default" : "pointer",
                backgroundColor: isActive ? (isAgent ? "#FFF3EE" : "#EFF6FF") : "#F9FAFB",
                borderColor: isActive ? color : "transparent",
                transition: "0.15s", "&:hover": !isActive ? { backgroundColor: isAgent ? "#FFF3EE" : "#EFF6FF", borderColor: color } : {}
              }}>
              <Box display="flex" alignItems="flex-start" gap={1.25}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: color, fontSize: 12 }}>{isAgent ? "A" : "G"}</Avatar>
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: isAgent ? "#C2410C" : "#1D4ED8" }}>{opt.display_name}</Typography>
                    {isActive && <Typography sx={{ fontSize: 8, bgcolor: color, color: "#fff", px: 0.5, borderRadius: 1 }}>ACTIVE</Typography>}
                  </Box>
                  <Typography noWrap sx={{ fontSize: 11, color: "#6B7280" }}>{opt.description}</Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

// ─── FAB3 Chat View ───────────────────────────────────────────────────────────

function Fab3ChatView({ onMinimize, onClose }: any) {
  const { currentUser } = useUser();
  const userName = currentUser?.name || "User";

  const [selectedSpace, setSelectedSpace] = useState(SPACES[0]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [spacesMetadata, setSpacesMetadata] = useState<any>({});
  const [multiAgentHistory, setMultiAgentHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSpaceSelector, setShowSpaceSelector] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const meta = spacesMetadata[selectedSpace.name];
    const chatGreeting = meta?.description || selectedSpace.description;
    const chatQuestions = meta?.suggested_questions || [];

    setMessages([{
      name: selectedSpace.display_name,
      message: chatGreeting,
      suggested_questions: chatQuestions,
      skipAnimation: true,
      content: "",
    }]);

    setConversationId("");
    setMultiAgentHistory([]);
    setIsTyping(false);
  }, [selectedSpace, spacesMetadata]);

  useEffect(() => {
    if (chatAreaRef.current) chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
  }, [messages, isTyping]);

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

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];

        // 1. Identify types of content
        const isInternalName = fullText.includes("<name>");
        const isThought = fullText.includes("I'll query") || fullText.includes("Thinking");
        const isTablePart = fullText.includes("|") || fullText.includes("---");
        
        // Determine if this is intermediate work (logs/tables)
        const isIntermediate = isInternalName || isThought || isTablePart || !!last.functionCall;

        // ─── ROUTE TO ANALYSIS BLOCK ───
        if (isIntermediate && !fullText.includes("Analysis:")) {
          const alreadyInThought = last.tempThought?.includes(fullText);
          if (!alreadyInThought) {
            // Add spacing between logs and tables for Markdown readability
            const separator = isTablePart ? "\n" : "\n\n";
            const newThought = (last.tempThought || "") + separator + fullText;
            last.tempThought = newThought;

            if (last.functionCall) {
              last.functionCall = { ...last.functionCall, thought: newThought };
            }
          }
          return updated;
        }

        // ─── ROUTE FINAL RESPONSE TO MAIN BUBBLE ───
        const base = last.message === "" ? "" : last.message;
        if (base.includes(fullText)) return updated;

        updated[updated.length - 1] = {
          ...last,
          name: selectedSpace.display_name,
          message: base + (base ? "\n" : "") + fullText
        };

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

    const userMsg = { name: userName, message: text, skipAnimation: false, content: "" };
    const agentPlaceholder = {
      name: selectedSpace.display_name,
      message: "",
      skipAnimation: false,
      content: ""
    };

    setMessages(prev => [...prev, userMsg, agentPlaceholder]);
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
            name: selectedSpace.display_name,
            message: data.answer || "",
            table_data: data.table_data,
            query: data.query,
            suggested_questions: data.suggested_questions,
            message_id: data.message_id,
            skipAnimation: false,
            content: data.content || ""
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowSpaceSelector(false);
      }
    };
    if (showSpaceSelector) {
      document.addEventListener("mousedown", handleClickOutside, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [showSpaceSelector]);

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Box sx={{ px: 1, pl: 0.5, background: HEADER_GRADIENT, minHeight: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton onClick={() => setSelectedSpace(SPACES[0])} size="small" sx={{ color: "common.white" }}><ArrowBackIcon fontSize="small" /></IconButton>
          <Avatar sx={{ width: 32, height: 32, background: "linear-gradient(135deg, #7C3AED, #DB2777)", fontSize: 14 }}>
            {selectedSpace.type === "agent" ? "A" : "G"}
          </Avatar>
          <Typography variant="subtitle2" sx={{ color: "common.white", ml: 0.75, fontWeight: 600 }}>{selectedSpace.display_name}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton onClick={onMinimize} size="small" sx={{ color: "common.white" }}><RemoveIcon fontSize="small" /></IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: "common.white" }}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      <Box ref={chatAreaRef} sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: "#F9F9F9" }}>
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

      <Box sx={{ px: 1.5, py: 1.5, bgcolor: "#FFF", borderTop: "1px solid #F0F0F0" }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", borderRadius: 2.5, border: "1.5px solid #D1D5DB", px: 1, height: 44, bgcolor: "#F9FAFB" }}>
          <Box
            component="input"
            value={inputText}
            onChange={(e: any) => setInputText(e.target.value)}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question..."
            sx={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, fontFamily: "inherit", paddingLeft: '4px', color: "#1F2937", "&::placeholder": { color: "#9CA3AF" } }}
          />

          <Box ref={selectorRef} sx={{ position: "relative", flexShrink: 0 }}>
            <Box
              component="button"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowSpaceSelector(!showSpaceSelector); }}
              sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.2, py: 0.5, borderRadius: "16px", border: "1px solid #E5E7EB", bgcolor: "#FFFFFF", cursor: "pointer", whiteSpace: "nowrap", transition: "0.2s all ease", "&:hover": { bgcolor: "#F3F4F6" } }}
            >
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#4B5563", letterSpacing: '0.03em' }}>SPACES</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 14, color: "#9CA3AF", transform: showSpaceSelector ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }} />
            </Box>

            {showSpaceSelector && (
              <SpaceSelectorPopup
                currentItemId={selectedSpace.name}
                onSelect={(spaceObj: any) => { setSelectedSpace(spaceObj); setShowSpaceSelector(false); }}
                onClose={() => setShowSpaceSelector(false)}
              />
            )}
          </Box>

          <IconButton
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            sx={{ width: 32, height: 32, flexShrink: 0, bgcolor: inputText.trim() ? "#7C3AED" : "#E5E7EB", color: "#FFF", "&:hover": { bgcolor: inputText.trim() ? "#6D28D9" : "#E5E7EB" } }}
          >
            <SendIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main Modal Wrapper ───────────────────────────────────────────────────────

export function Fab3Modal({ onClose, onMinimize, isMobile }: any) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (!isMobile) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose, isMobile]);

  return (
    <Box sx={{ position: "fixed", inset: 0, zIndex: 13000, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", bgcolor: "rgba(0,0,0,0.05)", pointerEvents: isMobile ? "none" : "auto" }}>
      <Paper
        ref={modalRef}
        elevation={16}
        sx={{
          position: "fixed",
          right: isMobile ? 0 : 20,
          bottom: isMobile ? 0 : 90,
          width: isMobile ? "100%" : 800,
          height: isMobile ? "100%" : "76vh",
          maxHeight: isMobile ? "100%" : 780,
          borderRadius: isMobile ? 0 : 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "auto"
        }}
      >
        <Fab3ChatView onMinimize={onMinimize} onClose={onClose} isMobile={isMobile} />
      </Paper>
    </Box>
  );
}

export function Fab3Button({
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
        bottom: isMobile ? "150px" : "182px",
        zIndex: 9999,
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2.5px solid #1e1b4b",
        background: "linear-gradient(135deg, #a5b4fc 0%, #da70d6 50%, #f472b6 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 18px rgba(218, 112, 214, 0.45)",
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
      aria-label="Open Multi Agent Chat"
    >
      <SparkleRectangleIcon
        style={{
          fontSize: isMobile ? "28px" : "32px",
          color: "#fff",
        }}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
    </button>
  );
}