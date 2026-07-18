document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       MOBILE NAVIGATION MENU
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        // Calculate scrollbar width for layout shift compensation
        const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth;

        const openMenu = () => {
            menuToggle.classList.add('active');
            navMenu.classList.add('active');
            // Set scrollbar compensation CSS variable before locking scroll
            const scrollbarWidth = getScrollbarWidth();
            document.documentElement.style.setProperty('--scrollbar-compensation', scrollbarWidth + 'px');
            document.body.classList.add('menu-open');
        };

        const closeMenu = () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.documentElement.style.setProperty('--scrollbar-compensation', '0px');
        };

        menuToggle.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when links are clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });
    }

    /* ==========================================================================
       THROTTLE UTILITY — prevents excessive repaints on mobile scroll
       ========================================================================== */
    const throttle = (fn, limit) => {
        let lastCall = 0;
        let scheduledId = null;
        return (...args) => {
            const now = Date.now();
            const remaining = limit - (now - lastCall);
            if (remaining <= 0) {
                if (scheduledId) {
                    cancelAnimationFrame(scheduledId);
                    scheduledId = null;
                }
                lastCall = now;
                fn(...args);
            } else if (!scheduledId) {
                scheduledId = requestAnimationFrame(() => {
                    lastCall = Date.now();
                    scheduledId = null;
                    fn(...args);
                });
            }
        };
    };

    /* ==========================================================================
       HEADER SCROLL STATES & PROGRESS BAR
       ========================================================================== */
    const header = document.querySelector('.header');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('btn-back-to-top');
    const scrollDownBtn = document.querySelector('.scroll-down-btn');

    const handleScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // Header shrinking
        if (header) {
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Scroll progress
        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }

        // Fade out scroll down arrow on scroll
        if (scrollDownBtn) {
            if (scrollTop > 100) {
                scrollDownBtn.style.opacity = '0';
                scrollDownBtn.style.pointerEvents = 'none';
            } else {
                scrollDownBtn.style.opacity = '1';
                scrollDownBtn.style.pointerEvents = 'auto';
            }
        }

        // Back to top button display
        if (backToTopBtn) {
            if (scrollTop > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        // Active link highlighting on scroll
        const scrollPosition = scrollTop + 100;
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (correspondingLink) {
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
    };

    // Throttle scroll handler to ~60fps (16ms) to prevent mobile GPU flicker
    window.addEventListener('scroll', throttle(handleScroll, 16), { passive: true });
    handleScroll(); // Initial invoke

    /* ==========================================================================
       TYPEWRITER SUBHEAD ANIMATION
       ========================================================================== */
    const typewriterElement = document.getElementById('typewriter-title');
    if (typewriterElement) {
        typewriterElement.textContent = ''; // Clear initial static text to prevent jumping
        const phrases = [
            "Computer Science Graduate & Software Engineer",
            "Deep Learning & Machine Learning Engineer",
            "Full Stack Developer & AI Researcher",
            "Python Developer & ML Specialist",
            "Data Structures & Algorithms Enthusiast"
        ];
        let phraseIdx = 0;
        let charIdx = 0;
        let isDeleting = false;
        let typingSpeed = 70;

        const type = () => {
            const currentPhrase = phrases[phraseIdx];
            
            if (isDeleting) {
                typewriterElement.textContent = currentPhrase.substring(0, charIdx - 1);
                charIdx--;
                typingSpeed = 30; // Delete faster
            } else {
                typewriterElement.textContent = currentPhrase.substring(0, charIdx + 1);
                charIdx++;
                typingSpeed = 70; // Normal typing speed
            }

            // Word completed
            if (!isDeleting && charIdx === currentPhrase.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause at full word
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                typingSpeed = 500; // Pause before typing next word
            }

            setTimeout(type, typingSpeed);
        };

        // Start typing
        setTimeout(type, 1000);
    }

    /* ==========================================================================
       SCROLL REVEAL (INTERSECTION OBSERVER)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Reveal once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    /* ==========================================================================
       TECH STACK GRID DYNAMIC FILTERING
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillTags = document.querySelectorAll('.skill-tag');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterCategory = btn.getAttribute('data-filter');

            skillTags.forEach(tag => {
                const tagCategory = tag.getAttribute('data-category');
                
                if (filterCategory === 'all' || tagCategory === filterCategory) {
                    tag.classList.remove('hidden');
                    // Small fade-in animation trigger
                    tag.style.opacity = '0';
                    tag.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        tag.style.opacity = '1';
                        tag.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    tag.classList.add('hidden');
                }
            });
        });
    });

    /* ==========================================================================
       RESUME PREVIEW MODAL LOGIC
       ========================================================================== */
    const resumeModal = document.getElementById('resume-modal');
    const btnResumeHero = document.getElementById('btn-resume-hero');
    const btnResumeNav = document.getElementById('btn-resume-nav');
    const modalClose = document.getElementById('modal-close');
    const btnPrintResume = document.getElementById('btn-print-resume');

    const openResume = (e) => {
        e.preventDefault();
        if (resumeModal) resumeModal.classList.add('active');
        document.body.classList.add('menu-open');
    };

    const closeResume = () => {
        if (resumeModal) resumeModal.classList.remove('active');
        document.body.classList.remove('menu-open');
    };

    // Commented out to allow direct Google Drive link download/open instead of showing the modal
    // if (btnResumeHero) btnResumeHero.addEventListener('click', openResume);
    // if (btnResumeNav) btnResumeNav.addEventListener('click', openResume);
    if (modalClose) modalClose.addEventListener('click', closeResume);

    if (resumeModal) {
        resumeModal.addEventListener('click', (e) => {
            if (e.target === resumeModal) {
                closeResume();
            }
        });
    }

    if (btnPrintResume) {
        btnPrintResume.addEventListener('click', () => {
            window.print();
        });
    }

    /* ==========================================================================
       LIVE DEMO SIMULATOR MODAL LOGIC
       ========================================================================== */
    const demoModal = document.getElementById('demo-modal');
    const demoClose = document.getElementById('demo-modal-close');
    const projectCards = document.querySelectorAll('.project-card');
    const demoLoader = document.getElementById('demo-loader');
    const demoContent = document.getElementById('demo-screen-content');
    const demoTitle = document.getElementById('demo-title');
    const demoSubtitle = document.getElementById('demo-subtitle');

    const demoSimulations = {
        'skin disease detection using cnn': {
            title: 'Skin Disease CNN Diagnostics',
            subtitle: 'Evaluating HAM10000 classification pipeline',
            logs: [
                { text: '[SYSTEM] Initializing virtual host GPU tensor stack...', type: 'accent' },
                { text: '[INFO] Loading Keras pre-trained weights for ResNet50 framework...', type: 'info' },
                { text: '[DATA] Streaming validation images subset from HAM10000 (1,200 records)...', type: 'info' },
                { text: '[PIPELINE] Applying image augmentation pipelines (rotation, horizontal flip, zoom)...', type: 'info' },
                { text: '[TRAINING] Reducing validation overfitting by 18% using custom dropout rules...', type: 'warning' },
                { text: '[EVALUATION] Commencing cross-validation classification sequence...', type: 'accent' },
                { text: 'Inference Step 1/7: Melanocytic nevi - accuracy 94.2%', type: 'info' },
                { text: 'Inference Step 2/7: Melanoma - accuracy 89.8%', type: 'info' },
                { text: 'Inference Step 3/7: Benign keratosis-like lesions - accuracy 92.1%', type: 'info' },
                { text: 'Inference Step 4/7: Basal cell carcinoma - accuracy 90.5%', type: 'info' },
                { text: 'Inference Step 5/7: Actinic keratoses - accuracy 88.9%', type: 'info' },
                { text: 'Inference Step 6/7: Dermatofibroma - accuracy 93.4%', type: 'info' },
                { text: 'Inference Step 7/7: Vascular lesions - accuracy 91.0%', type: 'info' },
                { text: '[SUCCESS] Confusion matrix optimization applied. False negative rates lowered by 12%!', type: 'success' },
                { text: '[COMPLETED] Multiclass classification complete. Final validation accuracy: 91.4%', type: 'success' },
                { text: '[READY] Diagnostic environment is online and awaiting new image stream.', type: 'accent' }
            ]
        },
        'customer churn prediction': {
            title: 'Telecom Attrition ML Model',
            subtitle: 'Evaluating predictive customer churn profiles',
            logs: [
                { text: '[SYSTEM] Parsing structured customer repository...', type: 'accent' },
                { text: '[DATA] Loaded 7,043 entries successfully. Structuring features...', type: 'info' },
                { text: '[PREPROCESSING] Handling empty records & applying One-Hot encoding to nominal parameters...', type: 'info' },
                { text: '[SPLIT] Setting up K-Fold split (k=5). Partitioning training groups...', type: 'info' },
                { text: '[TRAINING] Instantiating Decision Trees & Random Forest Classifier models...', type: 'accent' },
                { text: '[HYPER-TUNING] Running grid-search parameter optimization...', type: 'info' },
                { text: '[METRICS] Training cycle completed. Evaluating validation tests:', type: 'warning' },
                { text: '- Random Forest Base Accuracy: 84.8%', type: 'info' },
                { text: '- Tuned Decision Tree Precision: 0.82', type: 'info' },
                { text: '- Tuned Ensemble Model Recall: 0.90', type: 'info' },
                { text: '[COMPLETED] Optimal model weight resolved.', type: 'success' },
                { text: '[SUCCESS] Peak validation F1-Score attained: 0.86', type: 'success' },
                { text: '[READY] Inference pipelines active. Ready to ingest telemetry.', type: 'accent' }
            ]
        },
        'intelligent sla router': {
            title: 'SLA Router System Engine',
            subtitle: 'Evaluating real-time operational routing heuristics',
            logs: [
                { text: '[SYSTEM] Booting Intelligent SLA Router host environment...', type: 'accent' },
                { text: '[INFO] Parsing inbound support tickets and log payloads...', type: 'info' },
                { text: '[ALGORITHM] Executing priority queues with strict deadlines...', type: 'info' },
                { text: '[ROUTING] Dynamically dispatching logs based on strict SLA policies...', type: 'warning' },
                { text: '[COMPLETED] Dispatch sequence complete. Queue load optimized, bottlenecks cleared.', type: 'success' },
                { text: '[READY] Router listener online and actively monitoring logs.', type: 'accent' }
            ]
        },
        'meals mobile application': {
            title: 'Meals App Widget Compiler',
            subtitle: 'Assembling recipe database and nutritional widgets',
            logs: [
                { text: '[COMPILING] Building Flutter widget trees for cross-platform render...', type: 'accent' },
                { text: '[INFO] Ingesting recipe datasets and category search filters...', type: 'info' },
                { text: '[STATE] Structuring performant responsive views and favorites caching...', type: 'warning' },
                { text: '[COMPLETED] Compilation complete. Fast loading animations rendered successfully.', type: 'success' },
                { text: '[READY] Flutter emulator is running meals application package.', type: 'accent' }
            ]
        },
        'expense tracker app': {
            title: 'Expense Tracker Finance Engine',
            subtitle: 'Ingesting transactional logs and state workflows',
            logs: [
                { text: '[SYSTEM] Initializing financial ledger local configurations...', type: 'accent' },
                { text: '[STATE] Binding transaction input fields with active state manager...', type: 'info' },
                { text: '[CALCULATION] Compiling monthly expense percentages in real-time...', type: 'warning' },
                { text: '[COMPLETED] Memory state synced. UI state changes rendered instantly.', type: 'success' },
                { text: '[READY] Budget compiler active. Ready to ingest ledger entries.', type: 'accent' }
            ]
        }
    };

    const runDemoSimulator = (simKey) => {
        const sim = demoSimulations[simKey];
        if (!sim) return;

        demoTitle.textContent = sim.title;
        demoSubtitle.textContent = sim.subtitle;
        demoLoader.classList.remove('hidden');
        demoContent.classList.add('hidden');
        demoContent.innerHTML = '';

        // Sim loading delay
        setTimeout(() => {
            demoLoader.classList.add('hidden');
            demoContent.classList.remove('hidden');

            let lineIdx = 0;
            const printNextLog = () => {
                if (lineIdx < sim.logs.length) {
                    const log = sim.logs[lineIdx];
                    const div = document.createElement('div');
                    div.classList.add('demo-log-line');
                    
                    if (log.type === 'accent') div.classList.add('demo-log-accent');
                    else if (log.type === 'success') div.classList.add('demo-log-success');
                    else if (log.type === 'warning') div.classList.add('demo-log-warning');
                    
                    div.textContent = log.text;
                    demoContent.appendChild(div);
                    
                    // Auto scroll modal view
                    demoContent.scrollTop = demoContent.scrollHeight;
                    
                    lineIdx++;
                    setTimeout(printNextLog, Math.random() * 200 + 100); // randomize line printing delay
                }
            };
            printNextLog();

        }, 1200);
    };

    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // If they clicked the GitHub link/button inside the card, let it go to the link
            if (e.target.closest('.project-link')) {
                return;
            }
            
            // Otherwise, trigger the interactive simulation log modal
            const titleEl = card.querySelector('.project-title');
            if (titleEl) {
                const projectKey = titleEl.textContent.trim().toLowerCase();
                if (demoModal) {
                    demoModal.classList.add('active');
                    document.body.classList.add('menu-open');
                    runDemoSimulator(projectKey);
                }
            }
        });
    });

    const closeDemo = () => {
        if (demoModal) demoModal.classList.remove('active');
        document.body.classList.remove('menu-open');
    };

    if (demoClose) demoClose.addEventListener('click', closeDemo);
    if (demoModal) {
        demoModal.addEventListener('click', (e) => {
            if (e.target === demoModal) {
                closeDemo();
            }
        });
    }

    /* ==========================================================================
       CONTACT FORM VALIDATION & SIMULATION
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            if (formFeedback) {
                formFeedback.classList.remove('success', 'error');
                formFeedback.textContent = '';
            }

            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const subject = document.getElementById('form-subject').value.trim();
            const message = document.getElementById('form-message').value.trim();

            // 1. Required fields check
            if (!name || !email || !subject || !message) {
                if (formFeedback) {
                    formFeedback.classList.add('error');
                    formFeedback.textContent = 'All fields are required. Please fill in all the details.';
                }
                return;
            }

            // 2. Strict Email Format Validation
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                if (formFeedback) {
                    formFeedback.classList.add('error');
                    formFeedback.textContent = 'Please enter a valid email address (e.g. name@domain.com).';
                }
                return;
            }

            // 3. Typo detection for common domains (Senior Developer touch)
            const domainMatch = email.match(/@([^@]+)$/);
            if (domainMatch) {
                const domain = domainMatch[1].toLowerCase();
                const suspiciousDomains = ['gmai.com', 'gamil.com', 'gmail.co', 'gmaill.com', 'gmal.com', 'gmil.com'];
                if (suspiciousDomains.includes(domain)) {
                    if (formFeedback) {
                        formFeedback.classList.add('error');
                        formFeedback.textContent = `Did you mean ${email.replace(/@([^@]+)$/, '@gmail.com')}? Please check your email address.`;
                    }
                    return;
                }
                
                // Specific handler for '@l.com' typo when typing gmail (e.g. gmai@l.com)
                if (domain === 'l.com' && (email.includes('gmai') || email.includes('gamil'))) {
                    if (formFeedback) {
                        formFeedback.classList.add('error');
                        formFeedback.textContent = 'It looks like you typed "@l.com" by mistake. Did you mean to type "@gmail.com"?';
                    }
                    return;
                }
            }

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending Message...</span><div class="spinner" style="width:14px; height:14px; border-width:2px; margin-left:8px;"></div>';

            const accessKeyInput = contactForm.querySelector('input[name="access_key"]');
            const accessKey = accessKeyInput ? accessKeyInput.value : 'YOUR_ACCESS_KEY_HERE';

            const fromNameInput = contactForm.querySelector('input[name="from_name"]');
            const fromName = fromNameInput ? fromNameInput.value : 'Ubaid Ahmad Portfolio';

            const formData = {
                access_key: accessKey,
                from_name: fromName,
                name: name,
                email: email,
                subject: `[Portfolio Contact] ${subject}`,
                message: message
            };

            // Submit directly to Web3Forms API
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(async (response) => {
                const data = await response.json();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                if (response.ok && data.success) {
                    if (formFeedback) {
                        formFeedback.classList.add('success');
                        formFeedback.textContent = 'Thank you! Your message has been sent successfully. Ubaid will get back to you shortly.';
                    }
                    contactForm.reset();
                } else {
                    if (formFeedback) {
                        formFeedback.classList.add('error');
                        formFeedback.textContent = data.message || 'Oops! There was a problem submitting your message.';
                    }
                }
            })
            .catch((err) => {
                console.error('Submission error:', err);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                if (formFeedback) {
                    formFeedback.classList.add('error');
                    formFeedback.textContent = 'Oops! There was a network error. Please try again later.';
                }
            });
        });

        // Clear warning/success message as soon as user types (Standard UX optimization)
        contactForm.querySelectorAll('input, textarea').forEach(element => {
            element.addEventListener('input', () => {
                if (formFeedback) {
                    formFeedback.classList.remove('success', 'error');
                    formFeedback.textContent = '';
                }
            });
        });
    }

    /* ==========================================================================
       INTERACTIVE MAGNETIC GLOW CARD EFFECT
       ========================================================================== */
    const glowCards = document.querySelectorAll('.glow-on-hover');
    
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate within the element
            const y = e.clientY - rect.top;  // y coordinate within the element
            
            // Feeding coordinates back into CSS custom variables
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
