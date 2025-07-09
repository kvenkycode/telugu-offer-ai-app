// TeluguOfferParser.jsx
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const TeluguOfferParser = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [structuredData, setStructuredData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setStructuredData('');
    setExtractedText('');
    setError('');
  };

  const extractTextFromImage = async () => {
    if (!image) return;
    setLoading(true);
    setError('');
    try {
      const { data: { text } } = await Tesseract.recognize(image, 'tel');
      setExtractedText(text);
    } catch (err) {
      setError('Failed to extract text from image.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const callOpenAI = async () => {
    const apiKey = process.env.REACT_APP_OPENAI_KEY; // 🔑 Make sure .env is set
    if (!extractedText.trim()) {
      alert("No extracted text to summarize.");
      return;
    }

    setLoading(true);
    setError('');
    setStructuredData('');

    const prompt = `You are a Telugu content summarizer. Extract the product offers from the text and return them as a Markdown table:
    
"""
${extractedText}
"""`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const result = await response.json();

      if (result.choices && result.choices.length > 0) {
        setStructuredData(result.choices[0].message.content);
      } else {
        console.error("Unexpected API response:", result);
        setError("OpenAI response is invalid. Check your API key or request format.");
      }
    } catch (err) {
      setError("Failed to fetch summary from OpenAI. Check your internet or API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🧠 Telugu Offer Extractor</h2>

      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />

      <button
        onClick={extractTextFromImage}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        disabled={!image || loading}
      >
        1️⃣ Extract Telugu Text
      </button>

      {extractedText && (
        <>
          <pre className="bg-gray-100 p-2 my-2 text-sm whitespace-pre-wrap">{extractedText}</pre>
          <button
            onClick={callOpenAI}
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            2️⃣ Summarize Offers with AI
          </button>
        </>
      )}

      {loading && <p className="text-sm text-gray-500">⏳ Processing…</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {structuredData && (
        <div className="mt-4 bg-white shadow p-4 border rounded">
          <h3 className="font-semibold mb-2">📋 Structured Data</h3>
          <pre className="text-sm whitespace-pre-wrap">{structuredData}</pre>
        </div>
      )}
    </div>
  );
};

export default TeluguOfferParser;
