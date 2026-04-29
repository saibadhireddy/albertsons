/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCookie } from "../csrfCookie/csrf";

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface StartConversationResponse {
  status: string;
  answer?: string;
  message_id?: string;
  table_data?: any;
  query?: string;
  query_parameter?: any[];
  row_count?: number;
  attachment_id?: string;
  suggested_questions?: string[];
  content?: string;
  conversation_id?: string;
}

export async function fetchSpaceInfo(spaceName: string, signal?: AbortSignal) {
  const res = await fetch(`${API_URL}/genie/space-info?space_name=${spaceName}`, {
    method: 'GET',
    credentials: 'include',
    signal,
  });
  return res.json();
}

export async function startConversation(spaceName: string, message: string) {
  const res = await fetch(`${API_URL}/genie/start-conversation`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('XSRF-TOKEN') || '',
    },
    body: JSON.stringify({ space_name: spaceName, message }),
  });
  return res.json() as Promise<StartConversationResponse>;
}

export async function createMessage(
  spaceName: string,
  message: string,
  conversationId: string,
) {
  const res = await fetch(`${API_URL}/genie/create-message`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('XSRF-TOKEN') || '',
    },
    body: JSON.stringify({
      space_name: spaceName,
      message,
      conversation_id: conversationId,
    }),
  });
  return res.json() as Promise<StartConversationResponse>;
}

// GenieApi.ts
export async function streamChatPost(
  body: unknown,
  onToken: (token: any) => void,
  onDone?: () => void
) {
  const url = `${API_URL}/multi-agent/invocation`;
  const response = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "text/event-stream"
    },
    body: JSON.stringify(body),
  });

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  // Ensure the promise from readStream is returned
  return readStream(reader, new TextDecoder(), "", onToken, onDone);
}

async function readStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  buffer: string,
  onToken: (t: any) => void,
  onDone?: () => void
): Promise<void> {
  const { value, done } = await reader.read();
  if (done) return onDone?.();

  buffer += decoder.decode(value, { stream: true });

  const chunks = buffer.split("\n\n");
  buffer = chunks.pop() ?? "";

  for (const chunk of chunks) {
    if (chunk.includes("event: error")) {
    const dataLine = chunk.split("\n").find(line => line.startsWith("data:"));
    if (dataLine) {
        try {
            const errorData = dataLine.replace("data:", "").trim();
            // Instead of parsing here, we pass the string to onToken
            // This allows your component's raw.startsWith('{') check to work
            const errorObj = JSON.parse(errorData);
            onToken(JSON.stringify({ _isError: true, ...errorObj })); 
        } catch (e) {
            console.error("Error parsing error chunk", e);
        }
    }
    continue;
}

    if (!chunk.startsWith("data:")) continue;

    const data = chunk.slice(5).trim();
    if (data === "[DONE]") return onDone?.();
    onToken(data);
  }

  return readStream(reader, decoder, buffer, onToken, onDone);
}