/**
 * @OneCoach/api-chat
 *
 * API routes per chat, conversations, copilot e agents
 * Esporta route handlers che possono essere usati in apps/next/app/api/*
 */

// Chat routes
export { POST as chatPOST, OPTIONS as chatOPTIONS } from './routes/chat/route';

// Conversations routes
export { GET as conversationsGET, POST as conversationsPOST } from './routes/conversations/route';
export {
  GET as conversationByIdGET,
  PATCH as conversationByIdPATCH,
  DELETE as conversationByIdDELETE,
} from './routes/conversations/[conversationId]/route';

// Copilot routes
export { POST as copilotChatStreamPOST } from './routes/copilot/chat/stream/route';
export { GET as copilotConversationsGET } from './routes/copilot/conversations/route';
export { GET as copilotConversationByIdGET } from './routes/copilot/conversations/[id]/route';

// Agents routes
export { GET as agentsMainGET, POST as agentsMainPOST } from './routes/agents/main/route';
export { POST as agentsMainStreamPOST } from './routes/agents/main/stream/route';
export {
  GET as agentsMainStatusGET,
  POST as agentsMainStatusPOST,
} from './routes/agents/main/status/route';
