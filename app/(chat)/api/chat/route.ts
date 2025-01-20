import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateParentingAdvice,
  generateDevelopmentMilestones,
  generateBehaviorManagementStrategies,
  generateParentingTips,
  generateCustomizedRoutine,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import { deleteChatById, getChatById, saveChat } from "@/db/queries";
import { generateUUID } from "@/lib/utils";

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
    system: `\n
        - you are a parenting advice assistant!
        - keep responses concise but supportive.
        - DO NOT output lists unless explicitly requested.
        - today's date is ${new Date().toLocaleDateString()}.
        - ask follow-up questions to clarify the user's context and provide targeted advice.
        - suggest actionable steps tailored to the child's age group and situation.
        - always assume the user is seeking practical, hands-on advice.
        `,
    messages: coreMessages,
    tools: {
      getParentingAdvice: {
        description: "Provide advice on a parenting topic for a specific age group",
        parameters: z.object({
          topic: z.string().describe("Parenting topic, e.g., Discipline, Sleep"),
          ageGroup: z.string().describe("Age group, e.g., Toddlers, Teenagers"),
        }),
        execute: async ({ topic, ageGroup }) => {
          const advice = await generateParentingAdvice({ topic, ageGroup });
          return advice;
        },
      },
      getDevelopmentMilestones: {
        description: "List typical developmental milestones for an age group",
        parameters: z.object({
          ageGroup: z.string().describe("Age group, e.g., Infants, Teens"),
        }),
        execute: async ({ ageGroup }) => {
          const milestones = await generateDevelopmentMilestones({ ageGroup });
          return milestones;
        },
      },
      getBehaviorStrategies: {
        description: "Provide strategies to manage a specific behavior",
        parameters: z.object({
          behavior: z.string().describe("Behavior to address, e.g., tantrums"),
          ageGroup: z.string().describe("Age group, e.g., Preschoolers"),
        }),
        execute: async ({ behavior, ageGroup }) => {
          const strategies = await generateBehaviorManagementStrategies({
            behavior,
            ageGroup,
          });
          return strategies;
        },
      },
      getParentingTips: {
        description: "Provide tips for a parenting context and age group",
        parameters: z.object({
          context: z.string().describe("Parenting context, e.g., Bedtime routines"),
          ageGroup: z.string().describe("Age group, e.g., Teens"),
        }),
        execute: async ({ context, ageGroup }) => {
          const tips = await generateParentingTips({ context, ageGroup });
          return tips;
        },
      },
      getCustomizedRoutine: {
        description: "Generate a customized daily routine for a child",
        parameters: z.object({
          ageGroup: z.string().describe("Child's age group"),
          focusAreas: z
            .array(z.string())
            .describe("Focus areas for the routine, e.g., Playtime, Study"),
          familyPreferences: z
            .string()
            .describe("Family preferences or constraints"),
        }),
        execute: async ({ ageGroup, focusAreas, familyPreferences }) => {
          const routine = await generateCustomizedRoutine({
            ageGroup,
            focusAreas,
            familyPreferences,
          });
          return routine;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
