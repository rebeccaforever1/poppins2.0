import { convertToCoreMessages, Message, streamText } from "ai";

import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { saveChat } from "@/db/queries";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();
  
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );
  
  const result = await streamText({
    model: geminiProModel,
    system: `
      - You are a parenting advice assistant.
      - Keep your responses concise and supportive.
      - Ask follow up questions to nudge user into the optimal flow
      - If generating structured outputs like tips, integrate them into a conversational reply.
      - Do not output raw JSON unless explicitly requested.
    `,
    messages: coreMessages,
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat:", error);
        }
      }
    },
  });


  // Return the response with await
  const responseText = await result.text;
  return new Response(responseText || "Here is your parenting advice.", {
    headers: { "Content-Type": "text/plain" },
  });
}