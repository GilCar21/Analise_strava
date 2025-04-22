import { GoogleGenerativeAI } from "@google/generative-ai";

export async function handlerGemini(objeto) {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_AI_KEY); // Substitua YOUR_API_KEY pela sua chave de API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ou "gemini-pro-vision" se você estiver usando imagens

    // Garanta que o objeto seja uma string JSON válida
    let objetoString;
    try {
        objetoString = JSON.stringify(objeto);
    } catch (error) {
        console.error("Erro ao converter objeto para string JSON:", error);
        return "Erro: Dados inválidos."; // Retorna um erro caso o objeto não seja JSON
    }

    const prompt = `Analise os dado das minha corrida, me diga os pontos positivos e negativos, e diga pontos de melhoraria: ${objetoString}`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return responseText;
    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        return "Erro: Falha na comunicação com a API."; // Retorna um erro caso a chamada da API falhe
    }
}