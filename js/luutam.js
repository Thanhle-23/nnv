(() => {
  'use strict';

  const STORAGE_KEY = 'ngheNhanViet.favoriteArtists';

  /* =========================================================
     1. ĐỌC DANH SÁCH NGHỆ NHÂN YÊU THÍCH
  ========================================================= */
  function getFavoriteIds() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(data)) return [];
      return [
        ...new Set(
          data
            .map(Number)
            .filter(id => Number.isSafeInteger(id) && id > 0)
        )
      ];
    } catch (error) {
      return [];
    }
  }

  function saveFavoriteIds(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
    } catch (error) {
      console.warn('Không thể lưu nghệ nhân yêu thích.', error);
    }
  }

  function isFavorite(id) {
    const artistId = Number(id);
    return getFavoriteIds().includes(artistId);
  }

  function addFavorite(id) {
    const artistId = Number(id);
    if (!Number.isSafeInteger(artistId) || artistId <= 0) return;

    const ids = getFavoriteIds();
    if (!ids.includes(artistId)) {
      ids.push(artistId);
      saveFavoriteIds(ids);
    }

    document.dispatchEvent(new CustomEvent('ngheNhanViet:favoritesChanged'));
  }

  function removeFavorite(id) {
    const artistId = Number(id);
    const ids = getFavoriteIds().filter(item => item !== artistId);
    saveFavoriteIds(ids);
    document.dispatchEvent(new CustomEvent('ngheNhanViet:favoritesChanged'));
  }

  function toggleFavorite(id) {
    if (isFavorite(id)) {
      removeFavorite(id);
      return false;
    }
    addFavorite(id);
    return true;
  }

  function getArtists() {
    if (!window.NepVietData || !Array.isArray(window.NepVietData.artists)) {
      return [];
    }
    return window.NepVietData.artists;
  }

  function findArtist(id) {
    const artistId = Number(id);
    return getArtists().find(artist => Number(artist.id) === artistId) || null;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function artistDetailUrl(id) {
    return './chi-tiet-nghe-nhan.html?id=' + encodeURIComponent(id);
  }

  function heartSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.4 4.2 13 A5.3 5.3 0 0 1 11.7 5.5 L12 5.8 l.3-.3 A5.3 5.3 0 0 1 19.8 13 L12 20.4Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    `;
  }

  function updateHeartButton(button, active) {
    button.classList.toggle('is-favorite', active);
    button.setAttribute('aria-pressed', String(active));
    const artistName = button.dataset.artistName || 'nghệ nhân';

    if (active) {
      button.setAttribute('aria-label', `Bỏ ${artistName} khỏi danh sách yêu thích`);
      button.title = 'Đã yêu thích';
    } else {
      button.setAttribute('aria-label', `Thêm ${artistName} vào danh sách yêu thích`);
      button.title = 'Thêm vào yêu thích';
    }
  }

  function setupArtistDetailFavorite() {
    if (document.body.dataset.page !== 'artist-detail') return;

    const params = new URLSearchParams(window.location.search);
    const artistId = Number(params.get('id') || '1');
    if (!Number.isSafeInteger(artistId) || artistId <= 0) return;

    const artist = findArtist(artistId);
    if (!artist) return;

    const actions = document.querySelector('.detail-side .artist-actions');
    if (!actions || actions.querySelector('.artist-favorite-button')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button artist-favorite-button';
    button.dataset.artistId = String(artistId);
    button.dataset.artistName = artist.name;

    function renderButton() {
      const active = isFavorite(artistId);
      button.classList.toggle('is-favorite', active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute(
        'aria-label',
        active
          ? `Bỏ ${artist.name} khỏi danh sách yêu thích`
          : `Thêm ${artist.name} vào danh sách yêu thích`
      );
      button.innerHTML = `
        ${heartSvg()}
        <span class="favorite-button-text">
          ${active ? 'Đã yêu thích' : 'Yêu thích'}
        </span>
      `;
    }

    renderButton();

    button.addEventListener('click', () => {
      toggleFavorite(artistId);
      renderButton();
      button.classList.remove('favorite-pop');
      void button.offsetWidth;
      button.classList.add('favorite-pop');
    });

    actions.appendChild(button);
  }

  function updateFavoriteSummary(count) {
    const summary = document.getElementById('me-summary');
    const favoriteSummary = document.getElementById('favorite-summary');
    const favoriteCount = document.getElementById('favorite-count');

    if (favoriteCount) favoriteCount.textContent = String(count);
    if (favoriteSummary) favoriteSummary.hidden = count === 0;
    if (!summary) return;

    const orderSummary = document.getElementById('order-summary');
    const bookingSummary = document.getElementById('booking-summary');
    const hasOrder = orderSummary && !orderSummary.hidden;
    const hasBooking = bookingSummary && !bookingSummary.hidden;

    summary.hidden = !(count > 0 || hasOrder || hasBooking);
  }

  function favoriteCard(artist) {
    const id = Number(artist.id);
    const name = escapeHtml(artist.name);
    const image = escapeHtml(artist.image);
    const detailUrl = artistDetailUrl(id);

    return `
      <article class="me-card favorite-artist-card" data-favorite-id="${id}">
        <a class="me-card-image" href="${detailUrl}" aria-label="Xem hồ sơ ${name}">
          <img src="${image}" alt="Nghệ nhân ${name}" loading="lazy">
        </a>
        <div class="me-card-content">
          <h3><a href="${detailUrl}">${name}</a></h3>
          <div class="me-card-actions">
            <span class="me-status favorite-status" style="margin-top: 0;">♥ Đã yêu thích</span>
            <button class="remove-favorite" type="button" data-remove-favorite="${id}">
              Bỏ yêu thích
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderFavoriteArtists() {
    const list = document.getElementById('favorite-artists');
    const empty = document.getElementById('favorites-empty');
    if (!list && !empty) return;

    const ids = getFavoriteIds();
    const artists = ids.map(id => findArtist(id)).filter(Boolean);

    if (artists.length !== ids.length) {
      saveFavoriteIds(artists.map(artist => Number(artist.id)));
    }

    if (list) {
      list.innerHTML = artists.map(favoriteCard).join('');
      list.querySelectorAll('[data-remove-favorite]').forEach(button => {
        button.addEventListener('click', () => {
          const artistId = Number(button.dataset.removeFavorite);
          removeFavorite(artistId);
          renderFavoriteArtists();
        });
      });
    }

    if (empty) empty.hidden = artists.length !== 0;
    updateFavoriteSummary(artists.length);
  }

  function start() {
    setupArtistDetailFavorite();
    renderFavoriteArtists();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  document.addEventListener('ngheNhanViet:favoritesChanged', renderFavoriteArtists);

  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY) return;
    renderFavoriteArtists();
    const button = document.querySelector('.artist-favorite-button');
    if (button) {
      const artistId = Number(button.dataset.artistId);
      updateHeartButton(button, isFavorite(artistId));
    }
  });

  window.NgheNhanVietFavorites = {
    getIds: getFavoriteIds,
    isFavorite,
    add: addFavorite,
    remove: removeFavorite,
    toggle: toggleFavorite
  };
})();

