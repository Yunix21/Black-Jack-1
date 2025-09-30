class BlackjackCounter {
    constructor() {
        this.count = 0;
        this.history = [];
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.updateHistoryDisplay();
    }

    initializeElements() {
        this.countValueEl = document.getElementById('countValue');
        this.plusBtn = document.getElementById('plusBtn');
        this.minusBtn = document.getElementById('minusBtn');
        this.neutralBtn = document.getElementById('neutralBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.historyList = document.getElementById('historyList');
    }

    bindEvents() {
        // Boutons de contrôle principaux
        this.plusBtn.addEventListener('click', () => this.increment());
        this.minusBtn.addEventListener('click', () => this.decrement());
        this.neutralBtn.addEventListener('click', () => this.addNeutral());
        
        // Boutons de gestion
        this.resetBtn.addEventListener('click', () => this.reset());
        this.undoBtn.addEventListener('click', () => this.undo());

        // Support tactile pour tous les boutons
        this.addTouchFeedback(this.plusBtn);
        this.addTouchFeedback(this.minusBtn);
        this.addTouchFeedback(this.neutralBtn);
        this.addTouchFeedback(this.resetBtn);
        this.addTouchFeedback(this.undoBtn);
    }

    addTouchFeedback(button) {
        let touchTimeout;
        
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(0.95)';
            
            // Vibration tactile si disponible
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });

        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            touchTimeout = setTimeout(() => {
                button.style.transform = '';
            }, 100);
            
            // Déclencher le clic
            button.click();
        });

        button.addEventListener('touchcancel', () => {
            button.style.transform = '';
            if (touchTimeout) clearTimeout(touchTimeout);
        });
    }

    increment() {
        this.count++;
        this.addToHistory('+1', this.count, 1);
        this.updateDisplay();
        this.animateCountChange();
    }

    decrement() {
        this.count--;
        this.addToHistory('-1', this.count, -1);
        this.updateDisplay();
        this.animateCountChange();
    }

    addNeutral() {
        // Le bouton 0 n'affecte pas le compte, juste un marqueur dans l'historique
        this.addToHistory('0', this.count, 0);
        this.updateDisplay();
        this.animateCountChange();
    }

    reset() {
        const oldCount = this.count;
        this.count = 0;
        this.history = [];
        this.addToHistory('reset', this.count, -oldCount);
        this.updateDisplay();
        this.updateHistoryDisplay();
        this.animateCountChange();
    }

    undo() {
        if (this.history.length === 0) return;
        
        const lastAction = this.history[0];
        
        // Annuler l'effet de la dernière action
        if (lastAction.type === 'reset') {
            // Si la dernière action était un reset, on ne peut pas vraiment l'annuler
            // car on a perdu l'historique précédent
            return;
        } else {
            // Annuler l'effet de l'action
            this.count -= lastAction.countChange;
        }
        
        // Retirer l'action de l'historique
        this.history.shift();
        
        this.updateDisplay();
        this.updateHistoryDisplay();
        this.animateCountChange();
        
        // Vibration pour confirmer l'annulation
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    }

    addToHistory(action, count, countChange) {
        const historyItem = {
            type: action,
            count: count,
            countChange: countChange,
            timestamp: new Date()
        };
        
        // Ajouter au début pour avoir les actions récentes en premier
        this.history.unshift(historyItem);
        
        // Limiter l'historique à 100 éléments pour éviter les problèmes de performance
        if (this.history.length > 100) {
            this.history = this.history.slice(0, 100);
        }
        
        this.updateHistoryDisplay();
    }

    updateDisplay() {
        this.countValueEl.textContent = this.count;
        
        // Changer la couleur selon le compte
        this.countValueEl.classList.remove('positive', 'negative');
        
        if (this.count > 0) {
            this.countValueEl.classList.add('positive');
        } else if (this.count < 0) {
            this.countValueEl.classList.add('negative');
        }
        
        // Mettre à jour l'état du bouton undo
        this.updateUndoButton();
    }

    updateUndoButton() {
        if (this.history.length === 0) {
            this.undoBtn.disabled = true;
        } else {
            this.undoBtn.disabled = false;
        }
    }

    animateCountChange() {
        // Animation subtile lors du changement
        this.countValueEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.countValueEl.style.transform = 'scale(1)';
        }, 150);
    }

    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">Aucune action encore</div>';
            return;
        }

        const historyHTML = this.history.map(item => {
            const timeStr = this.formatTime(item.timestamp);
            let actionClass, actionText, countText;
            
            switch(item.type) {
                case '+1':
                    actionClass = 'plus';
                    actionText = '+1';
                    countText = `Total: ${item.count}`;
                    break;
                case '-1':
                    actionClass = 'minus';
                    actionText = '-1';
                    countText = `Total: ${item.count}`;
                    break;
                case '0':
                    actionClass = 'neutral';
                    actionText = '0';
                    countText = `Total: ${item.count}`;
                    break;
                case 'reset':
                    actionClass = 'reset';
                    actionText = 'Reset';
                    countText = 'Remis à 0';
                    break;
                default:
                    actionClass = 'neutral';
                    actionText = item.type;
                    countText = `Total: ${item.count}`;
            }

            return `
                <div class="history-item">
                    <div>
                        <span class="history-action ${actionClass}">${actionText}</span>
                        <span class="history-count">${countText}</span>
                    </div>
                    <div class="history-time">${timeStr}</div>
                </div>
            `;
        }).join('');

        this.historyList.innerHTML = historyHTML;
        
        // Scroll automatique vers le haut pour voir la dernière action
        this.historyList.scrollTop = 0;
    }

    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);

        if (diffSecs < 5) {
            return 'À l\'instant';
        } else if (diffSecs < 60) {
            return `Il y a ${diffSecs}s`;
        } else if (diffMins < 60) {
            return `Il y a ${diffMins} min`;
        } else if (diffHours < 24) {
            return `Il y a ${diffHours}h`;
        } else {
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}

