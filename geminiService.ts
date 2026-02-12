
import { GoogleGenAI } from "@google/genai";
import { Question, Submission, Exam } from "./types";

// Always use the required initialization format with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIExplanation = async (question: string, options: string[], correctAnswer: string) => {
  try {
    // Fix: Removed maxOutputTokens to prevent potential response truncation as per guidelines.
    // Using ai.models.generateContent directly with model name and prompt.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a clear, concise educational explanation for the following MCQ question. 
      Question: ${question}
      Options: ${options.join(', ')}
      Correct Answer: ${correctAnswer}`,
    });
    // Directly access the .text property of GenerateContentResponse
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating explanation.";
  }
};

export const getPerformanceInsights = async (exam: Exam, submission: Submission) => {
  try {
    const prompt = `Analyze this student's exam performance:
    Exam: ${exam.title}
    Score: ${submission.score}/${exam.totalMarks} (${submission.percentage}%)
    Status: ${submission.status}
    Number of Questions: ${exam.questions.length}
    Provide 3 bullet points: 1 Strength, 1 Weakness, and 1 Growth Suggestion.`;

    // Fix: Removed maxOutputTokens to allow the model to provide complete and detailed insights.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    // Directly access the .text property of GenerateContentResponse
    return response.text || "Keep studying to improve your results!";
  } catch (error) {
    return "Complete the review to see your areas of improvement.";
  }
};