/* =========================================================
   SẢN PHẨM YÊU THÍCH
========================================================= */
(() => {
  'use strict';

  const STORAGE_KEY = 'ngheNhanViet.favoriteProducts';

  function getFavorites() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function saveFavorites(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Không lưu được sản phẩm yêu thích:', error);
    }
  }

  function getProducts() {
    if (window.NepVietData && Array.isArray(window.NepVietData.products)) {
      return window.NepVietData.products;
    }
    return [];
  }

  function findProduct(id) {
    const productId = Number(id);
    return getProducts().find(product => Number(product.id) === productId) || null;
  }

  function isFavorite(id) {
    const productId = Number(id);
    return getFavorites().some(product => Number(product.id) === productId);
  }

  function addFavorite(product) {
    if (!product || !product.id) return;
    const favorites = getFavorites();
    if (favorites.some(item => Number(item.id) === Number(product.id))) return;

    favorites.push({
      id: Number(product.id),
      name: product.name || '',
      shortName: product.shortName || product.name || '',
      craft: product.craft || '',
      place: product.place || '',
      material: product.material || '',
      image: product.image || '',
      description: product.description || ''
    });

    saveFavorites(favorites);
    document.dispatchEvent(new CustomEvent('ngheNhanViet:productFavoritesChanged'));
  }

  function removeFavorite(id) {
    const productId = Number(id);
    const favorites = getFavorites().filter(product => Number(product.id) !== productId);
    saveFavorites(favorites);
    document.dispatchEvent(new CustomEvent('ngheNhanViet:productFavoritesChanged'));
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function heartSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.4 4.2 13 A5.3 5.3 0 0 1 11.7 5.5 L12 5.8 l.3-.3 A5.3 5.3 0 0 1 19.8 13 L12 20.4Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    `;
  }

  function setupProductDetail() {
    if (document.body.dataset.page !== 'product-detail') return;

    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get('id') || 1);
    if (!Number.isSafeInteger(productId) || productId <= 0) return;

    const product = findProduct(productId);
    if (!product) return;

    const slot = document.querySelector('.product-favorite-slot');
    if (!slot || slot.querySelector('.product-favorite-button')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'product-favorite-button';

    function renderButton() {
      const active = isFavorite(productId);
      button.classList.toggle('is-favorite', active);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute(
        'aria-label',
        active
          ? `Bỏ ${product.shortName || product.name} khỏi danh sách yêu thích`
          : `Thêm ${product.shortName || product.name} vào danh sách yêu thích`
      );
      button.innerHTML = `
        ${heartSvg()}
        <span class="favorite-button-text">
          ${active ? 'Đã yêu thích' : 'Yêu thích'}
        </span>
      `;
    }

    renderButton();

    button.addEventListener('click', () => {
      if (isFavorite(productId)) {
        removeFavorite(productId);
      } else {
        addFavorite(product);
      }
      renderButton();
      button.classList.remove('favorite-pop');
      void button.offsetWidth;
      button.classList.add('favorite-pop');
    });

    slot.appendChild(button);
  }

  function createProductCard(product) {
    const id = Number(product.id);
    const name = escapeHtml(product.name);
    const image = escapeHtml(product.image);
    const url = './chi-tiet-san-pham.html?id=' + encodeURIComponent(id);

    return `
      <article class="me-card favorite-product-card">
        <a class="me-card-image" href="${url}">
          <img src="${image}" alt="${name}" loading="lazy">
        </a>
        <div class="me-card-content">
          <h3><a href="${url}">${name}</a></h3>
          <div class="me-card-actions">
            <span class="me-status product-favorite-status" style="margin-top: 0;">♥ Đã yêu thích</span>
            <button
              class="remove-product-favorite"
              type="button"
              data-remove-product-favorite="${id}"
            >
              Bỏ yêu thích
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderFavoriteProducts() {
    const container = document.getElementById('favorite-products');
    const empty = document.getElementById('product-favorites-empty');
    if (!container && !empty) return;

    const favorites = getFavorites();

    if (container) {
      container.innerHTML = favorites.map(createProductCard).join('');
    }
    if (empty) {
      empty.hidden = favorites.length > 0;
    }

    container?.querySelectorAll('[data-remove-product-favorite]').forEach(button => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.removeProductFavorite);
        removeFavorite(id);
        renderFavoriteProducts();
      });
    });
  }

  function start() {
    setupProductDetail();
    renderFavoriteProducts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  document.addEventListener('ngheNhanViet:productFavoritesChanged', renderFavoriteProducts);

  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) renderFavoriteProducts();
  });
})();

