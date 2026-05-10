document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar Effect on Scroll
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-md');
            navbar.classList.replace('bg-surface/70', 'bg-surface/90');
            navbar.classList.replace('dark:bg-surface/70', 'dark:bg-surface/90');
        } else {
            navbar.classList.remove('shadow-md');
            navbar.classList.replace('bg-surface/90', 'bg-surface/70');
            navbar.classList.replace('dark:bg-surface/90', 'dark:bg-surface/70');
        }
    });

    // 2. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. Scroll Reveal Animations
    // Elements to animate
    const animatedElements = document.querySelectorAll('.glass-panel, .glass-card, .animate-fade-in-up, section h2');
    
    // Initial state setup for reveal elements
    animatedElements.forEach(el => {
        if (!el.classList.contains('animate-fade-in-up')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        }
    });

    // Intersection Observer for scroll reveal
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // 4. Interactive Tech Stack Floating Effect
    const techContainer = document.getElementById('tech-stack-container');
    const techWrapper = document.getElementById('tech-icons-wrapper');
    const chips = document.querySelectorAll('.tech-chip');
    
    if (techContainer && techWrapper && chips.length > 0) {
        let mouseX = 0;
        let mouseY = 0;
        let isHovering = false;

        techContainer.addEventListener('mousemove', (e) => {
            const rect = techContainer.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isHovering = true;
        });

        techContainer.addEventListener('mouseleave', () => {
            isHovering = false;
        });

        const chipsData = Array.from(chips).map(chip => {
            chip.style.willChange = 'transform';
            chip.style.zIndex = '2';
            
            return {
                element: chip,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
                phaseX: Math.random() * Math.PI * 2,
                phaseY: Math.random() * Math.PI * 2,
                speedX: 0.5 + Math.random() * 0.5,
                speedY: 0.5 + Math.random() * 0.5,
            };
        });

        function animateTechChips() {
            const time = Date.now() * 0.001;
            
            chipsData.forEach(data => {
                const floatX = Math.sin(time * data.speedX + data.phaseX) * 15;
                const floatY = Math.cos(time * data.speedY + data.phaseY) * 15;
                
                data.targetX = floatX;
                data.targetY = floatY;

                if (isHovering) {
                    const rect = data.element.getBoundingClientRect();
                    const containerRect = techContainer.getBoundingClientRect();
                    
                    const chipCenterX = rect.left - containerRect.left + rect.width / 2 - data.x;
                    const chipCenterY = rect.top - containerRect.top + rect.height / 2 - data.y;

                    const dx = mouseX - chipCenterX;
                    const dy = mouseY - chipCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const maxDistance = 200;
                    if (distance < maxDistance && distance > 0) {
                        const force = Math.pow((maxDistance - distance) / maxDistance, 1.2);
                        data.targetX += -(dx / distance) * force * 100;
                        data.targetY += -(dy / distance) * force * 100;
                    }
                }

                data.x += (data.targetX - data.x) * 0.08;
                data.y += (data.targetY - data.y) * 0.08;
                
                const rot = (data.targetX - data.x) * 0.3;
                data.element.style.transform = `translate(${data.x}px, ${data.y}px) rotate(${rot}deg)`;
            });

            requestAnimationFrame(animateTechChips);
        }

        animateTechChips();
    }
});
