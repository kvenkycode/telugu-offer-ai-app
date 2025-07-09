export const fetchOpenAISummary = async (text) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: generatePrompt(text) }],
    }),
  });
  const result = await response.json();
  return result.choices[0].message.content;
};

const generatePrompt = (text) => `
You are a Telugu content summarizer. Extract the product offers from the following paragraph and return a Markdown table:

"""${text}"""
`;