/* =========================================================
   TRẢI NGHIỆM: YÊU THÍCH & LỊCH SỬ ĐĂNG KÝ
========================================================= */
(() => {
  'use strict';

  const BOOKING_KEY = 'ngheNhanViet.experienceBookings';
  const FAVORITE_KEY = 'ngheNhanViet.favoriteExperiences';

  function getData() {
    return window.NepVietData || {};
  }

  function getExperiences() {
    const data = getData();
    return Array.isArray(data.experiences) ? data.experiences : [];
  }

  function getArtists() {
    const data = getData();
    return Array.isArray(data.artists) ? data.artists : [];
  }

  function findExperience(id) {
    const experienceId = Number(id);
    return getExperiences().find(item => Number(item.id) === experienceId) || null;
  }

  function findArtist(id) {
    const artistId = Number(id);
    return getArtists().find(item => Number(item.id) === artistId) || null;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function readStorage(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function saveStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Không lưu được dữ liệu:', error);
    }
  }

  function getCurrentExperienceId() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id') || 1);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }

  function experienceDetailUrl(id) {
    return './chi-tiet-trai-nghiem.html?id=' + encodeURIComponent(id);
  }

  function heartSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20.4 4.2 13 A5.3 5.3 0 0 1 11.7 5.5 L12 5.8 l.3-.3 A5.3 5.3 0 0 1 19.8 13 L12 20.4Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    `;
  }

  function getFavoriteExperienceIds() {
    return [
      ...new Set(
        readStorage(FAVORITE_KEY)
          .map(Number)
          .filter(id => Number.isSafeInteger(id) && id > 0)
      )
    ];
  }

  function isExperienceFavorite(id) {
    return getFavoriteExperienceIds().includes(Number(id));
  }

  function toggleExperienceFavorite(id) {
    const experienceId = Number(id);
    let ids = getFavoriteExperienceIds();

    if (ids.includes(experienceId)) {
      ids = ids.filter(item => item !== experienceId);
    } else {
      ids.push(experienceId);
    }

    saveStorage(FAVORITE_KEY, ids);
    document.dispatchEvent(new CustomEvent('ngheNhanViet:experienceFavoritesChanged'));
    return ids.includes(experienceId);
  }

  function getBookings() {
    return readStorage(BOOKING_KEY);
  }

  function formatDate(value) {
    if (!value) return 'Chưa chọn ngày';
    const date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  function saveBooking(experience, form) {
    const formData = new FormData(form);
    const artist = experience.artistId ? findArtist(experience.artistId) : null;

    const booking = {
      bookingId: Date.now() + '-' + experience.id,
      experienceId: Number(experience.id),
      artistId: Number(experience.artistId || (artist ? artist.id : 0)),
      title: experience.title || '',
      shortTitle: experience.shortTitle || experience.title || '',
      place: experience.place || '',
      duration: experience.duration || '',
      image: experience.image || '',
      artistName: artist ? artist.name : '',
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      date: String(formData.get('date') || ''),
      people: Math.max(1, Number(formData.get('people') || 1)),
      note: String(formData.get('note') || '').trim(),
      status: 'pending',
      statusLabel: 'Đã đăng ký · Chờ nghệ nhân duyệt',
      createdAt: new Date().toISOString()
    };

    const bookings = getBookings();
    bookings.unshift(booking);
    saveStorage(BOOKING_KEY, bookings);
    document.dispatchEvent(new CustomEvent('ngheNhanViet:experienceBookingsChanged'));
    return booking;
  }

  function removeBooking(bookingId) {
    const bookings = getBookings().filter(
      item => String(item.bookingId) !== String(bookingId)
    );
    saveStorage(BOOKING_KEY, bookings);
    document.dispatchEvent(new CustomEvent('ngheNhanViet:experienceBookingsChanged'));
  }

  function setupExperienceDetail() {
    if (document.body.dataset.page !== 'experience-detail') return;

    const experienceId = getCurrentExperienceId();
    if (!experienceId) return;

    const experience = findExperience(experienceId);
    if (!experience) return;

    const bookingButton = document.getElementById('show-booking');
    const favoriteButton = document.getElementById('favorite-experience');
    const notice = document.getElementById('experience-notice');
    const modal = document.getElementById('booking-modal');
    const form = document.getElementById('booking-form');
    const modalName = document.getElementById('booking-experience-name');
    const dateInput = form?.querySelector('input[name="date"]');

    if (modalName) modalName.textContent = experience.title;

    if (dateInput) {
      const now = new Date();
      dateInput.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
    }

    function showNotice(message) {
      if (!notice) return;
      notice.textContent = message;
      notice.hidden = false;
    }

    function renderFavoriteButton() {
      if (!favoriteButton) return;
      const active = isExperienceFavorite(experienceId);
      favoriteButton.classList.toggle('is-favorite', active);
      favoriteButton.setAttribute('aria-pressed', String(active));
      favoriteButton.innerHTML = `
        ${heartSvg()}
        <span>${active ? 'Đã yêu thích' : 'Yêu thích'}</span>
      `;
    }

    function openBookingModal() {
      if (!modal) return;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        form?.querySelector('input[name="name"]')?.focus();
      });
    }

    function closeBookingModal() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
    }

    bookingButton?.addEventListener('click', openBookingModal);

    favoriteButton?.addEventListener('click', () => {
      const active = toggleExperienceFavorite(experienceId);
      renderFavoriteButton();
      showNotice(
        active
          ? 'Đã lưu trải nghiệm vào mục Tôi.'
          : 'Đã bỏ trải nghiệm khỏi danh sách yêu thích.'
      );
    });

    modal?.querySelectorAll('[data-booking-close]').forEach(button => {
      button.addEventListener('click', closeBookingModal);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal && !modal.hidden) {
        closeBookingModal();
      }
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      saveBooking(experience, form);
      form.reset();

      if (dateInput) {
        const now = new Date();
        dateInput.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
      }

      closeBookingModal();
      showNotice('Đăng ký đã được lưu. Xem lại trong mục Tôi → Lịch sử đăng ký.');
    });

    renderFavoriteButton();
  }

  function bookingCard(booking) {
    const url = experienceDetailUrl(booking.experienceId);
    const isApproved = booking.status === 'approved';
    const statusText = booking.statusLabel || (isApproved ? '✓ Nghệ nhân đã duyệt lịch' : 'Đã đăng ký');

    return `
      <article class="me-card booking-experience-card">
        <a class="me-card-image" href="${url}">
          <img
            src="${escapeHtml(booking.image)}"
            alt="${escapeHtml(booking.shortTitle || booking.title)}"
            loading="lazy"
          >
        </a>
        <div class="me-card-content">
          <p class="card-kicker">${escapeHtml(booking.place)}</p>
          <h3>
            <a href="${url}">${escapeHtml(booking.shortTitle || booking.title)}</a>
          </h3>
          <p><strong>Ngày:</strong> ${escapeHtml(formatDate(booking.date))}</p>
          <p><strong>Số người:</strong> ${escapeHtml(booking.people)}</p>
          ${booking.artistName ? `<p><strong>Nghệ nhân:</strong> ${escapeHtml(booking.artistName)}</p>` : ''}
          <span class="me-status booking-status ${isApproved ? 'is-approved' : ''}">
            ${escapeHtml(statusText)}
          </span>
          <div class="me-card-actions">
            <a class="card-link" href="${url}">
              Xem trải nghiệm <span aria-hidden="true">↗</span>
            </a>
            <button
              class="remove-booking"
              type="button"
              data-remove-experience-booking="${escapeHtml(booking.bookingId)}"
            >
              Xóa đăng ký
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function favoriteExperienceCard(experience) {
    const url = experienceDetailUrl(experience.id);
    const title = escapeHtml(experience.shortTitle || experience.title);
    const image = escapeHtml(experience.image);

    return `
      <article class="me-card favorite-experience-card">
        <a class="me-card-image" href="${url}">
          <img src="${image}" alt="${title}" loading="lazy">
        </a>
        <div class="me-card-content">
          <h3><a href="${url}">${title}</a></h3>
          <div class="me-card-actions">
            <span class="me-status experience-favorite-status" style="margin-top: 0;">♥ Đã yêu thích</span>
            <button
              class="remove-experience-favorite"
              type="button"
              data-remove-experience-favorite="${experience.id}"
            >
              Bỏ yêu thích
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function updateExperienceSummary() {
    const summary = document.getElementById('me-summary');
    const bookingSummary = document.getElementById('booking-summary');
    const bookingCount = document.getElementById('booking-count');
    const favoriteSummary = document.getElementById('experience-favorite-summary');
    const favoriteCount = document.getElementById('experience-favorite-count');

    const bookings = getBookings();
    const favorites = getFavoriteExperienceIds();

    if (bookingCount) bookingCount.textContent = String(bookings.length);
    if (bookingSummary) bookingSummary.hidden = bookings.length === 0;
    if (favoriteCount) favoriteCount.textContent = String(favorites.length);
    if (favoriteSummary) favoriteSummary.hidden = favorites.length === 0;

    if (summary) {
      const visibleItems = [...summary.querySelectorAll('article')].filter(item => !item.hidden);
      summary.hidden = visibleItems.length === 0;
    }
  }

  function renderExperienceBookings() {
    const list = document.getElementById('my-bookings');
    const empty = document.getElementById('bookings-empty');
    if (!list && !empty) return;

    const bookings = getBookings();

    if (list) {
      list.innerHTML = bookings.map(bookingCard).join('');
      list.querySelectorAll('[data-remove-experience-booking]').forEach(button => {
        button.addEventListener('click', () => {
          removeBooking(button.dataset.removeExperienceBooking);
        });
      });
    }

    if (empty) empty.hidden = bookings.length > 0;
    updateExperienceSummary();
  }

  function renderFavoriteExperiences() {
    const list = document.getElementById('favorite-experiences');
    const empty = document.getElementById('experience-favorites-empty');
    if (!list && !empty) return;

    const experiences = getFavoriteExperienceIds()
      .map(id => findExperience(id))
      .filter(Boolean);

    if (list) {
      list.innerHTML = experiences.map(favoriteExperienceCard).join('');
      list.querySelectorAll('[data-remove-experience-favorite]').forEach(button => {
        button.addEventListener('click', () => {
          const id = Number(button.dataset.removeExperienceFavorite);
          if (isExperienceFavorite(id)) {
            toggleExperienceFavorite(id);
          }
        });
      });
    }

    if (empty) empty.hidden = experiences.length > 0;
    updateExperienceSummary();
  }

  function startExperienceStorage() {
    setupExperienceDetail();
    renderExperienceBookings();
    renderFavoriteExperiences();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startExperienceStorage, { once: true });
  } else {
    startExperienceStorage();
  }

  document.addEventListener('ngheNhanViet:experienceBookingsChanged', renderExperienceBookings);

  document.addEventListener('ngheNhanViet:experienceFavoritesChanged', () => {
    renderFavoriteExperiences();
    if (document.body.dataset.page === 'experience-detail') {
      const button = document.getElementById('favorite-experience');
      const id = getCurrentExperienceId();
      if (button && id) {
        const active = isExperienceFavorite(id);
        button.classList.toggle('is-favorite', active);
        button.setAttribute('aria-pressed', String(active));
        button.innerHTML = `
          ${heartSvg()}
          <span>${active ? 'Đã yêu thích' : 'Yêu thích'}</span>
        `;
      }
    }
  });

  window.addEventListener('storage', event => {
    if (event.key === BOOKING_KEY) renderExperienceBookings();
    if (event.key === FAVORITE_KEY) renderFavoriteExperiences();
  });
})();

/* =========================================================
   SẢN PHẨM: ĐĂNG KÝ MUA HÀNG & LƯU VÀO TRANG TÔI (toi.html)
========================================================= */
(() => {
  'use strict';

  const ORDER_KEY = 'ngheNhanViet.productOrders';

  function getData() {
    return window.NepVietData || {};
  }

  function getProducts() {
    const data = getData();
    return Array.isArray(data.products) ? data.products : [];
  }

  function getArtists() {
    const data = getData();
    return Array.isArray(data.artists) ? data.artists : [];
  }

  function findProduct(id) {
    const productId = Number(id);
    return getProducts().find(item => Number(item.id) === productId) || null;
  }

  function findArtist(id) {
    const artistId = Number(id);
    return getArtists().find(item => Number(item.id) === artistId) || null;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function readOrders() {
    try {
      const data = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function saveOrders(orders) {
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
    } catch (error) {
      console.warn('Không lưu được đơn đặt hàng:', error);
    }
  }

  function getCurrentProductId() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get('id') || 1);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }

  function productDetailUrl(id) {
    return './chi-tiet-san-pham.html?id=' + encodeURIComponent(id);
  }

  function saveProductOrder(product, form) {
    const formData = new FormData(form);
    const artist = product.artistId ? findArtist(product.artistId) : null;

    const order = {
      orderId: Date.now() + '-' + product.id,
      productId: Number(product.id),
      artistId: Number(product.artistId || (artist ? artist.id : 0)),
      name: product.name || '',
      shortName: product.shortName || product.name || '',
      craft: product.craft || '',
      place: product.place || product.origin || '',
      image: product.image || '',
      artistName: artist ? artist.name : '',
      customerName: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      quantity: Math.max(1, Number(formData.get('quantity') || 1)),
      address: String(formData.get('address') || '').trim(),
      note: String(formData.get('note') || '').trim(),
      status: 'pending',
      statusLabel: 'Đã đăng ký mua',
      createdAt: new Date().toISOString()
    };

    const orders = readOrders();
    orders.unshift(order);
    saveOrders(orders);

    document.dispatchEvent(new CustomEvent('ngheNhanViet:productOrdersChanged'));
    return order;
  }

  function removeProductOrder(orderId) {
    const orders = readOrders().filter(
      item => String(item.orderId) !== String(orderId)
    );
    saveOrders(orders);
    document.dispatchEvent(new CustomEvent('ngheNhanViet:productOrdersChanged'));
  }

  function setupProductOrderDetail() {
    if (document.body.dataset.page !== 'product-detail') return;

    const productId = getCurrentProductId();
    if (!productId) return;

    const product = findProduct(productId);
    if (!product) return;

    const modal = document.getElementById('product-order-modal');
    const form = document.getElementById('product-order-form');
    const modalName = document.getElementById('order-product-name');

    if (modalName) {
      modalName.textContent = product.shortName || product.name;
    }

    function showNotice(message) {
      const notice = document.getElementById('product-order-notice');
      if (!notice) return;
      notice.textContent = message;
      notice.hidden = false;
    }

    function openOrderModal() {
      if (!modal) return;
      if (modalName) {
        modalName.textContent = product.shortName || product.name;
      }
      modal.hidden = false;
      document.body.classList.add('modal-open');
      requestAnimationFrame(() => {
        form?.querySelector('input[name="name"]')?.focus();
      });
    }

    function closeOrderModal() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('modal-open');
    }

    document.addEventListener('click', event => {
      const openBtn = event.target.closest('#show-product-order');
      if (openBtn) {
        event.preventDefault();
        openOrderModal();
        return;
      }

      const closeBtn = event.target.closest('[data-order-close]');
      if (closeBtn) {
        event.preventDefault();
        closeOrderModal();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal && !modal.hidden) {
        closeOrderModal();
      }
    });

    form?.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      saveProductOrder(product, form);
      form.reset();
      closeOrderModal();
      showNotice('Đăng ký mua hàng đã được lưu. Xem lại trong mục Tôi → Lịch sử đăng ký.');
    });
  }

  function productOrderCard(order) {
    const url = productDetailUrl(order.productId);
    const isApproved = order.status === 'confirmed' || order.status === 'crafting';
    const statusText = order.statusLabel || 'Đã đăng ký mua';

    return `
      <article class="me-card booking-experience-card">
        <a class="me-card-image" href="${url}">
          <img
            src="${escapeHtml(order.image)}"
            alt="${escapeHtml(order.shortName || order.name)}"
            loading="lazy"
          >
        </a>
        <div class="me-card-content">
          <p class="card-kicker">${escapeHtml(order.craft || order.place)}</p>
          <h3>
            <a href="${url}">${escapeHtml(order.shortName || order.name)}</a>
          </h3>
          <p><strong>Người đặt:</strong> ${escapeHtml(order.customerName)}</p>
          <p><strong>Số lượng:</strong> ${escapeHtml(order.quantity)} sản phẩm</p>
          ${order.address ? `<p><strong>Nhận tại:</strong> ${escapeHtml(order.address)}</p>` : ''}
          <span class="me-status booking-status ${isApproved ? 'is-approved' : ''}">
            ${escapeHtml(statusText)}
          </span>
          <div class="me-card-actions">
            <a class="card-link" href="${url}">
              Xem sản phẩm <span aria-hidden="true">↗</span>
            </a>
            <button
              class="remove-booking"
              type="button"
              data-remove-product-order="${escapeHtml(order.orderId)}"
            >
              Xóa đăng ký
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function updateOrderSummary() {
    const summary = document.getElementById('me-summary');
    const orderSummary = document.getElementById('order-summary');
    const orderCount = document.getElementById('order-count');
    const bookingSummaryWrap = document.getElementById('me-booking-summary');
    const orders = readOrders();

    if (orderCount) {
      orderCount.textContent = String(orders.length);
    }
    if (orderSummary) {
      orderSummary.hidden = orders.length === 0;
    }
    if (bookingSummaryWrap) {
      const visibleItems = [...bookingSummaryWrap.querySelectorAll('article')].filter(
        item => !item.hidden
      );
      bookingSummaryWrap.hidden = visibleItems.length === 0;
    }
    if (summary) {
      const visibleItems = [...summary.querySelectorAll('article')].filter(
        item => !item.hidden
      );
      summary.hidden = visibleItems.length === 0;
    }
  }

  function renderProductOrders() {
    const list = document.getElementById('my-orders');
    const empty = document.getElementById('orders-empty');
    if (!list && !empty) return;

    const orders = readOrders();

    if (list) {
      list.innerHTML = orders.map(productOrderCard).join('');
      list.querySelectorAll('[data-remove-product-order]').forEach(button => {
        button.addEventListener('click', () => {
          removeProductOrder(button.dataset.removeProductOrder);
        });
      });
    }

    if (empty) {
      empty.hidden = orders.length > 0;
    }

    updateOrderSummary();
  }

  function startProductOrderStorage() {
    setupProductOrderDetail();
    renderProductOrders();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startProductOrderStorage, { once: true });
  } else {
    startProductOrderStorage();
  }

  document.addEventListener('ngheNhanViet:productOrdersChanged', renderProductOrders);

  window.addEventListener('storage', event => {
    if (event.key === ORDER_KEY) {
      renderProductOrders();
    }
  });
})();

