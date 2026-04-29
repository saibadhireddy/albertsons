import { RouterProvider } from 'react-router';
import { router } from './routes';
import GenieChatbotRevamp from "./components/GenieChatbot/GenieBotRevamp";

export default function App() {
  return <><RouterProvider router={router} /><GenieChatbotRevamp/> </>;
}
