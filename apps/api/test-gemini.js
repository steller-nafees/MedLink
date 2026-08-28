require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
    try {

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say hello in one sentence.",
        });

        console.log(response.text);

    } catch (error) {

        console.error(error);
    }
}

testGemini();
