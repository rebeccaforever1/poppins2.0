import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateParentingAdvice,
  generateDevelopmentMilestones,
  generateBehaviorManagementStrategies,
  generateParentingTips,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
// import { tips } from "../../../../components/custom/parenting"; 
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");


  
  if (!id) {
    return new Response("Not Found!", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  try {
    const savedData = await getChatById({ id });

    if (!savedData) {
      return new Response("Data not found!", { status: 404 });
    }

    if (savedData.id !== session.user.id) {
      return new Response("Unauthorized!", { status: 401 });
    }

    // Check if `tips` exist and format them
    if (savedData.tips) {
      const tipsList = savedData.tips
        .map((tip: { tip: string }) => `- ${tip.tip}`)
        .join("\n");

      return new Response(
        `Here are your saved tips:\n\n${tipsList}`,
        { headers: { "Content-Type": "text/plain" } }
      );
    }

    return Response.json(savedData);
  } catch (error) {
    console.error("Error retrieving data:", error);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}



export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found!", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }



    const { updates } = await request.json();

    // Example validation for updates
    if (!updates || typeof updates !== "object") {
      return new Response("Invalid update payload!", { status: 400 });
    }

    // If `tips` are being updated, validate them
    if (updates.tips && Array.isArray(updates.tips)) {
      updates.tips = updates.tips.map((tip: string) => ({ tip }));
    }

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