/* =========================================================
   QUẢN LÝ TRANG NGƯỜI DÙNG DU KHÁCH (TABS + HỒ SƠ + POPUP SỬA + HỖ TRỢ)
========================================================= */
(() => {
  'use strict';

  const PROFILE_KEY = 'ngheNhanViet.userProfile';

  function readProfile() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveProfile(profileData) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.warn('Không lưu được hồ sơ:', error);
    }
  }

  function setupMeDashboard() {
    const tabButtons = Array.from(document.querySelectorAll('[data-me-tab]'));
    const tabPanels = Array.from(document.querySelectorAll('[data-me-panel]'));
    if (!tabButtons.length || !tabPanels.length) return;

    function activateTab(tabName) {
      tabButtons.forEach(btn => {
        const isCurrent = btn.dataset.meTab === tabName;
        btn.classList.toggle('is-active', isCurrent);
        btn.setAttribute('aria-selected', String(isCurrent));
      });

      tabPanels.forEach(panel => {
        const isCurrent = panel.dataset.mePanel === tabName;
        panel.hidden = !isCurrent;
        panel.classList.toggle('is-active', isCurrent);
      });
    }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        activateTab(btn.dataset.meTab);
      });
    });

    const fields = ['name', 'phone', 'address', 'email'];
    const avatarImg = document.getElementById('profile-avatar-img');
    const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');
    const avatarInput = document.getElementById('profile-avatar-input');
    const avatarChangeBtn = document.getElementById('profile-avatar-change');
    const avatarRemoveBtn = document.getElementById('profile-avatar-remove');
    const saveAllBtn = document.getElementById('profile-save-all-btn');
    const saveStatus = document.getElementById('profile-save-status');

    const editModal = document.getElementById('profile-edit-modal');
    const editForm = document.getElementById('profile-edit-form');
    const modalTitle = document.getElementById('profile-modal-title');
    const modalLabel = document.getElementById('profile-modal-label');
    const modalInput = document.getElementById('profile-modal-input');

    let currentProfile = readProfile();
    let activeFieldKey = '';

    function showSaveNotice(msg) {
      if (!saveStatus) return;
      saveStatus.textContent = msg;
      clearTimeout(showSaveNotice._timer);
      showSaveNotice._timer = setTimeout(() => {
        saveStatus.textContent = '';
      }, 3000);
    }

    function renderProfileUI() {
      fields.forEach(key => {
        const el = document.getElementById(`profile-val-${key}`);
        if (!el) return;
        const val = String(currentProfile[key] || '').trim();
        el.textContent = val;
        el.classList.toggle('is-empty', !val);
      });

      const hasAvatar = Boolean(currentProfile.avatar);
      if (avatarImg) {
        avatarImg.src = hasAvatar ? currentProfile.avatar : '';
        avatarImg.hidden = !hasAvatar;
      }
      if (avatarPlaceholder) {
        avatarPlaceholder.hidden = hasAvatar;
      }
    }

    avatarChangeBtn?.addEventListener('click', () => {
      avatarInput?.click();
    });

    avatarInput?.addEventListener('change', () => {
      const file = avatarInput.files && avatarInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        currentProfile.avatar = String(reader.result || '');
        saveProfile(currentProfile);
        renderProfileUI();
        showSaveNotice('Đã cập nhật ảnh hồ sơ.');
      };
      reader.readAsDataURL(file);
      avatarInput.value = '';
    });

    avatarRemoveBtn?.addEventListener('click', () => {
      delete currentProfile.avatar;
      saveProfile(currentProfile);
      renderProfileUI();
      showSaveNotice('Đã xóa ảnh hồ sơ.');
    });

    function openProfileEditModal(button) {
      if (!editModal || !modalInput) return;

      activeFieldKey = button.dataset.profileEdit || '';
      const titleText = button.dataset.profileTitle || 'Chỉnh sửa thông tin';
      const labelText = button.dataset.profileLabel || 'Thông tin';
      const placeholderText = button.dataset.profilePlaceholder || '';

      if (modalTitle) modalTitle.textContent = titleText;
      if (modalLabel) modalLabel.textContent = labelText;

      modalInput.type = activeFieldKey === 'email' ? 'email' : 'text';
      modalInput.placeholder = placeholderText;
      modalInput.value = String(currentProfile[activeFieldKey] || '');

      editModal.hidden = false;
      editModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('profile-modal-open');

      requestAnimationFrame(() => {
        modalInput.focus();
        modalInput.select();
      });
    }

    function closeProfileEditModal() {
      if (!editModal) return;
      editModal.hidden = true;
      editModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('profile-modal-open');
      activeFieldKey = '';
    }

    document.querySelectorAll('[data-profile-edit]').forEach(button => {
      button.addEventListener('click', () => openProfileEditModal(button));
    });

    editModal?.querySelectorAll('[data-profile-modal-close]').forEach(btn => {
      btn.addEventListener('click', closeProfileEditModal);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && editModal && !editModal.hidden) {
        closeProfileEditModal();
      }
    });

    editForm?.addEventListener('submit', event => {
      event.preventDefault();
      if (!activeFieldKey || !modalInput) return;

      currentProfile[activeFieldKey] = modalInput.value.trim();
      saveProfile(currentProfile);
      renderProfileUI();
      closeProfileEditModal();
      showSaveNotice('Đã lưu thay đổi thông tin.');
    });

    saveAllBtn?.addEventListener('click', () => {
      saveProfile(currentProfile);
      showSaveNotice('Đã lưu hồ sơ của bạn.');
    });

    const supportForm = document.getElementById('me-support-form');
    const supportMsg = document.getElementById('support-status-msg');

    supportForm?.addEventListener('submit', event => {
      event.preventDefault();
      if (!supportForm.checkValidity()) {
        supportForm.reportValidity();
        return;
      }

      supportForm.reset();
      if (supportMsg) {
        supportMsg.textContent = 'Đã gửi yêu cầu hỗ trợ! Chúng tôi sẽ phản hồi qua email sớm nhất.';
        setTimeout(() => {
          supportMsg.textContent = '';
        }, 4000);
      }
    });

    renderProfileUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMeDashboard, { once: true });
  } else {
    setupMeDashboard();
  }
})();

