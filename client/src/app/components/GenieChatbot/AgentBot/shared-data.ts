export type ItemType = "agent" | "space";

export interface ChatItem {
  id: string;
  name: string;
  display_name:string
  description: string;
  type: ItemType;
}

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export const ALL_CHAT_ITEMS: ChatItem[] = [
  {
    id: "0",
    name: "MULTI_AGENT",
    display_name: "Multi Agent",
    description:
      "Ask questions to this supervisor and it re-routes the question to relevant genie and gets you the response",
      type: "agent",
  },
  {
    id: "1",
    name: "MARGE",
    display_name: "Marge",
    description:
      "Explore Outcomes, Campaign Data, Account & Contact Details, $DBU Consumption",
      type: "space",
  },
  {
    id: "3",
    name: "MARDI",
    display_name: "Mardi",
    description:
      "Understand digital performance through insights on campaigns, offers, and trends",
       type: "space",
  },
  {
    id: "5",
    name: "PLANNING_GENIE",
    display_name: "Maple",
    description: "Understand marketing plans and campaign taxonomy",
     type: "space",
  },
];

export const MULTI_AGENT_ITEM: ChatItem = ALL_CHAT_ITEMS[0];

export const HEADER_GRADIENT = "linear-gradient(to right, #2374C4, #0F2359)";
