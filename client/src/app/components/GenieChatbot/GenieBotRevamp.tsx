/* eslint-disable @typescript-eslint/no-explicit-any */

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useEffect, useState, useRef, lazy } from "react";
import Tooltip from "@mui/material/Tooltip";
import { useTheme, useMediaQuery } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { sxStyle } from "./GenieSxStyle";
import { GenieHeader } from "../GenieComponents/GenieHeader";
import { SpaceList } from "../GenieComponents/SpaceList";
import { ChatView } from "../GenieComponents/ChatView";
import {
  createMessage,
  fetchSpaceInfo,
  startConversation,
  streamChatPost,
} from "../../services/GenieApi/GenieApi";
import { MessageCard } from "../GenieComponents/MessageCard.tsx"
const SparkleRectangleIcon = lazy(() =>
  import("@databricks/design-system").then((mod) => ({
    default: mod.SparkleRectangleIcon,
  })),
);

interface ChatMessage {
  name: string;
  message: string;
  message_id?: string;
  attachment_id?: string;
  table_data?: { columns: GridColDef[]; data: any[] };
  query?: string;
  query_parameters?: any[] | "";
  row_count?: number;
  suggested_questions?: string[];
  skipAnimation: boolean;
  content: string;
  error?: any;
  multi_agent_message_id?: string;
  multi_agent_role?: string;
  agentName?: string;
  tempThought?: string; // Add this to store intermediate text/tables
  functionCall?: {
    name: string;
    sql: string;
    thought?: string; // Property now recognized by TS
    raw: any;
  };
}

interface SpaceMetadata {
  [key: string]: {
    description: string;
    suggested_questions: string[];
    title: string;
    space_id: string;
    warehouse_id: string;
  };
}

const CACHE_KEY = "genie_spaces_metadata";
const SPACES = [
  // {
  //   id: "0",
  //   name: "MULTI_AGENT",
  //   display_name: "Multi Agent",
  //   description:
  //     "Ask questions to this supervisor and it re-routes the question to relevant genie and gets you the response",
  // },
  {
    id: "1",
    name: "MARGE",
    display_name: "Warehouse Analyst Genie",
    description:
      "Deep dive into AQL/INQ Funnels, Conversion Ratios, Multi-touch Outcomes, and Granular Performance Data",
  },
  // {
  //   id: "3",
  //   name: "MARDI",
  //   display_name: "Mardi",
  //   description:
  //     "Understand digital performance through insights on campaigns, offers, and trends",
  // },
  // {
  //   id: "5",
  //   name: "PLANNING_GENIE",
  //   display_name: "Maple",
  //   description: "Understand marketing plans and campaign taxonomy",
  // },
];

// simple helper to create conversation ids

const createConversationId = () => {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
};

