import { useState, useRef, useEffect } from "react";
import {
  type ChatItem,
  type Message,
  ALL_CHAT_ITEMS,
  HEADER_GRADIENT,
} from "./shared-data";

import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
//   Divider,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GridViewIcon from "@mui/icons-material/GridView";


// ─── Internal Chat View ───────────────────────────────────────────────────────

function Fab1ChatView({
  item,
  onBack,
  onClose,
  onMinimize,
  isMobile,
  onItemSelect,
}: {
  item: ChatItem;
  onBack: () => void;
  onClose: () => void;
  onMinimize: () => void;
  isMobile: boolean;
  onItemSelect: (id: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showSwitcher, setShowSwitcher] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatAreaRef.current)
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `I'm ${item.type === "agent" ? "an Agent" : "Genie"} — happy to help you!`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const avatarBg = item.type === "agent" ? "#EA580C" : "#2563EB";

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Header */}
      <Box
        sx={{
          px: 1,
          pl: 0.5,
          background: HEADER_GRADIENT,
          minHeight: 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton
            onClick={onBack}
            size="small"
            sx={{ color: "common.white", "&:hover": { background: "whiteAlpha.100" } }}
            aria-label="Back"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: avatarBg,
              fontSize: 14,
            }}
          >
            {item.type === "agent" ? "A" : "🧞"}
          </Avatar>
          <Typography
            variant="subtitle2"
            sx={{
              color: "common.white",
              ml: 0.75,
              maxWidth: 220,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 600,
            }}
          >
            {item.name}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton
            onClick={onMinimize}
            size="small"
            sx={{ color: "common.white" }}
            aria-label="Minimize"
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "common.white" }}
            aria-label="Close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box
        ref={chatAreaRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: isMobile ? 1.25 : 1.75,
          bgcolor: "#F3F4F6",
        }}
      >
        {/* Initial bot message */}
        <Box display="flex" gap={1.5} mb={2.5}>
          <Avatar
            sx={{
              flexShrink: 0,
              width: 36,
              height: 36,
              bgcolor: avatarBg,
              fontSize: 12,
            }}
          >
            {item.type === "agent" ? "A" : "🧞"}
          </Avatar>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 1.5,
              maxWidth: "80%",
              bgcolor: "#E5E7EB",
            }}
          >
            <Typography variant="body2" sx={{ fontSize: 13, color: "#111827" }}>
              {item.description}
            </Typography>
          </Paper>
        </Box>

        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <Box
              key={msg.id}
              display="flex"
              gap={1.5}
              mb={1.5}
              flexDirection={isUser ? "row-reverse" : "row"}
            >
              {!isUser && (
                <Avatar
                  sx={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    bgcolor: avatarBg,
                    fontSize: 12,
                  }}
                >
                  {item.type === "agent" ? "A" : "🧞"}
                </Avatar>
              )}
              <Paper
                elevation={isUser ? 3 : 1}
                sx={{
                  borderRadius: 3,
                  p: 1.25,
                  maxWidth: "78%",
                  bgcolor: isUser ? "#2563EB" : "#E5E7EB",
                  color: isUser ? "#FFFFFF" : "#111827",
                  ml: isUser ? "auto" : 0,
                }}
              >
                <Typography variant="body2" sx={{ fontSize: 13 }}>
                  {msg.text}
                </Typography>
              </Paper>
            </Box>
          );
        })}
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          borderTop: "1px solid #E5E7EB",
          p: 1.25,
          bgcolor: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <Box display="flex" gap={1} alignItems="center">
          {/* Back to list */}
          <IconButton
            onClick={onBack}
            size="small"
            sx={{
              borderRadius: 2,
              border: "1px solid #E5E7EB",
              bgcolor: "background.paper",
            }}
            title="Back to list"
          >
            <ArrowBackIcon fontSize="small" sx={{ color: "#6B7280" }} />
          </IconButton>

          <TextField
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            size="small"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: 13,
                bgcolor: "#FFFFFF",
              },
            }}
          />

          {/* Grid / Switch chat */}
          <Box position="relative" flexShrink={0}>
            <IconButton
              onClick={() => setShowSwitcher((v) => !v)}
              size="small"
              sx={{
                borderRadius: 2,
                border: "1px solid #D1D5DB",
                bgcolor: "#F9FAFB",
                "&:hover": { bgcolor: "#EEF2FF" },
              }}
              title="Switch chat"
            >
              <GridViewIcon fontSize="small" sx={{ color: "#7C3AED" }} />
            </IconButton>

            {showSwitcher && (
              <Paper
                elevation={6}
                sx={{
                  position: "absolute",
                  bottom: "100%",
                  right: 0,
                  mb: 1,
                  width: 280,
                  borderRadius: 2,
                  overflow: "hidden",
                  zIndex: 10,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderBottom: "1px solid #E5E7EB",
                    background:
                      "linear-gradient(to right, #F3E8FF, #EFF6FF)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#4B5563",
                    }}
                  >
                    Switch to…
                  </Typography>
                </Box>
                <Box sx={{ p: 1, maxHeight: 260, overflowY: "auto" }}>
                  {ALL_CHAT_ITEMS.map((opt) => (
                    <ListItemButton
                      key={opt.id}
                      onClick={() => {
                        onItemSelect(opt.id);
                        setShowSwitcher(false);
                      }}
                      disabled={opt.id === item.id}
                      sx={{
                        mb: 0.5,
                        borderRadius: 1.5,
                        opacity: opt.id === item.id ? 0.6 : 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor:
                              opt.type === "agent" ? "#EA580C" : "#2563EB",
                            fontSize: 11,
                          }}
                        >
                          {opt.type === "agent" ? "A" : "🧞"}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 600,
                              color:
                                opt.type === "agent" ? "#C2410C" : "#1D4ED8",
                            }}
                          >
                            {opt.name}
                            {opt.id === item.id && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: 10,
                                  color: "#9CA3AF",
                                  ml: 0.5,
                                }}
                              >
                                (Current)
                              </Typography>
                            )}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            sx={{ fontSize: 11, color: "#6B7280" }}
                          >
                            {opt.description}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>

          {/* Send */}
          <IconButton
            onClick={handleSend}
            disabled={!inputText.trim()}
            sx={{
              borderRadius: 2,
              bgcolor: inputText.trim() ? "#2563EB" : "#E5E7EB",
              color: "#FFFFFF",
              "&:hover": {
                bgcolor: inputText.trim() ? "#1D4ED8" : "#E5E7EB",
              },
            }}
            aria-label="Send"
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}


