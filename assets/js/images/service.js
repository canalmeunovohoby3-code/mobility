/* ==========================================================================
   MOBILITY — CAMADA DE GERENCIAMENTO DE IMAGENS
   Contrato único para o painel e para a futura integração com Supabase.

   Repositório em uso nesta etapa:
   - DevelopmentImageRepository: mantém alterações apenas em memória.
   - Nenhum arquivo do site é sobrescrito.
   - Nenhum dado é gravado em localStorage.

   SupabaseImageRepository: esqueleto pronto para a próxima etapa.
   ========================================================================== */
(function () {
  'use strict';

  const config = {
    maxFileSize: 8 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: /\.(jpe?g|png|webp)$/i
  };

  const readImageMeta = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('Não foi possível ler esta imagem.'));
      image.src = url;
    });

  const validateImageFile = async (file) => {
    if (!file) {
      return { valid: false, error: 'Selecione um arquivo de imagem.' };
    }

    if (!config.allowedTypes.includes(file.type) || !config.allowedExtensions.test(file.name)) {
      return { valid: false, error: 'Formato inválido. Use JPEG, PNG ou WebP.' };
    }

    if (file.size > config.maxFileSize) {
      const maxMb = Math.round((config.maxFileSize / 1024 / 1024) * 10) / 10;
      return { valid: false, error: 'A imagem excede o limite de ' + maxMb + ' MB.' };
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const meta = await readImageMeta(objectUrl);
      if (!meta.width || !meta.height) throw new Error('Imagem sem dimensões válidas.');
      return { valid: true, objectUrl, width: meta.width, height: meta.height };
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      return { valid: false, error: 'Arquivo de imagem inválido ou corrompido.' };
    }
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  class DevelopmentImageRepository {
    constructor(catalog) {
      this.catalog = catalog;
      this.mode = 'development';
      this.overrides = new Map();
      this.addedGallery = [];
      this.removed = new Set();
      this.sequence = 1;
    }

    resolve(image) {
      const override = this.overrides.get(image.id);
      return {
        ...clone(image),
        currentSrc: override ? override.url : image.currentSrc || image.src,
        currentThumb: override ? override.url : image.currentThumb || image.thumb || image.src,
        originalSrc: image.originalSrc || image.src,
        staged: Boolean(override),
        added: Boolean(image.added),
        stagedFile: override
          ? {
              name: override.file.name,
              size: override.file.size,
              type: override.file.type
            }
          : null
      };
    }

    async listImages() {
      const base = this.catalog.images
        .filter((image) => !this.removed.has(image.id))
        .map((image) => this.resolve(image));

      const additions = this.addedGallery.map((image) => this.resolve(image));
      return base.concat(additions);
    }

    async getImage(id) {
      const all = await this.listImages();
      return all.find((image) => image.id === id) || null;
    }

    async replaceImage(id, fileResult) {
      const image = await this.getImage(id);
      if (!image) throw new Error('Imagem não encontrada.');
      if (!fileResult || !fileResult.objectUrl) throw new Error('Arquivo inválido.');

      const previous = this.overrides.get(id);
      if (previous) URL.revokeObjectURL(previous.url);

      this.overrides.set(id, {
        url: fileResult.objectUrl,
        file: fileResult.file,
        width: fileResult.width,
        height: fileResult.height
      });

      return this.getImage(id);
    }

    async addGalleryImage(fileResult) {
      if (!fileResult || !fileResult.objectUrl) throw new Error('Arquivo inválido.');

      const existingIndexes = (await this.listImages())
        .filter((image) => image.isGallery)
        .map((image) => Number(image.galleryIndex) || 0);

      const nextIndex = Math.max(0, ...existingIndexes) + 1;
      const number = String(nextIndex).padStart(2, '0');
      const id = 'gallery-local-' + Date.now() + '-' + this.sequence++;

      const item = {
        id,
        section: 'gallery',
        name: 'Galeria ' + number,
        description: 'Imagem adicionada localmente nesta sessão.',
        src: fileResult.objectUrl,
        thumb: fileResult.objectUrl,
        alt: '',
        width: fileResult.width,
        height: fileResult.height,
        thumbWidth: 700,
        thumbHeight: Math.round((fileResult.height / fileResult.width) * 700),
        usage: ['Galeria'],
        editable: true,
        isGallery: true,
        galleryIndex: nextIndex,
        added: true,
        currentSrc: fileResult.objectUrl,
        currentThumb: fileResult.objectUrl,
        originalSrc: fileResult.objectUrl
      };

      this.addedGallery.push(item);
      return this.getImage(id);
    }

    async removeGalleryImage(id) {
      const image = await this.getImage(id);
      if (!image || !image.isGallery) throw new Error('Imagem da galeria não encontrada.');

      if (image.relatedId) {
        throw new Error(
          'Esta fotografia tem relação com outra imagem do site. Revise a relação antes de removê-la.'
        );
      }

      const addedIndex = this.addedGallery.findIndex((item) => item.id === id);

      if (addedIndex >= 0) {
        const [removed] = this.addedGallery.splice(addedIndex, 1);
        if (removed.thumb && removed.thumb.startsWith('blob:')) {
          URL.revokeObjectURL(removed.thumb);
        }
        return true;
      }

      const override = this.overrides.get(id);
      if (override) {
        URL.revokeObjectURL(override.url);
        this.overrides.delete(id);
      }

      this.removed.add(id);
      return true;
    }

    async resetSession() {
      this.overrides.forEach((override) => URL.revokeObjectURL(override.url));
      this.addedGallery.forEach((item) => {
        if (item.thumb && item.thumb.startsWith('blob:')) URL.revokeObjectURL(item.thumb);
      });
      this.overrides.clear();
      this.addedGallery = [];
      this.removed.clear();
    }

    getChangesCount() {
      return this.overrides.size + this.addedGallery.length + this.removed.size;
    }
  }

  class SupabaseImageRepository {
    constructor(options = {}) {
      this.mode = 'supabase';
      this.client = options.client || null;
      this.bucket = options.bucket || 'site-images';
      this.table = options.table || 'site_images';
    }

    assertConfigured() {
      if (!this.client) {
        throw new Error('Supabase ainda não configurado nesta etapa.');
      }
    }

    async listImages() {
      this.assertConfigured();
      throw new Error('listImages do Supabase será implementado na próxima etapa.');
    }

    async getImage() {
      this.assertConfigured();
      throw new Error('getImage do Supabase será implementado na próxima etapa.');
    }

    async replaceImage() {
      this.assertConfigured();
      throw new Error('replaceImage do Supabase será implementado na próxima etapa.');
    }

    async addGalleryImage() {
      this.assertConfigured();
      throw new Error('addGalleryImage do Supabase será implementado na próxima etapa.');
    }

    async removeGalleryImage() {
      this.assertConfigured();
      throw new Error('removeGalleryImage do Supabase será implementado na próxima etapa.');
    }

    getPublicUrl(path) {
      this.assertConfigured();
      return this.client.storage.from(this.bucket).getPublicUrl(path);
    }

    async getSignedUrl() {
      this.assertConfigured();
      throw new Error('getSignedUrl do Supabase será implementado na próxima etapa.');
    }
  }

  window.MobilityImageService = {
    config,
    validateImageFile,
    createDevelopmentRepository: (catalog) => new DevelopmentImageRepository(catalog),
    createSupabaseRepository: (options) => new SupabaseImageRepository(options)
  };
})();
