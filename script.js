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
});
