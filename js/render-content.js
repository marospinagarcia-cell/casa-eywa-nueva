// js/render-content.js
//
// Lee content/retiros.json y content/kits.json y construye las tarjetas
// en pantalla. Esto es lo que permite que Ángela edite retiros y kits
// desde el panel de administración (/admin) sin tocar código: ella edita
// los archivos JSON con el CMS, y esta función los convierte en las
// tarjetas visuales que ya conoces.

function esc(str) {
  if (str === undefined || str === null) return '';
  return String(str);
}

function waLink(text) {
  return 'https://wa.me/573118128764?text=' + encodeURIComponent(text);
}

/* ============================================================
   RETIROS — ficha completa (retiros-viajes.html)
   ============================================================ */
function renderRetiroDetalle(r) {
  const metaParts = [r.location, r.date, r.duration].filter(Boolean).join(' · 📅 ');
  const meta = [r.location, r.date, r.duration].filter(Boolean);

  const conceptHtml = (r.conceptParagraphs || []).map(p => `<p>${esc(p)}</p>`).join('');
  const highlightHtml = r.conceptHighlight
    ? `<p style="font-family:var(--font-display); font-style:italic; color:var(--olive); text-align:center; font-size:1.05rem;">${esc(r.conceptHighlight)}</p>`
    : '';
  const closingHtml = r.closingQuote
    ? `<p class="closing" style="text-align:left; font-size:1.02rem;">${esc(r.closingQuote)}</p>`
    : '';
  const hookHtml = r.hook ? `<p class="pd-hook">${esc(r.hook)}</p>` : '';
  const priceHtml = r.price
    ? `<span class="retreat-price-badge">${esc(r.price)}${r.priceNote ? ' · ' + esc(r.priceNote) : ''}</span>`
    : '';
  const imageHtml = r.image
    ? `<img src="${esc(r.image)}" alt="Retiro ${esc(r.name)}" style="width:100%; aspect-ratio:16/9; object-fit:cover; border-radius:16px; margin-bottom:24px;">`
    : '';
  const includesHtml = (r.includes || []).map(i => `<li>${esc(i)}</li>`).join('');

  return `
    <article class="program-detail tone-${esc(r.tone)}" id="${esc(r.id)}">
      ${imageHtml}
      <div class="pd-head">
        <span class="pd-ico">${esc(r.icon)}</span>
        <h2>${esc(r.name)}</h2>
      </div>
      ${hookHtml}
      <p class="retreat-meta" style="margin-bottom:18px;">📍 ${meta.length ? meta.join(' · 📅 ') : ''}</p>
      <div class="pd-grid">
        <div class="pd-block">
          <h4>Concepto</h4>
          ${conceptHtml}
          ${highlightHtml}
          ${closingHtml}
        </div>
        <div class="pd-block">
          <div class="pd-how">
            ${priceHtml}
            <h4>Incluye</h4>
            <ul class="pd-list" style="margin-bottom:0;">${includesHtml}</ul>
          </div>
          <div class="pd-cta">
            <a href="${waLink(r.ctaWhatsapp || ('Hola, quiero conocer la experiencia ' + r.name))}" target="_blank" rel="noopener" class="btn btn-primary">${esc(r.ctaLabel || 'Quiero conocer esta experiencia →')}</a>
          </div>
        </div>
      </div>
    </article>`;
}

/* ============================================================
   RETIROS — tarjeta corta (index.html, "Retiros destacados")
   ============================================================ */
function renderRetiroHome(r) {
  const meta = [r.location, r.date, r.duration].filter(Boolean).join(' · ');
  const imageHtml = r.image
    ? `<img src="${esc(r.image)}" alt="Retiro ${esc(r.name)}" class="retreat-photo">`
    : '';
  return `
    <article class="retreat-card">
      ${imageHtml}
      <span class="badge">Cupos limitados</span>
      <h3>${esc(r.name)}</h3>
      <p class="retreat-meta">${meta}</p>
      <p>${esc(r.shortBlurb)}</p>
      <a href="retiros-viajes.html#${esc(r.id)}" class="card-link">Quiero vivir esta experiencia →</a>
    </article>`;
}

/* ============================================================
   TIENDA — tarjeta de kit
   ============================================================ */
