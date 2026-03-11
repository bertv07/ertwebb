gsap.registerPlugin(ScrollTrigger);

// Desactivar scroll al cargar
document.body.classList.add('no-scroll');

const loaderContainer = document.getElementById('loader-container');
const contenedorLogos = document.querySelector('.contenedor-logos');

// Cara
const bordeCara = document.querySelector('.borde-cara');
const detalleCara = document.querySelector('.detalle-cara');

// Texto
const pedazosTexto = document.querySelectorAll('.pedazo-texto');

// SVGs
const svg1 = document.querySelector('.svg1');
const svg2 = document.querySelector('.svg2');

// =============================================
// 1. SETUP INICIAL — Centrado y pequeño
// =============================================

function prepararPath(path) {
  const len = path.getTotalLength();
  gsap.set(path, {
    strokeDasharray: len,
    strokeDashoffset: len,
    opacity: 1,
    fill: 'transparent',
    stroke: '#57286d'
  });
}
prepararPath(bordeCara);
prepararPath(detalleCara);

// Texto: empieza invisible
gsap.set(pedazosTexto, {
  opacity: 0,
  y: 8,
  transformOrigin: "center center"
});

// Contenedor: empieza centrado y más pequeño (scale 0.2 en desktop, 0.4 en móvil)
const isMobileSVG = window.innerWidth <= 768;
const initialScale = isMobileSVG ? 0.35 : 0.2;

gsap.set(contenedorLogos, {
  scale: initialScale,
  x: 0,
  y: 0
});

// =============================================
// 2. TIMELINE DE CARGA — Traza pequeño, luego crece
// =============================================

// Imagen y botón empiezan ocultos abajo
gsap.set('.hero-img', { opacity: 0, y: 40 });
gsap.set('.button', { opacity: 0, y: 30 });

const tlLoader = gsap.timeline({
  onComplete: () => {
    // Permitir scroll removiendo clase del body
    document.body.classList.remove('no-scroll');

    // Bajar z-index del loader para que no bloquee interacciones
    loaderContainer.classList.add('done');
    loaderContainer.style.pointerEvents = 'none';
    loaderContainer.style.zIndex = '1';
    // También forzar en el pin-spacer padre que GSAP crea
    if (loaderContainer.parentElement && loaderContainer.parentElement.classList.contains('pin-spacer')) {
      loaderContainer.parentElement.style.zIndex = '1';
    }
    // Mostrar el header y el hero cuando termina la animación inicial
    document.querySelector('.main-header').classList.add('visible');
    gsap.to('.hero', {
      opacity: 1, duration: 0.2, ease: 'power2.out',
      onComplete: () => {
        animateHeroText();
        // Botón sube después del texto
        gsap.to('.button', {
          opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', delay: 0.25
        });
        // Imagen sube al final
        gsap.to('.hero-img', {
          opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.3
        });
      }
    });
    animateNavText();
    initScrollAnimation();
  }
});

// =============================================
// SPLIT TEXT — función genérica para cualquier elemento
// =============================================

function splitText(el) {
  if (!el) return;
  const text = el.textContent.trim();
  const words = text.split(/\s+/);
  el.innerHTML = words.map(word =>
    `<span class="word-wrap"><span class="word-inner">${word}</span></span>`
  ).join('');
}

function animateWords(container, delay = 0) {
  const words = container.querySelectorAll('.word-inner');
  if (!words || words.length === 0) return;

  gsap.to(words, {
    y: 0,
    duration: 0.4,
    ease: "expo.out",
    stagger: 0.03,
    delay: delay
  });
}

// Split del hero
splitText(document.getElementById('hero-paragraph'));

// Split de todos los textos del nav
document.querySelectorAll('.menu-content p, .menu-content a').forEach(el => splitText(el));

function animateHeroText() {
  animateWords(document.getElementById('hero-paragraph'));
}

