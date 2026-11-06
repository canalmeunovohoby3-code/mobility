/* ==========================================================================
   MOBILITY — CATÁLOGO CENTRAL DE IMAGENS
   Fonte única para a landing page e para o painel administrativo.

   Nesta etapa os caminhos apontam para arquivos locais.
   Na próxima etapa, este catálogo poderá ser hidratado pelos registros
   do Supabase, mantendo os mesmos IDs e a mesma estrutura.

   Modo atual: LOCAL / DESENVOLVIMENTO
   ========================================================================== */
(function () {
  'use strict';

  const gallery = [
    {
      n: 1,
      full: 'assets/img/galeria1.jpeg',
      thumb: 'assets/img/gallery/galeria-01-700.jpeg',
      width: 1170, height: 1111, thumbWidth: 700, thumbHeight: 665,
      alt: 'Bandeja traseira com água, lenços e itens de cortesia',
      description: 'Detalhe da bandeja traseira com itens de cortesia.'
    },
    {
      n: 2,
      full: 'assets/img/galeria2.jpeg',
      thumb: 'assets/img/gallery/galeria-02-700.jpeg',
      width: 1163, height: 1131, thumbWidth: 700, thumbHeight: 681,
      alt: 'Porta-malas vazio de um SUV executivo',
      description: 'Porta-malas organizado de um SUV executivo.'
    },
    {
      n: 3,
      full: 'assets/img/galeria3.jpeg',
      thumb: 'assets/img/gallery/galeria-03-700.jpeg',
      width: 1170, height: 1098, thumbWidth: 700, thumbHeight: 657,
      alt: 'Bancos traseiros em couro de um SUV executivo',
      description: 'Bancos traseiros em couro do SUV executivo.'
    },
    {
      n: 4,
      full: 'assets/img/galeria4.jpeg',
      thumb: 'assets/img/gallery/galeria-04-700.jpeg',
      width: 1170, height: 848, thumbWidth: 700, thumbHeight: 507,
      alt: 'Traseira de um sedã Mercedes-Benz preto',
      description: 'Traseira de um sedã Mercedes-Benz da frota.'
    },
    {
      n: 5,
      full: 'assets/img/galeria5.jpeg',
      thumb: 'assets/img/gallery/galeria-05-700.jpeg',
      width: 1170, height: 1009, thumbWidth: 700, thumbHeight: 604,
      alt: 'Frente de um sedã Mercedes-Benz preto',
      description: 'Frente de um sedã Mercedes-Benz da frota.'
    },
    {
      n: 6,
      full: 'assets/img/galeria6.jpeg',
      thumb: 'assets/img/gallery/galeria-06-700.jpeg',
      width: 942, height: 1129, thumbWidth: 700, thumbHeight: 839,
      alt: 'Sedã Toyota preto estacionado em frente a uma casa moderna',
      description: 'Sedã Toyota em frente a uma residência moderna.',
      relatedId: 'hero-main',
      relationNote: 'Mesma fotografia usada no Hero, mas em arquivo separado.'
    },
    {
      n: 7,
      full: 'assets/img/galeria7.jpeg',
      thumb: 'assets/img/gallery/galeria-07-700.jpeg',
      width: 914, height: 1117, thumbWidth: 700, thumbHeight: 855,
      alt: 'Sedã Toyota preto em área de embarque de aeroporto',
      description: 'Sedã Toyota em área de embarque de aeroporto.'
    },
    {
      n: 8,
      full: 'assets/img/galeria8.jpeg',
      thumb: 'assets/img/gallery/galeria-08-700.jpeg',
      width: 1600, height: 900, thumbWidth: 700, thumbHeight: 394,
      alt: 'Van, sedã e SUV pretos lado a lado em frente a um edifício corporativo',
      description: 'Frota executiva reunida em frente a um edifício corporativo.'
    },
    {
      n: 9,
      full: 'assets/img/galeria9.jpeg',
      thumb: 'assets/img/gallery/galeria-09-700.jpeg',
      width: 1138, height: 1104, thumbWidth: 700, thumbHeight: 679,
      alt: 'Interior de van executiva com poltronas de couro e iluminação ambiente',
      description: 'Interior de van executiva com poltronas de couro.'
    },
    {
      n: 10,
      full: 'assets/img/galeria10.jpeg',
      thumb: 'assets/img/gallery/galeria-10-700.jpeg',
      width: 1170, height: 1117, thumbWidth: 700, thumbHeight: 668,
      alt: 'Poltronas reclináveis de couro em van executiva',
      description: 'Poltronas reclináveis e iluminação ambiente da van.'
    },
    {
      n: 11,
      full: 'assets/img/galeria11.jpeg',
      thumb: 'assets/img/gallery/galeria-11-700.jpeg',
      width: 1153, height: 1141, thumbWidth: 700, thumbHeight: 693,
      alt: 'Van executiva preta em garagem coberta',
      description: 'Van executiva em garagem coberta.'
    },
    {
      n: 12,
      full: 'assets/img/galeria12.jpeg',
      thumb: 'assets/img/gallery/galeria-12-700.jpeg',
      width: 928, height: 1097, thumbWidth: 700, thumbHeight: 827,
      alt: 'Porta-malas de van executiva carregado com malas',
      description: 'Porta-malas de van executiva com bagagem.'
    }
  ];

  const galleryImages = gallery.map((item) => {
    const number = String(item.n).padStart(2, '0');
    return {
      id: 'gallery-' + number,
      section: 'gallery',
      name: 'Galeria ' + number,
      description: item.description,
      src: item.full,
      thumb: item.thumb,
      alt: item.alt,
      width: item.width,
      height: item.height,
      thumbWidth: item.thumbWidth,
      thumbHeight: item.thumbHeight,
      usage: ['Galeria'],
      editable: true,
      isGallery: true,
      galleryIndex: item.n,
      relatedId: item.relatedId || null,
      relationNote: item.relationNote || ''
    };
  });

  const images = [
    {
      id: 'brand-logo',
      section: 'brand',
      name: 'Logo Mobility',
      description: 'Logo oficial da Mobility, aplicada no cabeçalho e no rodapé.',
      src: 'assets/logo.png',
      alt: 'Mobility Transfer Executivo',
      width: 1027,
      height: 213,
      usage: ['Header', 'Rodapé'],
      editable: true
    },
    {
      id: 'hero-main',
      section: 'hero',
      name: 'Hero — foto principal',
      description: 'Fotografia principal do topo da landing page.',
      src: 'assets/img/fotohero.jpeg',
      alt: 'Sedã executivo preto estacionado em frente a uma residência moderna',
      width: 942,
      height: 1129,
      usage: ['Hero'],
      editable: true
    },
    {
      id: 'experience-main',
      section: 'experience',
      name: 'Experiência — frota executiva',
      description: 'Frota executiva reunida em frente a um edifício corporativo.',
      src: 'assets/hero.jpeg',
      alt: 'Van, sedã e SUV executivos pretos lado a lado em frente a um edifício corporativo ao anoitecer',
      width: 1600,
      height: 900,
      usage: ['A experiência'],
      editable: true
    },
    {
      id: 'service-airport',
      section: 'services',
      name: 'Serviço — Transfer Aeroporto',
      description: 'Imagem do card Transfer Aeroporto.',
      src: 'assets/aeroporto.jpeg',
      alt: 'Aeroporto iluminado ao pôr do sol, com aeronave e terminal ao fundo',
      width: 1600,
      height: 900,
      sizes: '(min-width: 1100px) 58vw, 100vw',
      variants: [
        { src: 'assets/img/svc-aeroporto-novo-700.jpg', width: 700 },
        { src: 'assets/img/svc-aeroporto-novo-1200.jpg', width: 1200 },
        { src: 'assets/aeroporto.jpeg', width: 1600 }
      ],
      usage: ['Serviços — Transfer Aeroporto'],
      editable: true
    },
    {
      id: 'service-corporate',
      section: 'services',
      name: 'Serviço — Executivo & Corporativo',
      description: 'Imagem do card Executivo & Corporativo.',
      src: 'assets/corporativo.jpeg',
      alt: 'Executivo sendo recebido por um motorista ao lado de um SUV preto em frente a um edifício corporativo',
      width: 1600,
      height: 900,
      sizes: '(min-width: 1100px) 42vw, 100vw',
      variants: [
        { src: 'assets/img/svc-corporativo-novo-700.jpg', width: 700 },
        { src: 'assets/img/svc-corporativo-novo-1200.jpg', width: 1200 },
        { src: 'assets/corporativo.jpeg', width: 1600 }
      ],
      usage: ['Serviços — Executivo & Corporativo'],
      editable: true
    },
    {
      id: 'service-events',
      section: 'services',
      name: 'Serviço — Eventos',
      description: 'Imagem do card Eventos.',
      src: 'assets/eventos.jpeg',
      alt: 'Convidados entrando em um espaço de eventos iluminado ao anoitecer, com SUV executivo em primeiro plano',
      width: 1600,
      height: 900,
      sizes: '(min-width: 1100px) 33vw, 100vw',
      variants: [
        { src: 'assets/img/svc-eventos-novo-700.jpg', width: 700 },
        { src: 'assets/img/svc-eventos-novo-1200.jpg', width: 1200 },
        { src: 'assets/eventos.jpeg', width: 1600 }
      ],
      usage: ['Serviços — Eventos'],
      editable: true
    },
    {
      id: 'service-travel',
      section: 'services',
      name: 'Serviço — Viagens & Turismo',
      description: 'Imagem do card Viagens & Turismo.',
      src: 'assets/viagenseturismo.PNG',
      alt: 'Rua turística com guarda-chuvas iluminados e arquitetura europeia',
      width: 299,
      height: 191,
      usage: ['Serviços — Viagens & Turismo'],
      editable: true
    },
    {
      id: 'service-driver',
      section: 'services',
      name: 'Serviço — Motorista à disposição',
      description: 'Imagem do card Motorista à disposição.',
      src: 'assets/img/svc-motorista-1200.jpg',
      alt: 'Motorista executivo abrindo a porta do veículo',
      width: 1200,
      height: 801,
      sizes: '(min-width: 1100px) 30vw, 100vw',
      variants: [
        { src: 'assets/img/svc-motorista-700.jpg', width: 700 },
        { src: 'assets/img/svc-motorista-1200.jpg', width: 1200 }
      ],
      usage: ['Serviços — Motorista à disposição'],
      editable: true
    },
    {
      id: 'map-background',
      section: 'regions',
      name: 'Regiões — fundo do mapa',
      description: 'Fotografia de São Paulo usada atrás do mapa de cobertura.',
      src: 'assets/img/regioes-saopaulo-1600.jpg',
      alt: '',
      width: 1600,
      height: 900,
      sizes: '(min-width: 900px) 58vw, 100vw',
      variants: [
        { src: 'assets/img/regioes-saopaulo-800.jpg', width: 800 },
        { src: 'assets/img/regioes-saopaulo-1600.jpg', width: 1600 }
      ],
      usage: ['Regiões — fundo do mapa'],
      editable: true
    },
    ...galleryImages,
    {
      id: 'cta-image',
      section: 'cta',
      name: 'CTA final — sedã',
      description: 'Fotografia da seção de contato final.',
      src: 'assets/img/cta-sedan-1800.jpg',
      alt: 'Sedã executivo preto diante de um edifício contemporâneo',
      width: 1800,
      height: 1200,
      sizes: '(min-width: 900px) 52vw, 100vw',
      variants: [
        { src: 'assets/img/cta-sedan-900.jpg', width: 900 },
        { src: 'assets/img/cta-sedan-1800.jpg', width: 1800 }
      ],
      usage: ['CTA final'],
      editable: true
    }
  ];

  const sections = [
    { id: 'brand', name: 'Marca', description: 'Identidade visual aplicada ao site.' },
    { id: 'hero', name: 'Hero', description: 'Imagem principal do topo da página.' },
    { id: 'experience', name: 'Experiência', description: 'Fotografia da seção A experiência.' },
    { id: 'services', name: 'Serviços', description: 'Imagens dos cards de serviços.' },
    { id: 'operation', name: 'Operação profissional', description: 'Seção de dados e indicadores, sem fotografias.' },
    { id: 'regions', name: 'Regiões', description: 'Fotografia de fundo do mapa de cobertura.' },
    { id: 'gallery', name: 'Galeria', description: 'Fotografias exibidas na galeria pública.' },
    { id: 'cta', name: 'CTA final', description: 'Fotografia da seção de contato.' }
  ];

  window.MobilityImageCatalog = {
    version: '1.2.0-local',
    mode: 'local',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 8 * 1024 * 1024,
    sections,
    images,
    gallery: galleryImages
  };
})();
