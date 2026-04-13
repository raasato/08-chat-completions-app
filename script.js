// Get references to the DOM elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const responseContainer = document.getElementById('response');

const systemMessage = `You are a friendly Budget Travel Planner, specializing in cost-conscious travel advice. You help users find cheap flights, budget-friendly accommodations, affordable itineraries, and low-cost activities in their chosen destination.

If a user's query is unrelated to budget travel, respond by stating that you do not know.`;

const conversationHistory = [
  { role: 'system', content: systemMessage }
];

async function main(userMessage) {
  conversationHistory.push({ role: 'user', content: userMessage });

  // Send a POST request to the OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', // We are POST-ing data to the API
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
      'Authorization': `Bearer ${apiKey}` // Include the API key for authorization
    },
    // Send model details and system message
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: conversationHistory,
      maxcompletionstokens: 800,
      temperature: 0.5,
      frequency_penalty: 0.8,
    })
  }).catch((error) => {
    console.error('Network error while requesting chat completion:', error);
    return null;
  });

  if (!response) {
    // Remove the latest user message because the request did not complete.
    conversationHistory.pop();
    responseContainer.textContent = 'Sorry, something went wrong while contacting the API. Please try again.';
    return;
  }

  if (!response.ok) {
    console.error('API returned an error status:', response.status, response.statusText);
    // Remove the latest user message because this request failed.
    conversationHistory.pop();
    responseContainer.textContent = 'Sorry, the API returned an error. Please try again in a moment.';
    return;
  }

  // Parse and store the response data
  const result = await response.json().catch((error) => {
    console.error('Could not parse API response JSON:', error);
    return null;
  });

  if (!result || !result.choices || !result.choices[0] || !result.choices[0].message || !result.choices[0].message.content) {
    console.error('API response format was unexpected:', result);
    // Remove the latest user message because we did not get a valid answer.
    conversationHistory.pop();
    responseContainer.textContent = 'Sorry, we received an unexpected response. Please try again.';
    return;
  }

  const assistantMessage = result.choices[0].message.content;

  conversationHistory.push({ role: 'assistant', content: assistantMessage });

  // Display the model response on the page.
  // Using textContent keeps line breaks and spacing readable.
  responseContainer.textContent = assistantMessage;
}

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = userInput.value.trim();

  if (!userMessage) {
    responseContainer.textContent = 'Please enter a question about budget travel.';
    return;
  }

  userInput.value = '';

  responseContainer.textContent = 'Thinking...';
  await main(userMessage);
});