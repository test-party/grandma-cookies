(function() {
    // --- 1. CONFIGURAÇÃO DE RASTREADORES (Dicionário de Bloqueio) ---
    const trackerPatterns = {
        'analytics': [
            'clarity.ms', 'google-analytics.com', 'googletagmanager.com/gtm.js', 
            'vercel/analytics', 'gtag/js'
        ],
        'ads': [
            'facebook.net', 'ads.linkedin.com', 'snap.licdn.com', 
            'leadsy.ai', 'reb2b', 'doubleclick.net', 'googleadservices.com'
        ]
    };

    // --- 2. LÓGICA DE INTERCEPTAÇÃO (O "Pulo do Gato") ---
    // Verificamos se o usuário já aceitou os cookies anteriormente
    const getConsent = () => JSON.parse(localStorage.getItem('cc_cookie') || '{}').categories || [];

    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.apply(this, arguments);

        if (tagName.toLowerCase() === 'script') {
            const consent = getConsent();
            
            // Criamos uma propriedade para monitorar o SRC assim que for definido
            Object.defineProperty(element, 'src', {
                set: function(url) {
                    let categoryToBlock = null;
                    
                    // Verifica se a URL do script bate com algum rastreador
                    for (const [cat, patterns] of Object.entries(trackerPatterns)) {
                        if (patterns.some(p => url.includes(p))) {
                            categoryToBlock = cat;
                            break;
                        }
                    }

                    // Se for um rastreador e NÃO houver consentimento, "matamos" o script
                    if (categoryToBlock && !consent.includes(categoryToBlock)) {
                        console.warn(`[Grandma] Blocking ${url} (Category: ${categoryToBlock})`);
                        element.type = 'text/plain'; // O navegador não executa text/plain
                        element.setAttribute('data-delayed-src', url);
                        element.setAttribute('data-category', categoryToBlock);
                    } else {
                        element.setAttribute('src', url);
                    }
                },
                get: function() {
                    return element.getAttribute('src') || element.getAttribute('data-delayed-src');
                }
            });
        }
        return element;
    };

    // --- 3. INICIALIZAÇÃO DA BIBLIOTECA COOKIECONSENT ---
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
        #cc-open-btn { position: fixed; bottom: 20px; left: 20px; width: 50px; height: 50px; background-color: #3d2211; border-radius: 50%; cursor: pointer; z-index: 2147483647; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: transform 0.3s; }
        #cc-open-btn:hover { transform: scale(1.1); }
        #cc-open-btn svg { width: 28px; height: 28px; fill: #fff; }
    `;
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js';
    script.onload = () => {
        const cc = CookieConsent;
        cc.run({
            guiOptions: { consentModal: { layout: 'cloud', position: 'bottom center' } },
            categories: {
                necessary: { enabled: true, readOnly: true },
                analytics: { enabled: false },
                ads: { enabled: false }
            },
            onAccept: () => {
                // Quando aceito, recarrega a página para ativar os scripts interceptados
                // Ou você pode disparar uma lógica de "unblock" manual aqui
                window.location.reload(); 
            },
            language: {
                default: 'en',
                translations: {
                    en: {
                        consentModal: {
                            title: 'We love cookies!',
                            description: 'Help us improve by allowing cookies.',
                            acceptAllBtn: 'Accept All',
                            acceptNecessaryBtn: 'Reject All',
                            showPreferencesBtn: 'Manage'
                        },
                        preferencesModal: {
                            title: 'Cookie Preferences',
                            sections: [
                                { title: 'Analytics', linkedCategory: 'analytics' },
                                { title: 'Marketing & Ads', linkedCategory: 'ads' }
                            ]
                        }
                    }
                }
            }
        });

        const btn = document.createElement('div');
        btn.id = 'cc-open-btn';
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M21.5,10.65C20.84,10.5 20.3,10.11 20,9.58..."/></svg>`;
        document.body.appendChild(btn);
        btn.addEventListener('click', () => cc.showPreferences());
    };
    document.head.appendChild(script);
})();