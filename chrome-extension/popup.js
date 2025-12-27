// ERS Chrome Extension - Popup Script
const BACKEND_URL = 'http://localhost:3030';

document.addEventListener('DOMContentLoaded', () => {
  const scanButton = document.getElementById('scanButton');
  const contentInput = document.getElementById('contentInput');
  const profileType = document.getElementById('profileType');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const errorDiv = document.getElementById('error');

  // Check backend connection on load
  checkBackendConnection();

  // Handle scan button click
  scanButton.addEventListener('click', async () => {
    const content = contentInput.value.trim();

    if (!content) {
      showError('Vänligen ange text att scanna.');
      return;
    }

    // Clear previous results
    hideResult();
    hideError();
    showLoading();
    scanButton.disabled = true;

    try {
      const response = await fetch(`${BACKEND_URL}/api/security/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          profileType: profileType.value,
          contentType: 'manual_scan',
          recipientEmail: 'chrome-extension@ers.local'
        })
      });

      const data = await response.json();

      hideLoading();

      if (!response.ok) {
        if (response.status === 403) {
          showResult(data, 'danger');
        } else {
          throw new Error(data.error || 'Okänt fel vid scanning');
        }
      } else {
        showResult(data, getRiskLevel(data.riskScore));
      }

    } catch (error) {
      hideLoading();

      if (error.message.includes('Failed to fetch')) {
        showError(
          '❌ Kunde inte ansluta till backend.\n\n' +
          'Säkerställ att backend körs på port 3030:\n' +
          'npm run dev\n\n' +
          'Backend URL: ' + BACKEND_URL
        );
      } else {
        showError('Fel vid scanning: ' + error.message);
      }
    } finally {
      scanButton.disabled = false;
    }
  });

  // Allow Enter key in textarea to trigger scan (Ctrl+Enter)
  contentInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      scanButton.click();
    }
  });
});

// Check if backend is running
async function checkBackendConnection() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/security/stats?timeRange=day`, {
      method: 'GET',
    });

    if (response.ok) {
      console.log('✅ Backend ansluten');
    }
  } catch (error) {
    console.warn('⚠️ Backend inte tillgänglig på ' + BACKEND_URL);
  }
}

// Show loading state
function showLoading() {
  document.getElementById('loading').classList.add('show');
}

// Hide loading state
function hideLoading() {
  document.getElementById('loading').classList.remove('show');
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

// Hide error message
function hideError() {
  document.getElementById('error').classList.remove('show');
}

// Show result
function showResult(data, level) {
  const resultDiv = document.getElementById('result');

  // Clear previous result
  resultDiv.className = 'result show';
  resultDiv.classList.add(level);

  let html = '';

  // Title
  if (data.allowed === false) {
    html += '<div class="result-title">🚫 INNEHÅLL BLOCKERAT</div>';
    html += '<div class="result-message">Kritisk säkerhetsrisk upptäckt. Innehållet kan inte delas.</div>';
  } else if (data.riskScore >= 100) {
    html += '<div class="result-title">⚠️ HÖG RISK UPPTÄCKT</div>';
    html += '<div class="result-message">Känslig information hittades. Granska innan delning.</div>';
  } else if (data.riskScore >= 50) {
    html += '<div class="result-title">⚡ MÅTTLIG RISK</div>';
    html += '<div class="result-message">Viss känslig information upptäckt.</div>';
  } else {
    html += '<div class="result-title">✅ INNEHÅLL SÄKERT</div>';
    html += '<div class="result-message">Inga kritiska säkerhetsrisker hittades.</div>';
  }

  // Risk score
  html += `<div class="result-message"><strong>Risknivå:</strong> ${data.riskScore} / 200+</div>`;

  // Findings
  if (data.findings && data.findings.length > 0) {
    html += '<div class="findings">';
    html += '<div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">Upptäckta hot:</div>';

    data.findings.forEach(finding => {
      const severityClass = finding.severity.toLowerCase();
      html += `
        <div class="finding-item">
          <div class="finding-type">
            ${finding.type}
            <span class="finding-severity ${severityClass}">${finding.severity}</span>
          </div>
          <div style="opacity: 0.8; font-size: 11px;">${finding.message}</div>
        </div>
      `;
    });

    html += '</div>';
  }

  // Sanitized content preview (if available and content was sanitized)
  if (data.sanitizedContent && data.sanitizedContent !== document.getElementById('contentInput').value) {
    html += '<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">';
    html += '<div style="font-weight: 600; margin-bottom: 5px; font-size: 12px;">Saniterad version:</div>';
    html += `<div style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 4px; font-size: 11px; font-family: monospace; max-height: 100px; overflow-y: auto;">${escapeHtml(data.sanitizedContent.substring(0, 200))}${data.sanitizedContent.length > 200 ? '...' : ''}</div>`;
    html += '</div>';
  }

  resultDiv.innerHTML = html;
}

// Hide result
function hideResult() {
  const resultDiv = document.getElementById('result');
  resultDiv.classList.remove('show', 'success', 'warning', 'danger');
}

// Get risk level class
function getRiskLevel(riskScore) {
  if (riskScore >= 200) return 'danger';
  if (riskScore >= 100) return 'warning';
  if (riskScore >= 50) return 'warning';
  return 'success';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
