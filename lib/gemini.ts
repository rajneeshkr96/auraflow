import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIResponse(
    apiKey: string,
    systemPrompt: string,
    userMessage: string,
    history: { role: 'user' | 'model', parts: string }[]
) {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.parts }]
            })),
            generationConfig: {
                maxOutputTokens: 200, // Keep replies concise for DM
            },
        });

        // We can inject system prompt by prepending it to the first message or using specific API if available (Gemini 1.5 supports system instruction).
        // "gemini-pro" (1.0) doesn't support system instructions directly in startChat cleanly without hacks, 
        // but we can prepend context to the history or the current message.
        // For better results, let's prepend to the prompt or assume 1.5 if available.
        // Let's us prepend to user message for now.

        // Better: Add a system message equivalent at the start of history? 
        // Gemini chat history role must be 'user' or 'model'.

        const finalPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

        const result = await chat.sendMessage(finalPrompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "I'm having trouble thinking right now. Please try again later.";
    }
}
