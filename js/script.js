/**
 * ELITE FITNESS — Main JavaScript
 * Premium Fitness Club Website
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==================== COMPONENT LOADER ====================
    /**
     * Универсальная функция загрузки компонентов
     * @param {string} targetId - ID элемента для вставки
     * @param {string} filePath - Путь к файлу компонента
     * @param {Function} [callback] - Опциональный callback после загрузки
     */
    const loadComponent = async (targetId, filePath, callback) => {
        const target = document.getElementById(targetId);
        if (!target) {
            console.warn(`Элемент #${targetId} не найден`);
            return;
        }

        try {
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            target.innerHTML = html;

            if (callback) {
                callback();
            }
        } catch (error) {
            console.error(`Ошибка загрузки компонента ${filePath}:`, error);
            target.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">Ошибка загрузки компонента</div>`;
        }
    };

    /**
     * Автоопределение базового пути для компонентов
     * Работает из любой вложенности
     */
    const getBasePath = () => {
        const path = window.location.pathname;
        // Если мы в корне (например, /index.html или /)
        if (path === '/' || path === '' || !path.includes('/')) {
            return '';
        }
        // Если мы в подпапке, возвращаем пустой путь (компоненты в корне)
        return '';
    };

    const basePath = getBasePath();

    // Загружаем header и footer
    const loadHeader = () => {
        loadComponent('header', `${basePath}components/header.html`, () => {
            // Небольшая задержка для гарантированного рендеринга
            setTimeout(() => {
                initHeaderScripts();
            }, 10);
        });
    };

    const loadFooter = () => {
        loadComponent('footer', `${basePath}components/footer.html`, () => {
            initFooterScripts();
        });
    };

    loadHeader();
    loadFooter();

    // ==================== HEADER SCRIPTS ====================
    const initHeaderScripts = () => {
        // Header scroll effect
        const header = document.getElementById('header');

        const handleHeaderScroll = () => {
            if (window.scrollY > 50) {
                header?.classList.add('header--scrolled');
            } else {
                header?.classList.remove('header--scrolled');
            }
        };

        window.addEventListener('scroll', handleHeaderScroll);
        handleHeaderScroll();

        // Mobile navigation
        const burger = document.getElementById('burger');
        const nav = document.getElementById('nav');
        const navClose = document.getElementById('navClose');
        const navLinks = document.querySelectorAll('.nav__link, .dropdown__link');

        // Проверка наличия элементов
        if (!burger || !nav) {
            console.warn('Mobile nav elements not found');
            return;
        }

        const toggleNav = () => {
            burger.classList.toggle('burger--active');
            nav.classList.toggle('nav--active');
            document.body.classList.toggle('nav-open');
            document.body.style.overflow = nav.classList.contains('nav--active') ? 'hidden' : '';
            
            // Скрываем бургер когда меню открыто
            if (nav.classList.contains('nav--active')) {
                burger.style.opacity = '0';
                burger.style.pointerEvents = 'none';
            } else {
                burger.style.opacity = '1';
                burger.style.pointerEvents = 'auto';
            }
        };

        const closeNav = () => {
            burger.classList.remove('burger--active');
            nav.classList.remove('nav--active');
            document.body.classList.remove('nav-open');
            document.body.style.overflow = '';
            
            // Возвращаем бургер
            setTimeout(() => {
                burger.style.opacity = '1';
                burger.style.pointerEvents = 'auto';
            }, 300);
        };

        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNav();
        });

        navClose?.addEventListener('click', closeNav);

        navLinks.forEach(link => {
            link.addEventListener('click', closeNav);
        });

        // Close nav on overlay click
        nav.addEventListener('click', (e) => {
            if (e.target === nav) {
                closeNav();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('nav--active')) {
                closeNav();
            }
        });

        // Dropdown menu mobile support - removed, always open on mobile

        // Highlight active nav link based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const allNavLinks = document.querySelectorAll('.nav__link, .dropdown__link');
        
        allNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && href.length > 1) {
                if (href === currentPage) {
                    link.classList.add('nav__link--active');
                } else {
                    link.classList.remove('nav__link--active');
                }
            }
        });
    };

    // ==================== FOOTER SCRIPTS ====================
    const initFooterScripts = () => {
        // Dynamic year
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletterForm');

        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        const showError = (input, message) => {
            clearError(input);
            input.classList.add('input-error');

            const errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.textContent = message;

            const formGroup = input.parentElement;
            formGroup.appendChild(errorEl);
        };

        const clearError = (input) => {
            input.classList.remove('input-error');
            const formGroup = input.parentElement;
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
        };

        const showSuccess = (message) => {
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            `;

            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: #10B981;
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 0.9375rem;
                font-weight: 500;
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
                z-index: 9999;
                animation: slideIn 0.3s ease;
            `;

            if (!document.getElementById('success-animation')) {
                const style = document.createElement('style');
                style.id = 'success-animation';
                style.textContent = `
                    @keyframes slideIn {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes slideOut {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        };

        newsletterForm?.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = newsletterForm.querySelector('input[type="email"]');

            if (!isValidEmail(emailInput.value)) {
                showError(emailInput, 'Введите корректный email');
                return;
            }

            clearError(emailInput);
            showSuccess('Вы успешно подписались на рассылку!');
            emailInput.value = '';
        });
    };

    // ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#' || href.length === 1) return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const header = document.getElementById('header');
                const headerHeight = header?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile nav if open
                const burger = document.getElementById('burger');
                const nav = document.getElementById('nav');
                burger?.classList.remove('burger--active');
                nav?.classList.remove('nav--active');
                document.body.style.overflow = '';
            }
        });
    });

    // ==================== INTERSECTION OBSERVER FOR ANIMATIONS ====================
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

    document.querySelectorAll('.slide-up').forEach(el => {
        animationObserver.observe(el);
    });

    // ==================== SCHEDULE FILTER ====================
    const scheduleFilters = document.querySelectorAll('.schedule-filter');
    const scheduleDays = document.querySelectorAll('.schedule-day');

    scheduleFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            scheduleFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            const filterValue = filter.dataset.filter;

            scheduleDays.forEach(day => {
                const dayClasses = day.querySelectorAll('.class-card');
                let hasVisibleClasses = false;

                dayClasses.forEach(card => {
                    const cardCategory = card.dataset.category;

                    if (filterValue === 'all' || cardCategory.includes(filterValue)) {
                        card.style.display = 'flex';
                        hasVisibleClasses = true;
                    } else {
                        card.style.display = 'none';
                    }
                });

                day.style.display = hasVisibleClasses ? 'block' : 'none';
            });
        });
    });

    // ==================== FORM VALIDATION ====================
    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, '');

        if (digits.length === 0) return '';
        if (digits.length <= 1) return `+7 (${digits}`;
        if (digits.length <= 4) return `+7 (${digits.slice(1, 4)}`;
        if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}`;
        if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
        return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhone = (phone) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11;
    };

    const isValidName = (name) => {
        return name.trim().length >= 2;
    };

    const showError = (input, message) => {
        clearError(input);
        input.classList.add('input-error');

        const formGroup = input.closest('.cta__form-row') || input.parentElement;
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;

        formGroup.appendChild(errorEl);
    };

    const clearError = (input) => {
        input.classList.remove('input-error');
        const formGroup = input.closest('.cta__form-row') || input.parentElement;
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    };

    // CTA Form
    const ctaForm = document.getElementById('ctaForm');

    ctaForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = ctaForm.querySelector('input[name="name"]');
        const phoneInput = ctaForm.querySelector('input[name="phone"]');

        let isValid = true;

        if (!isValidName(nameInput.value)) {
            showError(nameInput, 'Введите имя (минимум 2 символа)');
            isValid = false;
        } else {
            clearError(nameInput);
        }

        if (!isValidPhone(phoneInput.value)) {
            showError(phoneInput, 'Введите корректный номер телефона');
            isValid = false;
        } else {
            clearError(phoneInput);
        }

        if (isValid) {
            showSuccess('Спасибо! Мы свяжемся с вами в ближайшее время.');
            ctaForm.reset();
        }
    });

    // Phone input formatting
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const formatted = formatPhone(e.target.value);
            e.target.value = formatted;
        });

        input.addEventListener('blur', () => {
            const digits = input.value.replace(/\D/g, '');
            if (digits.length < 11 && digits.length > 0) {
                input.value = '';
            }
        });
    });

    // Gym Booking Form
    const gymBookingForm = document.getElementById('gymBookingForm');

    gymBookingForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = gymBookingForm.querySelector('input[name="name"]');
        const phoneInput = gymBookingForm.querySelector('input[name="phone"]');

        let isValid = true;

        if (!isValidName(nameInput.value)) {
            showError(nameInput, 'Введите имя (минимум 2 символа)');
            isValid = false;
        } else {
            clearError(nameInput);
        }

        if (!isValidPhone(phoneInput.value)) {
            showError(phoneInput, 'Введите корректный номер телефона');
            isValid = false;
        } else {
            clearError(phoneInput);
        }

        if (isValid) {
            showSuccess('Спасибо! Ваша заявка принята. Мы свяжемся с вами для подтверждения времени.');
            gymBookingForm.reset();
        }
    });

    // SPA Booking Form
    const spaBookingForm = document.getElementById('spaBookingForm');

    spaBookingForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = spaBookingForm.querySelector('input[name="name"]');
        const phoneInput = spaBookingForm.querySelector('input[name="phone"]');
        const serviceInput = spaBookingForm.querySelector('select[name="service"]');

        let isValid = true;

        if (!isValidName(nameInput.value)) {
            showError(nameInput, 'Введите имя (минимум 2 символа)');
            isValid = false;
        } else {
            clearError(nameInput);
        }

        if (!isValidPhone(phoneInput.value)) {
            showError(phoneInput, 'Введите корректный номер телефона');
            isValid = false;
        } else {
            clearError(phoneInput);
        }

        if (!serviceInput.value) {
            const errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.textContent = 'Выберите услугу';
            serviceInput.parentElement.appendChild(errorEl);
            isValid = false;
        } else {
            const existingError = serviceInput.parentElement.querySelector('.error-message');
            if (existingError) existingError.remove();
        }

        if (isValid) {
            showSuccess('Спасибо! Ваша заявка принята. Мы свяжемся с вами для подтверждения времени.');
            spaBookingForm.reset();
        }
    });

    // Contact Form
    const contactForm = document.getElementById('contactForm');

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = contactForm.querySelector('input[name="name"]');
        const phoneInput = contactForm.querySelector('input[name="phone"]');
        const emailInput = contactForm.querySelector('input[name="email"]');
        const messageInput = contactForm.querySelector('textarea[name="message"]');
        const consentInput = contactForm.querySelector('input[name="consent"]');

        let isValid = true;

        if (!isValidName(nameInput.value)) {
            showError(nameInput, 'Введите имя (минимум 2 символа)');
            isValid = false;
        } else {
            clearError(nameInput);
        }

        if (!isValidPhone(phoneInput.value)) {
            showError(phoneInput, 'Введите корректный номер телефона');
            isValid = false;
        } else {
            clearError(phoneInput);
        }

        if (emailInput.value && !isValidEmail(emailInput.value)) {
            showError(emailInput, 'Введите корректный email');
            isValid = false;
        } else if (emailInput.value) {
            clearError(emailInput);
        }

        if (!messageInput.value.trim()) {
            showError(messageInput, 'Введите сообщение');
            isValid = false;
        } else {
            clearError(messageInput);
        }

        if (!consentInput.checked) {
            showError(consentInput, 'Необходимо согласие на обработку данных');
            isValid = false;
        }

        if (isValid) {
            showSuccess('Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в течение 15 минут.');
            contactForm.reset();
        }
    });

    // Date input min date
    const dateInput = document.querySelector('input[type="date"][name="date"]');

    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // ==================== SCROLL TO TOP BUTTON ====================
    const createScrollToTopButton = () => {
        const button = document.createElement('button');
        button.className = 'scroll-to-top';
        button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        button.setAttribute('aria-label', 'Наверх');

        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #C23E36, #A8322C);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 1.25rem;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(194, 62, 54, 0.3);
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 999;
        `;

        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(button);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
                button.style.transform = 'translateY(0)';
            } else {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
                button.style.transform = 'translateY(20px)';
            }
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    };

    createScrollToTopButton();

    // ==================== FAQ ACCORDION ====================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const header = item.querySelector('.faq-item__header');

        header?.addEventListener('click', () => {
            const isActive = item.classList.contains('faq-item--active');

            faqItems.forEach(i => i.classList.remove('faq-item--active'));

            if (!isActive) {
                item.classList.add('faq-item--active');
            }
        });
    });

    // ==================== PRICING CARD SELECTION ====================
    const pricingGrid = document.getElementById('pricingGrid');

    if (pricingGrid) {
        const pricingCards = pricingGrid.querySelectorAll('.pricing-card');
        const pricingButtons = pricingGrid.querySelectorAll('.pricing-card__btn');

        pricingCards.forEach(card => {
            card.addEventListener('click', () => {
                // Удаляем выделение со всех карточек
                pricingCards.forEach(c => c.classList.remove('selected'));

                // Добавляем выделение выбранной карточке
                card.classList.add('selected');
            });
        });

        // Предотвращаем всплытие клика от кнопок
        pricingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    // ==================== PRICING MODAL ====================
    const pricingModal = document.getElementById('pricingModal');
    const modalPlanName = document.getElementById('modalPlanName');
    const modalPlanPrice = document.getElementById('modalPlanPrice');
    const modalPlanPeriod = document.getElementById('modalPlanPeriod');
    const modalForm = document.getElementById('modalForm');
    const modalClose = pricingModal?.querySelector('.modal__close');
    const modalOverlay = pricingModal?.querySelector('.modal__overlay');

    // Открытие модального окна
    if (pricingModal) {
        const pricingButtons = document.querySelectorAll('.pricing-card__btn');

        pricingButtons.forEach(button => {
            button.addEventListener('click', () => {
                const planName = button.getAttribute('data-plan');
                const planPrice = button.getAttribute('data-price');
                const planPeriod = button.getAttribute('data-period');

                modalPlanName.textContent = planName;
                modalPlanPrice.textContent = `${planPrice} ₽`;
                modalPlanPeriod.textContent = planPeriod;

                openModal();
            });
        });

        // Закрытие по кнопке X
        modalClose?.addEventListener('click', closeModal);

        // Закрытие по клику на оверлей
        modalOverlay?.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && pricingModal.classList.contains('modal--active')) {
                closeModal();
            }
        });

        // Предотвращение закрытия при клике внутри контента
        pricingModal.querySelector('.modal__content')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Обработка отправки формы
        modalForm?.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(modalForm);
            const data = Object.fromEntries(formData.entries());

            // Добавляем информацию о тарифе
            data.plan = modalPlanName.textContent;
            data.price = modalPlanPrice.textContent;
            data.period = modalPlanPeriod.textContent;

            console.log('Заявка на тариф:', data);

            // Здесь будет логика отправки на сервер
            alert(`Спасибо, ${data.name}! Ваша заявка на тариф "${data.plan}" принята. Мы свяжемся с вами по телефону ${data.phone} в ближайшее время.`);

            modalForm.reset();
            closeModal();
        });
    }

    function openModal() {
        if (pricingModal) {
            pricingModal.classList.add('modal--active');
            document.body.style.overflow = 'hidden';
            
            // Прокрутка наверх для мобильных
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            // Фокус на первом поле ввода
            setTimeout(() => {
                document.getElementById('modalName')?.focus();
            }, 100);
        }
    }

    function closeModal() {
        if (pricingModal) {
            pricingModal.classList.remove('modal--active');
            document.body.style.overflow = '';
        }
    }

    // ==================== REMOVE LOADING STATE ====================
    document.body.classList.add('loaded');

    // ==================== GALLERY LIGHTBOX (GYM PAGE) ====================
    const initGalleryLightbox = () => {
        const lightbox = document.getElementById('galleryLightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');
        const galleryItems = document.querySelectorAll('.gallery-item img');

        if (!lightbox || !galleryItems.length) return;

        let currentIndex = 0;
        const images = Array.from(galleryItems).map(img => ({
            src: img.src,
            alt: img.alt
        }));

        const openLightbox = (index) => {
            currentIndex = index;
            updateLightboxImage();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        const updateLightboxImage = () => {
            const current = images[currentIndex];
            lightboxImage.src = current.src;
            lightboxImage.alt = current.alt;
            lightboxCaption.textContent = current.alt;

            // Скрываем кнопки навигации если всего одно изображение
            if (images.length === 1) {
                lightboxPrev.style.display = 'none';
                lightboxNext.style.display = 'none';
            } else {
                lightboxPrev.style.display = 'flex';
                lightboxNext.style.display = 'flex';
            }
        };

        const showPrev = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateLightboxImage();
        };

        const showNext = () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateLightboxImage();
        };

        // Открытие по клику на изображение
        galleryItems.forEach((img, index) => {
            img.addEventListener('click', () => openLightbox(index));
            img.style.cursor = 'pointer';
        });

        // Закрытие по кнопке X
        lightboxClose?.addEventListener('click', closeLightbox);

        // Навигация
        lightboxPrev?.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrev();
        });

        lightboxNext?.addEventListener('click', (e) => {
            e.stopPropagation();
            showNext();
        });

        // Закрытие по клику на фон
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('gallery-lightbox__content')) {
                closeLightbox();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
            if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
                showPrev();
            }
            if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
                showNext();
            }
        });

        // Предотвращение закрытия при клике на изображение
        lightboxImage?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    };

    // Инициализация лайтбокса после загрузки контента
    setTimeout(() => {
        initGalleryLightbox();
    }, 100);

    // ==================== POOL PRICING (POOL PAGE) ====================
    const initPoolPricing = () => {
        const poolPricingGrid = document.getElementById('poolPricingGrid');
        const poolPricingModal = document.getElementById('poolPricingModal');
        const poolModalPlanName = document.getElementById('poolModalPlanName');
        const poolModalPlanPrice = document.getElementById('poolModalPlanPrice');
        const poolModalPlanPeriod = document.getElementById('poolModalPlanPeriod');
        const poolModalForm = document.getElementById('poolModalForm');
        const poolModalClose = poolPricingModal?.querySelector('.modal__close');
        const poolModalOverlay = poolPricingModal?.querySelector('.modal__overlay');

        if (!poolPricingGrid) return;

        const poolPricingCards = poolPricingGrid.querySelectorAll('.pool-pricing-card');
        const poolPricingButtons = poolPricingGrid.querySelectorAll('.pool-pricing-card__btn');

        // Выделение карточек при клике
        poolPricingCards.forEach(card => {
            card.addEventListener('click', () => {
                poolPricingCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });

        // Предотвращение всплытия клика от кнопок
        poolPricingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // Открытие модального окна
        if (poolPricingModal) {
            poolPricingButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const planName = button.getAttribute('data-plan');
                    const planPrice = button.getAttribute('data-price');
                    const planPeriod = button.getAttribute('data-period');

                    poolModalPlanName.textContent = planName;
                    poolModalPlanPrice.textContent = `${planPrice} ₽`;
                    poolModalPlanPeriod.textContent = planPeriod;

                    openPoolModal();
                });
            });

            // Закрытие по кнопке X
            poolModalClose?.addEventListener('click', closePoolModal);

            // Закрытие по клику на оверлей
            poolModalOverlay?.addEventListener('click', (e) => {
                if (e.target === poolModalOverlay) {
                    closePoolModal();
                }
            });

            // Закрытие по ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && poolPricingModal.classList.contains('modal--active')) {
                    closePoolModal();
                }
            });

            // Предотвращение закрытия при клике внутри контента
            poolPricingModal.querySelector('.modal__content')?.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            // Обработка отправки формы
            poolModalForm?.addEventListener('submit', (e) => {
                e.preventDefault();

                const formData = new FormData(poolModalForm);
                const data = Object.fromEntries(formData.entries());

                // Добавляем информацию о тарифе
                data.plan = poolModalPlanName.textContent;
                data.price = poolModalPlanPrice.textContent;
                data.period = poolModalPlanPeriod.textContent;

                console.log('Заявка на бассейн:', data);

                alert(`Спасибо, ${data.name}! Ваша заявка на тариф "${data.plan}" принята. Мы свяжемся с вами по телефону ${data.phone} в ближайшее время.`);

                poolModalForm.reset();
                closePoolModal();
            });
        }

        function openPoolModal() {
            if (poolPricingModal) {
                poolPricingModal.classList.add('modal--active');
                document.body.style.overflow = 'hidden';

                if (window.innerWidth <= 768) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }

                setTimeout(() => {
                    document.getElementById('poolModalName')?.focus();
                }, 100);
            }
        }

        function closePoolModal() {
            if (poolPricingModal) {
                poolPricingModal.classList.remove('modal--active');
                document.body.style.overflow = '';
            }
        }
    };

    // Инициализация pool pricing после загрузки контента
    setTimeout(() => {
        initPoolPricing();
    }, 100);

    // ==================== CONSOLE WELCOME MESSAGE ====================
    console.log('%c🏋️ ELITE FITNESS', 'font-size: 24px; font-weight: bold; color: #C23E36;');
    console.log('%cPremium Fitness Club Website', 'font-size: 14px; color: #6B7280;');
    console.log('%cBuilt with ❤️ for fitness enthusiasts', 'font-size: 12px; color: #9CA3AF;');
});
