import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);

export const analyzeFood = async (imageBase64: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `Analyze this food image and provide nutrition information in the following JSON format:
    {
      "calories": number,
      "protein": number,
      "fat": number,
      "carbohydrates": number,
      "vitamins": [string],
      "minerals": [string]
    }
    
    Provide realistic estimates based on visible portions. Return only valid JSON.`;

    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not parse nutrition data');
  } catch (error) {
    console.error('Error analyzing food:', error);
    throw error;
  }
};

export const analyzeGymEquipment = async (imageBase64: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `Analyze this gym equipment image and provide information in the following JSON format:
    {
      "name": string,
      "how_to_use": string,
      "warnings": [string],
      "instructions": [string]
    }
    
    Provide practical, safety-focused information. Return only valid JSON.`;

    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Could not parse equipment data');
  } catch (error) {
    console.error('Error analyzing equipment:', error);
    throw error;
  }
};