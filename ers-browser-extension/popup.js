// ERS Browser Extension - Popup Logic
// Handles user interaction and communication with backend

const API_ENDPOINT = 'http://localhost:3030/api/ers';

document.addEventListener('DOMContentLoaded', () => {
  const userInput = document.getElementById('userInput');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');
  const responseSection = document.getElementById('responseSection');
  const responseContent = document.getElementById('responseContent');
  const loadingSection = document.getElementById('loadingSection');

  // Submit handler
  submitBtn.addEventListener('click', handleSubmit);
  
  // Allow Enter + Shift for new line, Enter alone to submit
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });

  // Clear handler
  clearBtn.addEventListener('click', () => {
    responseSection.classList.add('hidden');
    responseContent.textContent = '';
    userInput.value = '';
    userInput.focus();
  });

  async function handleSubmit() {
    const text = userInput.value.trim();
    
    if (!text) {
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    loadingSection.classList.remove('hidden');
    responseSection.classList.add('hidden');

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Kunde inte få svar från ERS');
      }

      const data = await response.json();
      
      // Display response
      responseContent.textContent = data.response;
      responseSection.classList.remove('hidden');
      
    } catch (error) {
      console.error('ERS Error:', error);
      responseContent.textContent = 'Ett fel uppstod. Kontrollera att backend-tjänsten körs.';
      responseSection.classList.remove('hidden');
    } finally {
      loadingSection.classList.add('hidden');
      submitBtn.disabled = false;
    }
  }
});
