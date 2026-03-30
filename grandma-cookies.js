// grandma-cookies.js no seu GitHub
(function() {
    // Carregar CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css';
    document.head.appendChild(link);

    // Carregar a biblioteca de consentimento
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js';
    script.onload = () => {
        CookieConsent.run({
            guiOptions: {
                consentModal: {
                    layout: 'box',
                    position: 'bottom center',
                    equalWeightButtons: true,
                    flipButtons: false
                }
            },
            categories: {
                necessary: { enabled: true, readOnly: true },
                analytics: { 
                    enabled: false,
                    autoClear: {
                        cookies: [{ name: /^(_ga|_gid|CLID|_clck)/ }, { name: 'clerk_db_jwt' }]
                    }
                }
            },
            onAccept: () => {
                if (CookieConsent.acceptedCategory('analytics')) window.location.reload();
            },
            onChange: () => window.location.reload(),
            language: {
                default: 'en',
                translations: {
                    en: {
                        consentModal: {
                            title: '🍪🍪🍪 GRANDMA COOKIES v999 🍪🍪🍪',
                            description: 'AAAAA WE USE COOKIES BOOMER',
                            acceptAllBtn: '✅ YESYESYES',
                            acceptNecessaryBtn: '❌ NOOOOO'
                        },
                        preferencesModal: {
                            title: '⚙️ SETTINGS BABE',
                            acceptAllBtn: '✅ ALL IN BABY',
                            acceptNecessaryBtn: '❌ GET OUT',
                            savePreferencesBtn: '💾 SAVE ME',
                            sections: [
                                {
                                    title: 'Necessary Cookies',
                                    description: 'Required for the site to work.',
                                    linkedCategory: 'necessary'
                                },
                                {
                                    title: 'Analytics Cookies',
                                    description: 'Help us understand how you use the site.',
                                    linkedCategory: 'analytics'
                                }
                            ]
                        }
                    }
                }
            }
        });

        // Criar o botão flutuante
        const btn = document.createElement('div');
        btn.id = 'cc-open-btn';
        btn.innerHTML = `<svg ...></svg>`; // coloque seu SVG aqui
        btn.style.cssText = "position:fixed;bottom:20px;left:20px;width:50px;height:50px;background:#3d2211;border-radius:50%;cursor:pointer;z-index:999999;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);";
        document.body.appendChild(btn);
        btn.onclick = () => CookieConsent.showPreferences();
    };
    document.head.appendChild(script);
})();