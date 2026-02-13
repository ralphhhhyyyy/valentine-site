// import confetti from 'canvas-confetti';

const enterBtn = document.getElementById('enter-btn');
const landingOverlay = document.getElementById('landing-overlay');
const mainContent = document.getElementById('main-content');
const bgMusic = document.getElementById('bg-music');

// Confetti configuration
function launchConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    // Fire a burst every 250ms instead of every frame
    const interval = setInterval(function () {
        if (Date.now() > end) {
            return clearInterval(interval);
        }

        confetti({
            particleCount: 7, // Slightly increased from 5
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ffcdd2', '#d32f2f', '#ff80ab']
        });
        confetti({
            particleCount: 7, // Slightly increased from 5
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ffcdd2', '#d32f2f', '#ff80ab']
        });
    }, 250);
}

// Enter Experience
enterBtn.addEventListener('click', () => {
    // 1. Play Music (Interaction required first)
    // Attempt to play, handle potential errors
    bgMusic.load(); // Force reload of source in case it changed
    bgMusic.play()
        .then(() => {
            console.log("Audio playing successfully");
        })
        .catch(e => {
            console.error("Audio play failed:", e);
            alert("Music failed to play! Error: " + e.message + "\nCheck if content blocker is active.");
        });
    bgMusic.volume = 0.5;

    // 2. Hide Landing with Slide Transition
    landingOverlay.classList.add('slide-out'); // Changed from fade-out

    // 3. Show Main Content after transition
    // Timeout increased to 1500ms to match CSS transition duration
    setTimeout(() => {
        landingOverlay.style.display = 'none';
        mainContent.classList.remove('hidden');

        // Use requestAnimationFrame to ensure the class is applied after display:block
        requestAnimationFrame(() => {
            // Slight delay to let the eye settle before fading in content
            setTimeout(() => {
                mainContent.classList.add('visible');
            }, 100);

            // Force redraw of road now that layout is computed
            requestDrawRoad();
        });

        // 4. Trigger Visual Effects
        launchConfetti();
        startFloatingHearts();

        // Load photos if not already loaded (though we start them immediately below)
    }, 1500);
});


// Floating Hearts Background Logic
// Floating Hearts Background Logic
function startFloatingHearts() {
    setInterval(() => {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '&#10084;'; // Solid heart
        heart.style.left = Math.random() * 100 + 'vw';

        // Slower, more varying animation (5s to 12s)
        const duration = Math.random() * 7 + 5;
        heart.style.animationDuration = duration + 's';

        // Smaller, more subtle sizing (0.5rem to 1.5rem)
        const size = Math.random() * 1 + 0.5;
        heart.style.fontSize = size + 'rem';

        // Randomize opacity for depth effect
        const randomOpacity = Math.random() * 0.5 + 0.1; // 0.1 to 0.6
        heart.style.setProperty('--opacity', randomOpacity);

        document.body.appendChild(heart);

        // Cleanup
        setTimeout(() => {
            heart.remove();
        }, duration * 1000); // Remove exactly when animation ends
    }, 400); // Slightly more frequent creation for denser background
}

// ---------------------------------------------------------
// Dynamic Road & Photo Loading Logic
// ---------------------------------------------------------

const maxPhotosToCheck = 68;
const galleryGrid = document.getElementById('gallery-grid');
const placeholder = document.querySelector('.photo-placeholder');

// Create SVG Container for the Road
const roadSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
roadSvg.classList.add('road-svg');
galleryGrid.appendChild(roadSvg);

// Debounce helper
let drawTimeout;
function requestDrawRoad() {
    clearTimeout(drawTimeout);
    drawTimeout = setTimeout(drawRoad, 100);
}

// Function to draw the Zigzag Road
function drawRoad() {
    const items = Array.from(document.querySelectorAll('.timeline-item'));
    // Ensure sorted by index
    items.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));

    // Clear existing paths
    while (roadSvg.firstChild) {
        roadSvg.removeChild(roadSvg.firstChild);
    }

    if (items.length < 2) return;

    const gridRect = galleryGrid.getBoundingClientRect();

    for (let i = 0; i < items.length - 1; i++) {
        const itemA = items[i];
        const itemB = items[i + 1];

        // Skip if either item has no dimensions (e.g. hidden)
        if (itemA.offsetHeight === 0 || itemB.offsetHeight === 0) continue;

        const rectA = itemA.getBoundingClientRect();
        const rectB = itemB.getBoundingClientRect();

        const startX = (rectA.left + rectA.width / 2) - gridRect.left;
        const startY = (rectA.bottom - 40) - gridRect.top;
        const endX = (rectB.left + rectB.width / 2) - gridRect.left;
        const endY = (rectB.top + 40) - gridRect.top;

        const distY = endY - startY;
        const cp1x = startX;
        const cp1y = startY + distY * 0.55;
        const cp2x = endX;
        const cp2y = endY - distY * 0.55;

        const pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.classList.add("road-path");

        // Reveal logic: Opacity transition
        // If target is already visible, show path immediately
        if (itemB.classList.contains('visible')) {
            path.classList.add('visible');
        }

        roadSvg.appendChild(path);
        itemB.__roadPath = path;
    }
}

window.addEventListener('resize', requestDrawRoad);

function loadPhotos() {
    console.log("Starting photo load...");

    const extensions = ['JPG', 'jpg', 'png', 'PNG', 'jpeg', 'JPEG', 'webp'];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.classList.add('visible');

                if (target.__roadPath) {
                    setTimeout(() => {
                        target.__roadPath.classList.add('visible');
                    }, 100);
                }
                observer.unobserve(target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -100px 0px"
    });

    for (let i = 1; i <= maxPhotosToCheck; i++) {
        extensions.forEach(ext => {
            const path = `public/photos/${i}.${ext}`;
            const img = document.createElement('img');
            img.src = path;
            img.alt = `Memory ${i}`;

            img.onload = () => {
                if (placeholder && placeholder.style.display !== 'none') {
                    placeholder.style.display = 'none';
                }

                const timelineItem = document.createElement('div');
                timelineItem.classList.add('timeline-item');
                timelineItem.dataset.index = i;

                const polaroid = document.createElement('div');
                polaroid.classList.add('polaroid');
                polaroid.appendChild(img);
                timelineItem.appendChild(polaroid);

                const children = Array.from(galleryGrid.children);
                let inserted = false;
                for (let j = 0; j < children.length; j++) {
                    const child = children[j];
                    if (!child.classList.contains('timeline-item')) continue;

                    const childIndex = parseInt(child.dataset.index);
                    if (!isNaN(childIndex) && childIndex > i) {
                        galleryGrid.insertBefore(timelineItem, child);
                        inserted = true;
                        break;
                    }
                }

                if (!inserted) {
                    galleryGrid.appendChild(timelineItem);
                }

                observer.observe(timelineItem);
                requestDrawRoad();
            };
        });
    }
}

loadPhotos();