// ─── FAB1 Modal ───────────────────────────────────────────────────────────────

export function Fab1Modal({
  onClose,
  onMinimize,
  isMobile,
}: {
  onClose: () => void;
  onMinimize: () => void;
  isMobile: boolean;
}) {
  const [selectedItem, setSelectedItem] = useState<ChatItem | null>(null);
  const [isSpaceOpen, setIsSpaceOpen] = useState(false);

  const agents = ALL_CHAT_ITEMS.filter((i) => i.type === "agent");
  const spaces = ALL_CHAT_ITEMS.filter((i) => i.type === "space");

  return (
    <Box
      className="fab1-backdrop"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        pr: isMobile ? 0 : 2.5,
        pb: isMobile ? 0 : 12.5,
        bgcolor: "rgba(15,23,42,0.25)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Paper
        elevation={16}
        sx={{
          position: "fixed",
          right: isMobile ? 0 : 20,
          bottom: isMobile ? 0 : 100,
          width: isMobile ? "100%" : selectedItem ? 500 : 380,
          height: isMobile ? "100%" : selectedItem ? "76vh" : "auto",
          maxHeight: isMobile ? "100%" : 780,
          borderRadius: isMobile ? 0 : 2.5,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.25s ease, height 0.25s ease",
        }}
      >
        {selectedItem ? (
          <Fab1ChatView
            item={selectedItem}
            onBack={() => setSelectedItem(null)}
            onClose={onClose}
            onMinimize={onMinimize}
            isMobile={isMobile}
            onItemSelect={(id) => {
              const found = ALL_CHAT_ITEMS.find((i) => i.id === id);
              if (found) setSelectedItem(found);
            }}
          />
        ) : (
          <>
            {/* Header */}
            <Box
              sx={{
                px: 1,
                pl: 1.75,
                background: HEADER_GRADIENT,
                minHeight: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                borderRadius: isMobile ? 0 : "20px 20px 0 0",
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #a855f7, #ec4899)",
                  }}
                >
                  <AutoAwesomeIcon fontSize="small" sx={{ color: "#fff" }} />
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  Marketing Genie Spaces
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <IconButton
                  onClick={onMinimize}
                  size="small"
                  sx={{ color: "#fff" }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{ color: "#fff" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Content */}
            <Box
              sx={{
                overflowY: "auto",
                maxHeight: isMobile ? "70vh" : 500,
                minHeight: isMobile ? "50vh" : 320,
              }}
            >
              <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Agent Section */}
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#94A3B8",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      mb: 1,
                    }}
                  >
                    Agent
                  </Typography>
                  <List disablePadding>
                    {agents.map((item) => (
                      <ListItemButton
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        sx={{
                          mb: 0.75,
                          borderRadius: 2,
                          background: "#FFFBF7",
                          border: "1px solid #F3E8D8",
                          "&:hover": {
                            bgcolor: "#FFF3E0",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#C2410C",
                                mb: 0.3,
                              }}
                            >
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              sx={{ fontSize: 11, color: "#64748B" }}
                            >
                              {item.description}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Box>

                {/* Space Section */}
                <Box>
                  <Box
                    onClick={() => setIsSpaceOpen((v) => !v)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1,
                      borderRadius: 2,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#F9FAFB" },
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#94A3B8",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Space
                    </Typography>
                    {isSpaceOpen ? (
                      <ExpandLessIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                    ) : (
                      <ExpandMoreIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                    )}
                  </Box>
                  <Collapse in={isSpaceOpen} unmountOnExit>
                    <List disablePadding>
                      {spaces.map((item) => (
                        <ListItemButton
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          sx={{
                            mb: 0.75,
                            borderRadius: 2,
                            background: "#F0F5FF",
                            border: "1px solid #DBEAFE",
                            "&:hover": {
                              bgcolor: "#E0EDFF",
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#1E40AF",
                                  mb: 0.3,
                                }}
                              >
                                {item.name}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                sx={{ fontSize: 11, color: "#64748B" }}
                              >
                                {item.description}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}


// ─── FAB1 Button (keep as-is or convert later) ───────────────────────────────

export function Fab1Button({
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
      title="Marketing Genie Spaces"
      style={{
        position: "fixed",
        right: isMobile ? "15px" : "20px",
        bottom: isMobile ? "20px" : "28px",
        zIndex: 9999,
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2.5px solid #0F172A",
        background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 18px rgba(37,99,235,0.45)",
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.transform = "scale(1.1)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
      }
      aria-label="Open Marketing Genie Spaces"
    >
      <AutoAwesomeIcon className="w-5 h-5 text-white" />
    </button>
  );
}
