/* ==========================================================================
   MOBILITY — RUNTIME PÚBLICO DAS IMAGENS
   Aplica o catálogo central às imagens estáticas da landing page.

   Nesta etapa o catálogo aponta para os arquivos atuais.
   Na próxima etapa, o mesmo runtime poderá receber as URLs públicas
   do Supabase sem exigir alterações no HTML.
   ========================================================================== */
(function () {
  'use strict';

  const catalog = window.MobilityImageCatalog;
  if (!catalog || !Array.isArray(catalog.images)) return;

  const byId = new Map(catalog.images.map((image) => [image.id, image]));

  const applyImage = (element) => {
    const id = element.getAttribute('data-image-id');
    const image = byId.get(id);
    if (!image) return;

    if (image.variants && image.variants.length) {
      element.srcset = image.variants
        .map((variant) => variant.src + ' ' + variant.width + 'w')
        .join(', ');
      if (image.sizes) element.sizes = image.sizes;
    }

    if (image.src) element.src = image.src;
  };

  const applyCatalog = (root = document) => {
    root.querySelectorAll('img[data-image-id]').forEach(applyImage);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyCatalog());
  } else {
    applyCatalog();
  }

  window.MobilityImageRuntime = { applyCatalog };
})();
