document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------
  // 1. SELECTORS
  // --------------------------------------------------------
  const navbar = document.querySelector('.navbar');
  const canvas = document.getElementById('hero-canvas');
  const heroSection = document.getElementById('hero-section');
  const powerBtn = document.getElementById('power-btn');
  const engineImage = document.querySelector('.engine-image');
  const engineAudio = document.getElementById('engine-audio');

  // Carousel Selectors
  const spotlightOuter = document.getElementById('spotlight-outer');
  const spotlightTrack = document.getElementById('horizontal-track');
  const spotlightHeader = document.getElementById('spotlight-header');
  const slides = document.querySelectorAll('.carousel-slide img');

  // --------------------------------------------------------
  // 2. HERO CANVAS PRELOAD
  // --------------------------------------------------------
  const context = canvas ? canvas.getContext('2d') : null;
  const frameCount = 181;
  const currentFrame = index => `assets/frame_${index}.jpg`;
  const imgSequence = [];

  if (canvas) {
    const imgFirst = new Image();
    imgFirst.src = currentFrame(1);
    imgFirst.onload = () => {
      canvas.width = imgFirst.naturalWidth || 1920;
      canvas.height = imgFirst.naturalHeight || 1080;
      context.drawImage(imgFirst, 0, 0, canvas.width, canvas.height);
    };

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      imgSequence.push(img);
    }
  }

  // --------------------------------------------------------
  // 3. ENGINE INTERACTION
  // --------------------------------------------------------
  let isEnginePlaying = false;
  if (powerBtn) {
    powerBtn.addEventListener('click', () => {
      if (!isEnginePlaying) {
        engineAudio.currentTime = 0;
        engineAudio.play().catch(e => console.warn("Audio blocked", e));
        powerBtn.classList.add('active');
        engineImage.classList.add('running');
        isEnginePlaying = true;
      } else {
        engineAudio.pause();
        powerBtn.classList.remove('active');
        engineImage.classList.remove('running');
        isEnginePlaying = false;
      }
    });
  }

  // --------------------------------------------------------
  // 4. MAIN SCROLL LOOP (Synchronized)
  // --------------------------------------------------------
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;

    // A. Hero Canvas Scrubbing
    if (heroSection && canvas) {
      const heroRect = heroSection.getBoundingClientRect();
      if (heroRect.top <= 80) {
        const distance = Math.abs(heroRect.top - 80);
        const maxScroll = heroSection.offsetHeight - window.innerHeight + 80;
        let scrollFraction = Math.min(Math.max(distance / maxScroll, 0), 1);
        const frameIndex = Math.min(frameCount - 1, Math.floor(scrollFraction * frameCount));

        if (imgSequence[frameIndex]?.complete) {
          context.drawImage(imgSequence[frameIndex], 0, 0, canvas.width, canvas.height);
        }
      }
    }

    // B. Spotlight Horizontal Takeover & Navbar Hide
    if (spotlightOuter && spotlightTrack) {
      const rect = spotlightOuter.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Navbar Visibility Logic
      // Hide navbar when user is entering or inside the full-bleed section
      if (rect.top < 100 && rect.bottom > 100) {
        navbar.classList.add('hidden');
      } else {
        navbar.classList.remove('hidden');
      }

      // Horizontal Scroll & Image Scaling
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        const totalScrollable = spotlightOuter.offsetHeight - windowHeight;
        const progress = Math.abs(rect.top) / totalScrollable;

        // Move track (Horizontal movement)
        const moveAmount = progress * (slides.length - 1) * 100;
        spotlightTrack.style.transform = `translateX(-${moveAmount}vw)`;

        // Fade title out
        if (spotlightHeader) {
          spotlightHeader.style.opacity = progress > 0.1 ? '0' : '1';
        }

        // Dynamic Scaling (Full-bleed effect)
        slides.forEach((img, i) => {
          const centerPoint = i / (slides.length - 1);
          const distance = Math.abs(progress - centerPoint);

          // Each image hits scale 1.0 (full screen) as it centers
          let scale = 1.0 - (distance * 0.6);
          scale = Math.min(Math.max(scale, 0.7), 1.0);
          img.style.transform = `scale(${scale})`;
        });
      }
    }
  });
});