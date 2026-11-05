/* ==========================================================================
   MOBILITY TRANSFER EXECUTIVO — INTERAÇÕES
   Sem dependências externas.
   ========================================================================== */
(function () {
  'use strict';

  const body = document.body;
  const header = document.querySelector('.site-header');
  const headerBar = document.querySelector('.header-bar');
  const heroImg = document.querySelector('.hero-img');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prefersReducedMotion = reducedMotionQuery.matches;

  /* ------------------------------------------------------------------------
     REVELAÇÃO AO ENTRAR NA VIEWPORT
     ------------------------------------------------------------------------ */
  const revealElements = Array.from(document.querySelectorAll('.reveal'));

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  /* ------------------------------------------------------------------------
     MENU MOBILE
     ------------------------------------------------------------------------ */
  const menuToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('menu-mobile');
  const inertRegions = Array.from(
    document.querySelectorAll('main, .site-footer, .whatsapp-float')
  );
  let menuIsOpen = false;

  const setPageInert = (inert) => {
    inertRegions.forEach((region) => {
      if (inert) region.setAttribute('inert', '');
      else region.removeAttribute('inert');
    });
  };

  const openMenu = () => {
    if (!menuToggle || !mobileNav) return;

    menuIsOpen = true;
    body.classList.add('menu-open');
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    setPageInert(true);

    window.setTimeout(() => {
      const firstLink = mobileNav.querySelector('a');
      if (firstLink) firstLink.focus({ preventScroll: true });
    }, 120);
  };

  const closeMenu = (returnFocus = false) => {
    if (!menuToggle || !mobileNav) return;

    menuIsOpen = false;
    body.classList.remove('menu-open');
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    setPageInert(false);

    if (returnFocus) menuToggle.focus({ preventScroll: true });
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      if (menuIsOpen) closeMenu(true);
      else openMenu();
    });

    document
      .querySelectorAll('.site-header .brand, .btn--header')
      .forEach((link) => {
        link.addEventListener('click', () => {
          if (menuIsOpen) closeMenu();
        });
      });

    mobileNav.querySelectorAll('a[target="_blank"]').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    mobileNav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const hash = link.getAttribute('href');
        const target = hash ? document.querySelector(hash) : null;
        if (!target) return;

        event.preventDefault();
        closeMenu();

        const targetHeading = target.querySelector('h1, h2') || target;

        window.setTimeout(() => {
          const offset = (headerBar ? headerBar.offsetHeight : 64) + 22;
          const top =
            target.getBoundingClientRect().top +
            window.scrollY -
            offset;

          window.scrollTo({
            top,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });

          if (history.replaceState) history.replaceState(null, '', hash);

          targetHeading.setAttribute('tabindex', '-1');
          targetHeading.focus({ preventScroll: true });

          window.setTimeout(() => {
            targetHeading.removeAttribute('tabindex');
          }, 1200);
        }, 80);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (!menuIsOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        document.querySelectorAll(
          '.site-header a, .site-header button, .mobile-nav a, .mobile-nav button'
        )
      ).filter((element) => element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1100 && menuIsOpen) closeMenu();
    });
  }

  /* ------------------------------------------------------------------------
     HEADER, NAVEGAÇÃO ATIVA E PARALLAX
     ------------------------------------------------------------------------ */
  const navLinks = Array.from(document.querySelectorAll('.nav-desktop .nav-link'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navSectionIds = new Set(
    navLinks
      .map((link) => (link.getAttribute('href') || '').replace('#', ''))
      .filter(Boolean)
  );
  let scrollFrame = null;

  const canUseParallax = () =>
    window.innerWidth > 900 &&
    !prefersReducedMotion &&
    heroImg !== null;

  const updateOnScroll = () => {
    scrollFrame = null;

    const scrollY = window.scrollY;

    if (header) header.classList.toggle('is-scrolled', scrollY > 32);

    if (navLinks.length && sections.length) {
      const offset = (headerBar ? headerBar.offsetHeight : 64) + 90;
      let currentSection = '';

      sections.forEach((section) => {
        if (
          section.getBoundingClientRect().top <= offset &&
          navSectionIds.has(section.id)
        ) {
          currentSection = section.id;
        }
      });

      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === '#' + currentSection;
        link.classList.toggle('is-active', isActive);

        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    if (heroImg) {
      if (canUseParallax() && scrollY < window.innerHeight) {
        heroImg.style.transform =
          'translate3d(0, ' + (scrollY * 0.025).toFixed(2) + 'px, 0) scale(1.05)';
      } else {
        heroImg.style.transform = '';
      }
    }
  };

  const requestScrollUpdate = () => {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(updateOnScroll);
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  updateOnScroll();

  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener('change', (event) => {
      prefersReducedMotion = event.matches;
      if (prefersReducedMotion && heroImg) heroImg.style.transform = '';
    });
  }

  /* ------------------------------------------------------------------------
     GLOW NOS CARDS DE SERVIÇO
     ------------------------------------------------------------------------ */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const serviceCards = Array.from(document.querySelectorAll('.service-card[data-glow]'));

  if (canHover && !prefersReducedMotion) {
    serviceCards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    });
  }

  /* ------------------------------------------------------------------------
     REGIÕES INTERATIVAS
     ------------------------------------------------------------------------ */
  const regionTabs = Array.from(document.querySelectorAll('.region-tab'));
  const regionLabel = document.getElementById('region-label');
  const mapDots = Array.from(document.querySelectorAll('[data-map-dot]'));
  const mapHalos = Array.from(document.querySelectorAll('[data-map-halo]'));
  const mapLines = Array.from(document.querySelectorAll('[data-map-line]'));

  const regionNames = {
    'sao-paulo': 'São Paulo',
    campinas: 'Campinas',
    'rio-de-janeiro': 'Rio de Janeiro',
    'minas-gerais': 'Minas Gerais',
    bahia: 'Bahia'
  };

  const regionAnnouncer = document.getElementById('region-announcer');
  const regionOrder = regionTabs
    .map((tab) => tab.getAttribute('data-region'))
    .filter((region) => regionNames[region]);
  const REGION_CYCLE_MS = 2000;
  let currentRegionIndex = 0;
  let regionManualPauseUntil = 0;
  let regionCycleTimer = null;

  const stopRegionCycle = () => {
    if (regionCycleTimer !== null) {
      window.clearInterval(regionCycleTimer);
      regionCycleTimer = null;
    }
  };

  const canRunRegionCycle = () => !document.hidden && regionOrder.length > 1;

  const startRegionCycle = () => {
    stopRegionCycle();
    if (!canRunRegionCycle()) return;

    regionCycleTimer = window.setInterval(() => {
      if (!canRunRegionCycle() || Date.now() < regionManualPauseUntil) return;
      const nextIndex = (currentRegionIndex + 1) % regionOrder.length;
      setRegion(regionOrder[nextIndex]);
    }, REGION_CYCLE_MS);
  };

  const setRegion = (region) => {
    if (!regionNames[region]) return;

    const index = regionOrder.indexOf(region);
    if (index !== -1) currentRegionIndex = index;

    regionTabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-region') === region;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    mapDots.forEach((dot) => {
      const regions = (dot.getAttribute('data-map-dot') || '').split(/\s+/);
      dot.classList.toggle('is-active', regions.includes(region));
    });

    mapHalos.forEach((halo) => {
      const regions = (halo.getAttribute('data-map-halo') || '').split(/\s+/);
      halo.classList.toggle('is-active', regions.includes(region));
    });

    mapLines.forEach((line) => {
      const lineRegion = line.getAttribute('data-map-line');
      line.classList.toggle('is-active', lineRegion === region);
    });

    if (regionLabel) regionLabel.textContent = regionNames[region];
  };

  regionTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const region = tab.getAttribute('data-region');
      setRegion(region);
      regionManualPauseUntil = Date.now() + 2000;
      startRegionCycle();

      if (regionAnnouncer) {
        regionAnnouncer.textContent = 'Região selecionada: ' + regionNames[region];
      }
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRegionCycle();
    else startRegionCycle();
  });

  setRegion('sao-paulo');
  startRegionCycle();

  /* ------------------------------------------------------------------------
     GALERIA + LIGHTBOX
     ------------------------------------------------------------------------ */
  const galleryItems = [
    {
      full: 'assets/img/galeria1.jpeg',
      thumb: 'assets/img/gallery/galeria-01-700.jpeg',
      alt: 'Bandeja traseira com água, lenços e itens de cortesia',
      width: 1170,
      height: 1111
    },
    {
      full: 'assets/img/galeria2.jpeg',
      thumb: 'assets/img/gallery/galeria-02-700.jpeg',
      alt: 'Porta-malas vazio de um SUV executivo',
      width: 1163,
      height: 1131
    },
    {
      full: 'assets/img/galeria3.jpeg',
      thumb: 'assets/img/gallery/galeria-03-700.jpeg',
      alt: 'Bancos traseiros em couro de um SUV executivo',
      width: 1170,
      height: 1098
    },
    {
      full: 'assets/img/galeria4.jpeg',
      thumb: 'assets/img/gallery/galeria-04-700.jpeg',
      alt: 'Traseira de um sedã Mercedes-Benz preto',
      width: 1170,
      height: 848
    },
    {
      full: 'assets/img/galeria5.jpeg',
      thumb: 'assets/img/gallery/galeria-05-700.jpeg',
      alt: 'Frente de um sedã Mercedes-Benz preto',
      width: 1170,
      height: 1009
    },
    {
      full: 'assets/img/galeria6.jpeg',
      thumb: 'assets/img/gallery/galeria-06-700.jpeg',
      alt: 'Sedã Toyota preto estacionado em frente a uma casa moderna',
      width: 942,
      height: 1129
    },
    {
      full: 'assets/img/galeria7.jpeg',
      thumb: 'assets/img/gallery/galeria-07-700.jpeg',
      alt: 'Sedã Toyota preto em área de embarque de aeroporto',
      width: 914,
      height: 1117
    },
    {
      full: 'assets/img/galeria8.jpeg',
      thumb: 'assets/img/gallery/galeria-08-700.jpeg',
      alt: 'Van, sedã e SUV pretos lado a lado em frente a um edifício corporativo',
      width: 1600,
      height: 900
    },
    {
      full: 'assets/img/galeria9.jpeg',
      thumb: 'assets/img/gallery/galeria-09-700.jpeg',
      alt: 'Interior de van executiva com poltronas de couro e iluminação ambiente',
      width: 1138,
      height: 1104
    },
    {
      full: 'assets/img/galeria10.jpeg',
      thumb: 'assets/img/gallery/galeria-10-700.jpeg',
      alt: 'Poltronas reclináveis de couro em van executiva',
      width: 1170,
      height: 1117
    },
    {
      full: 'assets/img/galeria11.jpeg',
      thumb: 'assets/img/gallery/galeria-11-700.jpeg',
      alt: 'Van executiva preta em garagem coberta',
      width: 1153,
      height: 1141
    },
    {
      full: 'assets/img/galeria12.jpeg',
      thumb: 'assets/img/gallery/galeria-12-700.jpeg',
      alt: 'Porta-malas de van executiva carregado com malas',
      width: 928,
      height: 1097
    }
  ];

  const galleryFeature = document.getElementById('gallery-feature');
  const galleryMain = document.getElementById('gallery-main');
  const galleryCounter = document.getElementById('gallery-counter');
  const galleryThumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
  const lightbox = document.getElementById('lightbox');
  let currentGalleryIndex = 0;

  const padNumber = (number) => String(number).padStart(2, '0');

  const setGallery = (index, immediate = false) => {
    if (!galleryMain || !galleryItems[index]) return;

    currentGalleryIndex = index;
    const item = galleryItems[index];

    const update = () => {
      galleryMain.src = item.full;
      galleryMain.srcset = item.thumb + ' 700w, ' + item.full + ' ' + item.width + 'w';
      galleryMain.alt = item.alt;
      galleryMain.sizes = '(min-width: 900px) 92vw, 100vw';
      galleryMain.width = item.width;
      galleryMain.height = item.height;

      if (galleryCounter) galleryCounter.textContent = padNumber(index + 1) + ' / ' + padNumber(galleryItems.length);
      if (galleryFeature) galleryFeature.setAttribute('aria-label', 'Ampliar imagem ' + (index + 1));

      galleryThumbs.forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === index;
        thumb.classList.toggle('is-active', isActive);
        thumb.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    if (!galleryFeature || immediate) {
      update();
      return;
    }

    galleryFeature.classList.add('is-changing');
    window.setTimeout(() => {
      update();
      const clear = () => galleryFeature.classList.remove('is-changing');
      if (galleryMain.complete) {
        window.setTimeout(clear, 120);
      } else {
        galleryMain.addEventListener('load', clear, { once: true });
        window.setTimeout(clear, 500);
      }
    }, 110);
  };

  if (galleryFeature && galleryMain) {
    galleryFeature.addEventListener('click', () => {
      if (lightbox) openLightbox(currentGalleryIndex);
    });

    galleryThumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const index = Number(thumb.getAttribute('data-index'));
        setGallery(index);

        const featureRect = galleryFeature.getBoundingClientRect();
        if (featureRect.top < 0 || featureRect.bottom > window.innerHeight) {
          galleryFeature.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'center'
          });
        }
      });
    });
  }

  const lightboxImage = lightbox ? lightbox.querySelector('img') : null;
  const lightboxCounter = lightbox ? document.getElementById('lightbox-counter') : null;
  const closeButton = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const prevButton = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const nextButton = lightbox ? lightbox.querySelector('.lightbox-next') : null;
  let lightboxIndex = 0;
  let touchStartX = null;

  const renderLightbox = (index) => {
    if (!lightboxImage || !galleryItems.length) return;

    lightboxIndex =
      ((index % galleryItems.length) + galleryItems.length) % galleryItems.length;
    const item = galleryItems[lightboxIndex];

    lightboxImage.src = item.full;
    lightboxImage.alt = item.alt;
    if (lightboxCounter) {
      lightboxCounter.textContent =
        padNumber(lightboxIndex + 1) + ' / ' + padNumber(galleryItems.length);
    }

    setGallery(lightboxIndex, true);
  };

  function openLightbox(index) {
    if (!lightbox) return;

    renderLightbox(index);
    body.classList.add('lightbox-open');

    if (typeof lightbox.showModal === 'function') lightbox.showModal();
    else lightbox.setAttribute('open', '');

    if (closeButton) closeButton.focus({ preventScroll: true });
  }

  const closeLightbox = () => {
    if (!lightbox) return;

    if (typeof lightbox.close === 'function' && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute('open');
      body.classList.remove('lightbox-open');
    }

    if (galleryFeature) galleryFeature.focus({ preventScroll: true });
  };

  if (lightbox && galleryMain) {
    if (closeButton) closeButton.addEventListener('click', closeLightbox);
    if (prevButton) prevButton.addEventListener('click', () => renderLightbox(lightboxIndex - 1));
    if (nextButton) nextButton.addEventListener('click', () => renderLightbox(lightboxIndex + 1));

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener('close', () => {
      body.classList.remove('lightbox-open');
      if (galleryFeature) galleryFeature.focus({ preventScroll: true });
    });

    lightbox.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        renderLightbox(lightboxIndex + 1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        renderLightbox(lightboxIndex - 1);
      }
    });

    lightbox.addEventListener(
      'touchstart',
      (event) => {
        if (event.touches.length !== 1) return;
        touchStartX = event.touches[0].clientX;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      'touchend',
      (event) => {
        if (touchStartX === null) return;
        const touchEndX = event.changedTouches[0].clientX;
        const distance = touchEndX - touchStartX;
        touchStartX = null;
        if (Math.abs(distance) < 55) return;
        renderLightbox(distance < 0 ? lightboxIndex + 1 : lightboxIndex - 1);
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------------
     ANO ATUAL
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
