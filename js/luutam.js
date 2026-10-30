(() => {
  'use strict';

  const STORAGE_KEY = 'ngheNhanViet.favoriteArtists';


  /* =========================================================
     1. ĐỌC DANH SÁCH NGHỆ NHÂN YÊU THÍCH
  ========================================================= */

  function getFavoriteIds() {

    try {

      const data = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );


      if (!Array.isArray(data)) {
        return [];
      }


      return [
        ...new Set(
          data
            .map(Number)
            .filter(id =>
              Number.isSafeInteger(id) &&
              id > 0
            )
        )
      ];

    } catch (error) {

      return [];

    }

  }



  /* =========================================================
     2. LƯU DANH SÁCH
  ========================================================= */

  function saveFavoriteIds(ids) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          ...new Set(ids)
        ])
      );

    } catch (error) {

      console.warn(
        'Không thể lưu nghệ nhân yêu thích.',
        error
      );

    }

  }



  /* =========================================================
     3. KIỂM TRA ĐÃ YÊU THÍCH CHƯA
  ========================================================= */

  function isFavorite(id) {

    const artistId = Number(id);

    return getFavoriteIds()
      .includes(artistId);

  }



  /* =========================================================
     4. THÊM YÊU THÍCH
  ========================================================= */

  function addFavorite(id) {

    const artistId = Number(id);


    if (
      !Number.isSafeInteger(artistId) ||
      artistId <= 0
    ) {
      return;
    }


    const ids = getFavoriteIds();


    if (!ids.includes(artistId)) {

      ids.push(artistId);

      saveFavoriteIds(ids);

    }


    document.dispatchEvent(
      new CustomEvent(
        'ngheNhanViet:favoritesChanged'
      )
    );

  }



  /* =========================================================
     5. BỎ YÊU THÍCH
  ========================================================= */

  function removeFavorite(id) {

    const artistId = Number(id);


    const ids = getFavoriteIds()
      .filter(item =>
        item !== artistId
      );


    saveFavoriteIds(ids);


    document.dispatchEvent(
      new CustomEvent(
        'ngheNhanViet:favoritesChanged'
      )
    );

  }



  /* =========================================================
     6. BẬT / TẮT YÊU THÍCH
  ========================================================= */

  function toggleFavorite(id) {

    if (isFavorite(id)) {

      removeFavorite(id);

      return false;

    }


    addFavorite(id);

    return true;

  }



  /* =========================================================
     7. LẤY DỮ LIỆU NGHỆ NHÂN
  ========================================================= */

  function getArtists() {

    if (
      !window.NepVietData ||
      !Array.isArray(
        window.NepVietData.artists
      )
    ) {

      return [];

    }


    return window.NepVietData.artists;

  }



  function findArtist(id) {

    const artistId = Number(id);


    return getArtists().find(
      artist =>
        Number(artist.id) === artistId
    ) || null;

  }



  /* =========================================================
     8. ESCAPE HTML
  ========================================================= */

  function escapeHtml(value) {

    return String(value ?? '')

      .replaceAll(
        '&',
        '&amp;'
      )

      .replaceAll(
        '<',
        '&lt;'
      )

      .replaceAll(
        '>',
        '&gt;'
      )

      .replaceAll(
        '"',
        '&quot;'
      )

      .replaceAll(
        "'",
        '&#039;'
      );

  }



  /* =========================================================
     9. LINK CHI TIẾT NGHỆ NHÂN
  ========================================================= */

  function artistDetailUrl(id) {

    return (
      './chi-tiet-nghe-nhan.html?id=' +
      encodeURIComponent(id)
    );

  }



  /* =========================================================
     10. ICON TRÁI TIM
  ========================================================= */

  function heartSvg() {

    return `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >

        <path
          d="
            M12 20.4
            4.2 13
            A5.3 5.3 0 0 1
            11.7 5.5
            L12 5.8
            l.3-.3
            A5.3 5.3 0 0 1
            19.8 13
            L12 20.4Z
          "
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>

      </svg>
    `;

  }



  /* =========================================================
     11. CẬP NHẬT GIAO DIỆN NÚT TIM
  ========================================================= */

  function updateHeartButton(
    button,
    active
  ) {

    button.classList.toggle(
      'is-favorite',
      active
    );


    button.setAttribute(
      'aria-pressed',
      String(active)
    );


    const artistName =
      button.dataset.artistName ||
      'nghệ nhân';


    if (active) {

      button.setAttribute(
        'aria-label',
        `Bỏ ${artistName} khỏi danh sách yêu thích`
      );


      button.title =
        'Đã yêu thích';

    } else {

      button.setAttribute(
        'aria-label',
        `Thêm ${artistName} vào danh sách yêu thích`
      );


      button.title =
        'Thêm vào yêu thích';

    }

  }



  /* =========================================================
     12. TRANG CHI TIẾT NGHỆ NHÂN
  ========================================================= */

  function setupArtistDetailFavorite() {

  /*
      Chỉ chạy ở trang
      chi tiết nghệ nhân
  */

  if (
    document.body.dataset.page !==
    'artist-detail'
  ) {

    return;

  }


  const params =
    new URLSearchParams(
      window.location.search
    );


  const artistId =
    Number(
      params.get('id') || '1'
    );


  if (
    !Number.isSafeInteger(artistId) ||
    artistId <= 0
  ) {

    return;

  }



  /* =====================================================
     TÌM NGHỆ NHÂN
  ===================================================== */

  const artist =
    findArtist(
      artistId
    );


  if (!artist) {

    return;

  }



  /* =====================================================
     TÌM KHU VỰC 2 NÚT
  ===================================================== */

  const actions =
    document.querySelector(
      '.detail-side .artist-actions'
    );


  if (!actions) {

    return;

  }



  /*
      Không tạo lại nếu đã có
  */

  if (
    actions.querySelector(
      '.artist-favorite-button'
    )
  ) {

    return;

  }



  /* =====================================================
     TẠO NÚT YÊU THÍCH
  ===================================================== */

  const button =
    document.createElement(
      'button'
    );


  button.type =
    'button';


  button.className =
    'button artist-favorite-button';


  button.dataset.artistId =
    String(artistId);


  button.dataset.artistName =
    artist.name;



  /* =====================================================
     CẬP NHẬT NỘI DUNG NÚT
  ===================================================== */

  function renderButton() {

    const active =
      isFavorite(
        artistId
      );


    button.classList.toggle(
      'is-favorite',
      active
    );


    button.setAttribute(
      'aria-pressed',
      String(active)
    );


    button.setAttribute(
      'aria-label',

      active

        ? `Bỏ ${artist.name} khỏi danh sách yêu thích`

        : `Thêm ${artist.name} vào danh sách yêu thích`
    );


    button.innerHTML = `

      ${heartSvg()}

      <span class="favorite-button-text">

        ${
          active
            ? 'Đã yêu thích'
            : 'Yêu thích'
        }

      </span>

    `;

  }



  renderButton();



  /* =====================================================
     CLICK
  ===================================================== */

  button.addEventListener(
    'click',
    () => {

      toggleFavorite(
        artistId
      );


      renderButton();


      /*
          Animation
      */

      button.classList.remove(
        'favorite-pop'
      );


      void button.offsetWidth;


      button.classList.add(
        'favorite-pop'
      );

    }
  );



  /* =====================================================
     ĐẶT KẾ BÊN NÚT XEM TRẢI NGHIỆM
  ===================================================== */

  actions.appendChild(
    button
  );

}



  /* =========================================================
     13. CẬP NHẬT TỔNG QUAN TRANG TÔI
  ========================================================= */

  function updateFavoriteSummary(
    count
  ) {

    const summary =
      document.getElementById(
        'me-summary'
      );


    const favoriteSummary =
      document.getElementById(
        'favorite-summary'
      );


    const favoriteCount =
      document.getElementById(
        'favorite-count'
      );



    if (favoriteCount) {

      favoriteCount.textContent =
        String(count);

    }



    if (favoriteSummary) {

      favoriteSummary.hidden =
        count === 0;

    }



    if (!summary) {

      return;

    }



    const orderSummary =
      document.getElementById(
        'order-summary'
      );


    const bookingSummary =
      document.getElementById(
        'booking-summary'
      );



    const hasOrder =
      orderSummary &&
      !orderSummary.hidden;


    const hasBooking =
      bookingSummary &&
      !bookingSummary.hidden;



    const hasAnything =

      count > 0 ||

      hasOrder ||

      hasBooking;



    summary.hidden =
      !hasAnything;

  }



  /* =========================================================
     14. TẠO CARD NGHỆ NHÂN TRONG TRANG TÔI
  ========================================================= */

  function favoriteCard(artist) {
    const id = Number(artist.id);
    const name = escapeHtml(artist.name);
    const image = escapeHtml(artist.image);
    const detailUrl = artistDetailUrl(id);

    return `
      <article
        class="me-card favorite-artist-card"
        data-favorite-id="${id}"
      >
        <a
          class="me-card-image"
          href="${detailUrl}"
          aria-label="Xem hồ sơ ${name}"
        >
          <img
            src="${image}"
            alt="Nghệ nhân ${name}"
            loading="lazy"
          >
        </a>

        <div class="me-card-content">
          <h3>
            <a href="${detailUrl}">
              ${name}
            </a>
          </h3>

          <div class="me-card-actions">
            <span class="me-status favorite-status" style="margin-top: 0;">
              ♥ Đã yêu thích
            </span>

            <button
              class="remove-favorite"
              type="button"
              data-remove-favorite="${id}"
            >
              Bỏ yêu thích
            </button>
          </div>
        </div>
      </article>
    `;
  }



  /* =========================================================
     15. HIỂN THỊ NGHỆ NHÂN YÊU THÍCH TRONG TRANG TÔI
  ========================================================= */

  function renderFavoriteArtists() {

    const list =
      document.getElementById(
        'favorite-artists'
      );


    const empty =
      document.getElementById(
        'favorites-empty'
      );



    /*
        Không phải trang Tôi
    */

    if (
      !list &&
      !empty
    ) {

      return;

    }



    const ids =
      getFavoriteIds();



    const artists =
      ids

        .map(id =>
          findArtist(id)
        )

        .filter(Boolean);



    /*
        Nếu ID trong localStorage
        không còn tồn tại trong dữ liệu
    */

    if (
      artists.length !==
      ids.length
    ) {

      saveFavoriteIds(

        artists.map(
          artist =>
            Number(artist.id)
        )

      );

    }



    /* =========================
       RENDER CARD
    ========================== */

    if (list) {

      list.innerHTML =

        artists
          .map(
            favoriteCard
          )
          .join('');



      /* =========================
         BUTTON BỎ YÊU THÍCH
      ========================== */

      const removeButtons =

        list.querySelectorAll(
          '[data-remove-favorite]'
        );


      removeButtons.forEach(
        button => {

          button.addEventListener(
            'click',
            () => {

              const artistId =
                Number(
                  button.dataset
                    .removeFavorite
                );


              removeFavorite(
                artistId
              );


              renderFavoriteArtists();

            }
          );

        }
      );

    }



    /* =========================
       EMPTY STATE
    ========================== */

    if (empty) {

      empty.hidden =
        artists.length !== 0;

    }



    /* =========================
       SUMMARY
    ========================== */

    updateFavoriteSummary(
      artists.length
    );

  }



  /* =========================================================
     16. KHỞI ĐỘNG
  ========================================================= */

  function start() {

    /*
        Quan trọng:
        content-pages.js cũng dùng defer.

        Đặt artist-favorites.js
        SAU content-pages.js
        trong HTML.
    */

    setupArtistDetailFavorite();

    renderFavoriteArtists();

  }



  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      start,
      {
        once: true
      }
    );

  } else {

    start();

  }



  /* =========================================================
     17. KHI DANH SÁCH YÊU THÍCH THAY ĐỔI
  ========================================================= */

  document.addEventListener(

    'ngheNhanViet:favoritesChanged',

    () => {

      renderFavoriteArtists();

    }

  );



  /* =========================================================
     18. ĐỒNG BỘ NẾU MỞ NHIỀU TAB
  ========================================================= */

  window.addEventListener(
    'storage',
    event => {

      if (
        event.key !==
        STORAGE_KEY
      ) {

        return;

      }



      renderFavoriteArtists();



      const button =

        document.querySelector(
          '.artist-favorite-button'
        );


      if (button) {

        const artistId =

          Number(
            button.dataset.artistId
          );


        updateHeartButton(

          button,

          isFavorite(
            artistId
          )

        );

      }

    }
  );



  /* =========================================================
     19. CHO PHÉP FILE JS KHÁC SỬ DỤNG
  ========================================================= */

  window.NgheNhanVietFavorites = {

    getIds:
      getFavoriteIds,

    isFavorite:
      isFavorite,

    add:
      addFavorite,

    remove:
      removeFavorite,

    toggle:
      toggleFavorite

  };

})();
(() => {
    'use strict';

    const STORAGE_KEY =
        'ngheNhanViet.favoriteProducts';


    /* =========================================================
       ĐỌC DANH SÁCH SẢN PHẨM YÊU THÍCH
    ========================================================= */

    function getFavorites() {

        try {

            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || '[]'
            );

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                'Không đọc được sản phẩm yêu thích:',
                error
            );

            return [];

        }

    }


    /* =========================================================
       LƯU
    ========================================================= */

    function saveFavorites(products) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(products)
            );

        } catch (error) {

            console.error(
                'Không lưu được sản phẩm yêu thích:',
                error
            );

        }

    }


    /* =========================================================
       LẤY DỮ LIỆU PRODUCTS
    ========================================================= */

    function getProducts() {

        if (
            window.NepVietData &&
            Array.isArray(
                window.NepVietData.products
            )
        ) {

            return window.NepVietData.products;

        }

        return [];

    }


    function findProduct(id) {

        const productId =
            Number(id);

        return getProducts().find(
            product =>
                Number(product.id) === productId
        ) || null;

    }


    /* =========================================================
       KIỂM TRA YÊU THÍCH
    ========================================================= */

    function isFavorite(id) {

        const productId =
            Number(id);

        return getFavorites().some(
            product =>
                Number(product.id) === productId
        );

    }


    /* =========================================================
       THÊM YÊU THÍCH
    ========================================================= */

    function addFavorite(product) {

        if (
            !product ||
            !product.id
        ) {
            return;
        }

        const favorites =
            getFavorites();


        const exists =
            favorites.some(
                item =>
                    Number(item.id) ===
                    Number(product.id)
            );


        if (exists) {
            return;
        }


        favorites.push({

            id:
                Number(product.id),

            name:
                product.name || '',

            shortName:
                product.shortName ||
                product.name ||
                '',

            craft:
                product.craft || '',

            place:
                product.place || '',

            material:
                product.material || '',

            image:
                product.image || '',

            description:
                product.description || ''

        });


        saveFavorites(
            favorites
        );


        document.dispatchEvent(
            new CustomEvent(
                'ngheNhanViet:productFavoritesChanged'
            )
        );

    }


    /* =========================================================
       BỎ YÊU THÍCH
    ========================================================= */

    function removeFavorite(id) {

        const productId =
            Number(id);


        const favorites =
            getFavorites().filter(
                product =>
                    Number(product.id) !== productId
            );


        saveFavorites(
            favorites
        );


        document.dispatchEvent(
            new CustomEvent(
                'ngheNhanViet:productFavoritesChanged'
            )
        );

    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHtml(value) {

        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');

    }


    /* =========================================================
       ICON TRÁI TIM
    ========================================================= */

    function heartSvg() {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="
                        M12 20.4
                        4.2 13
                        A5.3 5.3 0 0 1
                        11.7 5.5
                        L12 5.8
                        l.3-.3
                        A5.3 5.3 0 0 1
                        19.8 13
                        L12 20.4Z
                    "
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>
            </svg>
        `;

    }


    /* =========================================================
       CẬP NHẬT GIAO DIỆN TIM
    ========================================================= */

    function updateHeart(
        button,
        active
    ) {

        button.classList.toggle(
            'is-favorite',
            active
        );


        button.setAttribute(
            'aria-pressed',
            String(active)
        );


        button.title =
            active
                ? 'Đã yêu thích'
                : 'Thêm vào yêu thích';


        button.setAttribute(
            'aria-label',
            active
                ? 'Bỏ sản phẩm khỏi danh sách yêu thích'
                : 'Thêm sản phẩm vào danh sách yêu thích'
        );

    }


    function setupProductDetail() {

    /*
        Chỉ chạy ở
        trang chi tiết sản phẩm
    */

    if (
        document.body.dataset.page !==
        'product-detail'
    ) {

        return;

    }



    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        Number(
            params.get('id') || 1
        );


    if (
        !Number.isSafeInteger(productId) ||
        productId <= 0
    ) {

        return;

    }



    /* =====================================================
       TÌM SẢN PHẨM
    ===================================================== */

    const product =
        findProduct(
            productId
        );


    if (!product) {

        return;

    }



    /* =====================================================
       TÌM VỊ TRÍ ĐẶT NÚT
    ===================================================== */

    const slot =
        document.querySelector(
            '.product-favorite-slot'
        );


    if (!slot) {

        return;

    }



    /*
        Không tạo 2 lần
    */

    if (
        slot.querySelector(
            '.product-favorite-button'
        )
    ) {

        return;

    }



    /* =====================================================
       TẠO BUTTON
    ===================================================== */

    const button =
        document.createElement(
            'button'
        );


    button.type =
        'button';


    button.className =
        'product-favorite-button';



    /* =====================================================
       RENDER TRẠNG THÁI
    ===================================================== */

    function renderButton() {

        const active =
            isFavorite(
                productId
            );


        button.classList.toggle(
            'is-favorite',
            active
        );


        button.setAttribute(
            'aria-pressed',
            String(active)
        );


        button.setAttribute(
            'aria-label',

            active

                ? `Bỏ ${product.shortName || product.name} khỏi danh sách yêu thích`

                : `Thêm ${product.shortName || product.name} vào danh sách yêu thích`
        );


        button.innerHTML = `

            ${heartSvg()}

            <span class="favorite-button-text">

                ${
                    active

                        ? 'Đã yêu thích'

                        : 'Yêu thích'
                }

            </span>

        `;

    }



    renderButton();



    /* =====================================================
       CLICK
    ===================================================== */

    button.addEventListener(
        'click',
        () => {


            if (
                isFavorite(
                    productId
                )
            ) {

                removeFavorite(
                    productId
                );

            } else {

                addFavorite(
                    product
                );

            }



            renderButton();



            button.classList.remove(
                'favorite-pop'
            );


            void button.offsetWidth;


            button.classList.add(
                'favorite-pop'
            );

        }
    );



    slot.appendChild(
        button
    );

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
                    <h3>
                        <a href="${url}">${name}</a>
                    </h3>

                    <div class="me-card-actions">
                        <span class="me-status product-favorite-status" style="margin-top: 0;">
                            ♥ Đã yêu thích
                        </span>

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


    /* =========================================================
       HIỂN THỊ TRONG TRANG TÔI
    ========================================================= */

    function renderFavoriteProducts() {

        const container =
            document.getElementById(
                'favorite-products'
            );


        const empty =
            document.getElementById(
                'product-favorites-empty'
            );


        if (
            !container &&
            !empty
        ) {
            return;
        }


        const favorites =
            getFavorites();


        if (container) {

            container.innerHTML =
                favorites
                    .map(
                        createProductCard
                    )
                    .join('');

        }


        if (empty) {

            empty.hidden =
                favorites.length > 0;

        }


        /*
            Nút bỏ yêu thích
        */

        container
            ?.querySelectorAll(
                '[data-remove-product-favorite]'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        'click',
                        () => {

                            const id =
                                Number(
                                    button.dataset
                                        .removeProductFavorite
                                );


                            removeFavorite(
                                id
                            );


                            renderFavoriteProducts();

                        }
                    );

                }
            );

    }


    /* =========================================================
       KHỞI ĐỘNG
    ========================================================= */

    function start() {

        setupProductDetail();

        renderFavoriteProducts();

    }


    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            start,
            {
                once: true
            }
        );

    } else {

        start();

    }


    document.addEventListener(
        'ngheNhanViet:productFavoritesChanged',
        renderFavoriteProducts
    );


    /*
        Đồng bộ nếu mở 2 tab
    */

    window.addEventListener(
        'storage',
        event => {

            if (
                event.key ===
                STORAGE_KEY
            ) {

                renderFavoriteProducts();

            }

        }
    );

})();
/* =========================================================
   TRẢI NGHIỆM
   - Yêu thích trải nghiệm
   - Đăng ký trải nghiệm
   - Hiển thị trong trang Tôi
========================================================= */

(() => {
    'use strict';


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    const BOOKING_KEY =
        'ngheNhanViet.experienceBookings';

    const FAVORITE_KEY =
        'ngheNhanViet.favoriteExperiences';



    /* =====================================================
       DỮ LIỆU
    ===================================================== */

    function getData() {

        return window.NepVietData || {};

    }


    function getExperiences() {

        const data =
            getData();


        return Array.isArray(
            data.experiences
        )
            ? data.experiences
            : [];

    }


    function getArtists() {

        const data =
            getData();


        return Array.isArray(
            data.artists
        )
            ? data.artists
            : [];

    }


    function findExperience(id) {

        const experienceId =
            Number(id);


        return (
            getExperiences().find(
                item =>
                    Number(item.id) ===
                    experienceId
            ) || null
        );

    }


    function findArtist(id) {

        const artistId =
            Number(id);


        return (
            getArtists().find(
                item =>
                    Number(item.id) ===
                    artistId
            ) || null
        );

    }



    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? '')

            .replaceAll(
                '&',
                '&amp;'
            )

            .replaceAll(
                '<',
                '&lt;'
            )

            .replaceAll(
                '>',
                '&gt;'
            )

            .replaceAll(
                '"',
                '&quot;'
            )

            .replaceAll(
                "'",
                '&#039;'
            );

    }



    /* =====================================================
       ĐỌC LOCAL STORAGE
    ===================================================== */

    function readStorage(key) {

        try {

            const data =
                JSON.parse(
                    localStorage.getItem(key) ||
                    '[]'
                );


            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.warn(
                'Không đọc được dữ liệu:',
                error
            );


            return [];

        }

    }



    /* =====================================================
       LƯU LOCAL STORAGE
    ===================================================== */

    function saveStorage(
        key,
        data
    ) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(data)
            );

        } catch (error) {

            console.warn(
                'Không lưu được dữ liệu:',
                error
            );

        }

    }



    /* =====================================================
       ID TRẢI NGHIỆM HIỆN TẠI
    ===================================================== */

    function getCurrentExperienceId() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const id =
            Number(
                params.get('id') || 1
            );


        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {

            return null;

        }


        return id;

    }



    /* =====================================================
       LINK CHI TIẾT
    ===================================================== */

    function experienceDetailUrl(id) {

        return (
            './chi-tiet-trai-nghiem.html?id=' +
            encodeURIComponent(id)
        );

    }



    /* =====================================================
       ICON TIM
    ===================================================== */

    function heartSvg() {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="
                        M12 20.4
                        4.2 13
                        A5.3 5.3 0 0 1
                        11.7 5.5
                        L12 5.8
                        l.3-.3
                        A5.3 5.3 0 0 1
                        19.8 13
                        L12 20.4Z
                    "
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>
            </svg>
        `;

    }



    /* =====================================================
       YÊU THÍCH TRẢI NGHIỆM
    ===================================================== */

    function getFavoriteExperienceIds() {

        return [
            ...new Set(

                readStorage(
                    FAVORITE_KEY
                )

                    .map(Number)

                    .filter(
                        id =>
                            Number.isSafeInteger(id) &&
                            id > 0
                    )

            )
        ];

    }


    function isExperienceFavorite(id) {

        return getFavoriteExperienceIds()
            .includes(
                Number(id)
            );

    }


    function toggleExperienceFavorite(id) {

        const experienceId =
            Number(id);


        let ids =
            getFavoriteExperienceIds();


        if (
            ids.includes(
                experienceId
            )
        ) {

            ids =
                ids.filter(
                    item =>
                        item !==
                        experienceId
                );

        } else {

            ids.push(
                experienceId
            );

        }


        saveStorage(
            FAVORITE_KEY,
            ids
        );


        document.dispatchEvent(
            new CustomEvent(
                'ngheNhanViet:experienceFavoritesChanged'
            )
        );


        return ids.includes(
            experienceId
        );

    }



    /* =====================================================
       DANH SÁCH ĐĂNG KÝ
    ===================================================== */

    function getBookings() {

        return readStorage(
            BOOKING_KEY
        );

    }



    /* =====================================================
       FORMAT NGÀY
    ===================================================== */

    function formatDate(value) {

        if (!value) {

            return 'Chưa chọn ngày';

        }


        const date =
            new Date(
                value + 'T00:00:00'
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;

        }


        return new Intl.DateTimeFormat(
            'vi-VN',
            {
                day:
                    '2-digit',

                month:
                    '2-digit',

                year:
                    'numeric'
            }
        ).format(date);

    }



    /* =====================================================
       LƯU ĐĂNG KÝ
    ===================================================== */

    function saveBooking(
        experience,
        form
    ) {

        const formData =
            new FormData(form);


        const artist =
            experience.artistId

                ? findArtist(
                    experience.artistId
                )

                : null;


        const booking = {

            bookingId:
                Date.now() +
                '-' +
                experience.id,


            experienceId:
                Number(
                    experience.id
                ),


            title:
                experience.title ||
                '',


            shortTitle:
                experience.shortTitle ||
                experience.title ||
                '',


            place:
                experience.place ||
                '',


            duration:
                experience.duration ||
                '',


            image:
                experience.image ||
                '',


            artistName:
                artist
                    ? artist.name
                    : '',


            name:
                String(
                    formData.get('name') ||
                    ''
                ).trim(),


            email:
                String(
                    formData.get('email') ||
                    ''
                ).trim(),


            phone:
                String(
                    formData.get('phone') ||
                    ''
                ).trim(),


            date:
                String(
                    formData.get('date') ||
                    ''
                ),


            people:
                Math.max(
                    1,
                    Number(
                        formData.get(
                            'people'
                        ) || 1
                    )
                ),


            note:
                String(
                    formData.get('note') ||
                    ''
                ).trim(),


            createdAt:
                new Date()
                    .toISOString()

        };


        const bookings =
            getBookings();


        bookings.unshift(
            booking
        );


        saveStorage(
            BOOKING_KEY,
            bookings
        );


        document.dispatchEvent(
            new CustomEvent(
                'ngheNhanViet:experienceBookingsChanged'
            )
        );


        return booking;

    }



    /* =====================================================
       XÓA ĐĂNG KÝ
    ===================================================== */

    function removeBooking(
        bookingId
    ) {

        const bookings =
            getBookings()
                .filter(
                    item =>
                        String(
                            item.bookingId
                        ) !==
                        String(
                            bookingId
                        )
                );


        saveStorage(
            BOOKING_KEY,
            bookings
        );


        document.dispatchEvent(
            new CustomEvent(
                'ngheNhanViet:experienceBookingsChanged'
            )
        );

    }



    /* =====================================================
       CHI TIẾT TRẢI NGHIỆM
    ===================================================== */

    function setupExperienceDetail() {

        if (
            document.body.dataset.page !==
            'experience-detail'
        ) {

            return;

        }


        const experienceId =
            getCurrentExperienceId();


        if (!experienceId) {

            return;

        }


        const experience =
            findExperience(
                experienceId
            );


        if (!experience) {

            return;

        }



        /* -------------------------------------------------
           ELEMENT
        ------------------------------------------------- */

        const bookingButton =
            document.getElementById(
                'show-booking'
            );


        const favoriteButton =
            document.getElementById(
                'favorite-experience'
            );


        const notice =
            document.getElementById(
                'experience-notice'
            );


        const modal =
            document.getElementById(
                'booking-modal'
            );


        const form =
            document.getElementById(
                'booking-form'
            );


        const modalName =
            document.getElementById(
                'booking-experience-name'
            );


        const dateInput =
            form
                ?.querySelector(
                    'input[name="date"]'
                );



        /* =================================================
           TÊN TRẢI NGHIỆM TRONG FORM
        ================================================= */

        if (modalName) {

            modalName.textContent =
                experience.title;

        }



        /* =================================================
           KHÔNG CHO CHỌN NGÀY QUÁ KHỨ
        ================================================= */

        if (dateInput) {

            const now =
                new Date();


            const today =
                new Date(
                    now.getTime() -
                    now.getTimezoneOffset() *
                    60000
                )

                    .toISOString()

                    .slice(
                        0,
                        10
                    );


            dateInput.min =
                today;

        }



        /* =================================================
           THÔNG BÁO
        ================================================= */

        function showNotice(message) {

            if (!notice) {

                return;

            }


            notice.textContent =
                message;


            notice.hidden =
                false;

        }



        /* =================================================
           CẬP NHẬT NÚT YÊU THÍCH
        ================================================= */

        function renderFavoriteButton() {

            if (!favoriteButton) {

                return;

            }


            const active =
                isExperienceFavorite(
                    experienceId
                );


            favoriteButton
                .classList
                .toggle(
                    'is-favorite',
                    active
                );


            favoriteButton.setAttribute(
                'aria-pressed',
                String(active)
            );


            favoriteButton.innerHTML = `

                ${heartSvg()}

                <span>
                    ${
                        active

                            ? 'Đã yêu thích'

                            : 'Yêu thích'
                    }
                </span>

            `;

        }



        /* =================================================
           MỞ FORM
        ================================================= */

        function openBookingModal() {

            if (!modal) {

                return;

            }


            modal.hidden =
                false;


            document.body
                .classList
                .add(
                    'modal-open'
                );


            requestAnimationFrame(
                () => {

                    form
                        ?.querySelector(
                            'input[name="name"]'
                        )
                        ?.focus();

                }
            );

        }



        /* =================================================
           ĐÓNG FORM
        ================================================= */

        function closeBookingModal() {

            if (!modal) {

                return;

            }


            modal.hidden =
                true;


            document.body
                .classList
                .remove(
                    'modal-open'
                );

        }



        /* =================================================
           CLICK ĐĂNG KÝ
        ================================================= */

        bookingButton
            ?.addEventListener(
                'click',
                openBookingModal
            );



        /* =================================================
           CLICK YÊU THÍCH
        ================================================= */

        favoriteButton
            ?.addEventListener(
                'click',
                () => {

                    const active =
                        toggleExperienceFavorite(
                            experienceId
                        );


                    renderFavoriteButton();


                    if (active) {

                        showNotice(
                            'Đã lưu trải nghiệm vào mục Tôi.'
                        );

                    } else {

                        showNotice(
                            'Đã bỏ trải nghiệm khỏi danh sách yêu thích.'
                        );

                    }

                }
            );



        /* =================================================
           ĐÓNG MODAL
        ================================================= */

        modal
            ?.querySelectorAll(
                '[data-booking-close]'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        'click',
                        closeBookingModal
                    );

                }
            );



        /* =================================================
           ESC
        ================================================= */

        document.addEventListener(
            'keydown',
            event => {

                if (
                    event.key ===
                    'Escape' &&

                    modal &&

                    !modal.hidden
                ) {

                    closeBookingModal();

                }

            }
        );



        /* =================================================
           SUBMIT FORM
        ================================================= */

        form
            ?.addEventListener(
                'submit',
                event => {

                    event.preventDefault();


                    if (
                        !form.checkValidity()
                    ) {

                        form.reportValidity();

                        return;

                    }


                    saveBooking(
                        experience,
                        form
                    );


                    form.reset();


                    /*
                        Sau reset input date
                        vẫn phải giữ min
                    */

                    if (dateInput) {

                        const now =
                            new Date();


                        dateInput.min =
                            new Date(
                                now.getTime() -
                                now.getTimezoneOffset() *
                                60000
                            )

                                .toISOString()

                                .slice(
                                    0,
                                    10
                                );

                    }


                    closeBookingModal();


                    showNotice(
                        'Đăng ký đã được lưu. Xem lại trong mục Tôi → Trải nghiệm đã đăng ký.'
                    );

                }
            );



        renderFavoriteButton();

    }



    /* =====================================================
       CARD ĐĂNG KÝ TRONG TRANG TÔI
    ===================================================== */

    function bookingCard(
        booking
    ) {

        const url =
            experienceDetailUrl(
                booking.experienceId
            );


        return `

            <article
                class="
                    me-card
                    booking-experience-card
                "
            >

                <a
                    class="me-card-image"
                    href="${url}"
                >

                    <img
                        src="${escapeHtml(
                            booking.image
                        )}"
                        alt="${escapeHtml(
                            booking.shortTitle ||
                            booking.title
                        )}"
                        loading="lazy"
                    >

                </a>


                <div class="me-card-content">

                    <p class="card-kicker">

                        ${escapeHtml(
                            booking.place
                        )}

                    </p>


                    <h3>

                        <a href="${url}">

                            ${escapeHtml(
                                booking.shortTitle ||
                                booking.title
                            )}

                        </a>

                    </h3>


                    <p>

                        <strong>
                            Ngày:
                        </strong>

                        ${escapeHtml(
                            formatDate(
                                booking.date
                            )
                        )}

                    </p>


                    <p>

                        <strong>
                            Số người:
                        </strong>

                        ${escapeHtml(
                            booking.people
                        )}

                    </p>


                    ${
                        booking.artistName

                            ? `

                                <p>

                                    <strong>
                                        Nghệ nhân:
                                    </strong>

                                    ${escapeHtml(
                                        booking.artistName
                                    )}

                                </p>

                            `

                            : ''
                    }


                    <span
                        class="
                            me-status
                            booking-status
                        "
                    >

                        Đã đăng ký

                    </span>


                    <div class="me-card-actions">

                        <a
                            class="card-link"
                            href="${url}"
                        >

                            Xem trải nghiệm

                            <span aria-hidden="true">
                                ↗
                            </span>

                        </a>


                        <button
                            class="remove-booking"
                            type="button"
                            data-remove-experience-booking="${escapeHtml(
                                booking.bookingId
                            )}"
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
                    <h3>
                        <a href="${url}">${title}</a>
                    </h3>

                    <div class="me-card-actions">
                        <span class="me-status experience-favorite-status" style="margin-top: 0;">
                            ♥ Đã yêu thích
                        </span>

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


    /* =====================================================
       CẬP NHẬT TỔNG QUAN TÔI
    ===================================================== */

    function updateExperienceSummary() {

        const summary =
            document.getElementById(
                'me-summary'
            );


        const bookingSummary =
            document.getElementById(
                'booking-summary'
            );


        const bookingCount =
            document.getElementById(
                'booking-count'
            );


        const favoriteSummary =
            document.getElementById(
                'experience-favorite-summary'
            );


        const favoriteCount =
            document.getElementById(
                'experience-favorite-count'
            );


        const bookings =
            getBookings();


        const favorites =
            getFavoriteExperienceIds();



        if (bookingCount) {

            bookingCount.textContent =
                String(
                    bookings.length
                );

        }


        if (bookingSummary) {

            bookingSummary.hidden =
                bookings.length === 0;

        }


        if (favoriteCount) {

            favoriteCount.textContent =
                String(
                    favorites.length
                );

        }


        if (favoriteSummary) {

            favoriteSummary.hidden =
                favorites.length === 0;

        }


        /*
            Không tự ẩn summary nếu
            còn artist/product summary đang hiện
        */

        if (summary) {

            const visibleItems =
                [
                    ...summary.querySelectorAll(
                        'article'
                    )
                ]
                    .filter(
                        item =>
                            !item.hidden
                    );


            summary.hidden =
                visibleItems.length === 0;

        }

    }



    /* =====================================================
       RENDER ĐĂNG KÝ TRONG TÔI
    ===================================================== */

    function renderExperienceBookings() {

        const list =
            document.getElementById(
                'my-bookings'
            );


        const empty =
            document.getElementById(
                'bookings-empty'
            );


        if (
            !list &&
            !empty
        ) {

            return;

        }


        const bookings =
            getBookings();



        if (list) {

            list.innerHTML =
                bookings
                    .map(
                        bookingCard
                    )
                    .join('');


            list
                .querySelectorAll(
                    '[data-remove-experience-booking]'
                )

                .forEach(
                    button => {

                        button.addEventListener(
                            'click',
                            () => {

                                removeBooking(
                                    button.dataset
                                        .removeExperienceBooking
                                );

                            }
                        );

                    }
                );

        }



        if (empty) {

            empty.hidden =
                bookings.length > 0;

        }



        updateExperienceSummary();

    }



    /* =====================================================
       RENDER YÊU THÍCH TRONG TÔI
    ===================================================== */

    function renderFavoriteExperiences() {

        const list =
            document.getElementById(
                'favorite-experiences'
            );


        const empty =
            document.getElementById(
                'experience-favorites-empty'
            );


        if (
            !list &&
            !empty
        ) {

            return;

        }


        const experiences =
            getFavoriteExperienceIds()

                .map(
                    id =>
                        findExperience(id)
                )

                .filter(Boolean);



        if (list) {

            list.innerHTML =
                experiences
                    .map(
                        favoriteExperienceCard
                    )
                    .join('');


            list
                .querySelectorAll(
                    '[data-remove-experience-favorite]'
                )

                .forEach(
                    button => {

                        button.addEventListener(
                            'click',
                            () => {

                                const id =
                                    Number(
                                        button.dataset
                                            .removeExperienceFavorite
                                    );


                                if (
                                    isExperienceFavorite(
                                        id
                                    )
                                ) {

                                    toggleExperienceFavorite(
                                        id
                                    );

                                }

                            }
                        );

                    }
                );

        }



        if (empty) {

            empty.hidden =
                experiences.length > 0;

        }



        updateExperienceSummary();

    }



    /* =====================================================
       KHỞI ĐỘNG
    ===================================================== */

    function startExperienceStorage() {

        setupExperienceDetail();

        renderExperienceBookings();

        renderFavoriteExperiences();

    }



    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            startExperienceStorage,
            {
                once: true
            }
        );

    } else {

        startExperienceStorage();

    }



    /* =====================================================
       EVENT ĐĂNG KÝ
    ===================================================== */

    document.addEventListener(
        'ngheNhanViet:experienceBookingsChanged',
        () => {

            renderExperienceBookings();

        }
    );



    /* =====================================================
       EVENT YÊU THÍCH
    ===================================================== */

    document.addEventListener(
        'ngheNhanViet:experienceFavoritesChanged',
        () => {

            renderFavoriteExperiences();


            /*
                Nếu đang ở trang chi tiết,
                cập nhật luôn nút tim
            */

            if (
                document.body.dataset.page ===
                'experience-detail'
            ) {

                const button =
                    document.getElementById(
                        'favorite-experience'
                    );


                const id =
                    getCurrentExperienceId();


                if (
                    button &&
                    id
                ) {

                    const active =
                        isExperienceFavorite(
                            id
                        );


                    button
                        .classList
                        .toggle(
                            'is-favorite',
                            active
                        );


                    button.setAttribute(
                        'aria-pressed',
                        String(active)
                    );


                    button.innerHTML = `

                        ${heartSvg()}

                        <span>

                            ${
                                active

                                    ? 'Đã yêu thích'

                                    : 'Yêu thích'
                            }

                        </span>

                    `;

                }

            }

        }
    );



    /* =====================================================
       ĐỒNG BỘ NẾU MỞ NHIỀU TAB
    ===================================================== */

    window.addEventListener(
        'storage',
        event => {

            if (
                event.key ===
                BOOKING_KEY
            ) {

                renderExperienceBookings();

            }


            if (
                event.key ===
                FAVORITE_KEY
            ) {

                renderFavoriteExperiences();

            }

        }
    );

})();
/* =========================================================
   ĐĂNG NHẬP / ĐĂNG KÝ MÔ PHỎNG TRÊN TRANG TÔI (#auth-modal)
========================================================= */
(() => {
    'use strict';

    const SESSION_KEY = 'ngheNhanViet.authSession';

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

    function setupAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (!modal) return;

        const loginPanel = document.getElementById('auth-login-panel');
        const registerPanel = document.getElementById('auth-register-panel');
        const loginForm = document.getElementById('demo-login-form');
        const registerForm = document.getElementById('demo-register-form');
        const welcomeHeading = document.querySelector('.me-welcome-text h1, .me-hero h1');
        const authActions = document.querySelector('.me-auth-actions');

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
                activePanel?.querySelector('input')?.focus();
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

        function renderSessionState() {
            const session = readSession();
            if (!authActions) return;

            if (session && (session.name || session.email)) {
                const displayName = session.name || session.email.split('@')[0];
                if (welcomeHeading) {
                    welcomeHeading.textContent = `Xin chào, ${displayName}`;
                }
                authActions.innerHTML = `
                    <span class="me-status" style="margin-top:0; padding:8px 14px; font-size:12px;">
                        Tài khoản: ${displayName}
                    </span>
                    <button class="button button-outline" type="button" id="demo-logout-btn">
                        Đăng xuất
                    </button>
                `;
                document.getElementById('demo-logout-btn')?.addEventListener('click', () => {
                    clearSession();
                    window.location.reload();
                });
            } else {
                if (welcomeHeading) {
                    welcomeHeading.textContent = 'Xin chào';
                }
            }
        }

        // Bắt sự kiện mở popup từ các nút [data-auth-open]
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
            }
        });

        // Đóng bằng phím ESC
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !modal.hidden) {
                closeModal();
            }
        });

        // Xử lý submit form Đăng nhập
        loginForm?.addEventListener('submit', event => {
            event.preventDefault();
            const formData = new FormData(loginForm);
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

            const savedName = email.split('@')[0];
            saveSession({ name: savedName, email });

            if (msg) {
                msg.classList.remove('error');
                msg.textContent = 'Đăng nhập mô phỏng thành công!';
            }

            setTimeout(() => {
                loginForm.reset();
                closeModal();
                renderSessionState();
            }, 500);
        });

        // Xử lý submit form Đăng ký
        registerForm?.addEventListener('submit', event => {
            event.preventDefault();
            const formData = new FormData(registerForm);
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

            saveSession({ name, email });

            if (msg) {
                msg.classList.remove('error');
                msg.textContent = 'Đăng ký tài khoản mô phỏng thành công!';
            }

            setTimeout(() => {
                registerForm.reset();
                closeModal();
                renderSessionState();
            }, 500);
        });

        renderSessionState();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAuthModal, { once: true });
    } else {
        setupAuthModal();
    }
})();