/* ==========================================================================
   MOBILITY — PAINEL ADMINISTRATIVO
   Interface + orquestração local. Sem Supabase nesta etapa.
   Nenhuma alteração é gravada em disco ou em localStorage.
   ========================================================================== */
(function () {
  'use strict';

  const catalog = window.MobilityImageCatalog;
  const imageService = window.MobilityImageService;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  if (!catalog || !imageService) {
    document.body.innerHTML =
      '<main style="padding:3rem;font-family:sans-serif"><h1>Painel indisponível</h1><p>Não foi possível carregar o catálogo de imagens.</p></main>';
    return;
  }

  const auth = window.MobilityAuthService
    ? window.MobilityAuthService.createDevelopmentAuth()
    : null;

  const repo = imageService.createDevelopmentRepository(catalog);
  const sectionsById = new Map(catalog.sections.map((section) => [section.id, section]));

  const state = {
    loggedIn: false,
    view: 'dashboard',
    images: [],
    search: '',
    section: 'all',
    replaceTarget: null,
    replaceFile: null,
    replacePreviewUrl: null,
    addPreviewUrl: null,
    deleteTarget: null,
    lastFocus: null,
    mobileNavOpen: false
  };

  const els = {
    loginView: $('#login-view'),
    appView: $('#app-view'),
    loginForm: $('#login-form'),
    loginMessage: $('#login-message'),
    demoAccess: $('#demo-access'),
    logout: $('#logout-button'),
    sidebar: $('#admin-sidebar'),
    mobileBackdrop: $('#mobile-backdrop'),
    mobileMenuButton: $('#mobile-menu-button'),
    pageTitle: $('#page-title'),
    imageSearch: $('#image-search'),
    sectionFilter: $('#section-filter'),
    imagesContent: $('#images-content'),
    galleryContent: $('#gallery-content'),
    addGalleryButton: $('#add-gallery-button'),
    galleryCount: $('#gallery-count'),
    imagesCount: $('#images-count'),
    sectionSummary: $('#section-summary'),
    dashboardGallery: $('#dashboard-gallery'),
    navImageCount: $('#nav-image-count'),
    navGalleryCount: $('#nav-gallery-count'),
    statTotal: $('#stat-total'),
    statSections: $('#stat-sections'),
    statGallery: $('#stat-gallery'),
    statChanges: $('#stat-changes'),
    toastRegion: $('#toast-region'),
    previewDialog: $('#preview-dialog'),
    replaceDialog: $('#replace-dialog'),
    addDialog: $('#add-gallery-dialog'),
    deleteDialog: $('#delete-dialog')
  };

  const pageTitles = {
    dashboard: 'Visão geral',
    images: 'Imagens do site',
    gallery: 'Galeria'
  };

  const pad = (number) => String(number).padStart(2, '0');
  const esc = (value) =>
    String(value == null ? '' : value).replace(/[&<>"']/g, (character) => {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });

  const adminUrl = (path) => {
    if (!path) return '';
    if (/^(blob:|data:|https?:|\/)/i.test(path)) return path;
    return '../' + path.replace(/^\.\//, '');
  };

  const sectionName = (id) => (sectionsById.get(id) || { name: id }).name;
  const formatBytes = (bytes) => {
    if (!bytes) return '—';
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? mb.toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
  };

  const galleryImages = () => state.images.filter((image) => image.isGallery);
  const sectionsWithImages = () =>
    catalog.sections.filter((section) => state.images.some((image) => image.section === section.id));

  const refreshData = async () => {
    state.images = await repo.listImages();
    renderCounts();
    renderSectionSummary();
    renderDashboardGallery();
    renderImages();
    renderGallery();
  };

  const renderCounts = () => {
    const total = state.images.length;
    const gallery = galleryImages().length;
    const withImages = sectionsWithImages().length;
    const changes = repo.getChangesCount();

    if (els.statTotal) els.statTotal.textContent = total;
    if (els.statSections) els.statSections.textContent = withImages;
    if (els.statGallery) els.statGallery.textContent = gallery;
    if (els.statChanges) els.statChanges.textContent = changes;
    if (els.navImageCount) els.navImageCount.textContent = total;
    if (els.navGalleryCount) els.navGalleryCount.textContent = gallery;
    if (els.imagesCount) els.imagesCount.textContent = total;
    if (els.galleryCount) els.galleryCount.innerHTML = '<strong>' + gallery + '</strong> imagens';
  };

  const renderSectionSummary = () => {
    if (!els.sectionSummary) return;

    els.sectionSummary.innerHTML = catalog.sections
      .map((section, index) => {
        const count = state.images.filter((image) => image.section === section.id).length;
        return `<div class="section-row${count ? '' : ' is-empty'}">
          <span>${pad(index + 1)}</span>
          <div><strong>${esc(section.name)}</strong><small>${esc(section.description)}</small></div>
          <em>${count}</em>
        </div>`;
      })
      .join('');
  };

  const renderDashboardGallery = () => {
    if (!els.dashboardGallery) return;

    els.dashboardGallery.innerHTML = galleryImages()
      .slice(0, 6)
      .map(
        (image, index) => `<figure>
          <img src="${esc(adminUrl(image.currentThumb))}" alt="" loading="lazy">
          <figcaption>${pad(index + 1)}</figcaption>
        </figure>`
      )
      .join('');
  };

  const renderImages = () => {
    if (!els.imagesContent || !els.sectionFilter) return;

    const query = state.search.trim().toLowerCase();
    const filtered = state.images.filter((image) => {
      const matchesSection = state.section === 'all' || image.section === state.section;
      const haystack = [image.name, image.description, sectionName(image.section), image.usage.join(' ')]
        .join(' ')
        .toLowerCase();
      return matchesSection && (!query || haystack.includes(query));
    });

    const grouped = catalog.sections
      .map((section) => ({
        section,
        images: filtered.filter((image) => image.section === section.id)
      }))
      .filter((group) => group.images.length || (!query && state.section === 'all'));

    if (!grouped.length || !filtered.length) {
      els.imagesContent.innerHTML = `<div class="empty-state"><strong>Nenhuma imagem encontrada</strong>Tente outra busca ou selecione outra seção.</div>`;
      return;
    }

    els.imagesContent.innerHTML = grouped
      .map(({ section, images }) => {
        if (!images.length) {
          return `<section class="image-group">
            <div class="image-group-head"><div><h2>${esc(section.name)}</h2><p>${esc(section.description)}</p></div><span class="group-count">0</span></div>
            <div class="empty-state"><strong>Sem fotografias nesta seção</strong>${esc(section.description)}</div>
          </section>`;
        }

        return `<section class="image-group">
          <div class="image-group-head">
            <div><h2>${esc(section.name)}</h2><p>${esc(section.description)}</p></div>
            <span class="group-count">${images.length}</span>
          </div>
          <div class="image-grid">
            ${images.map(renderImageCard).join('')}
          </div>
        </section>`;
      })
      .join('');
  };

  const renderImageCard = (image) => {
    const shared = image.usage.length > 1;
    const cardImage = image.isGallery ? image.currentThumb : image.currentSrc;
    const mediaClass = image.id === 'brand-logo' ? ' image-card-media--logo' : '';
    const stagedTag = image.staged
      ? '<span class="image-tag image-tag--staged">Prévia local</span>'
      : image.added
        ? '<span class="image-tag image-tag--staged">Adicionada</span>'
        : '';
    const relation = image.relatedId
      ? `<span class="usage-chip usage-chip--shared">Relacionada a ${esc(sectionName('hero'))}</span>`
      : '';

    return `<article class="image-card" data-id="${esc(image.id)}">
      <div class="image-card-media${mediaClass}">
        <img src="${esc(adminUrl(cardImage))}" alt="" loading="lazy">
        ${stagedTag}
      </div>
      <div class="image-card-body">
        <h3 class="image-card-title">${esc(image.name)}</h3>
        <p class="image-card-desc">${esc(image.description)}</p>
        <div class="image-card-usage">
          <span class="usage-chip">${esc(sectionName(image.section))}</span>
          ${shared ? `<span class="usage-chip usage-chip--shared">${image.usage.length} usos</span>` : ''}
          ${relation}
        </div>
        <span class="image-card-meta" title="${esc(image.staged && image.stagedFile ? image.stagedFile.name : image.originalSrc)}">${esc(image.staged && image.stagedFile ? image.stagedFile.name : image.originalSrc)}</span>
        <div class="image-card-actions">
          <button class="btn btn--quiet" type="button" data-action="preview" data-id="${esc(image.id)}" aria-label="Visualizar ${esc(image.name)}">
            <svg class="icon" aria-hidden="true"><use href="#i-eye"></use></svg> Prévia
          </button>
          <button class="btn btn--outline" type="button" data-action="replace" data-id="${esc(image.id)}" aria-label="Substituir ${esc(image.name)}">
            <svg class="icon" aria-hidden="true"><use href="#i-swap"></use></svg> Substituir
          </button>
        </div>
      </div>
    </article>`;
  };

  const renderGallery = () => {
    if (!els.galleryContent) return;

    const images = galleryImages().sort((a, b) => (a.galleryIndex || 0) - (b.galleryIndex || 0));
    const cards = images.map((image) => {
      const number = pad(image.galleryIndex || 0);
      const relation = image.relatedId
        ? `<span class="gallery-related">${esc(image.relationNote || 'Relacionada a outra imagem do site.')}</span>`
        : '';

      return `<article class="gallery-admin-card" data-id="${esc(image.id)}">
        <div class="gallery-thumb-wrap">
          <img src="${esc(adminUrl(image.currentThumb))}" alt="" loading="lazy">
          <span class="gallery-thumb-index">${number}</span>
          <div class="gallery-thumb-actions">
            <button class="icon-button" type="button" data-action="preview" data-id="${esc(image.id)}" aria-label="Visualizar galeria ${number}">
              <svg class="icon" aria-hidden="true"><use href="#i-eye"></use></svg>
            </button>
            <button class="icon-button" type="button" data-action="replace" data-id="${esc(image.id)}" aria-label="Substituir galeria ${number}">
              <svg class="icon" aria-hidden="true"><use href="#i-swap"></use></svg>
            </button>
            <button class="icon-button" type="button" data-action="delete" data-id="${esc(image.id)}" aria-label="Remover galeria ${number}">
              <svg class="icon" aria-hidden="true"><use href="#i-trash"></use></svg>
            </button>
          </div>
        </div>
        <div class="gallery-admin-body">
          <strong>Galeria ${number}</strong>
          <small>${image.added ? 'Incluída nesta prévia local' : esc(image.description)}</small>
          ${relation}
          ${image.staged ? '<span class="usage-chip usage-chip--shared">Prévia local</span>' : ''}
        </div>
      </article>`;
    });

    cards.push(`<button class="add-gallery-card" type="button" data-action="add-gallery">
      <span>
        <svg class="icon" aria-hidden="true"><use href="#i-plus"></use></svg>
        <strong>Adicionar fotografia</strong>
        <small>Prévia local · sem legenda no site</small>
      </span>
    </button>`);

    els.galleryContent.innerHTML = cards.join('');
  };

  const maxMb = Math.round((imageService.config.maxFileSize / 1024 / 1024) * 10) / 10;
  $$('.upload-empty small').forEach((hint) => {
    hint.textContent = 'JPEG, PNG ou WebP · até ' + maxMb + ' MB';
  });

  const setupUploadZone = (zone, input) => {
    if (!zone || !input) return;
    zone.tabIndex = 0;
    zone.setAttribute('role', 'button');
    zone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        input.click();
      }
    });
  };

  setupUploadZone($('#replace-upload-zone'), $('#replace-file'));
  setupUploadZone($('#add-upload-zone'), $('#add-file'));

  const findImage = (id) => state.images.find((image) => image.id === id);

  const setDialogOpen = (dialog, focusSelector) => {
    if (!dialog) return;
    state.lastFocus = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    const target = focusSelector ? $(focusSelector, dialog) : null;
    if (target) target.focus({ preventScroll: true });
  };

  const closeDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  const restoreFocus = () => {
    if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
      state.lastFocus.focus({ preventScroll: true });
    }
    state.lastFocus = null;
  };

  const toast = (message) => {
    if (!els.toastRegion) return;
    const item = document.createElement('div');
    item.className = 'toast';
    item.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg><span>' + esc(message) + '</span>';
    els.toastRegion.appendChild(item);
    window.setTimeout(() => item.remove(), 4200);
  };

  /* ------------------------------------------------------------------------
     PRÉVIA
     ------------------------------------------------------------------------ */
  const openPreview = (id) => {
    const image = findImage(id);
    if (!image) return;

    $('#preview-title').textContent = image.name;
    $('#preview-section').textContent = sectionName(image.section);
    $('#preview-description').textContent = image.description;
    $('#preview-id').textContent = image.id;
    $('#preview-usage').textContent = image.usage.join(' · ');
    $('#preview-path').textContent = image.staged && image.stagedFile ? image.stagedFile.name : image.originalSrc;
    $('#preview-dimensions').textContent = image.width + ' × ' + image.height + ' px';
    $('#preview-image').src = adminUrl(image.currentSrc);
    $('#preview-image').alt = image.alt || image.name;

    const note = $('#preview-note');
    if (image.relationNote) {
      note.hidden = false;
      note.textContent = image.relationNote;
    } else {
      note.hidden = true;
      note.textContent = '';
    }

    setDialogOpen(els.previewDialog, '.dialog-close');
  };

  /* ------------------------------------------------------------------------
     SUBSTITUIÇÃO
     ------------------------------------------------------------------------ */
  const resetReplacePreview = (revoke = true) => {
    if (state.replacePreviewUrl && revoke) URL.revokeObjectURL(state.replacePreviewUrl);
    state.replacePreviewUrl = null;
    state.replaceFile = null;
    $('#replace-preview').src = '';
    $('#replace-preview').hidden = true;
    $('#replace-upload-empty').hidden = false;
    $('#replace-filename').textContent = '';
    $('#replace-error').hidden = true;
    $('#replace-error').textContent = '';
    $('#confirm-replace').disabled = true;
    $('#replace-file').value = '';
  };

  const openReplace = (id) => {
    const image = findImage(id);
    if (!image) return;

    state.replaceTarget = image;
    resetReplacePreview(true);

    $('#replace-context').innerHTML =
      '<strong>' + esc(image.name) + '</strong> · ' + esc(sectionName(image.section)) + ' — ' + esc(image.description);
    $('#replace-current').src = adminUrl(image.currentSrc);
    $('#replace-current').alt = image.alt || image.name;
    $('#replace-current-caption').textContent =
      (image.staged && image.stagedFile ? image.stagedFile.name + ' · ' : '') + image.width + ' × ' + image.height + ' px';

    const warning = $('#replace-warning');
    warning.hidden = image.usage.length <= 1;
    warning.querySelector('span').textContent =
      'Esta imagem é usada em ' + image.usage.length + ' pontos do site. A substituição será aplicada a todos.';

    setDialogOpen(els.replaceDialog, '#replace-upload-zone');
  };

  const handleReplaceFile = async (file) => {
    resetReplacePreview(true);
    const result = await imageService.validateImageFile(file);

    if (!result.valid) {
      $('#replace-error').hidden = false;
      $('#replace-error').textContent = result.error;
      return;
    }

    state.replacePreviewUrl = result.objectUrl;
    state.replaceFile = {
      file,
      objectUrl: result.objectUrl,
      width: result.width,
      height: result.height
    };

    const preview = $('#replace-preview');
    preview.src = result.objectUrl;
    preview.hidden = false;
    $('#replace-upload-empty').hidden = true;
    $('#replace-filename').textContent = file.name + ' · ' + formatBytes(file.size);
    $('#replace-error').hidden = true;
    $('#confirm-replace').disabled = false;
  };

  const confirmReplace = async () => {
    if (!state.replaceTarget || !state.replaceFile) return;

    try {
      const image = await repo.replaceImage(state.replaceTarget.id, state.replaceFile);
      state.replacePreviewUrl = null;
      state.replaceFile = null;
      closeDialog(els.replaceDialog);
      await refreshData();
      toast('Substituição preparada nesta sessão. Nenhum arquivo do site foi alterado.');
      if (image) renderCurrentView();
    } catch (error) {
      $('#replace-error').hidden = false;
      $('#replace-error').textContent = error.message;
    }
  };

  /* ------------------------------------------------------------------------
     ADIÇÃO À GALERIA
     ------------------------------------------------------------------------ */
  const resetAddPreview = (revoke = true) => {
    if (state.addPreviewUrl && revoke) URL.revokeObjectURL(state.addPreviewUrl);
    state.addPreviewUrl = null;
    state.addFile = null;
    $('#add-preview').src = '';
    $('#add-preview').hidden = true;
    $('#add-upload-empty').hidden = false;
    $('#add-filename').textContent = '';
    $('#add-error').hidden = true;
    $('#add-error').textContent = '';
    $('#confirm-add').disabled = true;
    $('#add-file').value = '';
  };

  const openAddGallery = () => {
    resetAddPreview(true);
    setDialogOpen(els.addDialog, '#add-upload-zone');
  };

  const handleAddFile = async (file) => {
    resetAddPreview(true);
    const result = await imageService.validateImageFile(file);

    if (!result.valid) {
      $('#add-error').hidden = false;
      $('#add-error').textContent = result.error;
      return;
    }

    state.addPreviewUrl = result.objectUrl;
    state.addFile = {
      file,
      objectUrl: result.objectUrl,
      width: result.width,
      height: result.height
    };

    const preview = $('#add-preview');
    preview.src = result.objectUrl;
    preview.hidden = false;
    $('#add-upload-empty').hidden = true;
    $('#add-filename').textContent = file.name + ' · ' + formatBytes(file.size);
    $('#add-error').hidden = true;
    $('#confirm-add').disabled = false;
  };

  const confirmAdd = async () => {
    if (!state.addFile) return;

    try {
      await repo.addGalleryImage(state.addFile);
      state.addPreviewUrl = null;
      state.addFile = null;
      closeDialog(els.addDialog);
      await refreshData();
      toast('Fotografia adicionada à prévia local. Ela será publicada após a integração com o Supabase.');
      renderCurrentView();
    } catch (error) {
      $('#add-error').hidden = false;
      $('#add-error').textContent = error.message;
    }
  };

  /* ------------------------------------------------------------------------
     EXCLUSÃO DA GALERIA
     ------------------------------------------------------------------------ */
  const openDelete = (id) => {
    const image = findImage(id);
    if (!image) return;

    state.deleteTarget = image;
    $('#delete-message').textContent =
      '“' + image.name + '” será removida apenas desta prévia local. O arquivo original permanece intacto.';

    const note = $('#delete-note');
    if (image.relatedId) {
      note.hidden = false;
      note.textContent = image.relationNote || 'Esta imagem tem relação com outra área do site.';
      $('#confirm-delete').disabled = true;
    } else {
      note.hidden = true;
      note.textContent = '';
      $('#confirm-delete').disabled = false;
    }

    setDialogOpen(els.deleteDialog, '[data-close-delete]');
  };

  const confirmDelete = async () => {
    if (!state.deleteTarget) return;

    try {
      await repo.removeGalleryImage(state.deleteTarget.id);
      state.deleteTarget = null;
      closeDialog(els.deleteDialog);
      await refreshData();
      toast('Fotografia removida da prévia local.');
      renderCurrentView();
    } catch (error) {
      const note = $('#delete-note');
      note.hidden = false;
      note.textContent = error.message;
      $('#confirm-delete').disabled = true;
    }
  };

  /* ------------------------------------------------------------------------
     NAVEGAÇÃO
     ------------------------------------------------------------------------ */
  const setMobileNav = (open) => {
    state.mobileNavOpen = open;
    if (els.sidebar) els.sidebar.classList.toggle('is-open', open);
    if (els.mobileBackdrop) els.mobileBackdrop.hidden = !open;
    if (els.mobileMenuButton) {
      els.mobileMenuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      els.mobileMenuButton.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação');
    }
  };

  const renderCurrentView = () => {
    if (state.view === 'dashboard') {
      renderSectionSummary();
      renderDashboardGallery();
    }
    if (state.view === 'images') renderImages();
    if (state.view === 'gallery') renderGallery();
  };

  const navigate = (view, updateHash = true) => {
    if (!state.loggedIn) return;
    const target = ['dashboard', 'images', 'gallery'].includes(view) ? view : 'dashboard';
    state.view = target;

    $$('.admin-view').forEach((section) => {
      section.hidden = section.getAttribute('data-view') !== target;
    });

    $$('[data-nav]').forEach((item) => {
      item.classList.toggle('is-active', item.getAttribute('data-nav') === target);
    });

    if (els.pageTitle) els.pageTitle.textContent = pageTitles[target];
    const routePaths = {
      dashboard: '#/dashboard',
      images: '#/imagens',
      gallery: '#/galeria'
    };

    if (updateHash && location.hash !== routePaths[target]) {
      history.pushState(null, '', routePaths[target]);
    }

    setMobileNav(false);
    renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const viewFromHash = () => {
    const value = location.hash.replace(/^#\/?/, '');
    const routes = {
      '': 'dashboard',
      dashboard: 'dashboard',
      imagens: 'images',
      images: 'images',
      galeria: 'gallery',
      gallery: 'gallery'
    };
    return routes[value] || 'dashboard';
  };

  const enterApp = () => {
    state.loggedIn = true;
    if (els.loginView) els.loginView.hidden = true;
    if (els.appView) els.appView.hidden = false;
    document.body.classList.add('is-admin');
    navigate(viewFromHash(), false);
    refreshData();
  };

  const leaveApp = () => {
    state.loggedIn = false;
    if (els.appView) els.appView.hidden = true;
    if (els.loginView) els.loginView.hidden = false;
    document.body.classList.remove('is-admin');
    history.replaceState(null, '', location.pathname);
    closeDialog(els.previewDialog);
    closeDialog(els.replaceDialog);
    closeDialog(els.addDialog);
    closeDialog(els.deleteDialog);
    setMobileNav(false);
    const email = $('#login-email');
    if (email) email.focus({ preventScroll: true });
  };

  /* ------------------------------------------------------------------------
     EVENTOS
     ------------------------------------------------------------------------ */
  if (els.loginForm) {
    els.loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const result = auth
        ? await auth.signIn($('#login-email').value, $('#login-password').value)
        : {
            ok: false,
            message:
              'Autenticação ainda não configurada. Use o modo demonstração. O Supabase Auth será conectado na próxima etapa.'
          };

      if (els.loginMessage) {
        els.loginMessage.classList.add('is-strong');
        els.loginMessage.textContent = result.message || 'Não foi possível autenticar nesta etapa.';
      }
    });
  }

  if (els.demoAccess) {
    els.demoAccess.addEventListener('click', async () => {
      if (auth) await auth.enterDemo();
      enterApp();
      toast('Modo demonstração ativo. As alterações não são salvas.');
    });
  }

  if (els.logout) {
    els.logout.addEventListener('click', async () => {
      if (auth) await auth.signOut();
      leaveApp();
    });
  }

  window.addEventListener('popstate', () => {
    if (state.loggedIn) navigate(viewFromHash(), false);
  });

  window.addEventListener('hashchange', () => {
    if (state.loggedIn) navigate(viewFromHash(), false);
  });

  if (els.mobileMenuButton) {
    els.mobileMenuButton.addEventListener('click', () => setMobileNav(!state.mobileNavOpen));
  }
  if (els.mobileBackdrop) {
    els.mobileBackdrop.addEventListener('click', () => setMobileNav(false));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.mobileNavOpen) setMobileNav(false);
  });

  if (els.imageSearch) {
    let searchTimer = null;
    els.imageSearch.addEventListener('input', (event) => {
      state.search = event.target.value;
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(renderImages, 160);
    });
  }

  if (els.sectionFilter) {
    els.sectionFilter.innerHTML =
      '<option value="all">Todas as seções</option>' +
      catalog.sections
        .map((section) => `<option value="${esc(section.id)}">${esc(section.name)}</option>`)
        .join('');

    els.sectionFilter.addEventListener('change', (event) => {
      state.section = event.target.value;
      renderImages();
    });
  }

  const handleDelegatedAction = (event) => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.getAttribute('data-action');
    const id = trigger.getAttribute('data-id');

    if (action === 'preview' && id) openPreview(id);
    if (action === 'replace' && id) openReplace(id);
    if (action === 'delete' && id) openDelete(id);
    if (action === 'add-gallery') openAddGallery();
  };

  if (els.imagesContent) els.imagesContent.addEventListener('click', handleDelegatedAction);
  if (els.galleryContent) els.galleryContent.addEventListener('click', handleDelegatedAction);
  if (els.addGalleryButton) els.addGalleryButton.addEventListener('click', openAddGallery);

  // Uploads
  const replaceFile = $('#replace-file');
  if (replaceFile) {
    replaceFile.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) handleReplaceFile(file);
    });
  }

  const addFile = $('#add-file');
  if (addFile) {
    addFile.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) handleAddFile(file);
    });
  }

  const confirmReplaceButton = $('#confirm-replace');
  if (confirmReplaceButton) confirmReplaceButton.addEventListener('click', confirmReplace);
  const confirmAddButton = $('#confirm-add');
  if (confirmAddButton) confirmAddButton.addEventListener('click', confirmAdd);
  const confirmDeleteButton = $('#confirm-delete');
  if (confirmDeleteButton) confirmDeleteButton.addEventListener('click', confirmDelete);

  $$('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      closeDialog(els.previewDialog);
      restoreFocus();
    });
  });

  $$('[data-close-replace]').forEach((button) => {
    button.addEventListener('click', () => {
      resetReplacePreview(true);
      closeDialog(els.replaceDialog);
      restoreFocus();
    });
  });

  $$('[data-close-add]').forEach((button) => {
    button.addEventListener('click', () => {
      resetAddPreview(true);
      closeDialog(els.addDialog);
      restoreFocus();
    });
  });

  $$('[data-close-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      state.deleteTarget = null;
      closeDialog(els.deleteDialog);
      restoreFocus();
    });
  });

  // Limpeza ao fechar com ESC / clique nativo
  if (els.previewDialog) {
    els.previewDialog.addEventListener('close', () => restoreFocus());
    els.previewDialog.addEventListener('click', (event) => {
      if (event.target === els.previewDialog) {
        closeDialog(els.previewDialog);
        restoreFocus();
      }
    });
  }

  if (els.replaceDialog) {
    els.replaceDialog.addEventListener('close', () => {
      resetReplacePreview(true);
      state.replaceTarget = null;
    });
    els.replaceDialog.addEventListener('click', (event) => {
      if (event.target === els.replaceDialog) {
        closeDialog(els.replaceDialog);
      }
    });
  }

  if (els.addDialog) {
    els.addDialog.addEventListener('close', () => resetAddPreview(true));
    els.addDialog.addEventListener('click', (event) => {
      if (event.target === els.addDialog) closeDialog(els.addDialog);
    });
  }

  if (els.deleteDialog) {
    els.deleteDialog.addEventListener('close', () => {
      state.deleteTarget = null;
    });
    els.deleteDialog.addEventListener('click', (event) => {
      if (event.target === els.deleteDialog) closeDialog(els.deleteDialog);
    });
  }

  // Inicialização: a landing page já usa o catálogo publicamente.
  // O painel só busca os dados após o modo demonstração ser ativado.
  refreshData();
})();
