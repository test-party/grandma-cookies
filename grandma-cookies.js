(function() {
    // 1. Definições de Bloqueio
    const trackerPatterns = [
        'google-analytics', 'googletagmanager', 'clarity.ms', 
        'facebook.net', 'snap.licdn', 'leadsy.ai', 'reb2b', 'gtag'
    ];

    // 2. Função para verificar consentimento real da lib Orestbida
    const hasConsent = () => {
        try {
            // A lib v3 salva em um cookie chamado 'cc_cookie' por padrão
            const cookieValue = document.cookie.split('; ').find(row => row.startsWith('cc_cookie='));
            if (!cookieValue) return false;
            const data = JSON.parse(decodeURIComponent(cookieValue.split('=')[1]));
            // Se aceitou analytics ou ads, liberamos os scripts
            return data.categories.includes('analytics') || data.categories.includes('ads');
        } catch (e) {
            return false;
        }
    };

    // 3. Bloqueador de Scripts (MutationObserver)
    if (!hasConsent()) {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'SCRIPT') {
                        const src = node.src || '';
                        const content = node.innerHTML || '';
                        if (trackerPatterns.some(p => src.includes(p) || content.includes(p))) {
                            node.type = 'text/plain'; // Desativa execução
                            node.setAttribute('data-cookies-blocked', 'true');
                            console.warn('[Grandma] Script bloqueado até aceite:', src || 'inline');
                        }
                    }
                });
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // 4. Carregar a Interface (Somente após o DOM carregar)
    const initUI = () => {
        // Injeta CSS da Lib
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.css';
        document.head.appendChild(link);

        // Injeta Script da Lib
        const scriptLib = document.createElement('script');
        scriptLib.src = 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@3.1.0/dist/cookieconsent.umd.js';
        scriptLib.onload = () => {
            CookieConsent.run({
                categories: {
                    necessary: { enabled: true, readOnly: true },
                    analytics: { enabled: false },
                    ads: { enabled: false }
                },
                language: {
                    default: 'en',
                    translations: {
                        en: {
                            consentModal: {
                                title: 'We use cookies',
                                description: 'Accept to enable analytics and marketing features.',
                                acceptAllBtn: 'Accept All',
                                acceptNecessaryBtn: 'Reject All',
                                showPreferencesBtn: 'Manage'
                            },
                            preferencesModal: {
                                title: 'Cookie Preferences',
                                acceptAllBtn: 'Accept All',
                                acceptNecessaryBtn: 'Reject All',
                                savePreferencesBtn: 'Save Settings',
                                sections: [
                                    { title: 'Analytics', linkedCategory: 'analytics' },
                                    { title: 'Marketing', linkedCategory: 'ads' }
                                ]
                            }
                        }
                    }
                },
                // CRUCIAL: Recarrega a página ao aceitar para rodar os scripts liberados
                onAccept: () => {
                    window.location.reload();
                },
                onChange: () => {
                    window.location.reload();
                }
            });

            // Adiciona o Botão Flutuante
            const btn = document.createElement('div');
            btn.id = 'cc-open-btn';
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="white" width="30"><path d="M21.5,10.65C20.84,10.5 20.3,10.11 20,9.58C19.7,9.05 19.65,8.45 19.8,7.85C20,7.1 19.85,6.35 19.45,5.75C19,5.15 18.35,4.75 17.65,4.6C17.05,4.45 16.5,4.06 16.2,3.53C15.9,3 15.85,2.4 16,1.8C16.15,1.1 16,0.35 15.6,0.25C15,-0.25 14.1,0.05 13.55,0.45C13.05,0.85 12.45,1 11.85,0.95C11.25,0.9 10.65,0.65 10.25,0.2C9.75,-0.3 8.95,-0.4 8.35,-0.1C7.75,0.2 7.35,0.85 7.2,1.55C7.05,2.15 6.66,2.7 6.13,3C5.6,3.3 5,3.35 4.4,3.2C3.7,3.05 2.95,3.2 2.35,3.6C1.75,4 1.35,4.65 1.2,5.35C1.05,5.95 0.66,6.5 0.13,6.8C-0.4,7.1 -0.45,7.7 -0.15,8.3C0.15,8.9 0.8,9.3 1.5,9.45C2.1,9.6 2.65,10 2.95,10.53C3.25,11.06 3.3,11.66 3.15,12.26C3,13 3.15,13.75 3.55,14.35C4,14.95 4.65,15.35 5.35,15.5C5.95,15.65 6.5,16.04 6.8,16.57C7.1,17.1 7.15,17.7 7,18.3C6.85,19 7,19.75 7.4,20.35C7.8,20.95 8.45,21.35 9.15,21.5C9.75,21.65 10.3,22.04 10.6,22.57C10.9,23.1 10.95,23.7 10.8,24.3C10.65,25 10.8,25.75 11.2,26.35C11.75,27.15 12.8,27.35 13.65,26.85C14.15,26.45 14.75,26.3 15.35,26.35C15.95,26.4 16.55,26.65 16.95,27.1C17.45,27.6 18.25,27.7 18.85,27.4C19.45,27.1 19.85,26.45 20,25.75C20.15,25.15 20.54,24.6 21.07,24.3C21.6,24 22.2,23.95 22.8,24.1C23.5,24.25 24.25,24.1 24.85,23.7C25.45,23.3 25.85,22.65 26,21.95C26.15,21.35 26.54,20.8 27.07,20.5C27.6,20.2 28.2,20.25 28.8,20.45C29.4,20.65 30.15,20.5 30.65,20.05C31.3,19.45 31.4,18.45 30.9,17.75C30.5,17.25 30.35,16.65 30.4,16.05C30.45,15.45 30.7,14.85 31.15,14.45C31.65,13.95 31.75,13.15 31.45,12.55C31.15,11.95 30.5,11.55 29.8,11.4C29.2,11.25 28.65,10.86 28.35,10.33C28.05,9.8 28,9.2 28.15,8.6C28.3,7.9 28.15,7.15 27.75,6.55"/></svg>`;
            btn.style.cssText = "position:fixed;bottom:20px;left:20px;width:50px;height:50px;background:#3d2211;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9999999;box-shadow:0 4px 12px rgba(0,0,0,0.3);";
            document.body.appendChild(btn);
            btn.onclick = () => CookieConsent.showPreferences();
        };
        document.head.appendChild(scriptLib);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();