import { ChatGroq } from '@langchain/groq';
import { ConversationChain } from 'langchain/chains';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts';
import { BufferWindowMemory } from 'langchain/memory';
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // Get Groq API key
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY not found in environment variables');
  }

  const model = 'llama3-8b-8192';

  // Initialize Groq Langchain chat object
  const groqChat = new ChatGroq({
    apiKey: groqApiKey,
    model: model,
  });

  console.log("Hello! I'm your friendly Groq chatbot. I can help answer your questions, provide information, or just chat. I'm also super fast! Let's start our conversation!");

  const systemPrompt = 'You are a friendly conversational chatbot';
  const conversationalMemoryLength = 5;

  const memory = new BufferWindowMemory({
    k: conversationalMemoryLength,
    returnMessages: true,
    memoryKey: 'chat_history',
  });

  // Construct a chat prompt template
  const prompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(systemPrompt),
    new MessagesPlaceholder('chat_history'),
    HumanMessagePromptTemplate.fromTemplate('{human_input}'),
  ]);

  // Create a conversation chain
  const conversation = new ConversationChain({
    llm: groqChat,
    prompt: prompt,
    verbose: false,
    memory: memory,
  });

  // Simulating user input in a loop
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = () => {
    readline.question('Ask a question: ', async (userQuestion:any) => {
      if (userQuestion) {
        const response = await conversation.call({ human_input: userQuestion });
        console.log("Chatbot:", response.response);
        askQuestion(); // Ask for the next question
      } else {
        readline.close();
      }
    });
  };

  askQuestion(); // Start the conversation loop
}

main().catch(console.error);