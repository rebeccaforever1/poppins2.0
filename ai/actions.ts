import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlashModel } from ".";

export async function generateParentingAdvice({
  topic,
  ageGroup,
}: {
  topic: string;
  ageGroup: string;
}) {
  const { object: advice } = await generateObject({
    model: geminiFlashModel,
    prompt: `Provide parenting advice on the topic "${topic}" for children in the age group "${ageGroup}"`,
    schema: z.object({
      topic: z.string().describe("Parenting topic, e.g., Discipline, Sleep"),
      ageGroup: z.string().describe("Age group, e.g., Toddlers, Teenagers"),
      advice: z.string().describe("Detailed parenting advice for the topic"),
    }),
  });

  return advice;
}

export async function generateDevelopmentMilestones({
  ageGroup,
}: {
  ageGroup: string;
}) {
  const { object: milestones } = await generateObject({
    model: geminiFlashModel,
    prompt: `List typical developmental milestones for children in the age group "${ageGroup}"`,
    output: "array",
    schema: z.array(
      z.object({
        milestone: z.string().describe("Description of the developmental milestone"),
        ageRange: z.string().describe("Age range for this milestone, e.g., 0-6 months"),
      }),
    ),
  });

  return { milestones };
}

export async function generateBehaviorManagementStrategies({
  behavior,
  ageGroup,
}: {
  behavior: string;
  ageGroup: string;
}) {
  const { object: strategies } = await generateObject({
    model: geminiFlashModel,
    prompt: `Suggest behavior management strategies for dealing with "${behavior}" in children of the age group "${ageGroup}"`,
    output: "array",
    schema: z.array(
      z.object({
        strategy: z.string().describe("Description of the behavior management strategy"),
        effectiveness: z.string().describe("Expected effectiveness, e.g., High, Medium, Low"),
      }),
    ),
  });

  return { strategies };
}

export async function generateParentingTips({
  ageGroup,
  context,
}: {
  ageGroup: string;
  context: string;
}) {
  const { object: tips } = await generateObject({
    model: geminiFlashModel,
    prompt: `Provide parenting tips for children in the age group "${ageGroup}" related to "${context}"`,
    schema: z.array(
      z.object({
        tip: z.string().describe("Specific parenting tip"),
      }),
    ),
  });

  return { tips };
}

export async function generateCustomizedRoutine(props: {
  ageGroup: string;
  focusAreas: string[];
  familyPreferences: string;
}) {
  const { object: routine } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate a customized daily routine for a child in the age group "${props.ageGroup}" with a focus on ${props.focusAreas.join(
      ", "
    )}. Consider family preferences: ${props.familyPreferences}`,
    schema: z.object({
      routine: z
        .array(
          z.object({
            time: z.string().describe("Time of the activity, e.g., 8:00 AM"),
            activity: z.string().describe("Description of the activity"),
          }),
        )
        .describe("Customized daily routine with activities and times"),
    }),
  });

  return routine;
}