function renderKit(k) {
  const forYouHtml = (k.forYou || []).map(i => `<li>${esc(i)}</li>`).join('');
  const priceClass = (!k.price || k.price === 0) ? 'kit-price kit-price-pending' : 'kit-price';
  const ctaHtml = (k.price && k.price > 0)
    ? `<button type="button" class="btn btn-outline bold-pay-btn" data-kit-name="${esc(k.name)}" data-kit-price="${esc(k.price)}">Quiero llevarlo conmigo →</button>`
    : `<a href="${waLink('Hola, quiero el ' + k.name)}" target="_blank" rel="noopener" class="btn btn-outline">Quiero llevarlo conmigo →</a>`;

  return `
    <article class="kit-card tone-${esc(k.tone)}" id="${esc(k.id)}">
      <div class="kit-head"><span class="kit-ico">${esc(k.icon)}</span><h3>${esc(k.name)}</h3></div>
      <p class="${priceClass}">${esc(k.priceLabel)}</p>
      <p class="kit-hook">${esc(k.hook)}</p>
      <p>${esc(k.description)}</p>
      <h4>Puede ser para ti si…</h4>
      <ul class="pd-list">${forYouHtml}</ul>
      <h4>Qué encontrarás</h4>
      <p class="kit-includes">${esc(k.includes)}</p>
      <div class="kit-cta">${ctaHtml}</div>
    </article>`;
}

/* ============================================================
   GALERÍA — marquee dinámico (fotos y videos)
   ============================================================ */
function renderGalleryTile(item, hidden) {
  const hiddenAttrs = hidden ? ' aria-hidden="true" tabindex="-1"' : '';
  const altHidden = hidden ? '' : esc(item.alt);

  if (item.type === 'video') {
    return `<button class="gallery-item" data-type="video" data-full="${esc(item.src)}"${hiddenAttrs}>
      <video src="${esc(item.src)}" muted autoplay loop playsinline preload="metadata"></video>
      ${hidden ? '' : '<span class="video-badge">▶ Video</span>'}
    </button>`;
  }
  return `<button class="gallery-item" data-type="image" data-full="${esc(item.src)}"${hiddenAttrs}>
    <img src="${esc(item.src)}" alt="${altHidden}" loading="lazy">
  </button>`;
}

function renderGallery(items) {
  if (!items || !items.length) return '';

  const mid = Math.ceil(items.length / 2);
  const rowAItems = items.slice(0, mid);
  const rowBItems = items.length > mid ? items.slice(mid) : items; // si hay pocos elementos, reusa todos en la fila B

  const buildRow = (rowItems) => {
    const visible = rowItems.map(it => renderGalleryTile(it, false)).join('');
    const duplicate = rowItems.map(it => renderGalleryTile(it, true)).join(''); // duplicado para el loop continuo
    return visible + duplicate;
  };

  return `
    <div class="marquee-row row-a">${buildRow(rowAItems)}</div>
    <div class="marquee-row row-b">${buildRow(rowBItems)}</div>`;
}

/* ============================================================
   CARGA Y RENDERIZADO
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  // Galería (fotos y videos) — index.html
  const galleryEl = document.getElementById('gallery-marquee');
  if (galleryEl) {
    fetch('content/galeria.json')
      .then(r => r.json())
      .then(json => {
        galleryEl.innerHTML = renderGallery(json.items || []);
      })
      .catch(err => console.error('Error cargando galería:', err));
  }


  // Ficha completa de retiros (retiros-viajes.html)
  const retirosDetalle = document.getElementById('retiros-list');
  if (retirosDetalle) {
    fetch('content/retiros.json')
      .then(r => r.json())
      .then(json => {
        retirosDetalle.innerHTML = (json.items || []).map(renderRetiroDetalle).join('');
      })
      .catch(err => console.error('Error cargando retiros:', err));
  }

  // Tarjetas cortas de retiros (index.html)
  const retirosHome = document.getElementById('retiros-home-list');
  if (retirosHome) {
    fetch('content/retiros.json')
      .then(r => r.json())
      .then(json => {
        retirosHome.innerHTML = (json.items || []).map(renderRetiroHome).join('');
      })
      .catch(err => console.error('Error cargando retiros:', err));
  }

  // Kits de la tienda (tienda.html)
  const kitsList = document.getElementById('kits-list');
  if (kitsList) {
    fetch('content/kits.json')
      .then(r => r.json())
      .then(json => {
        kitsList.innerHTML = (json.items || []).map(renderKit).join('');
      })
      .catch(err => console.error('Error cargando kits:', err));
  }
});