function GenieChatbotRevamp() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const messageWindowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [syncingSpaces, setSyncingSpaces] = useState<Set<string>>(new Set());
  const [spacesMetadata, setSpacesMetadata] = useState<SpaceMetadata>({});
  const [currentView, setCurrentView] = useState<"list" | "chat">("list");
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedSpaceName, setSelectedSpaceName] = useState<string | null>(null,);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [qnsTextBox, setQnsTextBox] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [restrictedSpaces, setRestrictedSpaces] = useState<Set<string>>(new Set(),);
  const isChatView = currentView === "chat";
  const [isMultiAgentStreaming, setIsMultiAgentStreaming] = useState(false);
  const [multiAgentHistory, setMultiAgentHistory] = useState<any[]>([]);
  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsChatOpen(false);
      }
    }
    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatOpen]);

  // Initialize metadata

  const initializeMetadata = async (signal?: AbortSignal) => {
    const today = new Date().toDateString();
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const cacheDate = new Date(parsed.timestamp).toDateString();
      if (
        cacheDate === today &&
        parsed.data &&
        Object.keys(parsed.data).length > 0
      ) {
        setSpacesMetadata(parsed.data);
        return;
      }
    }
    setIsLoadingMetadata(true);
    const metadataMap: SpaceMetadata = {};
    const restricted = new Set<string>();
    setSyncingSpaces(new Set(SPACES.map((s) => s.name)));
    try {
      await Promise.all(
        SPACES.map(async (space) => {
          try {
            if (space.name === "MULTI_AGENT") {
              metadataMap[space.name] = {
                description:
                  "Ask questions to this supervisor and it re-routes the question to relevant genie and gets you the response",
                suggested_questions: [
                  // 'Which channels drove the most pipeline last quarter?',
                  // 'Show me email performance for FY25 Q4.',
                ],
                title: "Multi Agent Supervisor",
                space_id: "",
                warehouse_id: "",
              };
              return;
            }
            const res = await fetchSpaceInfo(space.name, signal);
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
          } catch (error) {
            console.error(error);
          } finally {
            setSyncingSpaces((prev) => {
              const next = new Set(prev);
              next.delete(space.name);
              return next;
            });
          }
        }),
      );
      setSpacesMetadata(metadataMap);
      setRestrictedSpaces(restricted);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: metadataMap }),
      );
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    initializeMetadata(controller.signal);
    return () => controller.abort();
  }, []);

  // Handle a single multi-agent item coming from SSE

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
            raw: item,
          },
        };
        return updated;
      });
      return;
    }

    if (item.type === "message" && item.role === "assistant") {
      const textParts = item.content
        ?.filter((c: any) => c.type === "output_text")
        .map((c: any) => c.text) || [];
      const fullText = textParts.join("\n").trim();

      if (!fullText) return;

      const isInternalName = fullText.includes("<name>");
      const isThought = fullText.includes("I'll query") || fullText.includes("Thinking");
      const isRawTable = fullText.trim().startsWith("|") && !fullText.includes("Analysis:");

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];

        // FIX: Check if this exact text was already processed in tempThought
        const alreadyInThought = last.tempThought?.includes(fullText);

        if (isInternalName || isThought || isRawTable) {
          // Only append to thought if it's not already there
          if (!alreadyInThought) {
            last.tempThought = (last.tempThought || "") + "\n\n" + fullText;
          }
          return updated;
        }

        // If it's a normal message, but we've already classified this text 
        // as a thought earlier in the stream, don't show it in the main chat.
        if (alreadyInThought) {
          return updated;
        }

        const baseMessage = last.message === "Loading" ? "" : last.message;

        // Final Deduplication: Don't add if the message already contains this exact string
        if (baseMessage.includes(fullText)) {
          return updated;
        }

        updated[updated.length - 1] = {
          ...last,
          name: "Agent",
          message: baseMessage + fullText,
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
      content: [
        {
          type: "input_text",
          text: userPrompt,
        },
      ],
    });
    return msgs;
  };

  // Handle sending message and fetching answer

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];

    if (
      lastMsg &&
      lastMsg.message === "Loading" &&
      selectedSpaceId &&
      messages.length >= 2
    ) {
      const userPrompt = messages[messages.length - 2].message;
      const isNewConversation = !conversationId;

      const doRequest = async () => {
        try {
          if (selectedSpaceName === "MULTI_AGENT") {
            const stackedMsgs = buildStackedMessagesPayload(
              multiAgentHistory,
              userPrompt,
            );
            let convId = conversationId;
            if (!convId) {
              convId = createConversationId();
              setConversationId(convId);
            }

            const body: any = {
              messages: stackedMsgs,
              conversation_id: convId,
            };

            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = {
                ...last,
                name: "Agent",
                message: "",
                content: "",
                skipAnimation: true,
              };
              return updated;
            });

            setIsMultiAgentStreaming(true);

            await streamChatPost(
              body,
              (raw: string) => {
                let chunk: any;
                try {
                  // Handle error chunks first
                  if (raw.startsWith('{') && raw.includes('_isError')) {
                    chunk = JSON.parse(raw);
                    if (chunk._isError) {
                      setMessages((prev) => {
                        const updated = [...prev];
                        const last = updated[updated.length - 1];
                        updated[updated.length - 1] = {
                          ...last,
                          name: "Agent",
                          message: `Error: ${chunk.message || 'Unknown error'}`,
                          error: chunk,
                          skipAnimation: true,
                          content: "",
                        };
                        return updated;
                      });
                      setIsMultiAgentStreaming(false);
                      return;
                    }
                  }

                  chunk = JSON.parse(raw);
                  console.debug({ messages });
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
              () => {
                setIsMultiAgentStreaming(false);
              },
            );
            return;
          }

          // Normal Genie spaces (existing code unchanged)
          const data = isNewConversation
            ? await startConversation(selectedSpaceName as string, userPrompt)
            : await createMessage(
              selectedSpaceName as string,
              userPrompt,
              conversationId,
            );

          if (data.status === "error") {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                name: "Genie",
                message: "Error",
                error: data,
                skipAnimation: true,
                content: "",
              };
              return updated;
            });
            return;
          }

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              name: "Genie",
              message: data.answer || "",
              message_id: data.message_id,
              table_data: data.table_data,
              query: data.query,
              query_parameters: data.query_parameter || "",
              row_count: data.row_count,
              attachment_id: data.attachment_id,
              suggested_questions: data.suggested_questions || [],
              skipAnimation: false,
              content: data.content || "",
            };

            return updated;
          });


          if (isNewConversation && data.conversation_id) {
            setConversationId(data.conversation_id);
          }
        } catch (error: any) {
          console.error({ error });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              name: selectedSpaceName === "MULTI_AGENT" ? "Agent" : "Genie",
              message: "Error",
              error,
              skipAnimation: true,
              content: "",
            };
            return updated;
          });
          if (selectedSpaceName === "MULTI_AGENT") {
            setIsMultiAgentStreaming(false);
          }
        }
      };

      doRequest();
    }

    if (messageWindowRef.current) {
      messageWindowRef.current.scrollTop =
        messageWindowRef.current.scrollHeight;
    }
  }, [
    messages,
    selectedSpaceId,
    conversationId,
    selectedSpaceName,
    multiAgentHistory,
  ]);

  const handleSelectSpace = (space: any) => {
    setSelectedSpaceId(space.id);
    setSelectedSpaceName(space.name);
    setCurrentView("chat");
    setConversationId("");
    setMultiAgentHistory([]);
    const metadata = spacesMetadata[space.name];

    setMessages([
      {
        name: space.name === "MULTI_AGENT" ? "Agent" : "Genie",
        message: metadata?.description || space.description,
        suggested_questions: metadata?.suggested_questions || [],
        skipAnimation: true,
        content: "",
      },
    ]);
  };
  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedSpaceId(null);
    setSelectedSpaceName(null);
    setMessages([]);
    setConversationId("");
    setMultiAgentHistory([]);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    handleBackToList();
  };

  const handleSubmit = (e: any, manualMsg?: string) => {
    if (e) e.preventDefault();
    const textToSubmit = manualMsg || qnsTextBox;
    if (!textToSubmit.trim() || !selectedSpaceId) return;

    setMessages((prev) => [
      ...prev,

      {
        name: "TestUser",
        message: textToSubmit,
        skipAnimation: false,
        content: "",
      },
      {
        name: selectedSpaceName === "MULTI_AGENT" ? "Agent" : "Genie",
        message: "Loading",
        skipAnimation: false,
        content: "",
      },
    ]);

    setQnsTextBox("");
  };

  const handleSuggestedQuestionClick = (question: string) => {
    const isMessageLoading =
      messages.length > 0 &&
      messages[messages.length - 1].message === "Loading";
    if (isMessageLoading) return;
    setQnsTextBox(question);
    setTimeout(() => handleSubmit(null, question), 10);
  };

  const isMessageLoading =
    messages.length > 0 && messages[messages.length - 1].message === "Loading";

  const isChatLoading = isMessageLoading;


  const currentSpaceData =
    selectedSpaceName && selectedSpaceName !== "MULTI_AGENT"
      ? spacesMetadata[selectedSpaceName]
      : null;

  const redirectUrl =
    currentSpaceData?.space_id && selectedSpaceName !== "MULTI_AGENT"
      ? conversationId
        ? `https://adb-2376768479807879.19.azuredatabricks.net/genie/rooms/${currentSpaceData.space_id}/chats/${conversationId}?o=2376768479807879`
        : `https://adb-2376768479807879.19.azuredatabricks.net/genie/rooms/${currentSpaceData.space_id}?o=2376768479807879`
      : null;

  const title =
    currentView === "list"
      ? "Marketing Genie Spaces"
      : SPACES.find((s) => s.name === selectedSpaceName)?.display_name ||
      selectedSpaceName ||
      "";

  return (
    <Box ref={containerRef}>
      {!isChatOpen && (
        <Tooltip title="Ask Genie">
          <Box
            sx={sxStyle.genieFAB(isMobile)}
            onClick={() => setIsChatOpen(true)}
          >
            <SparkleRectangleIcon
              style={{ fontSize: isMobile ? "28px" : "32px", color: "#fff" }}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </Box>
        </Tooltip>
      )}

      <Paper
        sx={{
          ...sxStyle.chatPopUp(isChatView, isMobile),

          display: isChatOpen ? "flex" : "none",
        }}
        elevation={6}
      >
        <GenieHeader
          currentView={currentView}
          selectedSpaceName={selectedSpaceName}
          title={title}
          onBack={handleBackToList}
          onMinimize={() => setIsChatOpen(false)}
          onClose={handleCloseChat}
          sxStyle={sxStyle}
        />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: "#fff",
          }}
        >
          {currentView === "list" ? (
            <SpaceList
              spaces={SPACES}
              spacesMetadata={spacesMetadata}
              syncingSpaces={syncingSpaces}
              restrictedSpaces={restrictedSpaces}
              isLoadingMetadata={isLoadingMetadata}
              onRetrySync={() => initializeMetadata()}
              onSelectSpace={handleSelectSpace}
              sxStyle={sxStyle}
            />
          ) : (
            <ChatView
              messages={messages}
              conversationId={conversationId}
              selectedSpaceName={selectedSpaceName}
              redirectUrl={redirectUrl}
              isMobile={isMobile}
              isMessageLoading={isMessageLoading}
              isChatLoading={isChatLoading || isMultiAgentStreaming}
              qnsTextBox={qnsTextBox}
              onChangeText={setQnsTextBox}
              onSubmit={handleSubmit}
              onSuggestedQuestionClick={handleSuggestedQuestionClick}
              userName={"TestUser"}
              sxStyle={sxStyle}
              messageWindowRef={messageWindowRef}
              MessageCard={MessageCard}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default GenieChatbotRevamp;
