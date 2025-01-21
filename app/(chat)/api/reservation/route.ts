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
    
    return Response.json(savedData);
  } catch (error) {
    console.error("Error retrieving data:", error);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}