import { GoogleGenAI, Type } from "@google/genai";

// Safely access process.env to prevent ReferenceError in pure browser environments
const apiKey = (typeof process !== "undefined" && process.env) ? process.env.API_KEY : '';
const ai = new GoogleGenAI({ apiKey });

export const generateMandalartIdeas = async (mainGoal: string): Promise<{ subGoals: string[], detailMap: Record<number, string[]> } | null> => {
  if (!mainGoal.trim()) return null;

  try {
    const model = ai.models;
    
    const prompt = `
      I am creating a Mandalart (Mandala Chart) for goal achievement.
      The main central goal is: "${mainGoal}".
      
      Please generate:
      1. 8 sub-goals related to achieving this main goal.
      2. For each of those 8 sub-goals, generate 8 actionable specific tasks.

      Return the result in strictly structured JSON.
      The output should handle Korean text if the input is Korean.
    `;

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subGoals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 8 sub-goals",
            },
            details: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subGoalIndex: { type: Type.INTEGER, description: "Index 0-7 corresponding to subGoals" },
                  tasks: { 
                      type: Type.ARRAY, 
                      items: { type: Type.STRING },
                      description: "Array of exactly 8 tasks for this sub-goal"
                  }
                }
              }
            }
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return null;
    
    const parsed = JSON.parse(jsonStr);
    
    // Transform into a map for easier consumption
    const detailMap: Record<number, string[]> = {};
    if (parsed.details && Array.isArray(parsed.details)) {
        parsed.details.forEach((item: any) => {
            if (item.tasks && Array.isArray(item.tasks)) {
                detailMap[item.subGoalIndex] = item.tasks.slice(0, 8);
            }
        });
    }

    return {
      subGoals: parsed.subGoals ? parsed.subGoals.slice(0, 8) : [],
      detailMap
    };

  } catch (error) {
    console.error("Error generating ideas:", error);
    return null;
  }
};