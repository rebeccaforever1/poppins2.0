import { auth } from "@/app/(auth)/auth";
import { getUserSavedDataById, updateUserSavedData } from "@/db/queries";

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
    const savedData = await getUserSavedDataById({ id });

    if (!savedData) {
      return new Response("Data not found!", { status: 404 });
    }

    if (savedData.userId !== session.user.id) {
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

  try {
    const savedData = await getUserSavedDataById({ id });

    if (!savedData) {
      return new Response("Data not found!", { status: 404 });
    }

    if (savedData.userId !== session.user.id) {
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

    const updatedData = await updateUserSavedData({ id, updates });
    return Response.json(updatedData);
  } catch (error) {
    console.error("Error updating data:", error);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
