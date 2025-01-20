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

    const updatedData = await updateUserSavedData({ id, updates });
    return Response.json(updatedData);
  } catch (error) {
    console.error("Error updating data:", error);
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