function animateNavText() {
  const navEls = document.querySelectorAll('.menu-content p, .menu-content a');
  navEls.forEach((el, i) => {
    animateWords(el, i * 0.05);
  });
}

tlLoader
  .addLabel("empiezaTrazo")

  // CARA: borde se traza (todavía pequeño)
  .to(bordeCara, {
    strokeDashoffset: 0,
    duration: 1.8,
    ease: "power3.inOut"
  }, "empiezaTrazo")

  // CARA: detalles internos (todavía pequeño)
  .to(detalleCara, {
    strokeDashoffset: 0,
    duration: 1.4,
    ease: "power3.inOut"
  }, ">-0.5")

  .addLabel("empiezaBold")

  // CARA: fill sólido — AHORA CRECE
  .to([bordeCara, detalleCara], {
    fill: '#57286d',
    strokeWidth: 0,
    duration: 0.8,
    ease: "power2.inOut"
  }, "empiezaBold")

  // El contenedor crece de 0.2 a 1 al mismo tiempo que se hace bold
  .to(contenedorLogos, {
    scale: 1,
    duration: 1.2,
    ease: "power2.out"
  }, "empiezaBold")

  // TEXTO: letras aparecen desde el centro (mientras crece)
  .to(pedazosTexto, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: "power2.out",
    stagger: {
      each: 0.1,
      from: "center"
    }
  }, "empiezaBold+=0.3");



// =============================================
// 3. SCROLL — Se encoge a la esquina superior derecha
// =============================================

let isScrolled = false;

function initScrollAnimation() {
  // Cambiar a position absolute para que el pin funcione
  gsap.set(loaderContainer, { position: 'absolute' });

  const tlScroll = gsap.timeline({
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "+=600", // aca se edita cuado tyermina la aniamicon del logo
      scrub: 1,
      pin: loaderContainer,
      pinSpacing: true,
      onLeave: () => {
        isScrolled = true;
        applyCornerState();
      },
      onEnterBack: () => {
        isScrolled = false;
        removeCornerState();
      }
    }
  });

  tlScroll
    // Texto desaparece primero (suave)
    .to(pedazosTexto, {
      opacity: 0,
      y: -6,
      duration: 0.08,
      ease: "power1.in",
      stagger: {
        each: 0.02,
        from: "edges"
      }
    }, 0)

    // Logo se encoge y se mueve a la esquina superior IZQUIERDA — fluido
    .to(contenedorLogos, {
      x: () => {
        // El logo fijo está en {left: 15px} con {width: 50px}, por lo que su centro X es 40px.
        return -(window.innerWidth / 2 - 40);
      },
      y: () => {
        // Posición top relativa, con un ligero ajuste en mobile si es necesario
        return -window.innerHeight / 2 + (isMobileSVG ? 45 : 50);
      },
      scale: () => {
        // svg2 original ocupa el 39vw del total de la pantalla.
        // Queremos que termine midiendo aproximadamente 50px de ancho.
        const nativeWidth = window.innerWidth * 0.39;
        return 50 / nativeWidth;
      },
      duration: 0.2,
      ease: "power3.inOut"
    }, 0.005);

  // Pinear el hero para que la sección de services se monte encima
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    pin: true,
    pinSpacing: false
  });

  // Forzar z-index bajo en TODOS los pin-spacers y el loader después de que GSAP los crea
  requestAnimationFrame(() => {
    loaderContainer.style.zIndex = '1';
    document.querySelectorAll('.pin-spacer').forEach(el => {
      el.style.zIndex = '1';
    });
  });
}

// Crear un clon fijo del logo para que viva fuera del control de GSAP
const fixedLogoContainer = document.createElement('div');
fixedLogoContainer.id = 'fixed-corner-logo';
fixedLogoContainer.style.cssText = `
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

// Clonar solo la cara (svg2)
const clonedFace = svg2.cloneNode(true);
clonedFace.style.cssText = `
  width: 50px;
  height: auto;
  position: relative;
  left: 0;
  top: 0;
