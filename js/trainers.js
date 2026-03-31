/**
 * Trainers Module
 * Рендеринг карточек тренеров из единого источника данных
 */

class TrainersModule {
    constructor() {
        this.trainers = [];
        this.loaded = false;
    }

    /**
     * Загрузка данных тренеров из JSON
     */
    async loadTrainers() {
        if (this.loaded) return this.trainers;

        try {
            const basePath = this.getBasePath();
            const response = await fetch(`${basePath}data/trainers.json`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.trainers = data.trainers;
            this.loaded = true;
            return this.trainers;
        } catch (error) {
            console.error('Ошибка загрузки данных тренеров:', error);
            return [];
        }
    }

    /**
     * Автоопределение базового пути
     */
    getBasePath() {
        const path = window.location.pathname;
        if (path === '/' || path === '' || !path.includes('/')) {
            return '';
        }
        return '';
    }

    /**
     * Фильтрация тренеров по направлению
     * @param {string} direction - направление (gym, pool, spa, yoga, dance)
     */
    filterByDirection(direction) {
        return this.trainers.filter(trainer => 
            trainer.directions.includes(direction.toLowerCase())
        );
    }

    /**
     * Генерация HTML карточки тренера
     * @param {Object} trainer - данные тренера
     * @param {number} index - индекс для задержки анимации
     */
    generateTrainerCard(trainer, index = 0) {
        const delay = index * 0.1;
        const specialtiesHtml = trainer.specialties
            .map(spec => `<li>${spec}</li>`)
            .join('');

        return `
            <div class="team-card slide-up" style="transition-delay: ${delay}s">
                <div class="team-card__image">
                    <img src="${trainer.image}" alt="${trainer.name}" loading="lazy">
                </div>
                <div class="team-card__content">
                    <h3 class="team-card__name">${trainer.name}</h3>
                    <p class="team-card__direction">${trainer.direction}</p>
                    <p class="team-card__experience">Опыт: ${trainer.experience}</p>
                    <ul class="team-card__specialties">
                        ${specialtiesHtml}
                    </ul>
                    <button class="btn btn--primary btn--full team-card__btn" data-trainer="${trainer.name}">
                        <span>Записаться к тренеру</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Рендеринг тренеров в контейнере
     * @param {string} containerSelector - селектор контейнера
     * @param {string} direction - направление для фильтрации
     */
    async renderTrainers(containerSelector, direction) {
        await this.loadTrainers();
        
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.warn(`Контейнер ${containerSelector} не найден`);
            return;
        }

        const filtered = this.filterByDirection(direction);
        
        if (filtered.length === 0) {
            container.innerHTML = '<p class="no-trainers">Тренеры этого направления скоро появятся</p>';
            return;
        }

        container.innerHTML = filtered
            .map((trainer, index) => this.generateTrainerCard(trainer, index))
            .join('');

        // Повторная инициализация Observer для анимаций
        this.initAnimationObserver();
        
        // Повторное навешивание обработчиков на кнопки
        this.initTrainerButtons();
    }

    /**
     * Рендеринг всех секций на странице team.html
     */
    async renderAllSections() {
        await this.loadTrainers();

        const sections = {
            'gym': '#gym-trainers .team-grid',
            'pool': '#pool-trainers .team-grid',
            'spa': '#spa-trainers .team-grid',
            'yoga': '#yoga-trainers .team-grid',
            'dance': '#dance-trainers .team-grid'
        };

        for (const [direction, selector] of Object.entries(sections)) {
            const container = document.querySelector(selector);
            if (container) {
                const filtered = this.filterByDirection(direction);
                container.innerHTML = filtered
                    .map((trainer, index) => this.generateTrainerCard(trainer, index))
                    .join('');
            }
        }

        this.initAnimationObserver();
        this.initTrainerButtons();
    }

    /**
     * Инициализация Observer для анимаций
     */
    initAnimationObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.team-card.slide-up').forEach(el => {
            animationObserver.observe(el);
        });
    }

    /**
     * Инициализация обработчиков кнопок записи к тренеру
     */
    initTrainerButtons() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTrainerName = document.getElementById('modalTrainerName');
        const modalClose = document.getElementById('modalClose');
        const modalForm = document.getElementById('modalForm');

        // Обработчик закрытия
        const closeModal = () => {
            modalOverlay?.classList.remove('modal-overlay--active');
            document.body.classList.remove('modal-open');
            modalForm?.reset();
        };

        modalClose?.addEventListener('click', closeModal);

        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay?.classList.contains('modal-overlay--active')) {
                closeModal();
            }
        });

        modalForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            // Здесь можно добавить отправку формы
            alert('Спасибо! Ваша заявка принята.');
            closeModal();
        });

        // Обработчики на кнопки тренеров
        document.querySelectorAll('.team-card__btn').forEach(button => {
            button.addEventListener('click', () => {
                const trainerName = button.dataset.trainer;
                if (modalTrainerName) {
                    modalTrainerName.textContent = `Тренер: ${trainerName}`;
                }
                
                // На мобильных прокручиваем наверх перед открытием
                if (window.innerWidth <= 768) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                        modalOverlay?.classList.add('modal-overlay--active');
                        document.body.classList.add('modal-open');
                    }, 300);
                } else {
                    modalOverlay?.classList.add('modal-overlay--active');
                    document.body.classList.add('modal-open');
                }
            });
        });
    }

    /**
     * Получение тренера по имени
     */
    getTrainerByName(name) {
        return this.trainers.find(t => t.name === name);
    }

    /**
     * Получение тренера по ID
     */
    getTrainerById(id) {
        return this.trainers.find(t => t.id === id);
    }
}

// Создание глобального экземпляра
window.trainersModule = new TrainersModule();

// Автоинициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[TrainersModule] DOM loaded, starting initialization...');
    
    // Загружаем тренеров
    const trainers = await window.trainersModule.loadTrainers();
    console.log('[TrainersModule] Loaded', trainers.length, 'trainers');

    // Проверка для team.html — рендеринг всех секций
    const teamPageContainer = document.querySelector('#gym-trainers .team-grid');
    if (teamPageContainer) {
        console.log('[TrainersModule] Detected team.html page');
        await window.trainersModule.renderAllSections();
        console.log('[TrainersModule] Rendered all sections on team.html');
        return;
    }

    // Проверка для страниц направлений
    const directionMap = {
        'gym': 'gym-trainers-section',
        'pool': 'pool-trainers-section',
        'spa': 'spa-trainers-section',
        'yoga': 'yoga-trainers-section',
        'dance': 'dance-trainers-section'
    };

    for (const [direction, sectionId] of Object.entries(directionMap)) {
        const container = document.querySelector(`#${sectionId} .team-grid`);
        if (container) {
            console.log(`[TrainersModule] Rendering ${direction} trainers in #${sectionId}`);
            const filtered = window.trainersModule.filterByDirection(direction);
            console.log(`[TrainersModule] Found ${filtered.length} trainers for ${direction}`);
            container.innerHTML = filtered
                .map((trainer, index) => window.trainersModule.generateTrainerCard(trainer, index))
                .join('');
        }
    }

    // Инициализация анимаций и обработчиков после рендеринга
    setTimeout(() => {
        console.log('[TrainersModule] Initializing animations and button handlers');
        window.trainersModule.initAnimationObserver();
        window.trainersModule.initTrainerButtons();
    }, 100);
});
