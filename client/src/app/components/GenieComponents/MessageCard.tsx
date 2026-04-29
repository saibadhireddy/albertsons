/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { lazy, useEffect, useState, Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactTyped } from "react-typed";
import ReactMarkdown from "react-markdown";
import type { GridColDef } from "@mui/x-data-grid";
import { Typography } from "@mui/material";
import MessageErrorState from "./MessageErrorState";
import remarkGfm from "remark-gfm";
import "./MarkdownStyles.css";

// Lazy Imports
import PopulateTable from "./PopulateTable";
import GenieFeedback from "./GenieFeedback";
import SuggestedQuestions from "./SuggestedQuestions";

const formatMessage = (msg: string) => {
  return msg.replace(/<name>.*?<\/name>/g, "").trim();
};

const API_URL = import.meta.env.VITE_API_BASE_URL || "";

const MessageCardStyle = {
  eachMessage: {
    height: "25px",
    width: "25px",
    margin: "auto",
    borderRadius: "14px",
    fontSize: "12px",
    color: "whitesmoke",
    lineHeight: "25px",
    fontWeight: "700",
  },
  genieIcon: { fontSize: "17px", marginTop: "4px", marginLeft: "-3px" },
  authorName: {
    marginTop: "0px",
    fontSize: "13px",
    fontWeight: "700",
    wordBreak: "break-all",
  },
  authorMessage: {
    wordWrap: "break-word" as const,
    whiteSpace: "normal" as const,
    marginTop: "5px",
    fontSize: "13px",
    lineHeight: "1.6",
    width: "100%",
    overflowX: "hidden" as const,
    "& p": { margin: "0 0 4px 0" },
    "& ul, & ol": { paddingLeft: "20px", margin: "4px 0" },
    "& li": { marginBottom: "2px" },
  },
};

interface MessageCardProps {
  isFirstMessage?: boolean;
  passref?: React.RefObject<HTMLDivElement> | null;
  name: string;
  message: string;
  content: string;
  lastMessage: boolean;
  conversationId?: string;
  messageId?: string | undefined;
  attachmentId?: string | undefined;
  tableData?: { columns: GridColDef[]; data: any[] } | undefined;
  query?: string | undefined;
  query_parameter?: any[];
  rowCount?: number | undefined;
  suggestedQuestions?: string[];
  onQuestionClick?: (question: string) => void;
  skipAnimation?: boolean;
  selectedSpaceName: string | null;
  error?: any;
  onRetry?: () => void;
  disabled?: boolean;
  functionCall?: {
    name: string;
    sql: string;
    thought?: string;
    raw: any;
  };
}

