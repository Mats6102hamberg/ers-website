/**
 * ERS - Enterprise Research Shield
 * Main JavaScript v1.0
 * 
 * Laddar innehåll från content/content.json och renderar sidan dynamiskt.
 * Redigera content.json för att ändra texter - du behöver inte röra denna fil.
 */

(function() {
  'use strict';

  // ============================================================================
  // Konfiguration
  // ============================================================================
  const CONFIG = {
    contentPath: 'content/content.json',
    animationDelay: 100
  };

  // ============================================================================
  // SVG Ikoner
  // ============================================================================
  const ICONS = {
    shield: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>`,
    document: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>`,
    balance: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
    </svg>`,
    lock: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>`,
    chart: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`,
    mail: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>`,
    location: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>`,
    xMark: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>`,
    noProfile: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>`,
    noPrediction: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>`,
    serverOff: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
    </svg>`
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================
  function getIcon(name) {
    return ICONS[name] || ICONS.shield;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================================================
  // Render Functions
  // ============================================================================
  function renderHeader(data) {
    const header = data.header;
    return `
      <header class="header">
        <div class="container header__inner">
          <a href="#" class="logo">
            <div class="logo__icon">${escapeHtml(header.logo_text)}</div>
            <div class="logo__text">
              <span class="logo__name">${escapeHtml(header.logo_text)}</span>
              <span class="logo__subtitle">${escapeHtml(header.logo_subtitle)}</span>
            </div>
          </a>
          
          <nav class="nav" role="navigation" aria-label="Huvudnavigation">
            ${header.nav_links.map(link => `
              <a href="${escapeHtml(link.href)}" class="nav__link">${escapeHtml(link.text)}</a>
            `).join('')}
          </nav>
          
          <a href="${escapeHtml(header.cta_button.href)}" class="btn btn--primary header__cta">
            ${escapeHtml(header.cta_button.text)}
          </a>
          
          <button class="mobile-menu-btn" aria-label="Meny">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
    `;
  }

  function renderHero(data) {
    const hero = data.hero;
    return `
      <section class="hero">
        <div class="container">
          <div class="hero__content">
            <div class="hero__badge">
              Enterprise-ready säkerhetslösning
            </div>
            <h1 class="hero__title animate-fade-in-up">${escapeHtml(hero.headline)}</h1>
            <p class="hero__subtitle animate-fade-in-up animation-delay-100">${escapeHtml(hero.subheadline)}</p>
            <div class="hero__actions animate-fade-in-up animation-delay-200">
              <a href="${escapeHtml(hero.primary_cta.href)}" class="btn btn--primary btn--large">
                ${escapeHtml(hero.primary_cta.text)}
              </a>
              <a href="${escapeHtml(hero.secondary_cta.href)}" class="btn btn--secondary btn--large">
                ${escapeHtml(hero.secondary_cta.text)}
              </a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderTrustBanner(data) {
    const trust = data.trust_banner;
    return `
      <section class="trust-banner">
        <div class="container">
          <div class="trust-banner__inner">
            ${trust.items.map(item => `
              <div class="trust-banner__item">
                <span class="trust-banner__icon">${getIcon('checkCircle')}</span>
                <span>${escapeHtml(item)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderFeatures(data) {
    const features = data.features;
    return `
      <section class="section section--gray" id="${features.section_id}">
        <div class="container">
          <div class="section-header">
            <h2>${escapeHtml(features.headline)}</h2>
            <p>${escapeHtml(features.subheadline)}</p>
          </div>
          
          <div class="features-grid">
            ${features.items.map(item => `
              <div class="feature-card">
                <div class="feature-card__icon">
                  ${getIcon(item.icon)}
                </div>
                <h4 class="feature-card__title">${escapeHtml(item.title)}</h4>
                <p class="feature-card__description">${escapeHtml(item.description)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderModes(data) {
    const modes = data.modes;
    return `
      <section class="section section--dark" id="${modes.section_id}">
        <div class="container">
          <div class="section-header">
            <h2>${escapeHtml(modes.headline)}</h2>
            <p>${escapeHtml(modes.subheadline)}</p>
          </div>
          
          <div class="modes-grid">
            ${modes.items.map(item => `
              <div class="mode-card mode-card--${item.color}">
                <span class="mode-card__tag">${escapeHtml(item.tag)}</span>
                <h3 class="mode-card__title">${escapeHtml(item.name)}</h3>
                <p class="mode-card__description">${escapeHtml(item.description)}</p>
                <ul class="mode-card__uses">
                  ${item.use_cases.map(use => `
                    <li>${escapeHtml(use)}</li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderSecurity(data) {
    const security = data.security;
    const securityIcons = ['serverOff', 'noProfile', 'noPrediction', 'lock'];
    
    return `
      <section class="section" id="${security.section_id}">
        <div class="container">
          <div class="section-header">
            <h2>${escapeHtml(security.headline)}</h2>
            <p>${escapeHtml(security.subheadline)}</p>
          </div>
          
          <div class="security-grid">
            ${security.commitments.map((item, index) => `
              <div class="security-card">
                <div class="security-card__icon">
                  ${getIcon(securityIcons[index] || 'check')}
                </div>
                <div class="security-card__content">
                  <h4>${escapeHtml(item.title)}</h4>
                  <p>${escapeHtml(item.description)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderTargetAudiences(data) {
    const audiences = data.target_audiences;
    return `
      <section class="section section--dark">
        <div class="container">
          <div class="section-header">
            <h2>${escapeHtml(audiences.headline)}</h2>
          </div>
          
          <div class="audiences-grid">
            ${audiences.items.map(item => `
              <div class="audience-card">
                <h4>${escapeHtml(item.name)}</h4>
                <p>${escapeHtml(item.description)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderCTA(data) {
    const cta = data.cta_section;
    return `
      <section class="cta-section">
        <div class="container">
          <h2>${escapeHtml(cta.headline)}</h2>
          <p>${escapeHtml(cta.subheadline)}</p>
          <a href="${escapeHtml(cta.button.href)}" class="btn btn--primary btn--large">
            ${escapeHtml(cta.button.text)}
          </a>
        </div>
      </section>
    `;
  }

  function renderContact(data) {
    const contact = data.contact;
    const form = contact.form;
    const company = contact.company_info;
    
    return `
      <section class="section" id="${contact.section_id}">
        <div class="container">
          <div class="section-header">
            <h2>${escapeHtml(contact.headline)}</h2>
            <p>${escapeHtml(contact.subheadline)}</p>
          </div>
          
          <div class="contact-wrapper">
            <div class="contact-info">
              <h3>${escapeHtml(company.name)}</h3>
              <div class="contact-info__company">
                ${company.org_number ? `<p>Org.nr: ${escapeHtml(company.org_number)}</p>` : ''}
              </div>
              
              ${company.email ? `
                <div class="contact-info__item">
                  ${getIcon('mail')}
                  <a href="mailto:${escapeHtml(company.email)}">${escapeHtml(company.email)}</a>
                </div>
              ` : ''}
              
              ${company.phone ? `
                <div class="contact-info__item">
                  ${getIcon('phone')}
                  <a href="tel:${escapeHtml(company.phone)}">${escapeHtml(company.phone)}</a>
                </div>
              ` : ''}
              
              ${company.address ? `
                <div class="contact-info__item">
                  ${getIcon('location')}
                  <span>${escapeHtml(company.address)}</span>
                </div>
              ` : ''}
            </div>
            
            ${form.enabled ? `
              <form class="contact-form" action="${escapeHtml(form.action_url)}" method="POST">
                <div class="form-group">
                  <label for="name">${escapeHtml(form.fields.name_label)}</label>
                  <input type="text" id="name" name="name" placeholder="${escapeHtml(form.fields.name_placeholder)}" required>
                </div>
                
                <div class="form-group">
                  <label for="email">${escapeHtml(form.fields.email_label)}</label>
                  <input type="email" id="email" name="email" placeholder="${escapeHtml(form.fields.email_placeholder)}" required>
                </div>
                
                <div class="form-group">
                  <label for="organization">${escapeHtml(form.fields.organization_label)}</label>
                  <input type="text" id="organization" name="organization" placeholder="${escapeHtml(form.fields.organization_placeholder)}">
                </div>
                
                <div class="form-group">
                  <label for="message">${escapeHtml(form.fields.message_label)}</label>
                  <textarea id="message" name="message" placeholder="${escapeHtml(form.fields.message_placeholder)}" required></textarea>
                </div>
                
                <button type="submit" class="btn btn--primary btn--large">
                  ${escapeHtml(form.submit_button)}
                </button>
              </form>
            ` : ''}
          </div>
        </div>
      </section>
    `;
  }

  function renderFooter(data) {
    const footer = data.footer;
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer__inner">
            <div class="footer__brand">
              <strong class="text-accent">${escapeHtml(footer.tagline)}</strong>
              <p>${escapeHtml(footer.copyright)}</p>
            </div>
            
            <div class="footer__links">
              ${footer.links.map(link => `
                <a href="${escapeHtml(link.href)}">${escapeHtml(link.text)}</a>
              `).join('')}
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // ============================================================================
  // Main Render Function
  // ============================================================================
  function renderPage(data) {
    // Update meta tags
    document.title = data.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', data.meta.description);
    }
    
    // Render all sections
    const app = document.getElementById('app');
    app.innerHTML = `
      ${renderHeader(data)}
      <main>
        ${renderHero(data)}
        ${renderTrustBanner(data)}
        ${renderFeatures(data)}
        ${renderModes(data)}
        ${renderSecurity(data)}
        ${renderTargetAudiences(data)}
        ${renderCTA(data)}
        ${renderContact(data)}
      </main>
      ${renderFooter(data)}
    `;
    
    // Initialize interactions
    initSmoothScroll();
  }

  // ============================================================================
  // Interactions
  // ============================================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ============================================================================
  // Initialize
  // ============================================================================
  async function init() {
    try {
      const response = await fetch(CONFIG.contentPath);
      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status}`);
      }
      const data = await response.json();
      renderPage(data);
    } catch (error) {
      console.error('Error loading content:', error);
      document.getElementById('app').innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h1>Kunde inte ladda innehåll</h1>
          <p>Kontrollera att content/content.json finns och är korrekt formaterad.</p>
          <p style="color: #666; font-size: 0.875rem;">${error.message}</p>
        </div>
      `;
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
