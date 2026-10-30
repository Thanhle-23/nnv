(() => {

  'use strict';

  const data = window.NepVietData;

  if (!data) {

    console.error('Thiếu file content-data.js. Kiểm tra đường dẫn ../js/content-data.js');

    return;

  }

  // Tránh đưa ký tự HTML trong nội dung dữ liệu vào thành thẻ HTML thật.
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  const findById = (group, id) => data[group].find(item => item.id === id);

  const url = (type, id) => `./chi-tiet-${type}.html?id=${encodeURIComponent(id)}`;

  const normalize = value => String(value ?? '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();

  // Tự động chuẩn hóa mọi link YouTube sang dạng nhúng /embed/
  function toYoutubeEmbedUrl(rawUrl) {
    const text = String(rawUrl || '').trim();
    if (!text) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    if (text.includes('youtube.com/embed/')) return text;

    const shortMatch = text.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    const watchMatch = text.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    const shortsMatch = text.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

    return text;
  }

  const card = (image, alt, label, title, description, link, action, extras = '') => `
    <article class="content-card reveal is-visible ${extras}">
      <a class="content-card-image" href="${esc(link)}">
        <img src="${esc(image)}" alt="${esc(alt)}" loading="lazy">
      </a>
      <div class="content-card-body">
        <p class="card-kicker">${esc(label)}</p>
        <h2><a href="${esc(link)}">${esc(title)}</a></h2>
        <p>${esc(description)}</p>
      </div>
    </article>`;

  function installImageFallback(scope, customFallback) {
    if (!scope) return;
    scope.querySelectorAll('img').forEach(img => {
      if (img.dataset.fallbackReady) return;
      img.dataset.fallbackReady = '1';
      img.addEventListener('error', () => {
        if (img.dataset.fallbackStage === '2') return;
        if (!img.dataset.fallbackStage && customFallback && img.src !== customFallback) {
          img.dataset.fallbackStage = '1';
          img.src = customFallback;
          return;
        }
        img.dataset.fallbackStage = '2';
        img.src = '../images/minh-hoa-chung.svg';
      });
    });
  }

  function setupArtistFilters(grid) {
    const search = document.getElementById('artist-search');
    const craft = document.getElementById('artist-craft');
    const province = document.getElementById('artist-place');
    const empty = document.getElementById('artist-empty');

    if (!search || !craft || !province) return;

    function applyFilters() {
      const q = normalize(search.value);
      const c = normalize(craft.value);
      const p = normalize(province.value);

      let count = 0;

      grid.querySelectorAll('.artist-list-card').forEach(el => {
        const searchable = normalize(`
          ${el.dataset.name || ''}
          ${el.dataset.craft || ''}
          ${el.dataset.place || ''}
          ${el.dataset.province || ''}
        `);

        const matches =
          (!q || searchable.includes(q)) &&
          (!c || normalize(el.dataset.craft) === c) &&
          (!p || normalize(el.dataset.province) === p);

        el.hidden = !matches;
        el.style.display = matches ? '' : 'none';

        if (matches) {
          count += 1;
        }
      });

      if (empty) {
        empty.hidden = count !== 0;
      }
    }

    search.addEventListener('input', applyFilters);
    search.addEventListener('search', applyFilters);
    craft.addEventListener('change', applyFilters);
    province.addEventListener('change', applyFilters);

    applyFilters();
  }

  function renderList(group) {
    const grid = document.querySelector('#artist-grid, #product-grid, #story-grid');
    if (!grid) return;

    if (group === 'artists') {
      grid.innerHTML = data.artists.map(a => card(
        a.image,
        `Minh họa nghề ${a.craft.toLowerCase()} của ${a.name}`,
        `${a.craft} · ${a.place}`,
        a.name,
        a.description,
        url('nghe-nhan', a.id),
        ' ',
        'artist-list-card'
      )).join('');

      grid.querySelectorAll('.artist-list-card').forEach((el, i) => {
        const a = data.artists[i];
        el.dataset.name = a.name;
        el.dataset.craft = a.craft;
        el.dataset.place = a.place;
        el.dataset.province = a.province;
      });

      setupArtistFilters(grid);
    } else if (group === 'products') {
      grid.innerHTML = data.products.map(p => card(
        p.image,
        `Hình minh họa ${p.name}`,
        `${p.craft} · ${p.place}`,
        p.name,
        `${p.description} Chất liệu: ${p.material}.`,
        url('san-pham', p.id),
        'Xem chi tiết'
      )).join('');
    } else {
      grid.innerHTML = data.stories.map(s => card(
        s.image,
        `Hình minh họa ${s.title}`,
        s.category,
        s.title,
        s.description,
        url('cau-chuyen', s.id),
        'Đọc câu chuyện'
      )).join('');
    }

    installImageFallback(grid);
  }

  function requestedId() {
    const params = new URLSearchParams(location.search);
    if (!params.has('id')) return 1;
    const text = params.get('id');
    if (!/^\d+$/.test(text || '')) return null;
    const parsed = Number(text);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }

  function pageMissing(kind, backLink) {
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = `<section class="section-pad"><div class="container">
      <h1>Không tìm thấy ${esc(kind)} này</h1>
      <p>ID không hợp lệ hoặc nội dung chưa có trong dữ liệu minh họa.</p>
      <a class="card-link" href="${esc(backLink)}">← Quay lại danh sách</a>
    </div></section>`;
    document.title = `Không tìm thấy ${kind} | Nghệ nhân Việt`;
  }

  function setPageIdentity(name, title) {
    document.title = `${title} | Nghệ nhân Việt`;
    const headline = document.querySelector('.page-hero h1');
    const crumb = document.querySelector('.breadcrumb [aria-current="page"]');
    if (headline) headline.textContent = title;
    if (crumb) crumb.textContent = name;
  }

  /* =====================================================
     CHI TIẾT NGHỆ NHÂN (BỐ CỤC MỚI)
     - Trang đầu: Cột trái (Ảnh, tên, nút Xem sản phẩm + Yêu thích) | Cột phải (Hành trình & Kỹ năng)
     - Trang tiếp theo: Video YouTube
     - Phía dưới: Album 5 ảnh (< >) bên trái | Khung Trải nghiệm cùng nghệ nhân bên phải
  ===================================================== */
  function renderArtistDetail() {
    const artist = findById('artists', requestedId());

    if (!artist) {
      return pageMissing('nghệ nhân', './nghe-nhan.html');
    }

    setPageIdentity(artist.name, 'Chân dung người giữ nghề');

    const side = document.querySelector('.detail-side');
    const content = document.querySelector('.detail-content');

    if (!side || !content) {
      return;
    }

    const product =
      (artist.productId ? findById('products', artist.productId) : null) ||
      (Array.isArray(data.products)
        ? data.products.find(item => Number(item.artistId) === Number(artist.id))
        : null);

    const productHref = product
      ? url('san-pham', product.id)
      : './san-pham.html';

    const experience = Array.isArray(data.experiences)
      ? data.experiences.find(item => Number(item.artistId) === Number(artist.id))
      : null;

    const experienceHref = experience
      ? url('trai-nghiem', experience.id)
      : './trai-nghiem.html';

    // 1. CỘT TRÁI TRANG ĐẦU: Đổi nút thành "Xem sản phẩm"
    side.innerHTML = `
      <img
        class="detail-portrait"
        src="${esc(artist.image)}"
        alt="Minh họa về nghề ${esc(artist.craft.toLowerCase())} của ${esc(artist.name)}"
      >
      <p class="card-kicker">
        ${esc(artist.craft)} · ${esc(artist.place)}
      </p>
      <h2>${esc(artist.name)}</h2>
      <p>${esc(artist.subtitle)}</p>
      <div class="artist-actions">
        <a class="button button-dark" href="${esc(productHref)}">
          Xem sản phẩm <span aria-hidden="true">↗</span>
        </a>
      </div>
    `;

    // 2. CỘT PHẢI TRANG ĐẦU: Hành trình & Kỹ năng
    content.innerHTML = `
      <h2>
        ${esc(artist.headline)}
        <br>
        <em>${esc(artist.accent)}</em>
      </h2>
      <h3>Hành trình theo nghề</h3>
      <p>${esc(artist.journey)}</p>
      <h3>Kỹ năng và kinh nghiệm</h3>
      <ul class="check-list">
        ${artist.skills.map(item => `<li>${esc(item)}</li>`).join('')}
      </ul>
      ${artist.quote ? `<blockquote class="pull-quote">“${esc(artist.quote)}”</blockquote>` : ''}
    `;

    // 3. TẦNG TIẾP THEO (VIDEO YOUTUBE) & TẦNG DƯỚI (ALBUM 5 ẢNH + TRẢI NGHIỆM)
    let extraContainer = document.getElementById('artist-extra-sections');
    if (!extraContainer) {
      const detailLayout = document.querySelector('.detail-layout');
      if (detailLayout && detailLayout.parentElement) {
        extraContainer = document.createElement('div');
        extraContainer.id = 'artist-extra-sections';
        extraContainer.className = 'container artist-extra-sections';
        detailLayout.insertAdjacentElement('afterend', extraContainer);
      }
    }

    if (extraContainer) {
      const albumImages = Array.isArray(artist.album) && artist.album.length
        ? artist.album
        : [
            artist.image,
            product ? product.image : artist.image,
            artist.image,
            product ? product.image : artist.image,
            artist.image
          ];

      const youtubeEmbed = toYoutubeEmbedUrl(artist.youtubeUrl);

      extraContainer.innerHTML = `
        <!-- VIDEO YOUTUBE -->
        <div class="artist-youtube-section" aria-label="Video giới thiệu nghệ nhân ${esc(artist.name)}">
          <div class="artist-youtube-frame">
            <iframe
              class="artist-youtube-iframe"
              src="${esc(youtubeEmbed)}"
              title="Video giới thiệu nghệ nhân ${esc(artist.name)}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        </div>
        

        <!-- HÀNG DƯỚI: TRÁI = ALBUM 5 ẢNH (< >) | PHẢI = KHUNG PHẦN TRẢI NGHIỆM -->
        <div class="artist-bottom-row">

          <div
            class="artist-album"
            id="artist-album"
            aria-label="Album hình ảnh nghệ nhân ${esc(artist.name)}"
          >
            <div class="artist-album-slides">
              ${albumImages.map((imgSrc, index) => `
                <figure class="artist-album-slide ${index === 0 ? 'is-active' : ''}">
                  <img
                    src="${esc(imgSrc)}"
                    alt="${esc(artist.name)} - Hình ${index + 1}"
                    loading="lazy"
                  >
                </figure>
              `).join('')}
            </div>

            <span class="artist-album-badge">
              Album ảnh · <strong class="artist-album-counter">1 / ${albumImages.length}</strong>
            </span>

            <button
              class="artist-album-btn artist-album-prev"
              type="button"
              aria-label="Xem ảnh trước"
            >
              <span aria-hidden="true">◀</span>
            </button>

            <button
              class="artist-album-btn artist-album-next"
              type="button"
              aria-label="Xem ảnh tiếp theo"
            >
              <span aria-hidden="true">▶</span>
            </button>
          </div>

          <div class="artist-experience-box">
            <div class="artist-experience-card">
              <p class="card-kicker">Hoạt động gắn kết</p>
              <h3>Trải nghiệm cùng nghệ nhân</h3>
              <p>${esc(artist.experience)}</p>
              <a class="button button-dark" href="${esc(experienceHref)}">
                Khám phá trải nghiệm <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

        </div>

        <p class="back-link">
          <a href="./nghe-nhan.html">← Quay lại danh sách nghệ nhân</a>
        </p>
      `;

      // Gắn sự kiện chuyển ảnh bằng 2 nút < (◀) và > (▶) cho Album nghệ nhân
      const albumEl = extraContainer.querySelector('#artist-album');
      if (albumEl) {
        const slides = Array.from(albumEl.querySelectorAll('.artist-album-slide'));
        const prevBtn = albumEl.querySelector('.artist-album-prev');
        const nextBtn = albumEl.querySelector('.artist-album-next');
        const counterEl = albumEl.querySelector('.artist-album-counter');
        let currentIndex = 0;

        const showSlide = nextIndex => {
          if (!slides.length) return;
          currentIndex = (nextIndex + slides.length) % slides.length;
          slides.forEach((slide, idx) => {
            slide.classList.toggle('is-active', idx === currentIndex);
          });
          if (counterEl) {
            counterEl.textContent = `${currentIndex + 1} / ${slides.length}`;
          }
        };

        if (prevBtn) {
          prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
        }
      }
    }

    installImageFallback(document.querySelector('main'), artist.image);
  }

  /* =====================================================
     CHI TIẾT SẢN PHẨM (ÁP DỤNG ĐỘNG CHO CẢ 10 SẢN PHẨM)
     - Hàng 1: Ảnh chính (trái) + Tên & Nội dung mô tả (phải)
     - Hàng 2: Thông tin chi tiết & Nút bấm (trái) + Album 5 ảnh < > (phải)
     - Hàng 3: Video của sản phẩm
  ===================================================== */
  function renderProductDetail() {
    const product = findById('products', requestedId());

    if (!product) {
      return pageMissing('sản phẩm', './san-pham.html');
    }

    setPageIdentity(product.shortName, product.shortName);

    const area = document.querySelector('.product-detail');
    if (!area) return;

    const artist = product.artistId
      ? findById('artists', product.artistId)
      : null;

    const personText = artist ? artist.name : 'Chưa cập nhật';

    // Lấy danh sách 5 ảnh album riêng của sản phẩm từ content-data.js
    const albumImages = Array.isArray(product.album) && product.album.length
      ? product.album
      : [
          product.image,
          artist ? artist.image : product.image,
          product.image,
          artist ? artist.image : product.image,
          product.image
        ];

    const videoSrc = product.video || `../images/video-san-pham-${product.id}.mp4`;

    area.innerHTML = `
      <!-- HÀNG 1 (TRANG ĐẦU): TRÁI = ẢNH CHÍNH | PHẢI = TÊN + NỘI DUNG MÔ TẢ -->
      <div class="product-top-row">

        <div class="product-image">
          <img
            src="${esc(product.image)}"
            alt="${esc(product.shortName)}"
            loading="eager"
          >
        </div>

        <div class="product-copy">
          <h2>${esc(product.shortName)}</h2>
          <p>${esc(product.detail)}</p>
        </div>

      </div>

      <!-- HÀNG 2 (TRANG DƯỚI): TRÁI = THÔNG TIN ĐÃ CÓ + NÚT | PHẢI = ALBUM 5 HÌNH CÓ NÚT < > -->
      <div class="product-middle-row">

        <div class="product-info-col">

          <dl class="product-facts">
            <div>
              <dt>Chất liệu</dt>
              <dd>${esc(product.material)}</dd>
            </div>
            <div>
              <dt>Nghệ nhân</dt>
              <dd>${esc(personText)}</dd>
            </div>
            <div>
              <dt>Nguồn gốc</dt>
              <dd>${esc(product.origin)}</dd>
            </div>
            <div>
              <dt>Ý nghĩa</dt>
              <dd>${esc(product.meaning)}</dd>
            </div>
          </dl>

          <div class="product-actions">
            ${
              artist
                ? `
                  <a
                    class="product-action-button product-action-primary"
                    href="${url('nghe-nhan', artist.id)}"
                  >
                    Xem nghệ nhân
                    <span aria-hidden="true">↗</span>
                  </a>
                `
                : ''
            }
            <!-- luutam.js chèn nút Yêu thích vào đây -->
            <div class="product-favorite-slot"></div>
          </div>

        </div>

        <div
          class="product-album"
          id="product-album"
          aria-label="Album hình ảnh ${esc(product.shortName)}"
        >
          <div class="product-album-slides">
            ${albumImages.map((imgSrc, index) => `
              <figure class="product-album-slide ${index === 0 ? 'is-active' : ''}">
                <img
                  src="${esc(imgSrc)}"
                  alt="${esc(product.shortName)} - Hình ${index + 1}"
                  loading="lazy"
                >
              </figure>
            `).join('')}
          </div>

          <span class="product-album-badge">
            Album ảnh · <strong class="product-album-counter">1 / ${albumImages.length}</strong>
          </span>

          <button
            class="product-album-btn product-album-prev"
            type="button"
            aria-label="Xem ảnh trước"
          >
            <span aria-hidden="true">◀</span>
          </button>

          <button
            class="product-album-btn product-album-next"
            type="button"
            aria-label="Xem ảnh tiếp theo"
          >
            <span aria-hidden="true">▶</span>
          </button>
        </div>

      </div>

      <!-- HÀNG 3 (PHÍA DƯỚI): VIDEO CỦA SẢN PHẨM -->
      <div class="product-video-section" aria-label="Video giới thiệu ${esc(product.shortName)}">
        <div class="product-video-frame">
          <video
            class="product-video-player"
            controls
            playsinline
            preload="metadata"
            poster="${esc(product.image)}"
          >
            <source src="${esc(videoSrc)}" type="video/mp4">
            Trình duyệt của bạn không hỗ trợ phát video.
          </video>
          <span class="product-video-tag">Video · ${esc(product.shortName)}</span>
        </div>
      </div>
    `;

    // Gắn sự kiện chuyển ảnh bằng 2 nút < (◀) và > (▶) cho Album
    const albumEl = area.querySelector('#product-album');
    if (albumEl) {
      const slides = Array.from(albumEl.querySelectorAll('.product-album-slide'));
      const prevBtn = albumEl.querySelector('.product-album-prev');
      const nextBtn = albumEl.querySelector('.product-album-next');
      const counterEl = albumEl.querySelector('.product-album-counter');
      let currentIndex = 0;

      const showSlide = nextIndex => {
        if (!slides.length) return;
        currentIndex = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, idx) => {
          slide.classList.toggle('is-active', idx === currentIndex);
        });
        if (counterEl) {
          counterEl.textContent = `${currentIndex + 1} / ${slides.length}`;
        }
      };

      if (prevBtn) {
        prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
      }
    }

    // Nếu trang vẫn còn thẻ .timeline thì cập nhật, không có cũng không lỗi
    const timeline = document.querySelector('.timeline');
    if (timeline && Array.isArray(product.steps)) {
      timeline.innerHTML = product.steps.map(([heading, description], index) => `
        <li>
          <span class="timeline-number">${String(index + 1).padStart(2, '0')}</span>
          <div>
            <h3>${esc(heading)}</h3>
            <p>${esc(description)}</p>
          </div>
        </li>
      `).join('');
    }

    installImageFallback(document.querySelector('main'), product.image);
  }

  function renderStoryDetail() {
    const story = findById('stories', requestedId());
    if (!story) return pageMissing('câu chuyện', './cau-chuyen-van-hoa.html');

    setPageIdentity(story.shortTitle, story.title);

    const root = document.querySelector('.story-article');
    if (!root) return;

    const artist = story.artistId ? findById('artists', story.artistId) : null;

    const sections = story.sections.map(s => `
      <section class="story-section">
        <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
        ${s.imageAfter ? `<figure class="article-figure story-inline-figure">
          <img src="${esc(story.inlineImage)}" alt="Hình minh họa ${esc(story.category.toLowerCase())}" loading="lazy">
          <figcaption>Hình ảnh minh họa cho câu chuyện.</figcaption>
        </figure>` : ''}
      </section>`).join('');

    root.innerHTML = `
      <header class="article-header">
        <p class="card-kicker">${esc(story.category)} · Nội dung minh họa</p>
        <h2 class="article-title">${esc(story.title)}</h2>
        <p class="article-lead">${esc(story.lead)}</p>
      </header>
      <figure class="article-figure article-cover-wrap">
        <img class="article-cover" src="${esc(story.image)}" alt="Hình minh họa ${esc(story.title)}" loading="eager">
        <figcaption>Hình ảnh minh họa, không phải tư liệu đã xác minh.</figcaption>
      </figure>
      <div class="article-body">
        <p class="article-opening">${esc(story.opening)}</p>
        ${sections}
        <blockquote class="pull-quote">“${esc(story.quote)}”</blockquote>
        ${artist ? `<aside class="story-related" aria-label="Thông tin liên quan">
          <div><p class="related-label">Khám phá thêm</p><h3>Thông tin liên quan</h3>
          <p>Nghệ nhân minh họa: <strong>${esc(artist.name)}</strong> · Nghề: ${esc(artist.craft.toLowerCase())}.</p></div>
          <a class="card-link" href="${url('nghe-nhan', artist.id)}">Xem hồ sơ nghệ nhân <span aria-hidden="true">↗</span></a>
        </aside>` : ''}
        <p class="back-link"><a href="./cau-chuyen-van-hoa.html">← Quay lại danh sách câu chuyện</a></p>
      </div>`;

    installImageFallback(root);
  }

  /* DANH SÁCH TRẢI NGHIỆM */
  function renderExperiences() {
    const grid = document.getElementById('experience-grid');
    if (!grid) return;

    grid.innerHTML = (data.experiences || []).map(experience => {
      const artist = experience.artistId
        ? findById('artists', experience.artistId)
        : null;
      const guide = artist ? artist.name + ' (minh họa)' : 'Chưa cập nhật';

      return `
        <article class="content-card experience-card reveal is-visible">
          <a class="content-card-image" href="${url('trai-nghiem', experience.id)}">
            <img src="${esc(experience.image)}" alt="Hình minh họa: ${esc(experience.title)}" loading="lazy">
          </a>
          <div class="content-card-body">
            <p class="card-kicker">${esc(experience.place)} · ${esc(experience.duration)}</p>
            <h2><a href="${url('trai-nghiem', experience.id)}">${esc(experience.title)}</a></h2>
            <p><strong>Người hướng dẫn:</strong> ${esc(guide)}<br>${esc(experience.summary)}</p>
            <a class="card-link" href="${url('trai-nghiem', experience.id)}">Xem chi tiết <span aria-hidden="true">↗</span></a>
          </div>
        </article>`;
    }).join('');

    installImageFallback(grid);
  }

  /* CHI TIẾT TRẢI NGHIỆM: HIỂN THỊ THEO ?id=... */
  function renderExperienceDetail() {
    const experience = findById('experiences', requestedId());

    if (!experience) {
      return pageMissing('trải nghiệm', './trai-nghiem.html');
    }

    setPageIdentity(experience.shortTitle, experience.title);

    const cover = document.getElementById('experience-cover');
    const content = document.getElementById('experience-info');
    const tripPanel = document.getElementById('experience-trip-panel');
    const map = document.getElementById('experience-map');
    const mapLink = document.getElementById('experience-map-link');
    const heroDescription = document.querySelector('.page-hero p:not(.eyebrow)');
    const placeBadge = document.getElementById('experience-place-badge');
    const durationBadge = document.getElementById('experience-duration-badge');

    if (heroDescription) {
      heroDescription.textContent = experience.summary;
    }

    if (placeBadge) {
      placeBadge.textContent = experience.place;
    }

    if (durationBadge) {
      durationBadge.textContent = experience.duration;
    }

    if (cover) {
      cover.src = experience.image;
      cover.alt = `Hình minh họa: ${experience.title}`;
    }

    const artist = experience.artistId
      ? findById('artists', experience.artistId)
      : null;

    const guide = artist ? artist.name : 'Chưa cập nhật';

    const sources = Array.isArray(experience.sources) && experience.sources.length
      ? `
        <h3>Nguồn tham khảo</h3>
        <ul class="source-list">
          ${experience.sources.map(source => `
            <li>
              <a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">
                <strong>${esc(source.publisher)}</strong><br>
                ${esc(source.title)}
              </a>
            </li>
          `).join('')}
        </ul>
      `
      : '';

    if (content) {
      content.innerHTML = `
        <p class="eyebrow">
          <span></span>
          Hoạt động trải nghiệm
        </p>
        <h2>
          ${esc(experience.headline)}
          <br>
          <em>${esc(experience.accent)}</em>
        </h2>
        <p class="experience-intro">${esc(experience.intro)}</p>
        <h3>Bạn sẽ trải nghiệm gì?</h3>
        <ul class="check-list">
          ${experience.activities.map(item => `<li>${esc(item)}</li>`).join('')}
        </ul>
        ${sources}
      `;
    }

    const actionsHTML = `
      <div class="experience-actions">
        <button class="button button-dark" type="button" id="show-booking">
          Đăng ký trải nghiệm <span aria-hidden="true">↗</span>
        </button>
        <button class="button experience-favorite-button" type="button" id="favorite-experience" aria-pressed="false">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M12 20.4 4.2 13 A5.3 5.3 0 0 1 11.7 5.5 L12 5.8 l.3-.3 A5.3 5.3 0 0 1 19.8 13 L12 20.4Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <span>Yêu thích</span>
        </button>
      </div>
      <p class="experience-notice" id="experience-notice" hidden></p>
    `;

    if (tripPanel) {
      tripPanel.innerHTML = `
        <div class="trip-panel-inner">
          <p class="trip-kicker">Thông tin chuyến đi</p>
          <h2>Trải nghiệm làng nghề</h2>
          <dl class="trip-facts">
            <div>
              <dt>Địa điểm</dt>
              <dd>${esc(experience.place)}</dd>
            </div>
            <div>
              <dt>Thời lượng</dt>
              <dd>${esc(experience.duration)}</dd>
            </div>
            <div>
              <dt>Nghệ nhân</dt>
              <dd>${esc(guide)}</dd>
            </div>
          </dl>
          ${
            artist
              ? `
                <a class="trip-artist-link" href="${url('nghe-nhan', artist.id)}">
                  Xem hồ sơ nghệ nhân <span aria-hidden="true">↗</span>
                </a>
              `
              : ''
          }
          <p class="trip-note">
            * Lịch tổ chức và khả năng tham gia cần được xác nhận với cơ sở trước khi xem là lịch đặt thực tế.
          </p>
          ${actionsHTML}
        </div>
      `;
    } else if (content) {
      content.insertAdjacentHTML('beforeend', actionsHTML);
    }

    if (map && experience.mapQuery) {
      map.title = `Bản đồ khu vực tham khảo: ${experience.place}`;
      map.src = `https://www.google.com/maps?q=${encodeURIComponent(experience.mapQuery)}&output=embed`;
    }

    if (mapLink && experience.mapQuery) {
      mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(experience.mapQuery)}`;
    }

    installImageFallback(document.querySelector('main'));
  }

  function start() {
    const page = document.body.dataset.page;
    switch (page) {
      case 'artists': renderList('artists'); break;
      case 'products': renderList('products'); break;
      case 'stories': renderList('stories'); break;
      case 'artist-detail': renderArtistDetail(); break;
      case 'product-detail': renderProductDetail(); break;
      case 'story-detail': renderStoryDetail(); break;
      case 'experiences': renderExperiences(); break;
      case 'experience-detail': renderExperienceDetail(); break;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

})();