export function MessageCard(props: MessageCardProps) {
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [localTableData, setLocalTableData] = useState(props.tableData);
  const [localRowCount, setLocalRowCount] = useState(props.rowCount);
  const [showSql, setShowSql] = useState(false);

  const isAgentAuthor = props.name === "Agent" || props.name === "Genie";
  const [typingFinished, setTypingFinished] = useState(
    props.skipAnimation || !props.lastMessage || !isAgentAuthor,
  );

  const displayName = props.name;
  const hasData = !!(localTableData && localTableData.data.length > 0);

  // --- Chart Logic Addition ---
  const getInitialChartType = () => {
    if (!hasData) return null;
    const text = (props.message || "").toLowerCase();
    const count = localRowCount || localTableData?.data.length || 0;

    if (/\b(pie|pi|pye)\b/i.test(text)) return "pie";
    if (/\b(donut|doughnut|dohnut|donit|dnut)\b/i.test(text)) return "donut";
    if (/\b(line|lin|lyne)\b/i.test(text)) return "line";
    if (/\b(horizontal|horztal|hozontal|horiz|h bar)\b/i.test(text))
      return "horizontalBar";
    if (/\b(bar|ber|baer)\b/i.test(text)) return "bar";

    if (count > 20) return null;
    if (count >= 10) return "line";
    return "bar";
  };

  const initialChartType = getInitialChartType();
  // ----------------------------

  useEffect(() => {
    setLocalTableData(props.tableData);
    setLocalRowCount(props.rowCount);
  }, [props.tableData, props.rowCount]);

  useEffect(() => {
    if (hasData) {
      setIsDataLoading(true);
      const delay = (props.skipAnimation ? 0 : props.message.length) * 15;
      const timer = setTimeout(() => setIsDataLoading(false), delay);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [hasData, props.message, props.skipAnimation]);

  useEffect(() => {
    if (props.functionCall && isAgentAuthor) {
      setTypingFinished(true);
    }
  }, [props.functionCall, isAgentAuthor]);

  const handleUpdateData = (newData: any, newCount: number) => {
    setLocalTableData(newData);
    setLocalRowCount(newCount);
  };

  const renderCleanJson = (sql: string) => {
    let cleanSql = sql;
    try {
      const parsed = JSON.parse(sql);
      cleanSql = parsed.genie_query || parsed.sql || sql;
    } catch (e) {
      console.debug({ e });
    }
    return JSON.stringify({ genie_query: cleanSql }, null, 2);
  };

  const isMessageLoading = isAgentAuthor && props.message === "Loading";

  return (
    <Box>
      <Grid container spacing={1} width={"100%"} padding={"10px 0"}>
        <Grid size={1} textAlign={"center"}>
          <Box
            sx={{
              backgroundColor: isAgentAuthor ? "#444795" : "#db5777",
              ...MessageCardStyle.eachMessage,
            }}
          >
            {isAgentAuthor ? (
              <AutoAwesomeIcon sx={MessageCardStyle.genieIcon} />
            ) : (
              props.name[0]?.toUpperCase()
            )}
          </Box>
        </Grid>
        <Grid size={11} textAlign={"left"}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box component={"span"} sx={MessageCardStyle.authorName}>
              {displayName}
            </Box>
          </Box>

          <Box sx={MessageCardStyle.authorMessage}>
            {props.error ? (
              <MessageErrorState error={props.error} onRetry={props.onRetry} />
            ) : isMessageLoading ? (
              null
            ) : (
              <div className="markdown-container">
                {props.functionCall?.sql && (
                  <Box
                    sx={{
                      mb: 1.5,
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Box
                      onClick={() => setShowSql(!showSql)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 1.5,
                        py: 0.8,
                        cursor: "pointer",
                        gap: 1,
                        "&:hover": { bgcolor: "#f9f9f9" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: "1px solid #626469",
                          color: "#626469",
                        }}
                      >
                        <span style={{ fontSize: "10px" }}>✓</span>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: "#626469",
                          flexGrow: 1,
                          fontWeight: 500,
                        }}
                      >
                        Analysis complete
                      </Typography>
                      <Box
                        sx={{
                          transform: showSql
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          display: "flex",
                          transition: "0.2s",
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#626469"
                          strokeWidth="2"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </Box>
                    </Box>

                    {showSql && (
                      <Box sx={{ p: 1.5, bgcolor: "#f4f4f8", borderTop: "1px solid #eee", overflowX: "auto" }}>
                        <div className="markdown-container"> {/* Wrap in your container */}
                          {props.functionCall?.thought && (
                            <Box sx={{ mb: 2, fontSize: "12px", color: "#626469" }}>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Use the scroll wrapper you defined in CSS
                                  table: ({ ...p }) => (
                                    <div className="table-scroll-wrapper">
                                      <table {...p} />
                                    </div>
                                  ),
                                }}
                              >
                                {props.functionCall.thought}
                              </ReactMarkdown>
                            </Box>
                          )}
                        </div>
                        <Box
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {renderCleanJson(props.functionCall!.sql)}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {typingFinished ? (
                  (props.functionCall?.thought?.trim().includes(formatMessage(props.message).trim())) ? null : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ ...p }) => (
                          <div className="table-scroll-wrapper">
                            <table {...p} />
                          </div>
                        ),
                      }}
                    >
                      {formatMessage(props.message)}
                    </ReactMarkdown>
                  )
                ) : (
                  (props.functionCall?.thought?.trim().includes(formatMessage(props.message).trim())) ? null : (
                    <ReactTyped
                      strings={[formatMessage(props.message)]}
                      typeSpeed={1}
                      showCursor={false}
                      onComplete={() => setTypingFinished(true)}
                    />
                  )
                )}
              </div>
            )}
          </Box>

          <Suspense fallback={<CircularProgress size={20} />}>
            {hasData && (props.query || props.functionCall?.sql) && (
              <Box sx={{ mt: 2, minHeight: "100px" }}>
                {isDataLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      py: 4,
                      color: "#444795",
                    }}
                  >
                    <CircularProgress size={20} color="inherit" />
                    <Typography
                      variant="caption"
                      sx={{ ml: 1, fontWeight: 600 }}
                    >
                      Preparing data...
                    </Typography>
                  </Box>
                ) : (
                  <PopulateTable
                    data={localTableData!}
                    query={props.query || props.functionCall?.sql}
                    query_parameter={props.query_parameter}
                    rowCount={localRowCount ?? localTableData!.data.length}
                    onUpdateData={handleUpdateData}
                    spaceName={props.selectedSpaceName}
                    conversationId={props.conversationId}
                    initialChartType={initialChartType}
                  />
                )}
              </Box>
            )}

            {isAgentAuthor &&
              !isMessageLoading &&
              !props.isFirstMessage &&
              props.name !== "Agent" && (
                <GenieFeedback
                  messageId={props.messageId}
                  conversationId={props.conversationId}
                  selectedSpaceName={props.selectedSpaceName}
                  lastMessage={props.lastMessage}
                  hasData={hasData}
                  apiUrl={API_URL}
                />
              )}

            {props.suggestedQuestions &&
              props.suggestedQuestions.length > 0 &&
              typingFinished && (
                <SuggestedQuestions
                  questions={props.suggestedQuestions}
                  onQuestionClick={props.onQuestionClick}
                  disabled={props.disabled}
                />
              )}
          </Suspense>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MessageCard;