`;
// Asegurar que los paths del clon tengan fill visible
clonedFace.querySelectorAll('.borde-cara').forEach(p => {
  p.style.fill = '#57286d';
  p.style.stroke = '#57286d';
  p.style.strokeWidth = '0';
  p.style.opacity = '1';
});
clonedFace.querySelectorAll('.detalle-cara').forEach(p => {
  p.style.fill = '#57286d';
  p.style.stroke = '#57286d';
  p.style.strokeWidth = '0';
  p.style.opacity = '1';
});

fixedLogoContainer.appendChild(clonedFace);
document.body.appendChild(fixedLogoContainer);

function applyCornerState() {
  // Ocultar el texto del logo original
  svg1.style.display = 'none';

  // Mostrar el clon fijo
  fixedLogoContainer.style.opacity = '1';

  // Mostrar botón de hamburguesa
  gsap.to('#burger', { opacity: 1, autoAlpha: 1, duration: 0.3 });
}

function removeCornerState() {
  // Restaurar el texto del logo original
  svg1.style.display = '';

  // Ocultar el clon fijo
  fixedLogoContainer.style.opacity = '0';

  // Ocultar botón de hamburguesa
  gsap.to('#burger', { opacity: 0, autoAlpha: 0, duration: 0.3 });

  // Cerrar menú si estaba abierto
  if (typeof tlBurger !== 'undefined' && tlBurger.progress() > 0) {
    tlBurger.reverse();
  }
}

// =============================================
// 4. SPOTLIGHT BUTTON
// =============================================

const spotlightBtn = document.querySelector('a.button');

if (spotlightBtn) {
  spotlightBtn.addEventListener('mousemove', function (evt) {
    const movX = evt.clientX - this.getBoundingClientRect().x;
    gsap.to(".button__spotlight", {
      x: movX,
      scale: 30,
      duration: 0.3
    });
  });

  spotlightBtn.addEventListener('mouseleave', function (evt) {
    const movX = evt.clientX - this.getBoundingClientRect().x;
    gsap.to(".button__spotlight", {
      x: movX,
      scale: 0,
      duration: 0.3
    });
  });
}

// =============================================
// 5. SERVICES — Pinned Scroll / Panel Wipe
// =============================================

function initServicesPanelWipe() {
  // Elementos
  const cards = document.querySelectorAll('.sr-card');
  const textBlocks = document.querySelectorAll('.sr-text-block');
  const navItems = document.querySelectorAll('.mini-nav ul li');

  // Solo animar si existen los elementos
  if (cards.length < 3 || textBlocks.length < 3) return;

  // Usar matchMedia para aplicar en todos los tamaños
  let mm = gsap.matchMedia();

  mm.add("all", () => {
    // ---- Estado inicial via GSAP (evita conflictos con CSS transforms) ----
    gsap.set('.visual-card-2', { yPercent: 100 });
    gsap.set('.visual-card-3', { yPercent: 100 });
    gsap.set('.text-2', { opacity: 0, y: 30 });
    gsap.set('.text-3', { opacity: 0, y: 30 });

    // ---- Función helper para actualizar el nav activo ----
    function setActiveNav(index) {
      navItems.forEach((item, i) => {
        if (i === index) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // ---- Timeline principal vinculada a ScrollTrigger ----
    const tlServices = gsap.timeline({
      scrollTrigger: {
        trigger: ".boxed-container",
        pin: true,
        scrub: 1,
        start: "top top",
        end: "+=300%",
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress < 0.45) {
            setActiveNav(0);
          } else if (progress < 0.72) {
            setActiveNav(1);
          } else {
            setActiveNav(2);
          }
        }
      }
    });

    // ============================================
    // TRANSICIÓN 1: Card 1 → Card 2 / Text 1 → Text 2
    // ============================================
    tlServices.to('.visual-card-2', {
      yPercent: 0, duration: 1, ease: "none"
    }, 0.2);

    tlServices.to('.text-1', {
      opacity: 0, y: -30, duration: 0.5, ease: "power2.in"
    }, 0.2);

    tlServices.to('.text-2', {
      opacity: 1, y: 0, duration: 0.5, ease: "power2.out"
    }, 0.5);

    tlServices.to('.giant-number-track', {
      y: '-8rem', duration: 1, ease: "none"
    }, 0.2);

    // ============================================
    // TRANSICIÓN 2: Card 2 → Card 3 / Text 2 → Text 3
    // ============================================
    tlServices.to('.visual-card-3', {
      yPercent: 0, duration: 1, ease: "none"
    }, 1.5);

    tlServices.to('.text-2', {
      opacity: 0, y: -30, duration: 0.5, ease: "power2.in"
    }, 1.5);

    tlServices.to('.text-3', {
      opacity: 1, y: 0, duration: 0.5, ease: "power2.out"
    }, 1.8);

    tlServices.to('.giant-number-track', {
      y: '-16rem', duration: 1, ease: "none"
    }, 1.5);
  });
}

// Inicializar el panel wipe cuando el DOM esté listo
// (Se ejecuta después de que GSAP/ScrollTrigger ya están cargados)
initServicesPanelWipe();

// =============================================
// 6. SELECTED WORKS — Sticky Split-Screen
// =============================================

function initSelectedWorks() {
  const swCards = document.querySelectorAll('.sw-card');
  const swTrack = document.querySelector('.sw-number-track');
  const swInfoTrack = document.querySelector('.sw-info-track');
  const swLeft = document.querySelector('.sw-left');
  const swSection = document.querySelector('.selected-works');

  if (!swCards.length || !swTrack || !swLeft || !swSection) return;

  // Usar GSAP matchMedia para limpiar estilos si el usuario redimensiona la ventana
  let mm = gsap.matchMedia();

  // Desktop: > 1024px
  mm.add("(min-width: 1025px)", () => {
    // 1. Pinear la columna izquierda
    ScrollTrigger.create({
      trigger: swSection,
      start: "top top",
      end: "bottom bottom",
      pin: swLeft,
      pinSpacing: false
    });

    // 2. Cada card actualiza el número Y el texto
    swCards.forEach((card) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 65%",
        end: "bottom 65%",
        onEnter: () => {
          const idx = parseInt(card.dataset.index);
          swTrack.style.transform = `translateY(-${idx * 10}rem)`;
          if (swInfoTrack) swInfoTrack.style.transform = `translateY(-${idx * 10}rem)`;
        },
        onEnterBack: () => {
          const idx = parseInt(card.dataset.index);
          swTrack.style.transform = `translateY(-${idx * 10}rem)`;
          if (swInfoTrack) swInfoTrack.style.transform = `translateY(-${idx * 10}rem)`;
        }
      });
    });
  });
}

initSelectedWorks();

// =============================================
// 7. ABOUT — Text Scramble Effect
// =============================================

function scrambleText(element, finalText, duration = 800) {
  const chars = '!<>-_\\/[]{}—=+*^?#_@$%&';
  const totalFrames = Math.ceil(duration / 30);
  let frame = 0;

  const interval = setInterval(() => {
    const progress = frame / totalFrames;
    let output = '';

    for (let i = 0; i < finalText.length; i++) {
      if (i < finalText.length * progress) {
        // Carácter ya revelado
        output += finalText[i];
      } else {
        // Carácter aleatorio
        output += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    element.textContent = output;
    frame++;

    if (frame > totalFrames) {
      clearInterval(interval);
      element.textContent = finalText;
    }
  }, 30);
}

function initSkillsScramble() {
  const items = document.querySelectorAll('[data-scramble]');
  if (!items.length) return;

  // Guardar el texto original
  items.forEach(item => {
    item.dataset.original = item.textContent;
    item.textContent = '';
  });

  ScrollTrigger.create({
    trigger: '.skills-block',
    start: 'top 75%',
    end: 'bottom 20%',
    onEnter: () => {
      items.forEach((item, index) => {
        setTimeout(() => {
          scrambleText(item, item.dataset.original, 600);
        }, index * 80);
      });
    },
    onLeaveBack: () => {
      // Resetear para que vuelva a animar al bajar de nuevo
      items.forEach(item => {
        item.textContent = '';
      });
    }
  });
}

initSkillsScramble();

// =============================================
// 8. ABOUT — Title & Description Animations
// =============================================

function initAboutAnimations() {
  const title = document.querySelector('.about-title');
  const desc = document.querySelector('.about-description p');
  const imgBlock = document.querySelector('.about-img-placeholder');

  // Helper: envuelve cada palabra en spans para la animación clip
  function wrapWords(el) {
    const text = el.textContent;
    const words = text.split(/\s+/).filter(w => w.length > 0);
    el.innerHTML = words.map(word =>
      `<span class="word-wrap"><span class="word-inner">${word}</span></span>`
    ).join('');
  }

  // Animación del título — palabra por palabra desde abajo
  if (title) {
    const lines = title.textContent.split(',');
    title.innerHTML = lines.map((line, i) => {
      const words = line.trim().split(/\s+/).filter(w => w.length > 0);
      const wrapped = words.map((word, j) => {
        // Añadir la coma al primer grupo
        const suffix = (i === 0 && j === words.length - 1) ? ',' : '';
        return `<span class="word-wrap"><span class="word-inner">${word}${suffix}</span></span>`;
      }).join('');
      return wrapped;
    }).join('<br>');

    const titleInners = title.querySelectorAll('.word-inner');
    gsap.set(titleInners, { y: '100%' });

    ScrollTrigger.create({
      trigger: title,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to(titleInners, {
          y: '0%', duration: 0.8, ease: 'power3.out',
          stagger: 0.12
        });
      },
      onLeaveBack: () => {
        gsap.set(titleInners, { y: '100%' });
      }
    });
  }

  // Animación de la imagen — fade in con scale
  if (imgBlock) {
    gsap.set(imgBlock, { opacity: 0, scale: 0.95 });
    ScrollTrigger.create({
      trigger: imgBlock,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to(imgBlock, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' });
      },
      onLeaveBack: () => {
        gsap.to(imgBlock, { opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.in' });
      }
    });
  }

  // Animación del párrafo — palabra por palabra desde abajo
  if (desc) {
    wrapWords(desc);
    const descInners = desc.querySelectorAll('.word-inner');
    gsap.set(descInners, { y: '100%' });

    ScrollTrigger.create({
      trigger: desc,
      start: 'top 85%',
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to(descInners, {
          y: '0%', duration: 0.6, ease: 'power3.out',
          stagger: 0.012
        });
      },
      onLeaveBack: () => {
        gsap.set(descInners, { y: '100%' });
      }
    });
  }
}

initAboutAnimations();

// =============================================
// 9. CONTACT — Entrance Animation & Form Submit
// =============================================

function initContactAnimation() {
  const card = document.querySelector('.contact-card');
  const contactTitle = document.querySelector('.contact-title');
  const formGroups = document.querySelectorAll('.form-group');
  const contactBtn = document.querySelector('.contact-btn');
  const contactForm = document.getElementById('contact-form');

  if (!card) return;

  // -- Netlify Forms AJAX Submission Logic --
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const originalBtnText = contactBtn.textContent;
      contactBtn.textContent = 'Enviando...';
      contactBtn.disabled = true;

      const formData = new FormData(contactForm);

      // --- 1. Enviar a Netlify (Respaldo en Dashboard) ---
      const sendToNetlify = fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      }).catch(err => console.warn("Falló envío a Netlify", err));

      // --- 2. Enviar a tu Correo vía Web3Forms ---
      const formObject = Object.fromEntries(formData);
      const sendToWeb3Forms = fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formObject)
      });

      // Ejecutar ambos métodos a la vez
      Promise.all([sendToNetlify, sendToWeb3Forms])
        .then(async (responses) => {
          contactBtn.textContent = '¡Mensaje Enviado!';
          contactBtn.style.backgroundColor = '#4CAF50';
          contactForm.reset();

          setTimeout(() => {
            contactBtn.textContent = originalBtnText;
            contactBtn.style.backgroundColor = '';
            contactBtn.disabled = false;
          }, 3000);
        })
        .catch((error) => {
          console.error("FAILED...", error);
          contactBtn.textContent = 'Error al Enviar';
          contactBtn.style.backgroundColor = '#f44336';

          setTimeout(() => {
            contactBtn.textContent = originalBtnText;
            contactBtn.style.backgroundColor = '';
            contactBtn.disabled = false;
          }, 3000);
        });
    });
  }

  // Card sube desde abajo
  gsap.set(card, { opacity: 0, y: 80 });
  ScrollTrigger.create({
    trigger: '.contact-section',
    start: 'top 75%',
    end: 'bottom 20%',
    onEnter: () => {
      gsap.to(card, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    },
    onLeaveBack: () => {
      gsap.to(card, { opacity: 0, y: 80, duration: 0.4, ease: 'power2.in' });
    }
  });

  // Form groups entran con stagger
  gsap.set(formGroups, { opacity: 0, y: 20 });
  if (contactBtn) gsap.set(contactBtn, { opacity: 0, y: 20 });

  ScrollTrigger.create({
    trigger: '.contact-form',
    start: 'top 80%',
    end: 'bottom 20%',
    onEnter: () => {
      gsap.to(formGroups, {
        opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
        stagger: 0.08
      });
      if (contactBtn) {
        gsap.to(contactBtn, {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
          delay: formGroups.length * 0.08
        });
      }
    },
    onLeaveBack: () => {
      gsap.set(formGroups, { opacity: 0, y: 20 });
      if (contactBtn) gsap.set(contactBtn, { opacity: 0, y: 20 });
    }
  });
}

initContactAnimation();

// =============================================
// 10. LANGUAGE TOGGLE — ES / EN
// =============================================

const translations = {
  es: {
    nav_work: 'Trabajos',
    nav_about: 'Sobre mí',
    nav_contact: 'Contacto',
    btn_contact: 'Contacto',
    services_title: 'Servicios/',
    nav_optimization: '03 Optimización',
    srv1_title: 'DESARROLLO\nFULL-STACK',
    srv3_title: 'OPTIMIZACIÓN',
    about_title: 'DESARROLLADOR,\nDISEÑADOR',
    skills_heading: 'Habilidades',
    skills_col1: 'Lenguajes y Herramientas',
    skills_col2: 'Frameworks y Librerías',
    contact_title: 'Contacto',
    form_name: 'Nombre Completo',
    form_email: 'Correo Electrónico',
    form_phone: 'Teléfono',
    form_project: 'Tipo de Proyecto',
    form_budget: 'Presupuesto Estimado',
    form_message: 'Mensaje',
    form_send: 'Enviar Mensaje',
    opt_select: 'Selecciona un tipo de proyecto',
    opt_budget: 'Selecciona un rango',
    footer_tagline: 'Diseño que piensa. Código que siente.',
    footer_nav_title: 'Navegación',
    footer_social_title: 'Redes Sociales',
    footer_contact_title: 'Contacto',
    footer_rights: 'Todos los derechos reservados.',
    footer_crafted: 'Hecho con código y café ☕',
    ph_name: 'Ingresa tu nombre completo',
    ph_message: 'Escribe tu mensaje',
  },
  en: {
    nav_work: 'Work',
    nav_about: 'About',
    nav_contact: 'Contact',
    btn_contact: 'Contact',
    services_title: 'Services/',
    nav_optimization: '03 Optimization',
    srv1_title: 'FULL-STACK\nDEVELOPMENT',
    srv3_title: 'OPTIMIZATION',
    about_title: 'DEVELOPER,\nDESIGNER',
    skills_heading: 'Skills',
    skills_col1: 'Languages & Tools',
    skills_col2: 'Frameworks & Libraries',
    contact_title: 'Contact',
    form_name: 'Full Name',
    form_email: 'Email Address',
    form_phone: 'Phone Number',
    form_project: 'Project Type',
    form_budget: 'Estimated Budget',
    form_message: 'Message',
    form_send: 'Send Message',
    opt_select: 'Select a project type',
    opt_budget: 'Select a range',
    footer_tagline: 'Design that thinks. Code that feels.',
    footer_nav_title: 'Navigation',
    footer_social_title: 'Social Media',
    footer_contact_title: 'Contact',
    footer_rights: 'All rights reserved.',
    footer_crafted: 'Made with code and coffee ☕',
    ph_name: 'Enter your full name',
    ph_message: 'Type your message',
  }
};

let currentLang = localStorage.getItem('ert_lang') || 'es';

function applyLanguage(lang) {
  const t = translations[lang];
  // Textos normales
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      // Si contiene \n tratar como innerHTML para <br>
      if (t[key].includes('\n')) {
        el.innerHTML = t[key].replace(/\n/g, '<br>');
      } else {
        el.textContent = t[key];
      }

      // Si la carga inicial no ha pasado o estamos en un nav/hero, re-separar para GSAP
      if (el.matches('.menu-content p, .menu-content a, #hero-paragraph')) {
        splitText(el);
      }
    }
  });
  // Placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  // Botón
  document.getElementById('langLabel').textContent = lang === 'es' ? 'EN' : 'ES';
  document.documentElement.lang = lang;
  localStorage.setItem('ert_lang', lang);
}

document.getElementById('langToggle').addEventListener('click', () => {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  applyLanguage(currentLang);
});

// Aplicar idioma guardado al cargar
applyLanguage(currentLang);

// =============================================
// 11. BURGER MENU
// =============================================
const burger = document.querySelector('#burger');
const tlBurger = gsap.timeline({ paused: true });

gsap.set('.burger-overlay', { autoAlpha: 0 });

tlBurger.to('.burger-overlay', { autoAlpha: 1, duration: 0.3 })
  .to('.burger-content', { x: '0%', duration: 0.5, ease: 'power3.out' }, '<')
  .to('.burger-link', { yPercent: 0, translateY: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }, '-=0.2');

burger.addEventListener('click', () => {
  if (tlBurger.reversed() || tlBurger.progress() === 0) {
    tlBurger.play();
  } else {
    tlBurger.reverse();
  }
});

// Cerrar el menú hamburguesa cuando se hace clic en cualquier link interno
const burgerLinks = document.querySelectorAll('.burger-link');
burgerLinks.forEach(link => {
  link.addEventListener('click', () => {
    tlBurger.reverse();
  });
});

// =============================================
// 12. CUSTOM SCROLL PROGRESS BAR
// =============================================
gsap.to('.custom-scrollbar-thumb', {
  height: '100%',
  ease: 'none',
  scrollTrigger: {
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true
  }
});

// =============================================
// 13. GLOBAL CURSOR PARA SELECTED WORKS
// =============================================
function initSWCursor() {
  const cursor = document.getElementById('sw-global-cursor');
  const links = document.querySelectorAll('.sw-card-link');

  if (!cursor || links.length === 0) return;

  // Movimiento fluido del cursor persiguiendo el raton
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" }),
    yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

  window.addEventListener("mousemove", e => {
    // Offset de 50px porque nuestro cursor tiene 100px por 100px, centrandolo
    xTo(e.clientX - 50);
    yTo(e.clientY - 50);
  });

  // Animaciones Hover
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      gsap.to(cursor, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "back.out(1.5)"
      });
    });

    link.addEventListener('mouseleave', () => {
      gsap.to(cursor, {
        opacity: 0,
        scale: 0.1,
        duration: 0.3,
        ease: "power2.in"
      });
    });
  });
}

initSWCursor();
