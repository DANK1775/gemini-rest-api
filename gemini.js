require('dotenv').config()
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} = require('@google/generative-ai')
const genAI = new GoogleGenerativeAI(process.env.GEMINIKEY)
const generationConfigzzz = {
    temperature: 0.8,
    topK: 15,
    topP: 1,
};
const safetySettingszzz = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', generationConfig: generationConfigzzz, safetySettings: safetySettingszzz});

async function ask(prompt) {
    try {
        prompt = prompt.toString()
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    ask
}
