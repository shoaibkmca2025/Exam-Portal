
import { GoogleGenAI } from "@google/genai";
import { Question, Submission, Exam } from "./types";

/**
 * Utility to obtain a fresh Gemini AI client instance.
 * Lazily evaluating this within functions ensures process.env.API_KEY
 * is always correctly retrieved from the global environment.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is not detected in process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const getAIExplanation = async (question: string, options: string[], correctAnswer: string) => {
  try {
    const ai = getAiClient();
    // Using gemini-3-flash-preview for high-performance MCQ explanations
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a clear, concise educational explanation for the following MCQ question. 
      Question: ${question}
      Options: ${options.join(', ')}
      Correct Answer: ${correctAnswer}`,
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating explanation.";
  }
};

export const getPerformanceInsights = async (exam: Exam, submission: Submission) => {
  try {
    const ai = getAiClient();
    const prompt = `Analyze this student's exam performance:
    Exam: ${exam.title}
    Score: ${submission.score}/${exam.totalMarks} (${submission.percentage}%)
    Status: ${submission.status}
    Number of Questions: ${exam.questions.length}
    Provide 3 bullet points: 1 Strength, 1 Weakness, and 1 Growth Suggestion.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Keep studying to improve your results!";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Complete the review to see your areas of improvement.";
  }
};
