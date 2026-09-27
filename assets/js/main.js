/* ====================================================
   KOUSHIK C. — Single-Page Portfolio  ·  main.js
   Three.js 3D elements, scroll-spy, tilt cards,
   mobile drawer, scroll-reveal
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------
       1. NAVBAR — scroll effect & scroll-spy
       -------------------------------------------------- */
    const navbar   = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    function updateNavbar() {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (window.scrollY >= top) current = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === current);
        });
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    /* --------------------------------------------------
       2. SMOOTH SCROLL for anchor links
       -------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                const offset = navbar.offsetHeight + 12;
                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* --------------------------------------------------
       3. MOBILE MENU DRAWER
       -------------------------------------------------- */
    const hamburger    = document.getElementById('hamburger');
    const drawerClose  = document.getElementById('drawer-close');
    const drawer       = document.getElementById('mobile-drawer');
    const overlay      = document.getElementById('mobile-overlay');

    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('open');
        document.body.classList.add('menu-open');
        hamburger.setAttribute('aria-expanded', 'true');
        drawerClose.focus();
    }
    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        document.body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
    }

    hamburger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
    drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));

    /* --------------------------------------------------
       4. SCROLL-REVEAL with IntersectionObserver
       -------------------------------------------------- */
    const reveals = document.querySelectorAll('.reveal');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObs.observe(el));

    /* --------------------------------------------------
       5. THREE.JS — Hero Wireframe Particle Background
       -------------------------------------------------- */
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas && typeof THREE !== 'undefined') {
        const scene    = new THREE.Scene();
        const camera   = new THREE.PerspectiveCamera(60, heroCanvas.clientWidth / heroCanvas.clientHeight, 0.1, 1000);
        camera.position.z = 30;

        const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(heroCanvas.clientWidth, heroCanvas.clientHeight);

        // Particles
        const particleCount = 160;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0x000000, size: 0.15, transparent: true, opacity: 0.25 });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Wireframe icosahedron
        const icoGeo = new THREE.IcosahedronGeometry(8, 1);
        const icoMat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 0.06 });
        const ico = new THREE.Mesh(icoGeo, icoMat);
        ico.position.set(12, -2, -10);
        scene.add(ico);

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', e => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        function animateHero() {
            requestAnimationFrame(animateHero);
            const t = Date.now() * 0.0003;
            particles.rotation.y = t + mouseX * 0.15;
            particles.rotation.x = t * 0.5 + mouseY * 0.1;
            ico.rotation.x += 0.002;
            ico.rotation.y += 0.003;
            ico.position.x = 12 + Math.sin(t * 2) * 2;
            ico.position.y = -2 + Math.cos(t * 2) * 1.5;
            renderer.render(scene, camera);
        }
        animateHero();

        function onHeroResize() {
            const parent = heroCanvas.parentElement;
            camera.aspect = parent.clientWidth / parent.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(parent.clientWidth, parent.clientHeight);
        }
        window.addEventListener('resize', onHeroResize);
    }

    /* --------------------------------------------------
       6. THREE.JS — Skills Section 3D Rotating Ring Carousel
       Carries 7 Core Stack tech cards on a 3D orbit ring:
       - Auto-rotates smoothly
       - Pauses/slows on hover
       - Drag / touch-swipe to spin with momentum
       - Subtle cursor-following parallax tilt
       - Raycasting hover highlights
       - IntersectionObserver pausing for 60fps performance
       -------------------------------------------------- */
    const skillsStage = document.getElementById('skills-3d-stage');
    const ringCanvas  = document.getElementById('skills-ring-canvas');

    if (skillsStage && ringCanvas && typeof THREE !== 'undefined') {
        const CORE_ITEMS = [
            { key: 'python', name: 'Python', role: 'AI & Scripting', icon: 'assets/images/icons/python.jpeg' },
            { key: 'js', name: 'JavaScript', role: 'Frontend & Web', icon: 'assets/images/icons/js.png' },
            { key: 'fastapi', name: 'FastAPI', role: 'Backend APIs', icon: 'assets/images/icons/fastapi.png' },
            { key: 'langchain', name: 'LangChain', role: 'GenAI & LLMs', icon: 'assets/images/icons/langchain.png' },
            { key: 'html', name: 'HTML5 / CSS3', role: 'Web Standards', icon: 'assets/images/icons/html.png' },
            { key: 'git', name: 'Git', role: 'Version Control', icon: 'assets/images/icons/git.png' },
            { key: 'google-cloud', name: 'Google Cloud', role: 'Cloud Run / GCP', icon: 'assets/images/icons/google-cloud.png' }
        ];

        let ringScene, ringCamera, ringRenderer;
        let ringGroup;
        const cardMeshes = [];
        let isInitialized = false;
        let isRendering = false;
        let animFrameId = null;

        // Physics & Motion State (Calm, ambient carousel rotation)
        let rotationAngle = 0;
        let baseAutoSpeed = 0.0012;
        let currentAutoSpeed = 0.0012;
        let dragVelocity = 0;
        let isDragging = false;
        let lastPointerX = 0;
        let isHovered = false;
        let hoveredCard = null;

        // Parallax Tilt State
        let targetTiltX = 0;
        let targetTiltZ = 0;

        // Raycasting
        const raycaster = new THREE.Raycaster();
        const pointerNdc = new THREE.Vector2(-999, -999);

        // Helper: Card Front Canvas Texture
        function createCardTexture(item, onReady) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            function renderTexture(img) {
                ctx.clearRect(0, 0, 512, 512);

                // Rounded Rect Card Face
                const r = 38;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(r, 0);
                ctx.lineTo(512 - r, 0);
                ctx.quadraticCurveTo(512, 0, 512, r);
                ctx.lineTo(512, 512 - r);
                ctx.quadraticCurveTo(512, 512, 512 - r, 512);
                ctx.lineTo(r, 512);
                ctx.quadraticCurveTo(0, 512, 0, 512 - r);
                ctx.lineTo(0, r);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.closePath();

                // Pure white fill
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                // Crisp border
                ctx.lineWidth = 6;
                ctx.strokeStyle = '#E2E8F0';
                ctx.stroke();

                // Soft inner inset border
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#F1F5F9';
                ctx.stroke();
                ctx.restore();

                // Icon Box
                const iconBoxSize = 180;
                const ibx = (512 - iconBoxSize) / 2;
                const iby = 68;

                ctx.save();
                ctx.beginPath();
                const ir = 22;
                if (ctx.roundRect) {
                    ctx.roundRect(ibx, iby, iconBoxSize, iconBoxSize, ir);
                } else {
                    ctx.rect(ibx, iby, iconBoxSize, iconBoxSize);
                }
                ctx.fillStyle = '#F8FAFC';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#E2E8F0';
                ctx.stroke();
                ctx.restore();

                // Draw Icon Image Centered
                if (img && img.width > 0) {
                    const padding = 24;
                    const drawSize = iconBoxSize - padding * 2;
                    ctx.drawImage(img, ibx + padding, iby + padding, drawSize, drawSize);
                }

                // Tech Title
                ctx.fillStyle = '#0A0A0A';
                ctx.font = 'bold 36px "Geist", "Inter", -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(item.name, 256, 320);

                // Subtitle Role
                ctx.fillStyle = '#737373';
                ctx.font = '500 22px "Inter", -apple-system, sans-serif';
                ctx.fillText(item.role, 256, 368);

                // Bottom Core Indicator Pill
                ctx.save();
                ctx.beginPath();
                const pw = 150;
                const ph = 32;
                const px = (512 - pw) / 2;
                const py = 414;
                if (ctx.roundRect) {
                    ctx.roundRect(px, py, pw, ph, 16);
                } else {
                    ctx.rect(px, py, pw, ph);
                }
                ctx.fillStyle = '#0A0A0A';
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '600 14px "Geist", "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('CORE TECH', 256, py + 21);
                ctx.restore();

                const texture = new THREE.CanvasTexture(canvas);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                onReady(texture);
            }

            const img = new Image();
            let rendered = false;
            function safeRender() {
                if (!rendered) {
                    rendered = true;
                    renderTexture(img);
                }
            }

            img.onload = safeRender;
            img.onerror = () => safeRender();

            const dataUri = (window.CORE_ICONS_DATA && window.CORE_ICONS_DATA[item.key]);
            img.src = dataUri || item.icon;

            if (img.complete && img.naturalWidth > 0) {
                safeRender();
            }
        }

        // Helper: Card Back Canvas Texture
        function createBackTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            const r = 38;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(512 - r, 0);
            ctx.quadraticCurveTo(512, 0, 512, r);
            ctx.lineTo(512, 512 - r);
            ctx.quadraticCurveTo(512, 512, 512 - r, 512);
            ctx.lineTo(r, 512);
            ctx.quadraticCurveTo(0, 512, 0, 512 - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            ctx.fillStyle = '#F8FAFC';
            ctx.fill();
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#E2E8F0';
            ctx.stroke();
            ctx.restore();

            // Minimalist back graphic
            ctx.fillStyle = '#0A0A0A';
            ctx.font = 'bold 36px "Geist", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('{ ... }', 256, 240);

            ctx.fillStyle = '#737373';
            ctx.font = '600 18px "Geist", sans-serif';
            ctx.fillText('KOUSHIK C.', 256, 285);

            ctx.fillStyle = '#A3A3A3';
            ctx.font = '500 14px "Inter", sans-serif';
            ctx.fillText('PRODUCTION STACK', 256, 315);

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            return texture;
        }

        function initRing() {
            if (isInitialized) return;
            isInitialized = true;

            const w = skillsStage.clientWidth || 800;
            const h = skillsStage.clientHeight || 320;

            ringScene = new THREE.Scene();
            ringCamera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);

            // Responsive distance
            function updateCamDist() {
                const width = skillsStage.clientWidth;
                if (width < 600) {
                    ringCamera.position.set(0, 0.25, 11.2);
                } else if (width < 900) {
                    ringCamera.position.set(0, 0.25, 9.8);
                } else {
                    ringCamera.position.set(0, 0.25, 8.8);
                }
                ringCamera.lookAt(0, -0.05, 0);
            }
            updateCamDist();

            ringRenderer = new THREE.WebGLRenderer({
                canvas: ringCanvas,
                alpha: true,
                antialias: true
            });
            ringRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            ringRenderer.setSize(w, h);

            ringGroup = new THREE.Group();
            ringScene.add(ringGroup);

            // Orbital Guide Rings (Top and Bottom Tracks)
            const ringRadius = 4.0;
            const trackGeo = new THREE.RingGeometry(ringRadius - 0.02, ringRadius + 0.02, 80);
            trackGeo.rotateX(Math.PI / 2);
            const trackMat = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.09,
                side: THREE.DoubleSide
            });
            const topTrack = new THREE.Mesh(trackGeo, trackMat);
            topTrack.position.y = 1.15;
            ringGroup.add(topTrack);

            const bottomTrack = new THREE.Mesh(trackGeo, trackMat);
            bottomTrack.position.y = -1.15;
            ringGroup.add(bottomTrack);

            // Subtle Central Particle Sphere
            const axisCount = 40;
            const axisPos = new Float32Array(axisCount * 3);
            for (let i = 0; i < axisCount; i++) {
                const t = (i / axisCount) * Math.PI * 2;
                axisPos[i * 3]     = Math.sin(t) * 1.5;
                axisPos[i * 3 + 1] = ((i % 5) - 2) * 0.4;
                axisPos[i * 3 + 2] = Math.cos(t) * 1.5;
            }
            const axisGeo = new THREE.BufferGeometry();
            axisGeo.setAttribute('position', new THREE.BufferAttribute(axisPos, 3));
            const axisMat = new THREE.PointsMaterial({ color: 0x000000, size: 0.08, transparent: true, opacity: 0.15 });
            const axisPoints = new THREE.Points(axisGeo, axisMat);
            ringGroup.add(axisPoints);

            // Build 7 Tech Cards along perimeter
            const cardBackTexture = createBackTexture();
            const total = CORE_ITEMS.length;

            CORE_ITEMS.forEach((item, idx) => {
                const angle = (idx / total) * Math.PI * 2;
                const cardWidth = 1.8;
                const cardHeight = 2.05;

                // Create a parent pivot container for this card
                const cardPivot = new THREE.Group();
                cardPivot.position.x = ringRadius * Math.sin(angle);
                cardPivot.position.z = ringRadius * Math.cos(angle);
                cardPivot.position.y = 0;
                cardPivot.rotation.y = angle;

                // Card Front Plane
                const frontGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
                const frontMat = new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 1.0,
                    side: THREE.FrontSide
                });
                const frontMesh = new THREE.Mesh(frontGeo, frontMat);
                frontMesh.position.z = 0.01;
                cardPivot.add(frontMesh);

                // Card Back Plane (Rotated 180deg)
                const backGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);
                const backMat = new THREE.MeshBasicMaterial({
                    map: cardBackTexture,
                    transparent: true,
                    opacity: 0.85,
                    side: THREE.FrontSide
                });
                const backMesh = new THREE.Mesh(backGeo, backMat);
                backMesh.rotation.y = Math.PI;
                backMesh.position.z = -0.01;
                cardPivot.add(backMesh);

                // Load and assign front texture
                createCardTexture(item, (tex) => {
                    frontMat.map = tex;
                    frontMat.needsUpdate = true;
                });

                // Attach metadata to the mesh for raycasting and depth tracking
                frontMesh.userData = {
                    index: idx,
                    item: item,
                    baseAngle: angle,
                    pivot: cardPivot
                };

                cardMeshes.push(frontMesh);
                ringGroup.add(cardPivot);
            });

            // Stage Resize Handler
            function onStageResize() {
                if (!ringRenderer || !ringCamera) return;
                const width = skillsStage.clientWidth;
                const height = skillsStage.clientHeight;
                ringRenderer.setSize(width, height);
                ringCamera.aspect = width / height;
                updateCamDist();
                ringCamera.updateProjectionMatrix();
            }
            window.addEventListener('resize', onStageResize);

            // Pointer Events: Dragging / Swiping & Mouse Parallax
            skillsStage.addEventListener('pointerdown', (e) => {
                isDragging = true;
                lastPointerX = e.clientX;
                dragVelocity = 0;
                skillsStage.classList.add('grabbing');
                if (skillsStage.setPointerCapture) {
                    skillsStage.setPointerCapture(e.pointerId);
                }
            });

            skillsStage.addEventListener('pointermove', (e) => {
                const rect = skillsStage.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width;
                const relY = (e.clientY - rect.top) / rect.height;

                // Cursor in NDC for raycaster (-1 to +1)
                pointerNdc.x = (relX * 2) - 1;
                pointerNdc.y = -(relY * 2) + 1;

                // Parallax tilt angles
                targetTiltX = (relY - 0.5) * 0.32;
                targetTiltZ = (relX - 0.5) * -0.18;

                if (isDragging) {
                    const deltaX = e.clientX - lastPointerX;
                    rotationAngle += deltaX * 0.007;
                    dragVelocity = deltaX * 0.007;
                    lastPointerX = e.clientX;
                }
            });

            const onPointerEnd = (e) => {
                if (isDragging) {
                    isDragging = false;
                    skillsStage.classList.remove('grabbing');
                    if (skillsStage.releasePointerCapture && e && e.pointerId) {
                        try { skillsStage.releasePointerCapture(e.pointerId); } catch (_) {}
                    }
                }
            };

            skillsStage.addEventListener('pointerup', onPointerEnd);
            skillsStage.addEventListener('pointercancel', onPointerEnd);

            skillsStage.addEventListener('mouseenter', () => {
                isHovered = true;
            });

            skillsStage.addEventListener('mouseleave', (e) => {
                isHovered = false;
                onPointerEnd(e);
                pointerNdc.set(-999, -999);
                targetTiltX = 0;
                targetTiltZ = 0;
            });
        }

        // Animation Loop
        function animateRing() {
            if (!isRendering) return;
            animFrameId = requestAnimationFrame(animateRing);

            // Smooth speed transitions on hover
            const targetSpeed = hoveredCard ? 0 : (isHovered ? 0.0003 : baseAutoSpeed);
            currentAutoSpeed += (targetSpeed - currentAutoSpeed) * 0.08;

            if (isDragging) {
                // Dragging controls angle directly
            } else {
                // Apply inertia
                dragVelocity *= 0.94;
                rotationAngle += dragVelocity;

                if (Math.abs(dragVelocity) < 0.0002) {
                    rotationAngle += currentAutoSpeed;
                }
            }

            // Apply rotation around Y
            ringGroup.rotation.y = rotationAngle;

            // Parallax tilt response
            ringGroup.rotation.x += (targetTiltX - ringGroup.rotation.x) * 0.08;
            ringGroup.rotation.z += (targetTiltZ - ringGroup.rotation.z) * 0.08;

            // Raycast for card hover
            raycaster.setFromCamera(pointerNdc, ringCamera);
            const intersects = raycaster.intersectObjects(cardMeshes, false);
            hoveredCard = intersects.length > 0 ? intersects[0].object : null;

            if (!isDragging) {
                skillsStage.style.cursor = hoveredCard ? 'pointer' : 'grab';
            }

            // Depth attenuation & scale dynamics for each card
            cardMeshes.forEach((mesh) => {
                const pivot = mesh.userData.pivot;
                // Calculate world angle relative to camera
                const worldAngle = (rotationAngle + mesh.userData.baseAngle) % (Math.PI * 2);
                const cos = Math.cos(worldAngle);

                const isThisHovered = (hoveredCard === mesh);

                if (isThisHovered) {
                    pivot.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.15);
                    mesh.material.opacity = 1.0;
                } else if (cos > 0) {
                    // Front hemisphere (facing user)
                    const targetScale = 1.0 + cos * 0.06;
                    pivot.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
                    mesh.material.opacity = 0.8 + cos * 0.2;
                } else {
                    // Back hemisphere (rotating away)
                    const targetScale = 0.92 + cos * 0.04;
                    pivot.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
                    mesh.material.opacity = 0.42 + (cos + 1) * 0.25;
                }
            });

            ringRenderer.render(ringScene, ringCamera);
        }

        // Viewport IntersectionObserver: Lazy Init & Pause/Resume
        const skillsSection = document.getElementById('skills');
        if (skillsSection && 'IntersectionObserver' in window) {
            const ringObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (!isInitialized) {
                            initRing();
                        }
                        if (!isRendering) {
                            isRendering = true;
                            animateRing();
                        }
                    } else {
                        if (isRendering) {
                            isRendering = false;
                            if (animFrameId) cancelAnimationFrame(animFrameId);
                        }
                    }
                });
            }, { rootMargin: '100px 0px 100px 0px', threshold: 0.05 });

            ringObserver.observe(skillsSection);
        } else {
            // Fallback: immediate init
            initRing();
            isRendering = true;
            animateRing();
        }
    }

    /* --------------------------------------------------
       7. 3D TILT EFFECT on Project Cards
       -------------------------------------------------- */
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01,1.01,1.01)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
            card.style.transition = 'transform .4s cubic-bezier(.4,0,.2,1)';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    /* --------------------------------------------------
       8. CUSTOM CURSOR (Black & White Theme)
       - Direct tracking for precision dot
       - Smooth trailing lerp interpolation for follower ring
       - Contextual interactive states (hover, card, drag, text, click)
       - Graceful touch fallback
       -------------------------------------------------- */
    const cursorDot   = document.getElementById('cursor-dot');
    const cursorRing  = document.getElementById('cursor-ring');
    const cursorLabel = document.getElementById('cursor-label');

    if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = -100;
        let mouseY = -100;
        let ringX  = -100;
        let ringY  = -100;
        let isCursorVisible = false;

        // Render Loop for fluid follower physics
        function renderCursor() {
            ringX += (mouseX - ringX) * 0.2;
            ringY += (mouseY - ringY) * 0.2;

            cursorDot.style.transform  = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

            requestAnimationFrame(renderCursor);
        }
        requestAnimationFrame(renderCursor);

        // Mouse Move Handler
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!isCursorVisible) {
                isCursorVisible = true;
                ringX = mouseX;
                ringY = mouseY;
                cursorDot.classList.add('visible');
                cursorRing.classList.add('visible');
            }
        }, { passive: true });

        // Window Boundary Handlers
        document.documentElement.addEventListener('mouseleave', () => {
            isCursorVisible = false;
            cursorDot.classList.remove('visible');
            cursorRing.classList.remove('visible');
        });

        document.documentElement.addEventListener('mouseenter', () => {
            isCursorVisible = true;
            cursorDot.classList.add('visible');
            cursorRing.classList.add('visible');
        });

        // Click / Press Tactile Response
        window.addEventListener('mousedown', () => {
            cursorRing.classList.add('cursor--click');
            cursorDot.classList.add('cursor--click');
        });

        window.addEventListener('mouseup', () => {
            cursorRing.classList.remove('cursor--click');
            cursorDot.classList.remove('cursor--click');
        });

        // Contextual State Delegation
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            if (!target || !(target instanceof Element)) return;

            // 1. 3D Stage Carousel Hover (compact DRAG indicator)
            if (target.closest('#skills-3d-stage')) {
                setCursorState('drag', 'DRAG');
                return;
            }

            // 2. Clickable Links, Buttons, Chips, Icons (reduced focus reticle)
            if (target.closest('a, button, .btn, .icon-btn, .hamburger, .tech-item, .chip, .tag, [role="button"]')) {
                setCursorState('hover', '');
                return;
            }

            // 3. Headings & Paragraph Text Hover (compact text bar)
            if (target.closest('h1, h2, h3, p, .section-sub, .hero-sub')) {
                setCursorState('text', '');
                return;
            }

            // Default State (including normal custom cursor on project cards)
            resetCursorState();
        });

        document.addEventListener('mouseout', (e) => {
            if (!e.relatedTarget || !document.contains(e.relatedTarget)) {
                resetCursorState();
            }
        });

        function setCursorState(type, labelText) {
            cursorRing.classList.remove('cursor--hover', 'cursor--drag', 'cursor--text');
            cursorDot.classList.remove('cursor--hover', 'cursor--drag', 'cursor--text');

            if (type === 'hover') {
                cursorRing.classList.add('cursor--hover');
                cursorDot.classList.add('cursor--hover');
                if (cursorLabel) cursorLabel.textContent = '';
            } else if (type === 'drag') {
                cursorRing.classList.add('cursor--drag');
                cursorDot.classList.add('cursor--drag');
                if (cursorLabel) cursorLabel.textContent = labelText || 'DRAG';
            } else if (type === 'text') {
                cursorRing.classList.add('cursor--text');
                cursorDot.classList.add('cursor--text');
                if (cursorLabel) cursorLabel.textContent = '';
            }
        }

        function resetCursorState() {
            cursorRing.classList.remove('cursor--hover', 'cursor--drag', 'cursor--text');
            cursorDot.classList.remove('cursor--hover', 'cursor--drag', 'cursor--text');
            if (cursorLabel) cursorLabel.textContent = '';
        }
    }

});