/* =========================================================
   PHÂN QUYỀN ĐĂNG NHẬP (DU KHÁCH / NGHỆ NHÂN) & BẢNG ĐIỀU KHIỂN NGHỆ NHÂN
========================================================= */
(() => {
  'use strict';

  const SESSION_KEY = 'ngheNhanViet.authSession';
  const ORDER_KEY = 'ngheNhanViet.productOrders';
  const BOOKING_KEY = 'ngheNhanViet.experienceBookings';
  const WORKSHOP_KEY = 'ngheNhanViet.artisanWorkshopSettings';
  const REPLY_KEY = 'ngheNhanViet.artisanReviewReplies';

  function getData() {
    return window.NepVietData || {};
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  function saveSession(user) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Không lưu được phiên đăng nhập mô phỏng:', error);
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn(error);
    }
  }

  function readJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (error) {
      console.warn(error);
    }
  }

  function setupAuthAndArtisanWorkspace() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    const data = getData();
    const artists = Array.isArray(data.artists) ? data.artists : [];
    const products = Array.isArray(data.products) ? data.products : [];
    const experiences = Array.isArray(data.experiences) ? data.experiences : [];

    const loginPanel = document.getElementById('auth-login-panel');
    const registerPanel = document.getElementById('auth-register-panel');
    const loginForm = document.getElementById('demo-login-form');
    const registerForm = document.getElementById('demo-register-form');

    const welcomeHeading = document.getElementById('me-welcome-title') || document.querySelector('.me-welcome-text h1');
    const welcomeDesc = document.getElementById('me-welcome-desc') || document.querySelector('.me-welcome-text p');
    const verifiedPill = document.getElementById('artisan-verified-pill');
    const authActions = document.querySelector('.me-auth-actions');

    const touristDashboard = document.getElementById('tourist-dashboard');
    const artisanDashboard = document.getElementById('artisan-dashboard');

    const loginPickerWrap = document.getElementById('login-artisan-picker-wrap');
    const registerPickerWrap = document.getElementById('register-artisan-picker-wrap');
    const loginArtistSelect = document.getElementById('login-artist-select');
    const registerArtistSelect = document.getElementById('register-artist-select');
    const workshopArtistSwitcher = document.getElementById('artisan-select-switcher');
    const loginEmailInput = document.getElementById('login-email-input');

    // Đổ danh sách 9 nghệ nhân vào các thẻ <select>
    const artistOptionsHtml = artists
      .map(a => `<option value="${a.id}">${escapeHtml(a.name)} — ${escapeHtml(a.craft)} (${escapeHtml(a.province)})</option>`)
      .join('');

    if (loginArtistSelect) loginArtistSelect.innerHTML = artistOptionsHtml;
    if (registerArtistSelect) registerArtistSelect.innerHTML = artistOptionsHtml;
    if (workshopArtistSwitcher) workshopArtistSwitcher.innerHTML = artistOptionsHtml;

    function autoFillArtisanDemoEmail(artistId) {
      if (!loginEmailInput) return;
      const artist = artists.find(a => Number(a.id) === Number(artistId)) || artists[0];
      if (!artist) return;
      const slug = artist.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      loginEmailInput.value = `${slug}@nghenhanviet.vn`;
    }

    // Xử lý chọn radio Vai trò (Du khách / Nghệ nhân) trong form Đăng nhập & Đăng ký
    function bindRoleRadios(formEl, pickerWrap) {
      if (!formEl) return;
      const radios = Array.from(formEl.querySelectorAll('input[name="role"]'));
      const labels = Array.from(formEl.querySelectorAll('.auth-role-option'));

      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          const isArtisan = radio.value === 'artisan' && radio.checked;
          labels.forEach(lbl => {
            const inp = lbl.querySelector('input[name="role"]');
            lbl.classList.toggle('is-selected', Boolean(inp && inp.checked));
          });
          if (pickerWrap) {
            pickerWrap.hidden = !isArtisan;
          }
          if (formEl === loginForm && isArtisan) {
            autoFillArtisanDemoEmail(loginArtistSelect?.value || 1);
          }
        });
      });
    }

    bindRoleRadios(loginForm, loginPickerWrap);
    bindRoleRadios(registerForm, registerPickerWrap);

    loginArtistSelect?.addEventListener('change', () => {
      autoFillArtisanDemoEmail(loginArtistSelect.value);
    });

    function clearMessages() {
      modal.querySelectorAll('.auth-message').forEach(msg => {
        msg.textContent = '';
        msg.classList.remove('error');
      });
    }

    function switchPanel(mode) {
      const isRegister = mode === 'register';
      if (loginPanel) loginPanel.hidden = isRegister;
      if (registerPanel) registerPanel.hidden = !isRegister;
      clearMessages();

      requestAnimationFrame(() => {
        const activePanel = isRegister ? registerPanel : loginPanel;
        activePanel?.querySelector('input:not([type="radio"])')?.focus();
      });
    }

    function openModal(mode) {
      switchPanel(mode || 'login');
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('auth-modal-open');
    }

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('auth-modal-open');
      clearMessages();
    }

    /* =====================================================
       RENDER KHÔNG GIAN QUẢN LÝ CỦA NGHỆ NHÂN
    ===================================================== */
    const showAllToggle = document.getElementById('artisan-show-all-toggle');

    function getActiveArtisan(session) {
      const id = Number(session?.artistId || 1);
      return artists.find(a => Number(a.id) === id) || artists[0];
    }

    function renderArtisanDashboard(session) {
      if (!artisanDashboard) return;
      const artist = getActiveArtisan(session);
      if (!artist) return;

      const showAll = showAllToggle ? showAllToggle.checked : true;

      // 1. Thẻ thông tin nghệ nhân ở cột trái
      const currentCard = document.getElementById('artisan-current-card');
      if (currentCard) {
        currentCard.innerHTML = `
          <img src="${escapeHtml(artist.image)}" alt="${escapeHtml(artist.name)}">
          <div>
            <strong>${escapeHtml(artist.name)}</strong>
            <span>${escapeHtml(artist.craft)} · ${escapeHtml(artist.province)}</span>
          </div>
        `;
      }

      if (workshopArtistSwitcher) {
        workshopArtistSwitcher.value = String(artist.id);
      }

      // 2. Đọc cài đặt xưởng nghề
      const allWorkshopSettings = readJson(WORKSHOP_KEY, {});
      const mySettings = allWorkshopSettings[artist.id] || {
        openStatus: 'Đang mở cửa đón khách',
        openHours: '08:00 – 17:00 (Thứ 2 – Chủ nhật)',
        maxGuests: 'Tối đa 15 khách / lượt',
        visitorNote: `Xưởng của nghệ nhân ${artist.name} tại ${artist.place} khuyến khích du khách đặt lịch trước để được chuẩn bị nguyên liệu chu đáo nhất.`
      };

      const openStatusSelect = document.getElementById('workshop-open-status');
      const openHoursInput = document.getElementById('workshop-open-hours');
      const maxGuestsInput = document.getElementById('workshop-max-guests');
      const visitorNoteInput = document.getElementById('workshop-visitor-note');

      if (openStatusSelect) openStatusSelect.value = mySettings.openStatus;
      if (openHoursInput) openHoursInput.value = mySettings.openHours;
      if (maxGuestsInput) maxGuestsInput.value = mySettings.maxGuests;
      if (visitorNoteInput) visitorNoteInput.value = mySettings.visitorNote;

      // 3. Lọc danh sách lịch hẹn & đơn đặt sản phẩm
      const allBookings = readJson(BOOKING_KEY, []);
      const allOrders = readJson(ORDER_KEY, []);

      const filteredBookings = showAll
        ? allBookings
        : allBookings.filter(b => Number(b.artistId) === Number(artist.id) || Number(b.experienceId) === Number(artist.id));

      const filteredOrders = showAll
        ? allOrders
        : allOrders.filter(o => Number(o.artistId) === Number(artist.id) || Number(o.productId) === Number(artist.productId));

      // 4. Cập nhật 4 thẻ KPI
      const statBookings = document.getElementById('artisan-stat-bookings');
      const statBookingsSub = document.getElementById('artisan-stat-bookings-sub');
      const statOrders = document.getElementById('artisan-stat-orders');
      const statOrdersSub = document.getElementById('artisan-stat-orders-sub');
      const statRating = document.getElementById('artisan-stat-rating');
      const statOpen = document.getElementById('artisan-stat-open');
      const statHoursSub = document.getElementById('artisan-stat-hours-sub');

      const pendingBookingsCount = filteredBookings.filter(b => b.status !== 'approved').length;
      const pendingOrdersCount = filteredOrders.filter(o => o.status !== 'confirmed' && o.status !== 'crafting').length;

      if (statBookings) statBookings.textContent = String(filteredBookings.length);
      if (statBookingsSub) statBookingsSub.textContent = `${pendingBookingsCount} lịch chờ duyệt`;
      if (statOrders) statOrders.textContent = String(filteredOrders.length);
      if (statOrdersSub) statOrdersSub.textContent = `${pendingOrdersCount} đơn chờ xác nhận`;

      const artistExp = experiences.find(e => Number(e.artistId) === Number(artist.id));
      if (statRating) statRating.textContent = artistExp?.rating || '9,8';
      if (statOpen) statOpen.textContent = mySettings.openStatus.includes('Tạm ngưng') ? 'Tạm ngưng' : 'Đang mở cửa';
      if (statHoursSub) statHoursSub.textContent = mySettings.openHours;

      // 5. Render danh sách Lịch hẹn trải nghiệm cho Nghệ nhân duyệt
      const bookingsListEl = document.getElementById('artisan-bookings-list');
      const bookingsEmptyEl = document.getElementById('artisan-bookings-empty');

      if (bookingsListEl) {
        if (!filteredBookings.length) {
          bookingsListEl.innerHTML = '';
          if (bookingsEmptyEl) bookingsEmptyEl.hidden = false;
        } else {
          if (bookingsEmptyEl) bookingsEmptyEl.hidden = true;
          bookingsListEl.innerHTML = filteredBookings
            .map(b => {
              const isApproved = b.status === 'approved';
              return `
                <article class="me-card booking-experience-card">
                  <a class="me-card-image" href="./chi-tiet-trai-nghiem.html?id=${encodeURIComponent(b.experienceId)}">
                    <img src="${escapeHtml(b.image)}" alt="${escapeHtml(b.shortTitle || b.title)}" loading="lazy">
                  </a>
                  <div class="me-card-content">
                    <p class="card-kicker">${escapeHtml(b.place)}</p>
                    <h3><a href="./chi-tiet-trai-nghiem.html?id=${encodeURIComponent(b.experienceId)}">${escapeHtml(b.shortTitle || b.title)}</a></h3>
                    <p><strong>Khách đặt:</strong> ${escapeHtml(b.name)} (${escapeHtml(b.phone)})</p>
                    <p><strong>Ngày tham gia:</strong> ${escapeHtml(b.date)} · <strong>${escapeHtml(b.people)} người</strong></p>
                    ${b.note ? `<p><strong>Ghi chú:</strong> ${escapeHtml(b.note)}</p>` : ''}
                    <span class="me-status booking-status ${isApproved ? 'is-approved' : 'is-pending'}">
                      ${isApproved ? '✓ Nghệ nhân đã duyệt lịch' : '⏳ Chờ nghệ nhân duyệt'}
                    </span>
                    <div class="me-card-actions">
                      ${
                        !isApproved
                          ? `<button type="button" class="artisan-action-btn" data-artisan-approve-booking="${escapeHtml(b.bookingId)}">✓ Duyệt lịch hẹn</button>`
                          : `<span style="font-size:12px; color:#256b36; font-weight:700;">Đã xác nhận đón đoàn</span>`
                      }
                      <button type="button" class="remove-booking" data-artisan-delete-booking="${escapeHtml(b.bookingId)}">Xóa</button>
                    </div>
                  </div>
                </article>
              `;
            })
            .join('');
        }
      }

      // 6. Render danh sách Đơn đặt mua sản phẩm cho Nghệ nhân xác nhận
      const ordersListEl = document.getElementById('artisan-orders-list');
      const ordersEmptyEl = document.getElementById('artisan-orders-empty');

      if (ordersListEl) {
        if (!filteredOrders.length) {
          ordersListEl.innerHTML = '';
          if (ordersEmptyEl) ordersEmptyEl.hidden = false;
        } else {
          if (ordersEmptyEl) ordersEmptyEl.hidden = true;
          ordersListEl.innerHTML = filteredOrders
            .map(o => {
              const isConfirmed = o.status === 'confirmed';
              const isCrafting = o.status === 'crafting';
              const statusBadge = isCrafting
                ? '🏺 Đang chế tác & đóng gói'
                : isConfirmed
                ? '✓ Nghệ nhân đã xác nhận'
                : '⏳ Chờ nghệ nhân xác nhận';

              return `
                <article class="me-card booking-experience-card">
                  <a class="me-card-image" href="./chi-tiet-san-pham.html?id=${encodeURIComponent(o.productId)}">
                    <img src="${escapeHtml(o.image)}" alt="${escapeHtml(o.shortName || o.name)}" loading="lazy">
                  </a>
                  <div class="me-card-content">
                    <p class="card-kicker">${escapeHtml(o.craft || o.place)}</p>
                    <h3><a href="./chi-tiet-san-pham.html?id=${encodeURIComponent(o.productId)}">${escapeHtml(o.shortName || o.name)}</a></h3>
                    <p><strong>Người mua:</strong> ${escapeHtml(o.customerName)} (${escapeHtml(o.phone)})</p>
                    <p><strong>Số lượng:</strong> ${escapeHtml(o.quantity)} sản phẩm</p>
                    <p><strong>Giao tới:</strong> ${escapeHtml(o.address)}</p>
                    ${o.note ? `<p><strong>Ghi chú:</strong> ${escapeHtml(o.note)}</p>` : ''}
                    <span class="me-status booking-status ${isConfirmed || isCrafting ? 'is-approved' : 'is-pending'}">
                      ${escapeHtml(statusBadge)}
                    </span>
                    <div class="me-card-actions">
                      <button type="button" class="artisan-action-btn" data-artisan-confirm-order="${escapeHtml(o.orderId)}">
                        ✓ Xác nhận đơn
                      </button>
                      <button type="button" class="artisan-action-btn is-secondary" data-artisan-craft-order="${escapeHtml(o.orderId)}">
                        Đang chế tác
                      </button>
                      <button type="button" class="remove-booking" data-artisan-delete-order="${escapeHtml(o.orderId)}">
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              `;
            })
            .join('');
        }
      }

      // 7. Render sản phẩm & hoạt động của chính nghệ nhân trong tab Xưởng nghề
      const ownItemsEl = document.getElementById('artisan-own-items');
      if (ownItemsEl) {
        const myProducts = products.filter(p => Number(p.artistId) === Number(artist.id));
        const myExps = experiences.filter(e => Number(e.artistId) === Number(artist.id));

        ownItemsEl.innerHTML = [
          ...myProducts.map(p => `
            <article class="me-card">
              <a class="me-card-image" href="./chi-tiet-san-pham.html?id=${p.id}">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
              </a>
              <div class="me-card-content">
                <p class="card-kicker">Sản phẩm tiêu biểu · ${escapeHtml(p.craft)}</p>
                <h3><a href="./chi-tiet-san-pham.html?id=${p.id}">${escapeHtml(p.name)}</a></h3>
                <p>${escapeHtml(p.description)}</p>
                <div class="me-card-actions">
                  <span class="me-status booking-status is-approved">Đang trưng bày</span>
                  <a class="card-link" href="./chi-tiet-san-pham.html?id=${p.id}">Xem trang sản phẩm ↗</a>
                </div>
              </div>
            </article>
          `),
          ...myExps.map(e => `
            <article class="me-card">
              <a class="me-card-image" href="./chi-tiet-trai-nghiem.html?id=${e.id}">
                <img src="${escapeHtml(e.image)}" alt="${escapeHtml(e.title)}" loading="lazy">
              </a>
              <div class="me-card-content">
                <p class="card-kicker">Workshop trải nghiệm · ${escapeHtml(e.duration)}</p>
                <h3><a href="./chi-tiet-trai-nghiem.html?id=${e.id}">${escapeHtml(e.shortTitle || e.title)}</a></h3>
                <p>${escapeHtml(e.summary)}</p>
                <div class="me-card-actions">
                  <span class="me-status booking-status is-approved">${escapeHtml(mySettings.openStatus)}</span>
                  <a class="card-link" href="./chi-tiet-trai-nghiem.html?id=${e.id}">Xem trang trải nghiệm ↗</a>
                </div>
              </div>
            </article>
          `)
        ].join('');
      }

      // 8. Render Đánh giá của du khách dành cho sản phẩm & trải nghiệm của nghệ nhân
      const reviewsListEl = document.getElementById('artisan-reviews-list');
      if (reviewsListEl) {
        const prodObj = products.find(p => Number(p.artistId) === Number(artist.id)) || products[0];
        const expObj = experiences.find(e => Number(e.artistId) === Number(artist.id)) || experiences[0];

        const savedProdRevs = readJson(`ngheNhanViet.reviews.prod.${prodObj?.id}`, []);
        const savedExpRevs = readJson(`ngheNhanViet.reviews.exp.${expObj?.id}`, []);
        const repliesMap = readJson(REPLY_KEY, {});

        const combinedReviews = [
          ...savedProdRevs.map((r, i) => ({ ...r, sourceLabel: `Sản phẩm: ${prodObj.shortName}`, key: `up-${prodObj.id}-${i}` })),
          ...savedExpRevs.map((r, i) => ({ ...r, sourceLabel: `Trải nghiệm: ${expObj.shortTitle}`, key: `ue-${expObj.id}-${i}` })),
          ...(prodObj?.reviews || []).map((r, i) => ({ ...r, sourceLabel: `Sản phẩm: ${prodObj.shortName}`, key: `dp-${prodObj.id}-${i}` })),
          ...(expObj?.reviews || []).map((r, i) => ({ ...r, sourceLabel: `Trải nghiệm: ${expObj.shortTitle}`, key: `de-${expObj.id}-${i}` }))
        ];

        reviewsListEl.innerHTML = combinedReviews
          .map(rev => {
            const initial = String(rev.name || 'K').trim().charAt(0).toUpperCase();
            const existingReply = repliesMap[rev.key] || '';
            return `
              <article class="artisan-review-item">
                <div class="artisan-review-head">
                  <div class="artisan-review-user">
                    <span class="artisan-review-avatar">${escapeHtml(initial)}</span>
                    <div>
                      <strong>${escapeHtml(rev.name)}</strong>
                      <span>${escapeHtml(rev.sourceLabel)}</span>
                    </div>
                  </div>
                  <span class="artisan-review-score">${escapeHtml(rev.score || '9,8')} / 10</span>
                </div>
                <p class="artisan-review-comment">“${escapeHtml(rev.comment)}”</p>
                ${
                  existingReply
                    ? `<div class="artisan-reply-box"><strong>Phản hồi từ Nghệ nhân ${escapeHtml(artist.name)}:</strong> ${escapeHtml(existingReply)}</div>`
                    : `
                      <form class="artisan-reply-form" data-reply-key="${escapeHtml(rev.key)}">
                        <input type="text" name="replyText" placeholder="Nhập lời cảm ơn hoặc phản hồi của nghệ nhân..." required>
                        <button type="submit" class="artisan-action-btn">Gửi phản hồi</button>
                      </form>
                    `
                }
              </article>
            `;
          })
          .join('');
      }
    }

    function renderSessionState() {
      const session = readSession();
      if (!authActions) return;

      const isArtisan = session && session.role === 'artisan';

      if (touristDashboard) touristDashboard.hidden = Boolean(isArtisan);
      if (artisanDashboard) artisanDashboard.hidden = !isArtisan;
      if (verifiedPill) verifiedPill.hidden = !isArtisan;

      if (session && (session.name || session.email)) {
        if (isArtisan) {
          const artist = getActiveArtisan(session);
          if (welcomeHeading) {
            welcomeHeading.textContent = `Xưởng nghề: ${artist ? artist.name : session.name}`;
          }
          if (welcomeDesc) {
            welcomeDesc.textContent = `Không gian quản lý đơn đặt sản phẩm, duyệt lịch hẹn trải nghiệm và phản hồi du khách tại ${artist ? artist.place : 'làng nghề'}.`;
          }
          authActions.innerHTML = `
            <button class="button button-outline" type="button" id="switch-to-tourist-btn">
              🧳 Xem góc nhìn Du khách
            </button>
            <button class="button button-dark" type="button" id="demo-logout-btn">
              Đăng xuất
            </button>
          `;
          renderArtisanDashboard(session);
        } else {
          const displayName = session.name || session.email.split('@')[0];
          if (welcomeHeading) {
            welcomeHeading.textContent = `Xin chào, ${displayName}`;
          }
          if (welcomeDesc) {
            welcomeDesc.textContent = 'Không gian lưu giữ bộ sưu tập yêu thích và lịch trình trải nghiệm làng nghề của bạn.';
          }
          authActions.innerHTML = `
            <span class="me-status" style="margin-top:0; padding:8px 14px; font-size:12px;">
              🧳 Du khách: ${escapeHtml(displayName)}
            </span>
            <button class="button button-outline" type="button" id="switch-to-artisan-btn">
              🏺 Chuyển sang Nghệ nhân
            </button>
            <button class="button button-dark" type="button" id="demo-logout-btn">
              Đăng xuất
            </button>
          `;
        }

        document.getElementById('demo-logout-btn')?.addEventListener('click', () => {
          clearSession();
          window.location.reload();
        });

        document.getElementById('switch-to-tourist-btn')?.addEventListener('click', () => {
          saveSession({
            ...session,
            role: 'tourist',
            name: session.touristName || 'Du khách'
          });
          renderSessionState();
          document.dispatchEvent(new CustomEvent('ngheNhanViet:productOrdersChanged'));
          document.dispatchEvent(new CustomEvent('ngheNhanViet:experienceBookingsChanged'));
        });

        document.getElementById('switch-to-artisan-btn')?.addEventListener('click', () => {
          const defaultArtist = artists[0];
          saveSession({
            ...session,
            touristName: session.name,
            role: 'artisan',
            artistId: session.artistId || (defaultArtist ? defaultArtist.id : 1),
            name: defaultArtist ? defaultArtist.name : 'Nghệ nhân'
          });
          renderSessionState();
        });
      } else {
        if (welcomeHeading) {
          welcomeHeading.textContent = 'Xin chào';
        }
        if (welcomeDesc) {
          welcomeDesc.textContent = 'Không gian lưu giữ bộ sưu tập yêu thích và lịch trình trải nghiệm làng nghề của bạn.';
        }
      }
    }

    // Chuyển tab trong bảng điều khiển Nghệ nhân
    const artisanTabBtns = Array.from(document.querySelectorAll('[data-artisan-tab]'));
    const artisanTabPanels = Array.from(document.querySelectorAll('[data-artisan-panel]'));

    artisanTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.artisanTab;
        artisanTabBtns.forEach(b => {
          const active = b.dataset.artisanTab === target;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', String(active));
        });
        artisanTabPanels.forEach(p => {
          const active = p.dataset.artisanPanel === target;
          p.hidden = !active;
          p.classList.toggle('is-active', active);
        });
      });
    });

    showAllToggle?.addEventListener('change', () => {
      const session = readSession();
      if (session?.role === 'artisan') renderArtisanDashboard(session);
    });

    workshopArtistSwitcher?.addEventListener('change', () => {
      const session = readSession() || {};
      const chosen = artists.find(a => Number(a.id) === Number(workshopArtistSwitcher.value));
      if (!chosen) return;
      const updated = {
        ...session,
        role: 'artisan',
        artistId: chosen.id,
        name: chosen.name
      };
      saveSession(updated);
      renderSessionState();
    });

    // Lưu thiết lập xưởng nghề
    const workshopForm = document.getElementById('artisan-workshop-form');
    const workshopMsg = document.getElementById('workshop-save-msg');
    workshopForm?.addEventListener('submit', event => {
      event.preventDefault();
      const session = readSession();
      const artist = getActiveArtisan(session);
      if (!artist) return;

      const formData = new FormData(workshopForm);
      const allSettings = readJson(WORKSHOP_KEY, {});
      allSettings[artist.id] = {
        openStatus: String(formData.get('openStatus') || ''),
        openHours: String(formData.get('openHours') || ''),
        maxGuests: String(formData.get('maxGuests') || ''),
        visitorNote: String(formData.get('visitorNote') || '')
      };
      writeJson(WORKSHOP_KEY, allSettings);
      renderArtisanDashboard(session);

      if (workshopMsg) {
        workshopMsg.textContent = `Đã lưu thiết lập xưởng nghề của nghệ nhân ${artist.name}!`;
        setTimeout(() => {
          workshopMsg.textContent = '';
        }, 3000);
      }
    });

    // Xử lý các nút Duyệt lịch hẹn, Xác nhận đơn hàng, Xóa đơn & Gửi phản hồi đánh giá
    document.addEventListener('click', event => {
      const openBtn = event.target.closest('[data-auth-open]');
      if (openBtn) {
        event.preventDefault();
        openModal(openBtn.dataset.authOpen);
        return;
      }

      const switchBtn = event.target.closest('[data-auth-switch]');
      if (switchBtn) {
        event.preventDefault();
        switchPanel(switchBtn.dataset.authSwitch);
        return;
      }

      const closeBtn = event.target.closest('[data-auth-close]');
      if (closeBtn) {
        event.preventDefault();
        closeModal();
        return;
      }

      // Duyệt lịch hẹn trải nghiệm
      const approveBookingBtn = event.target.closest('[data-artisan-approve-booking]');
      if (approveBookingBtn) {
        const id = approveBookingBtn.dataset.artisanApproveBooking;
        const list = readJson(BOOKING_KEY, []).map(item =>
          String(item.bookingId) === String(id)
            ? { ...item, status: 'approved', statusLabel: '✓ Nghệ nhân đã duyệt lịch' }
            : item
        );
        writeJson(BOOKING_KEY, list);
        document.dispatchEvent(new CustomEvent('ngheNhanViet:experienceBookingsChanged'));
        renderArtisanDashboard(readSession());
        return;
      }

      // Xóa lịch hẹn từ phía nghệ nhân
      const deleteBookingBtn = event.target.closest('[data-artisan-delete-booking]');
      if (deleteBookingBtn) {
        const id = deleteBookingBtn.dataset.artisanDeleteBooking;
        const list = readJson(BOOKING_KEY, []).filter(item => String(item.bookingId) !== String(id));
        writeJson(BOOKING_KEY, list);
        document.dispatchEvent(new CustomEvent('ngheNhanViet:experienceBookingsChanged'));
        renderArtisanDashboard(readSession());
        return;
      }

      // Xác nhận đơn đặt mua sản phẩm
      const confirmOrderBtn = event.target.closest('[data-artisan-confirm-order]');
      if (confirmOrderBtn) {
        const id = confirmOrderBtn.dataset.artisanConfirmOrder;
        const list = readJson(ORDER_KEY, []).map(item =>
          String(item.orderId) === String(id)
            ? { ...item, status: 'confirmed', statusLabel: '✓ Nghệ nhân đã xác nhận' }
            : item
        );
        writeJson(ORDER_KEY, list);
        document.dispatchEvent(new CustomEvent('ngheNhanViet:productOrdersChanged'));
        renderArtisanDashboard(readSession());
        return;
      }

      // Chuyển trạng thái đơn sang Đang chế tác
      const craftOrderBtn = event.target.closest('[data-artisan-craft-order]');
      if (craftOrderBtn) {
        const id = craftOrderBtn.dataset.artisanCraftOrder;
        const list = readJson(ORDER_KEY, []).map(item =>
          String(item.orderId) === String(id)
            ? { ...item, status: 'crafting', statusLabel: '🏺 Đang chế tác & đóng gói' }
            : item
        );
        writeJson(ORDER_KEY, list);
        document.dispatchEvent(new CustomEvent('ngheNhanViet:productOrdersChanged'));
        renderArtisanDashboard(readSession());
        return;
      }

      // Xóa đơn đặt sản phẩm
      const deleteOrderBtn = event.target.closest('[data-artisan-delete-order]');
      if (deleteOrderBtn) {
        const id = deleteOrderBtn.dataset.artisanDeleteOrder;
        const list = readJson(ORDER_KEY, []).filter(item => String(item.orderId) !== String(id));
        writeJson(ORDER_KEY, list);
        document.dispatchEvent(new CustomEvent('ngheNhanViet:productOrdersChanged'));
        renderArtisanDashboard(readSession());
      }
    });

    // Nghệ nhân gửi phản hồi dưới đánh giá của khách
    document.addEventListener('submit', event => {
      const replyForm = event.target.closest('.artisan-reply-form');
      if (!replyForm) return;
      event.preventDefault();
      const key = replyForm.dataset.replyKey;
      const input = replyForm.querySelector('input[name="replyText"]');
      const text = String(input?.value || '').trim();
      if (!key || !text) return;

      const replies = readJson(REPLY_KEY, {});
      replies[key] = text;
      writeJson(REPLY_KEY, replies);
      renderArtisanDashboard(readSession());
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !modal.hidden) {
        closeModal();
      }
    });

    // Submit form Đăng nhập
    loginForm?.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const role = String(formData.get('role') || 'tourist');
      const artistId = Number(formData.get('artistId') || 1);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '').trim();
      const msg = loginForm.querySelector('.auth-message');

      if (!email || !password) {
        if (msg) {
          msg.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu.';
          msg.classList.add('error');
        }
        return;
      }

      const selectedArtist = artists.find(a => Number(a.id) === artistId) || artists[0];
      const displayName =
        role === 'artisan' && selectedArtist
          ? selectedArtist.name
          : email.split('@')[0];

      saveSession({
        name: displayName,
        email,
        role,
        artistId: role === 'artisan' ? (selectedArtist ? selectedArtist.id : 1) : null
      });

      if (msg) {
        msg.classList.remove('error');
        msg.textContent =
          role === 'artisan'
            ? `Đăng nhập thành công vào Xưởng nghề ${displayName}!`
            : 'Đăng nhập tài khoản Du khách thành công!';
      }

      setTimeout(() => {
        closeModal();
        renderSessionState();
      }, 350);
    });

    // Submit form Đăng ký
    registerForm?.addEventListener('submit', event => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const role = String(formData.get('role') || 'tourist');
      const artistId = Number(formData.get('artistId') || 1);
      const name = String(formData.get('name') || '').trim();
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');
      const confirmPassword = String(formData.get('confirmPassword') || '');
      const msg = registerForm.querySelector('.auth-message');

      if (!name || !email || !password) {
        if (msg) {
          msg.textContent = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
          msg.classList.add('error');
        }
        return;
      }

      if (password !== confirmPassword) {
        if (msg) {
          msg.textContent = 'Mật khẩu nhập lại chưa khớp.';
          msg.classList.add('error');
        }
        return;
      }

      const selectedArtist = artists.find(a => Number(a.id) === artistId) || artists[0];

      saveSession({
        name: role === 'artisan' && selectedArtist ? selectedArtist.name : name,
        email,
        role,
        artistId: role === 'artisan' ? (selectedArtist ? selectedArtist.id : 1) : null
      });

      if (msg) {
        msg.classList.remove('error');
        msg.textContent = 'Đăng ký tài khoản thành công!';
      }

      setTimeout(() => {
        registerForm.reset();
        closeModal();
        renderSessionState();
      }, 350);
    });

    renderSessionState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAuthAndArtisanWorkspace, { once: true });
  } else {
    setupAuthAndArtisanWorkspace();
  }
})();