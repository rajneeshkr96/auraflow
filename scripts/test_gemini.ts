import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in environment variables.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro", "gemini-2.5-flash", "gemini-2.5-pro"];

    for (const modelName of modelsToTest) {
        console.log(`\n--- Testing ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello via validation script");
            console.log(`SUCCESS with ${modelName}! Response:`, result.response.text());
        } catch (error: any) {
            console.error(`FAILED with ${modelName}:`, error.message);
        }
    }

    console.log("\n--- Listing Available Models (Raw Fetch) ---");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            console.error(`Failed to list models: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
        } else {
            const data = await response.json();
            console.log("Available Models:", JSON.stringify(data, null, 2));
        }
    } catch (e: any) {
        console.error("Error listing models:", e.message);
    }
}

main();
