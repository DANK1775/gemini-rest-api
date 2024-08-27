require('dotenv').config()
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} = require('@google/generative-ai')
const genAI = new GoogleGenerativeAI(process.env.GEMINIKEY)
const generationConfigzzz = {
    temperature: 0.7,
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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: generationConfigzzz, safetySettings: safetySettingszzz});


async function ask(promptOne) {
    try {
        const prompt = promptOne
        const internal = {
            ask: prompt
        }
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        return text
    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    ask
}
