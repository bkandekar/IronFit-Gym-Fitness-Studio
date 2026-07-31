/* ==========================================================================
   IRONFIT GYM & FITNESS STUDIO - INTERACTIVITY & ESTIMATOR ENGINE
   Client: IronFit Gym & Fitness Studio, Kothrud, Pune
   WhatsApp Target: 918329931123 (Rahul Patil - Owner)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------------------------
    // 1. DATA LOOKUP & CONFIGURATION
    // ----------------------------------------------------------------------
    const WHATSAPP_NUMBER = '918329931123'; // Target WhatsApp with country code
    
    const PLAN_DATA = {
        strength: {
            label: "Gym Floor & Strength Training",
            plans: [
                { id: "1mo", name: "1 Month Access", basic: 2500, pro: 3000, elite: 3500 },
                { id: "3mo", name: "3 Months Access (Quarterly)", basic: 6500, pro: 7500, elite: 8800 },
                { id: "6mo", name: "6 Months Access (Semi-Annual)", basic: 11500, pro: 13200, elite: 15500 },
                { id: "12mo", name: "12 Months Access (Annual Beast)", basic: 18000, pro: 21000, elite: 25000 }
            ]
        },
        group: {
            label: "Group Classes (Zumba, Yoga, HIIT)",
            plans: [
                { id: "1mo_pass", name: "1 Month Class Pass", basic: 3000, pro: 3600, elite: 4200 },
                { id: "3mo_pass", name: "3 Months Class Pass", basic: 7800, pro: 9200, elite: 10800 },
                { id: "6mo_pass", name: "6 Months Class Pass", basic: 13500, pro: 15800, elite: 18500 }
            ]
        },
        pt: {
            label: "1-on-1 Personal Training",
            plans: [
                { id: "12_sessions", name: "12 Sessions (1 Month)", basic: 7500, pro: 9000, elite: 10500 },
                { id: "36_sessions", name: "36 Sessions (3 Months)", basic: 19500, pro: 22500, elite: 26000 },
                { id: "72_sessions", name: "72 Sessions (6 Months)", basic: 36000, pro: 42000, elite: 48000 }
            ]
        },
        transformation: {
            label: "Body Transformation Challenge",
            plans: [
                { id: "90_day", name: "90-Day Fat Loss Challenge", basic: 24000, pro: 28000, elite: 32000 },
                { id: "180_day", name: "180-Day Muscle Build Challenge", basic: 42000, pro: 48000, elite: 55000 }
            ]
        }
    };

    // ----------------------------------------------------------------------
    // 2. DOM ELEMENTS
    // ----------------------------------------------------------------------
    const estCategorySelect = document.getElementById('estCategory');
    const estPlanSelect = document.getElementById('estPlan');
    const estTierInputs = document.querySelectorAll('input[name="estTier"]');
    const estAddonCheckboxes = document.querySelectorAll('.estAddon');
    const priceMinDisplay = document.getElementById('priceMinDisplay');
    const priceMaxDisplay = document.getElementById('priceMaxDisplay');
    const btnBookEstimatedPlan = document.getElementById('btnBookEstimatedPlan');

    const bookingModal = document.getElementById('bookingModal');
    const modalClose = document.getElementById('modalClose');
    const bookingForm = document.getElementById('bookingForm');
    const modalName = document.getElementById('modalName');
    const modalPhone = document.getElementById('modalPhone');
    const modalProgram = document.getElementById('modalProgram');
    const modalDate = document.getElementById('modalDate');
    const modalSlot = document.getElementById('modalSlot');
    const modalNotes = document.getElementById('modalNotes');
    const redirectNotice = document.getElementById('redirectNotice');
    const btnSubmitModal = document.getElementById('btnSubmitModal');

    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');

    let currentCalculatedMin = 2500;
    let currentCalculatedMax = 3200;

    // ----------------------------------------------------------------------
    // 3. ESTIMATOR CALCULATOR LOGIC
    // ----------------------------------------------------------------------
    function populatePlans(categoryKey) {
        if (!estPlanSelect) return;
        estPlanSelect.innerHTML = '';
        const catData = PLAN_DATA[categoryKey];
        if (!catData) return;

        catData.plans.forEach(plan => {
            const opt = document.createElement('option');
            opt.value = plan.id;
            opt.textContent = plan.name;
            estPlanSelect.appendChild(opt);
        });
    }

    function calculateEstimate() {
        if (!estCategorySelect || !estPlanSelect) return;

        const categoryKey = estCategorySelect.value;
        const planId = estPlanSelect.value;
        let selectedTier = 'basic';
        
        estTierInputs.forEach(radio => {
            if (radio.checked) selectedTier = radio.value;
        });

        const catData = PLAN_DATA[categoryKey];
        if (!catData) return;

        const planObj = catData.plans.find(p => p.id === planId) || catData.plans[0];
        let baseCost = planObj[selectedTier] || planObj.basic;

        // Addon Surcharges
        let addonsTotal = 0;
        estAddonCheckboxes.forEach(cb => {
            if (cb.checked) {
                addonsTotal += parseInt(cb.getAttribute('data-cost') || '0', 10);
            }
        });

        let targetMin = baseCost + addonsTotal;
        let targetMax = Math.round(targetMin * 1.15); // Realistic range buffer

        animateNumber(priceMinDisplay, currentCalculatedMin, targetMin, 300);
        animateNumber(priceMaxDisplay, currentCalculatedMax, targetMax, 300);

        currentCalculatedMin = targetMin;
        currentCalculatedMax = targetMax;
    }

    function animateNumber(element, startVal, endVal, duration) {
        if (!element) return;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = Math.min((timestamp - startTime) / duration, 1);
            let currentVal = Math.floor(progress * (endVal - startVal) + startVal);
            element.textContent = currentVal.toLocaleString('en-IN');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = endVal.toLocaleString('en-IN');
            }
        }
        window.requestAnimationFrame(step);
    }

    // Event Listeners for Estimator Controls
    if (estCategorySelect) {
        estCategorySelect.addEventListener('change', function() {
            populatePlans(this.value);
            calculateEstimate();
        });
    }

    if (estPlanSelect) estPlanSelect.addEventListener('change', calculateEstimate);
    estTierInputs.forEach(radio => radio.addEventListener('change', calculateEstimate));
    estAddonCheckboxes.forEach(cb => cb.addEventListener('change', calculateEstimate));

    // Initial population and calculate
    populatePlans('strength');
    calculateEstimate();

    // ----------------------------------------------------------------------
    // 4. MODAL & WHATSAPP REDIRECT ENGINE
    // ----------------------------------------------------------------------
    function openModal(programName) {
        if (!bookingModal) return;
        bookingModal.classList.add('active');
        bookingModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        if (programName && modalProgram) {
            // Check if option exists in select, else add dynamically
            let matched = false;
            for (let i = 0; i < modalProgram.options.length; i++) {
                if (modalProgram.options[i].value === programName || modalProgram.options[i].textContent.includes(programName)) {
                    modalProgram.selectedIndex = i;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                const newOpt = new Option(programName, programName, true, true);
                modalProgram.add(newOpt, 0);
                modalProgram.selectedIndex = 0;
            }
        }
    }

    function closeModal() {
        if (!bookingModal) return;
        bookingModal.classList.remove('active');
        bookingModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (redirectNotice) redirectNotice.style.display = 'none';
        if (btnSubmitModal) btnSubmitModal.disabled = false;
    }

    // Attach Open Modal event to all trigger buttons
    document.querySelectorAll('.btn-open-modal').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const programName = this.getAttribute('data-program') || 'General Trial Pass';
            openModal(programName);
        });
    });

    // Estimator "Book This Plan" button
    if (btnBookEstimatedPlan) {
        btnBookEstimatedPlan.addEventListener('click', function() {
            const catText = estCategorySelect.options[estCategorySelect.selectedIndex].text;
            const planText = estPlanSelect.options[estPlanSelect.selectedIndex].text;
            const summaryProgram = `Estimate (${planText}) ~ ₹${currentCalculatedMin.toLocaleString('en-IN')}`;
            openModal(summaryProgram);
        });
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (bookingModal) {
        bookingModal.addEventListener('click', function(e) {
            if (e.target === bookingModal) closeModal();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Booking Form Submit Handler -> Redirects to WhatsApp
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            let isValid = true;
            const nameVal = modalName ? modalName.value.trim() : '';
            const phoneVal = modalPhone ? modalPhone.value.trim() : '';
            const programVal = modalProgram ? modalProgram.value : '3-Day Free Trial Pass';
            const dateVal = modalDate && modalDate.value ? modalDate.value : 'Flexible';
            const slotVal = modalSlot ? modalSlot.value : 'Morning';
            const notesVal = modalNotes && modalNotes.value.trim() ? modalNotes.value.trim() : 'None';

            // Validate Name
            const nameGroup = modalName ? modalName.closest('.form-group') : null;
            if (!nameVal) {
                if (nameGroup) nameGroup.classList.add('has-error');
                isValid = false;
            } else {
                if (nameGroup) nameGroup.classList.remove('has-error');
            }

            // Validate 10-digit Phone
            const phoneGroup = modalPhone ? modalPhone.closest('.form-group') : null;
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneVal || !phoneRegex.test(phoneVal.replace(/\s+/g, ''))) {
                if (phoneGroup) phoneGroup.classList.add('has-error');
                isValid = false;
            } else {
                if (phoneGroup) phoneGroup.classList.remove('has-error');
            }

            if (!isValid) return;

            // Show Redirect Loading State
            if (redirectNotice) redirectNotice.style.display = 'flex';
            if (btnSubmitModal) btnSubmitModal.disabled = true;

            // Construct Formatted WhatsApp Message
            const message = `Hello Rahul Patil Sir,\n\nI would like to book a Free Trial at *IronFit Gym & Fitness Studio*, Kothrud!\n\n📋 *Booking Details:*\n👤 *Name:* ${nameVal}\n📞 *Phone:* ${phoneVal}\n🏋️ *Preferred Program:* ${programVal}\n📅 *Preferred Date:* ${dateVal}\n⏰ *Time Slot:* ${slotVal}\n📝 *Goals/Notes:* ${notesVal}\n\nPlease confirm my complimentary trial pass slot. Thank you!`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

            setTimeout(function() {
                window.location.href = whatsappUrl;
            }, 800);
        });
    }

    // ----------------------------------------------------------------------
    // 5. TAB SWITCHER FOR PROGRAMS
    // ----------------------------------------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // ----------------------------------------------------------------------
    // 6. ANIMATED STATS COUNTER ON SCROLL (IntersectionObserver)
    // ----------------------------------------------------------------------
    const statCounts = document.querySelectorAll('.stat-count');
    let animatedStats = false;

    if (statCounts.length > 0 && 'IntersectionObserver' in window) {
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animatedStats) {
                    animatedStats = true;
                    statCounts.forEach(counter => {
                        const target = parseInt(counter.getAttribute('data-target') || '0', 10);
                        animateStatCounter(counter, 0, target, 1800);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        const statsBar = document.querySelector('.stats-counter-bar');
        if (statsBar) statsObserver.observe(statsBar);
    }

    function animateStatCounter(element, start, end, duration) {
        let startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = Math.min((timestamp - startTime) / duration, 1);
            let current = Math.floor(progress * (end - start) + start);
            element.textContent = current.toLocaleString('en-IN');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end.toLocaleString('en-IN');
            }
        }
        window.requestAnimationFrame(step);
    }

    // ----------------------------------------------------------------------
    // 7. MOBILE NAVIGATION TOGGLE
    // ----------------------------------------------------------------------
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });

        // Close nav when clicking links
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
            });
        });
    }

    // Set Default Min Date for Modal Date Picker
    if (modalDate) {
        const today = new Date().toISOString().split('T')[0];
        modalDate.value = today;
        modalDate.min = today;
    }

    // ----------------------------------------------------------------------
    // 8. LIGHT / DARK THEME TOGGLE
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        // Check saved theme
        const savedTheme = localStorage.getItem('ironfit_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }

        themeToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('ironfit_theme', isLight ? 'light' : 'dark');
        });
    }

    // ----------------------------------------------------------------------
    // 9. BMI & BODY FAT CALCULATOR
    // ----------------------------------------------------------------------
    const btnCalculateBmi = document.getElementById('btnCalculateBmi');
    const bmiAgeInput = document.getElementById('bmiAge');
    const bmiHeightInput = document.getElementById('bmiHeight');
    const bmiWeightInput = document.getElementById('bmiWeight');
    const resBmiVal = document.getElementById('resBmiVal');
    const resBmiCategory = document.getElementById('resBmiCategory');
    const resMeterPointer = document.getElementById('resMeterPointer');
    const resBodyFat = document.getElementById('resBodyFat');
    const resIdealWeight = document.getElementById('resIdealWeight');
    const resBmiAdvice = document.getElementById('resBmiAdvice');
    const btnBmiClaimPlan = document.getElementById('btnBmiClaimPlan');

    function runBmiCalculation() {
        if (!bmiHeightInput || !bmiWeightInput || !bmiAgeInput) return;

        const heightCm = parseFloat(bmiHeightInput.value) || 170;
        const weightKg = parseFloat(bmiWeightInput.value) || 70;
        const ageYears = parseFloat(bmiAgeInput.value) || 25;
        const isMale = document.querySelector('input[name="bmiGender"]:checked')?.value === 'male';

        const heightM = heightCm / 100;
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);

        // Calculate Body Fat Estimate (Deurenberg formula)
        const genderVal = isMale ? 1 : 0;
        let bodyFat = ((1.20 * bmi) + (0.23 * ageYears) - (10.8 * genderVal) - 5.4).toFixed(1);
        if (bodyFat < 5) bodyFat = 5.0;

        // Calculate Ideal Weight Range (18.5 to 24.9 BMI)
        const minIdeal = (18.5 * heightM * heightM).toFixed(0);
        const maxIdeal = (24.9 * heightM * heightM).toFixed(0);

        if (resBmiVal) resBmiVal.textContent = bmi;
        if (resBodyFat) resBodyFat.textContent = `${bodyFat}%`;
        if (resIdealWeight) resIdealWeight.textContent = `${minIdeal} – ${maxIdeal} kg`;

        // Category & Pointer Position
        let category = 'Normal';
        let pointerPct = 50;
        let advice = 'You are in a healthy range! Maintain your peak physique with our gym floor strength access.';
        let recommendedProgram = 'Gym Floor & Strength Access';

        if (bmi < 18.5) {
            category = 'Underweight';
            pointerPct = Math.max(10, (bmi / 18.5) * 25);
            advice = 'Focus on progressive overload strength lifting & high-calorie nutrition to build lean muscle mass.';
            recommendedProgram = '180-Day Muscle & Strength Transformation';
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Healthy / Normal';
            pointerPct = 25 + (((bmi - 18.5) / 6.4) * 25);
            advice = 'Optimal fitness zone! Elevate stamina with Zumba, HIIT, or heavy compound strength workouts.';
            recommendedProgram = 'Gym Floor & HIIT Membership';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            pointerPct = 50 + (((bmi - 25) / 4.9) * 25);
            advice = 'Combine personal coaching with ISSA diet plans for 100% guaranteed calorie burn & body toning.';
            recommendedProgram = '90-Day Fat Loss & Recomposition Challenge';
        } else {
            category = 'Obese';
            pointerPct = Math.min(92, 75 + (((bmi - 30) / 10) * 25));
            advice = 'Personalized 1-on-1 coaching is highly recommended to protect joints and ensure sustainable fat loss.';
            recommendedProgram = '1-on-1 Personal Training & Custom Diet';
        }

        if (resBmiCategory) resBmiCategory.textContent = category;
        if (resMeterPointer) resMeterPointer.style.left = `${pointerPct}%`;
        if (resBmiAdvice) resBmiAdvice.textContent = advice;
        if (btnBmiClaimPlan) btnBmiClaimPlan.setAttribute('data-program', `BMI Pass: ${category} (${recommendedProgram})`);
    }

    if (btnCalculateBmi) {
        btnCalculateBmi.addEventListener('click', runBmiCalculation);
    }

    // ----------------------------------------------------------------------
    // 10. FITNESS GOAL QUIZ LOGIC
    // ----------------------------------------------------------------------
    let quizState = { goal: 'fat_loss', days: '5', level: 'beginner' };

    const quizStep1 = document.getElementById('quizStep1');
    const quizStep2 = document.getElementById('quizStep2');
    const quizStep3 = document.getElementById('quizStep3');
    const quizResultStep = document.getElementById('quizResultStep');
    const quizProgressFill = document.getElementById('quizProgressFill');
    const quizStepNum = document.getElementById('quizStepNum');
    const quizResultTitle = document.getElementById('quizResultTitle');
    const quizResultDesc = document.getElementById('quizResultDesc');
    const btnBookQuizPlan = document.getElementById('btnBookQuizPlan');
    const btnRestartQuiz = document.getElementById('btnRestartQuiz');

    document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.hasAttribute('data-quiz-goal')) {
                quizState.goal = this.getAttribute('data-quiz-goal');
                showQuizStep(2);
            } else if (this.hasAttribute('data-quiz-days')) {
                quizState.days = this.getAttribute('data-quiz-days');
                showQuizStep(3);
            } else if (this.hasAttribute('data-quiz-level')) {
                quizState.level = this.getAttribute('data-quiz-level');
                evaluateQuizResult();
            }
        });
    });

    function showQuizStep(stepNum) {
        if (quizStep1) quizStep1.classList.remove('active');
        if (quizStep2) quizStep2.classList.remove('active');
        if (quizStep3) quizStep3.classList.remove('active');
        if (quizResultStep) quizResultStep.classList.remove('active');

        if (stepNum === 1) {
            if (quizStep1) quizStep1.classList.add('active');
            if (quizProgressFill) quizProgressFill.style.width = '33.3%';
            if (quizStepNum) quizStepNum.textContent = '1';
        } else if (stepNum === 2) {
            if (quizStep2) quizStep2.classList.add('active');
            if (quizProgressFill) quizProgressFill.style.width = '66.6%';
            if (quizStepNum) quizStepNum.textContent = '2';
        } else if (stepNum === 3) {
            if (quizStep3) quizStep3.classList.add('active');
            if (quizProgressFill) quizProgressFill.style.width = '100%';
            if (quizStepNum) quizStepNum.textContent = '3';
        }
    }

    function evaluateQuizResult() {
        if (quizStep3) quizStep3.classList.remove('active');
        if (quizResultStep) quizResultStep.classList.add('active');

        let programTitle = '90-Day Fat Loss & Recomposition Challenge';
        let programDesc = 'Based on your goal, our certified coaches recommend 1-on-1 personal training paired with customized ISSA diet advice for guaranteed calorie burning!';

        if (quizState.goal === 'ladies') {
            programTitle = 'Ladies Special Morning Batch';
            programDesc = 'Designed exclusively for women! Led by female ACE certified trainers focusing on weight loss, core toning, and stamina in a comfortable batch setting.';
        } else if (quizState.goal === 'muscle') {
            programTitle = '180-Day Muscle & Strength Transformation';
            programDesc = 'Tailored for heavy compound PRs, Jerai machine workouts, hyper-trophy routines, and high-protein nutrition blueprints.';
        } else if (quizState.goal === 'group') {
            programTitle = 'Zumba & Power Yoga Class Pass';
            programDesc = 'High-energy cardio dance sessions combined with relaxing posture & flexibility yoga led by certified group instructors.';
        }

        if (quizResultTitle) quizResultTitle.textContent = programTitle;
        if (quizResultDesc) quizResultDesc.textContent = programDesc;
        if (btnBookQuizPlan) btnBookQuizPlan.setAttribute('data-program', `Quiz Match: ${programTitle}`);
    }

    if (btnRestartQuiz) {
        btnRestartQuiz.addEventListener('click', function() {
            showQuizStep(1);
        });
    }

    // ----------------------------------------------------------------------
    // 11. TIMETABLE BATCH FILTER
    // ----------------------------------------------------------------------
    const ttFilterBtns = document.querySelectorAll('.tt-filter-btn');
    const ttCards = document.querySelectorAll('.tt-card');

    ttFilterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterVal = this.getAttribute('data-tt-filter');

            ttFilterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            ttCards.forEach(card => {
                const daysAttr = card.getAttribute('data-day') || '';
                if (filterVal === 'all' || daysAttr.includes(filterVal)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 12. BEFORE & AFTER COMPARISON SLIDER
    // ----------------------------------------------------------------------
    document.querySelectorAll('.ba-slider-container').forEach(container => {
        const afterWrap = container.querySelector('.ba-after-wrap');
        const handle = container.querySelector('.ba-handle');
        const rangeInput = container.querySelector('.ba-range-input');

        if (rangeInput && afterWrap && handle) {
            rangeInput.addEventListener('input', function() {
                const val = this.value;
                afterWrap.style.width = `${val}%`;
                handle.style.left = `${val}%`;
            });
        }
    });

    // ----------------------------------------------------------------------
    // 13. VIDEO MODAL PLAYER
    // ----------------------------------------------------------------------
    const videoModal = document.getElementById('videoModal');
    const videoModalClose = document.getElementById('videoModalClose');
    const videoIframe = document.getElementById('videoIframe');

    function openVideoModal() {
        if (!videoModal || !videoIframe) return;
        videoIframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'; // Placeheld embedding video link
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        if (!videoModal || !videoIframe) return;
        videoIframe.src = 'about:blank';
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.video-play-btn').forEach(btn => {
        btn.addEventListener('click', openVideoModal);
    });

    if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
    if (videoModal) {
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) closeVideoModal();
        });
    }

    // ----------------------------------------------------------------------
    // 14. EXIT INTENT POPUP LOGIC
    // ----------------------------------------------------------------------
    const exitModal = document.getElementById('exitModal');
    const exitModalClose = document.getElementById('exitModalClose');
    const btnDismissExit = document.getElementById('btnDismissExit');
    let exitModalShown = false;

    function triggerExitModal() {
        if (exitModalShown || sessionStorage.getItem('ironfit_exit_dismissed')) return;
        if (exitModal) {
            exitModal.classList.add('active');
            exitModalShown = true;
        }
    }

    function closeExitModal() {
        if (exitModal) {
            exitModal.classList.remove('active');
            sessionStorage.setItem('ironfit_exit_dismissed', 'true');
        }
    }

    // Trigger on cursor moving up towards browser tabs
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY < 15) {
            triggerExitModal();
        }
    });

    // Fallback trigger after 45 seconds on mobile
    setTimeout(triggerExitModal, 45000);

    if (exitModalClose) exitModalClose.addEventListener('click', closeExitModal);
    if (btnDismissExit) btnDismissExit.addEventListener('click', closeExitModal);
    if (exitModal) {
        exitModal.addEventListener('click', function(e) {
            if (e.target === exitModal) closeExitModal();
        });
    }

    // ----------------------------------------------------------------------
    // 15. CUSTOM WORKOUT ROUTINE GENERATOR
    // ----------------------------------------------------------------------
    const btnGenerateRoutine = document.getElementById('btnGenerateRoutine');
    const genGoalSelect = document.getElementById('genGoalSelect');
    const genSplitSelect = document.getElementById('genSplitSelect');
    const genEquipSelect = document.getElementById('genEquipSelect');
    const planPreviewTitle = document.getElementById('planPreviewTitle');
    const daysScheduleGrid = document.getElementById('daysScheduleGrid');
    const btnClaimRoutinePass = document.getElementById('btnClaimRoutinePass');

    const ROUTINE_DATABASE = {
        ppl: [
            { day: "Day 1 (Mon)", title: "Push (Chest, Shoulders & Triceps)", ex: ["Barbell Incline Bench Press: 4x8-10", "Heavy Dumbbell Shoulder Press: 3x10", "Dips / Pec Fly Machine: 3x12", "Tricep Rope Pushdowns: 4x12-15"] },
            { day: "Day 2 (Tue)", title: "Pull (Back, Biceps & Rear Delts)", ex: ["Lat Pulldowns / Pull-Ups: 4x8-12", "Seated Cable Rows: 3x10", "Barbell Bicep Curls: 4x10-12", "Face Pulls: 3x15"] },
            { day: "Day 3 (Wed)", title: "Legs & Core Power", ex: ["Barbell Back Squats: 4x8", "Leg Press (Jerai): 3x12", "Hamstring Curls: 3x12", "Standing Calf Raises & Hanging Leg Raises: 4x15"] },
            { day: "Day 4 (Thu)", title: "Push (Hypertrophy)", ex: ["Flat Barbell Bench Press: 4x8", "Dumbbell Lateral Raises: 4x12-15", "Cable Chest Flyes: 3x12", "Skullcrushers: 3x10"] },
            { day: "Day 5 (Fri)", title: "Pull (Hypertrophy)", ex: ["Deadlifts / T-Bar Rows: 4x6-8", "Single Arm Dumbbell Rows: 3x10", "Incline Dumbbell Curls: 3x12", "Hammer Curls: 3x12"] },
            { day: "Day 6 (Sat)", title: "Legs & Core Conditioning", ex: ["Romanian Deadlifts: 4x10", "Walking Dumbbell Lunges: 3x12/leg", "Leg Extensions: 3x15", "Abdominal Planks: 3x1 min"] }
        ],
        upper_lower: [
            { day: "Day 1 (Mon)", title: "Upper Body Power", ex: ["Barbell Bench Press: 4x6", "Barbell Rows: 4x6", "Overhead Press: 3x8", "Chins / Dips Superset: 3x10"] },
            { day: "Day 2 (Tue)", title: "Lower Body Power", ex: ["Barbell Squats: 4x6", "Romanian Deadlifts: 3x8", "Leg Press: 3x10", "Calf Raises & Ab Wheel: 4x12"] },
            { day: "Day 3 (Thu)", title: "Upper Body Hypertrophy", ex: ["Incline Dumbbell Press: 4x10", "Lat Pulldown: 4x10", "Dumbbell Lateral Raises: 4x12", "Bicep Curls & Tricep Pushdowns: 3x12"] },
            { day: "Day 4 (Fri)", title: "Lower Body Hypertrophy", ex: ["Leg Press: 4x12", "Hamstring Curls: 4x12", "Dumbbell Lunges: 3x12", "Seated Calf Raises: 4x15"] }
        ],
        fullbody: [
            { day: "Day 1 (Mon)", title: "Full Body A (Strength Focus)", ex: ["Barbell Squats: 3x6", "Bench Press: 3x6", "Bent-Over Rows: 3x8", "Plank Hold: 3x60s"] },
            { day: "Day 2 (Wed)", title: "Full Body B (Hypertrophy Focus)", ex: ["Romanian Deadlifts: 3x8", "Overhead Press: 3x8", "Lat Pulldown: 3x10", "Dumbbell Lunges: 3x10"] },
            { day: "Day 3 (Fri)", title: "Full Body C (Metabolic Blast)", ex: ["Leg Press: 3x12", "Incline Dumbbell Press: 3x10", "Seated Rows: 3x12", "Kettlebell Swings & Ab Crunches: 3x15"] }
        ],
        bro: [
            { day: "Day 1 (Mon)", title: "Chest Demolition", ex: ["Barbell Flat Bench: 4x8", "Incline Dumbbell Press: 3x10", "Cable Crossovers: 3x12", "Push-Ups To Failure"] },
            { day: "Day 2 (Tue)", title: "Back Width & Thickness", ex: ["Deadlifts: 4x6", "Lat Pulldowns: 4x10", "Seated Cable Row: 3x12", "Hyperextensions: 3x15"] },
            { day: "Day 3 (Wed)", title: "Shoulders & Traps", ex: ["Dumbbell Shoulder Press: 4x8", "Lateral Raises: 4x15", "Front Raises: 3x12", "Barbell Shrugs: 4x12"] },
            { day: "Day 4 (Thu)", title: "Legs Annihilation", ex: ["Barbell Squats: 4x8", "Leg Press: 3x12", "Leg Curls: 3x12", "Calf Raises: 4x20"] },
            { day: "Day 5 (Fri)", title: "Arms & Core (Biceps/Triceps)", ex: ["Barbell Curls: 4x10", "Skullcrushers: 4x10", "Hammer Curls: 3x12", "Tricep Rope Pushdown: 3x12"] }
        ]
    };

    function generateRoutine() {
        if (!daysScheduleGrid || !genSplitSelect) return;

        const split = genSplitSelect.value;
        const goalText = genGoalSelect.options[genGoalSelect.selectedIndex].text;
        const splitText = genSplitSelect.options[genSplitSelect.selectedIndex].text;

        if (planPreviewTitle) {
            planPreviewTitle.textContent = `${splitText} — ${goalText}`;
        }

        const routineDays = ROUTINE_DATABASE[split] || ROUTINE_DATABASE.ppl;
        daysScheduleGrid.innerHTML = '';

        routineDays.forEach(item => {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-routine-card';

            let exListHtml = item.ex.map(e => `<li><span class="ex-dot">›</span> ${e}</li>`).join('');

            dayCard.innerHTML = `
                <div class="day-routine-header">
                    <span class="day-name">${item.day}</span>
                    <h4 class="day-title">${item.title}</h4>
                </div>
                <ul class="ex-list">
                    ${exListHtml}
                </ul>
            `;

            daysScheduleGrid.appendChild(dayCard);
        });

        if (btnClaimRoutinePass) {
            btnClaimRoutinePass.setAttribute('data-program', `Custom Routine: ${splitText} (${goalText})`);
        }
    }

    if (btnGenerateRoutine) {
        btnGenerateRoutine.addEventListener('click', generateRoutine);
        generateRoutine(); // Initial render
    }
});

