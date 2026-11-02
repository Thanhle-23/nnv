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
      const featuredMain = document.getElementById('story-featured-main');
      const featuredSub = document.getElementById('story-featured-sub');
      const moreList = document.getElementById('story-more-list');
      const stories = Array.isArray(data.stories) ? data.stories : [];

      if (featuredMain && featuredSub && moreList) {
        const heroStory = stories[0];
        const subStories = stories.slice(1, 4);
        const moreStories = stories.slice(4);

        if (heroStory) {
          const heroLink = url('cau-chuyen', heroStory.id);
          featuredMain.innerHTML = `
            <article class="story-hero-card reveal is-visible">
              <a class="story-hero-image" href="${esc(heroLink)}">
                <img
                  src="${esc(heroStory.image)}"
                  alt="${esc(heroStory.title)}"
                  loading="eager"
                >
              </a>
              <p class="story-kicker">${esc(heroStory.category)}</p>
              <h3 class="story-hero-title">
                <a href="${esc(heroLink)}">${esc(heroStory.title)}</a>
              </h3>
              <p class="story-hero-desc">${esc(heroStory.description)}</p>
            </article>
          `;
        }

        featuredSub.innerHTML = subStories.map(s => {
          const storyLink = url('cau-chuyen', s.id);
          return `
            <article class="story-sub-card reveal is-visible">
              <a class="story-sub-image" href="${esc(storyLink)}">
                <img
                  src="${esc(s.image)}"
                  alt="${esc(s.title)}"
                  loading="lazy"
                >
              </a>
              <p class="story-kicker">${esc(s.category)}</p>
              <h3 class="story-sub-title">
                <a href="${esc(storyLink)}">${esc(s.title)}</a>
              </h3>
            </article>
          `;
        }).join('');

        moreList.innerHTML = moreStories.map(s => {
          const storyLink = url('cau-chuyen', s.id);
          return `
            <article class="story-more-item reveal is-visible">
              <a class="story-more-thumb" href="${esc(storyLink)}">
                <img
                  src="${esc(s.image)}"
                  alt="${esc(s.title)}"
                  loading="lazy"
                >
              </a>
              <div class="story-more-body">
                <p class="story-kicker">${esc(s.category)}</p>
                <h3 class="story-more-title">
                  <a href="${esc(storyLink)}">${esc(s.title)}</a>
                </h3>
              </div>
            </article>
          `;
        }).join('');
      } else {
        grid.innerHTML = stories.map(s => card(
          s.image,
          `Hình minh họa ${s.title}`,
          s.category,
          s.title,
          s.description,
          url('cau-chuyen', s.id),
          'Đọc câu chuyện'
        )).join('');
      }
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
     CHI TIẾT NGHỆ NHÂN
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
     CHI TIẾT SẢN PHẨM
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

  /* =====================================================
     CHI TIẾT CÂU CHUYỆN (BỐ CỤC 2 CỘT)
  ===================================================== */
  function renderStoryDetail() {
    const story = findById('stories', requestedId());
    if (!story) return pageMissing('câu chuyện', './cau-chuyen-van-hoa.html');

    setPageIdentity(story.shortTitle, story.title);

    const root = document.querySelector('.story-article');
    if (!root) return;

    const artist = story.artistId ? findById('artists', story.artistId) : null;
    const product = story.artistId
      ? (Array.isArray(data.products)
          ? data.products.find(item => Number(item.artistId) === Number(story.artistId))
          : null)
      : null;

    const sections = Array.isArray(story.sections) ? story.sections : [];
    const image1 = story.image;
    const image2 = story.inlineImage || (product ? product.image : story.image);

    let content1HTML = '';
    let content2HTML = '';
    let content3HTML = '';

    if (sections.length >= 3) {
      content1HTML = `
        <div class="story-content-block">
          <p class="article-lead">${esc(story.lead)}</p>
          <p>${esc(story.opening)}</p>
          <h3>${esc(sections[0].title)}</h3>
          <p>${esc(sections[0].text)}</p>
        </div>
      `;

      content2HTML = `
        <div class="story-content-block">
          <h3>${esc(sections[1].title)}</h3>
          <p>${esc(sections[1].text)}</p>
        </div>
      `;

      content3HTML = `
        <div class="story-content-block">
          ${sections.slice(2).map(s => `
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
          `).join('')}
        </div>
      `;
    } else {
      content1HTML = `
        <div class="story-content-block">
          <p class="article-lead">${esc(story.lead)}</p>
          <p>${esc(story.opening)}</p>
        </div>
      `;

      content2HTML = sections[0]
        ? `
          <div class="story-content-block">
            <h3>${esc(sections[0].title)}</h3>
            <p>${esc(sections[0].text)}</p>
          </div>
        `
        : '';

      content3HTML = sections[1]
        ? `
          <div class="story-content-block">
            <h3>${esc(sections[1].title)}</h3>
            <p>${esc(sections[1].text)}</p>
          </div>
        `
        : '';
    }

    const sourcesHTML = Array.isArray(story.sources) && story.sources.length
      ? `
        <div class="story-sources">
          <h3>Nguồn tham khảo</h3>
          <ul class="story-source-list">
            ${story.sources.map(src => `
              <li>
                <a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">
                  ${esc(src.title)}
                </a>
                <span class="story-source-publisher">${esc(src.publisher)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `
      : '';

    root.innerHTML = `
      <header class="article-header">
        <p class="card-kicker">${esc(story.category)}</p>
        <h1 class="article-title">${esc(story.title)}</h1>
        <div class="article-meta">
          <span class="article-meta-dot" aria-hidden="true"></span>
          <span>${artist ? `Nghệ nhân ${esc(artist.name)} · ${esc(artist.place)}` : esc(story.category)}</span>
        </div>
      </header>

      <div class="article-body">
        ${content1HTML}

        <figure class="article-figure">
          <img src="${esc(image1)}" alt="Hình minh họa 1: ${esc(story.title)}" loading="eager">
          <figcaption>${artist ? `Hình ảnh gắn với câu chuyện nghề của nghệ nhân ${esc(artist.name)}.` : `Hình ảnh minh họa câu chuyện ${esc(story.shortTitle)}.`}</figcaption>
        </figure>

        ${content2HTML}

        <figure class="article-figure">
          <img src="${esc(image2)}" alt="Hình minh họa 2: ${esc(story.title)}" loading="lazy">
          <figcaption>${product ? `Sản phẩm thủ công tiêu biểu: ${esc(product.name)}.` : `Không gian thực hành và gìn giữ nghề truyền thống.`}</figcaption>
        </figure>

        ${content3HTML}

        ${story.quote ? `<blockquote class="pull-quote">“${esc(story.quote)}”</blockquote>` : ''}

        ${artist ? `
          <aside class="story-related" aria-label="Thông tin liên quan">
            <div>
              <p class="related-label">Khám phá thêm</p>
              <h3>Nhân vật trong câu chuyện</h3>
              <p>Nghệ nhân: <strong>${esc(artist.name)}</strong> · Nghề: ${esc(artist.craft.toLowerCase())}.</p>
            </div>
            <a class="card-link" href="${url('nghe-nhan', artist.id)}">
              Xem hồ sơ nghệ nhân <span aria-hidden="true">↗</span>
            </a>
          </aside>
        ` : ''}

        ${sourcesHTML}

        <p class="back-link">
          <a href="./cau-chuyen-van-hoa.html">← Quay lại danh sách câu chuyện</a>
        </p>
      </div>
    `;

    const moreContainer = document.getElementById('story-detail-more');
    if (moreContainer && Array.isArray(data.stories)) {
      const otherStories = data.stories.filter(item => item.id !== story.id);
      moreContainer.innerHTML = otherStories.map(s => {
        const storyLink = url('cau-chuyen', s.id);
        return `
          <article class="story-more-item reveal is-visible">
            <a class="story-more-thumb" href="${esc(storyLink)}">
              <img
                src="${esc(s.image)}"
                alt="${esc(s.title)}"
                loading="lazy"
              >
            </a>
            <div class="story-more-body">
              <p class="story-kicker">${esc(s.category)}</p>
              <h3 class="story-more-title">
                <a href="${esc(storyLink)}">${esc(s.title)}</a>
              </h3>
            </div>
          </article>
        `;
      }).join('');
    }

    installImageFallback(document.querySelector('main'), story.image);
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

  /* =====================================================
     CHI TIẾT TRẢI NGHIỆM (LIỀN MẠCH + POPUP ĐÁNH GIÁ CỦA BẠN)
  ===================================================== */
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
    const reviewsSection = document.getElementById('experience-reviews-section');
    const nearbySection = document.getElementById('experience-nearby-section');

    if (heroDescription) {
      heroDescription.textContent = experience.summary;
    }

    if (cover) {
      cover.src = experience.image;
      cover.alt = `Hình minh họa: ${experience.title}`;
    }

    const artist = experience.artistId
      ? findById('artists', experience.artistId)
      : null;

    const guide = artist ? artist.name : 'Chưa cập nhật';

    const baseExp =
      (Array.isArray(data.experiences)
        ? data.experiences.find(
            item =>
              Number(item.artistId) === Number(experience.artistId) &&
              Array.isArray(item.reviews) &&
              item.nearby
          )
        : null) || data.experiences[0];

    // 1. TẦNG 1 BÊN PHẢI: NỘI DUNG LIỀN MẠCH
    if (content) {
      content.innerHTML = `
        <p class="experience-intro">${esc(experience.intro)}</p>
        <h3>Bạn sẽ trải nghiệm gì?</h3>
        <ul class="check-list">
          ${experience.activities.map(item => `<li>${esc(item)}</li>`).join('')}
        </ul>
      `;
    }

    // 2. TẦNG 2 BÊN TRÁI: GIỮ KHUNG THÔNG TIN CHUYẾN ĐI + 2 NÚT BÊN DƯỚI
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
          <span>Thêm vào yêu thích</span>
        </button>
      </div>
      <p class="experience-notice" id="experience-notice" hidden></p>
    `;

    if (tripPanel) {
      tripPanel.innerHTML = `
        <div class="trip-panel-card">
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
        </div>
        ${actionsHTML}
      `;
    }

    if (map && experience.mapQuery) {
      map.title = `Bản đồ khu vực tham khảo: ${experience.place}`;
      map.src = `https://www.google.com/maps?q=${encodeURIComponent(experience.mapQuery)}&output=embed`;
    }

    if (mapLink && experience.mapQuery) {
      mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(experience.mapQuery)}`;
    }

    // 3. TẦNG 3: PHẦN ĐÁNH GIÁ CỦA DU KHÁCH + POPUP "ĐÁNH GIÁ CỦA BẠN"
    if (reviewsSection) {
      const REVIEW_STORAGE_KEY = `ngheNhanViet.reviews.exp.${experience.id}`;

      const getSavedUserReviews = () => {
        try {
          const parsed = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          return [];
        }
      };

      const saveUserReviews = list => {
        try {
          localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));
        } catch (err) {
          console.warn('Không lưu được đánh giá:', err);
        }
      };

      const defaultReviews = Array.isArray(experience.reviews) && experience.reviews.length
        ? experience.reviews
        : (baseExp && Array.isArray(baseExp.reviews) ? baseExp.reviews : []);

      let userReviews = getSavedUserReviews();
      let reviewsList = [...userReviews, ...defaultReviews];

      const baseScoreText = String(experience.rating || (baseExp && baseExp.rating) || '9,7');
      const ratingLabel = experience.reviewLabel || (baseExp && baseExp.reviewLabel) || 'Xuất sắc';
      const baseCount = Number(experience.reviewCount || (baseExp && baseExp.reviewCount) || 161);

      let startIdx = 0;

      const formatScore = val => {
        if (val === undefined || val === null || val === '') return '';
        const num = Number(String(val).replace(',', '.'));
        if (Number.isNaN(num)) return String(val);
        return Number.isInteger(num) ? String(num) : num.toFixed(1).replace('.', ',');
      };

      const renderReviewCards = () => {
        if (!reviewsList.length) return '';
        const visible = [];
        const total = Math.min(3, reviewsList.length);
        for (let i = 0; i < total; i += 1) {
          visible.push(reviewsList[(startIdx + i) % reviewsList.length]);
        }

        return visible.map(rev => {
          const initial = String(rev.name || 'K').trim().charAt(0).toUpperCase();
          const scoreBadge = rev.score
            ? `<span class="review-item-score">${esc(formatScore(rev.score))}</span>`
            : '';

          return `
            <article class="review-card">
              <div class="review-user">
                <div class="review-user-left">
                  <span class="review-avatar" aria-hidden="true">${esc(initial)}</span>
                  <div class="review-user-meta">
                    <strong>${esc(rev.name)}</strong>
                  </div>
                </div>
                ${scoreBadge}
              </div>
              <p class="review-quote">“${esc(rev.comment)}”</p>
            </article>
          `;
        }).join('');
      };

      const updateReviewsUI = () => {
        const totalCount = baseCount + userReviews.length;
        reviewsSection.innerHTML = `
          <h2 class="reviews-section-title">Đánh giá của du khách</h2>
          <div class="reviews-summary-bar">
            <span class="reviews-score-badge">${esc(baseScoreText)}</span>
            <span class="reviews-summary-text">
              ${esc(ratingLabel)} · <span class="reviews-summary-count">${esc(totalCount)} đánh giá</span>
            </span>
            <button class="reviews-read-all" type="button">Đọc tất cả đánh giá</button>
          </div>
          <div class="reviews-carousel-wrap">
            <div class="reviews-grid" id="reviews-grid-list">
              ${renderReviewCards()}
            </div>
            <button
              class="reviews-next-btn"
              id="reviews-next-btn"
              type="button"
              aria-label="Xem đánh giá tiếp theo"
            >
              ›
            </button>
          </div>
          <div class="reviews-bottom-actions">
            <button
              class="review-write-btn"
              id="open-review-modal"
              type="button"
            >
              Đánh giá của bạn
            </button>
          </div>
        `;

        const nextReviewBtn = reviewsSection.querySelector('#reviews-next-btn');
        const readAllBtn = reviewsSection.querySelector('.reviews-read-all');
        const gridListEl = reviewsSection.querySelector('#reviews-grid-list');
        const openModalBtn = reviewsSection.querySelector('#open-review-modal');

        const cycleReviews = () => {
          if (!gridListEl || !reviewsList.length) return;
          startIdx = (startIdx + 1) % reviewsList.length;
          gridListEl.innerHTML = renderReviewCards();
        };

        if (nextReviewBtn) nextReviewBtn.addEventListener('click', cycleReviews);
        if (readAllBtn) readAllBtn.addEventListener('click', cycleReviews);
        if (openModalBtn) openModalBtn.addEventListener('click', openReviewModal);
      };

      // Xử lý đóng/mở và gửi form trong Pop-up "Đánh giá của bạn" (#review-modal)
      const reviewModal = document.getElementById('review-modal');
      const reviewForm = document.getElementById('review-form');
      const reviewExpName = document.getElementById('review-experience-name');

      if (reviewExpName) {
        reviewExpName.textContent = experience.title;
      }

      function openReviewModal() {
        if (!reviewModal) return;
        reviewModal.hidden = false;
        document.body.classList.add('modal-open');
        requestAnimationFrame(() => {
          reviewForm?.querySelector('input[name="reviewerName"]')?.focus();
        });
      }

      function closeReviewModal() {
        if (!reviewModal) return;
        reviewModal.hidden = true;
        document.body.classList.remove('modal-open');
      }

      if (reviewModal && !reviewModal.dataset.bound) {
        reviewModal.dataset.bound = '1';

        reviewModal.querySelectorAll('[data-review-close]').forEach(btn => {
          btn.addEventListener('click', closeReviewModal);
        });

        document.addEventListener('keydown', event => {
          if (event.key === 'Escape' && !reviewModal.hidden) {
            closeReviewModal();
          }
        });

        reviewForm?.addEventListener('submit', event => {
          event.preventDefault();
          if (!reviewForm.checkValidity()) {
            reviewForm.reportValidity();
            return;
          }

          const formData = new FormData(reviewForm);
          const name = String(formData.get('reviewerName') || '').trim();
          const scoreRaw = String(formData.get('reviewerScore') || '10').trim();
          const comment = String(formData.get('reviewerComment') || '').trim();

          if (!name || !comment) return;

          const newReview = {
            name,
            score: scoreRaw,
            comment
          };

          userReviews.unshift(newReview);
          saveUserReviews(userReviews);
          reviewsList = [...userReviews, ...defaultReviews];
          startIdx = 0;

          reviewForm.reset();
          closeReviewModal();
          updateReviewsUI();
        });
      }

      updateReviewsUI();
    }

    // 4. TẦNG 4: ĐỊA ĐIỂM XUNG QUANH LÀNG NGHỀ
    if (nearbySection) {
      const nearbyData = experience.nearby || (baseExp && baseExp.nearby) || {
        around: [],
        dining: [],
        topAttractions: [],
        scenic: [],
        transport: []
      };

      const renderPlaceItems = items =>
        (items || []).map(([placeName, dist]) => `
          <li>
            <span class="nearby-place-name">${esc(placeName)}</span>
            <span class="nearby-place-dist">${esc(dist)}</span>
          </li>
        `).join('');

      nearbySection.innerHTML = `
        <h2 class="nearby-main-title">Địa điểm xung quanh làng nghề</h2>

        <div class="nearby-columns">

          <div class="nearby-col">
            <div class="nearby-group">
              <h3 class="nearby-group-title">
                <span class="nearby-icon" aria-hidden="true">🚶</span>
                Xung quanh có gì?
              </h3>
              <ul class="nearby-list">
                ${renderPlaceItems(nearbyData.around)}
              </ul>
            </div>
          </div>

          <div class="nearby-col">
            <div class="nearby-group">
              <h3 class="nearby-group-title">
                <span class="nearby-icon" aria-hidden="true">🍴</span>
                Nhà hàng &amp; quán cà phê
              </h3>
              <ul class="nearby-list">
                ${renderPlaceItems(nearbyData.dining)}
              </ul>
            </div>

            <div class="nearby-group">
              <h3 class="nearby-group-title">
                <span class="nearby-icon" aria-hidden="true">🏛️</span>
                Địa điểm tham quan hàng đầu
              </h3>
              <ul class="nearby-list">
                ${renderPlaceItems(nearbyData.topAttractions)}
              </ul>
            </div>
          </div>

          <div class="nearby-col">
            <div class="nearby-group">
              <h3 class="nearby-group-title">
                <span class="nearby-icon" aria-hidden="true">🌿</span>
                Không gian cảnh quan trong khu vực
              </h3>
              <ul class="nearby-list">
                ${renderPlaceItems(nearbyData.scenic)}
              </ul>
            </div>

            <div class="nearby-group">
              <h3 class="nearby-group-title">
                <span class="nearby-icon" aria-hidden="true">🚌</span>
                Phương tiện công cộng &amp; di chuyển
              </h3>
              <ul class="nearby-list">
                ${renderPlaceItems(nearbyData.transport)}
              </ul>
            </div>
          </div>

        </div>
      `;
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