// Fonction utilitaire pour empêcher le zoom sur double-tap (mobile)
function preventDoubleZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Fonction pour garder l'écran allumé (si supporté)
function keepScreenAwake() {
    if ('wakeLock' in navigator) {
        let wakeLock = null;
        
        const requestWakeLock = async () => {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock activé');
            } catch (err) {
                console.log('Wake Lock non supporté:', err);
            }
        };

        // Demander le wake lock au chargement
        requestWakeLock();

        // Redemander le wake lock quand la page redevient visible
        document.addEventListener('visibilitychange', () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
                requestWakeLock();
            }
        });
    }
}

// Fonction pour gérer les raccourcis clavier
function setupKeyboardShortcuts(counter) {
    document.addEventListener('keydown', function(e) {
        // Éviter les raccourcis si on est dans un champ de saisie
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case '+':
            case '=':
                e.preventDefault();
                counter.increment();
                break;
            case '-':
                e.preventDefault();
                counter.decrement();
                break;
            case '0':
                e.preventDefault();
                counter.addNeutral();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                counter.reset();
                break;
            case 'z':
            case 'Z':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    counter.undo();
                }
                break;
            case 'Backspace':
                e.preventDefault();
                counter.undo();
                break;
        }
    });
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    // Créer l'instance du compteur
    window.blackjackCounter = new BlackjackCounter();
    
    // Optimisations mobile
    preventDoubleZoom();
    keepScreenAwake();
    
    // Raccourcis clavier
    setupKeyboardShortcuts(window.blackjackCounter);
    
    // Message de bienvenue avec instructions
    console.log('🃏 Compteur BlackJack v2.0 initialisé');
    console.log('Raccourcis clavier: +/- (compter), 0 (neutre), R (reset), Ctrl+Z ou Backspace (undo)');
    
    // Ajouter une classe pour indiquer que l'app est prête
    document.body.classList.add('app-ready');
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur dans l\'application:', e.error);
});

// Gestion de la visibilité de la page pour optimiser les performances
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Réactiver les animations ou autres fonctionnalités si nécessaire
        console.log('Application redevenue visible');
    } else {
        // Suspendre certaines opérations si nécessaire
        console.log('Application en arrière-plan');
    }
});

// Export pour les tests (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlackjackCounter;
}