document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const backToTop = document.querySelector(".back-to-top");

  function closeMenu() {
    if (!menuToggle || !nav) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Mở menu");
    nav.classList.remove("open");
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Mở menu" : "Đóng menu");
      nav.classList.toggle("open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }
const floatingBack = document.querySelector('.floating-back');

if (floatingBack) {

    const toggleFloatingBack = () => {

        if (window.scrollY > 180) {

            floatingBack.classList.add('is-visible');

        } else {

            floatingBack.classList.remove('is-visible');

        }

    };

    window.addEventListener(
        'scroll',
        toggleFloatingBack,
        { passive: true }
    );

    toggleFloatingBack();
}
  function updateHeaderOnScroll() {
    const scrollPosition = window.scrollY;

    if (header) {
      header.classList.toggle("scrolled", scrollPosition > 20);
    }

    if (backToTop) {
      backToTop.classList.toggle("visible", scrollPosition > 450);
    }
  }

  window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Hiện dần các nội dung khi chúng xuất hiện trong màn hình.
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // Số liệu dưới đây chỉ minh họa giao diện prototype.
  const counters = document.querySelectorAll("[data-count]");

  function animateCounter(element) {
    const target = Number(element.dataset.count);
    const startTime = performance.now();
    const duration = 900;

    function updateCounter(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      element.textContent = String(Math.floor(target * easedProgress));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => {
      counter.textContent = counter.dataset.count;
    });
  }

  // Tìm kiếm chuyển từ khóa sang tim-kiem.html bằng phương thức GET.
  document.querySelectorAll('form[action="tim-kiem.html"]').forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = form.querySelector('input[name="q"]');

      if (!input || !input.value.trim()) {
        event.preventDefault();
        input?.focus();
      }
    });
  });

  // Hiển thị tên tài khoản demo ở Header nếu đã đăng nhập mô phỏng.
  const session = JSON.parse(localStorage.getItem("nepVietSession") || "null");

  if (session) {
    const loginLink = document.querySelector("[data-login-link]");
    const registerLink = document.querySelector("[data-register-link]");

    if (loginLink) {
      loginLink.textContent = session.name || "Tài khoản";
      loginLink.href = "index.html#top";
    }

    if (registerLink) {
      registerLink.textContent = "Đăng xuất";
      registerLink.href = "#logout";
      registerLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("nepVietSession");
        window.location.reload();
      });
    }
  }
   setupPageTransition();
});

function setupPageTransition() {

    // Hiệu ứng khi trang mới xuất hiện
    document.body.classList.add('page-entering');

    window.setTimeout(() => {
        document.body.classList.remove('page-entering');
    }, 400);


    // Bắt các link nội bộ
    document.addEventListener('click', event => {

        const link = event.target.closest('a');

        if (!link) return;

        const href = link.getAttribute('href');

        // Không xử lý những link không cần chuyển trang
        if (
            !href ||
            href.startsWith('#') ||
            href.startsWith('javascript:') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            link.target === '_blank' ||
            link.hasAttribute('download') ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        const targetUrl = new URL(link.href, window.location.href);

        // Chỉ áp dụng với link trong cùng website
        if (targetUrl.origin !== window.location.origin) {
            return;
        }

        event.preventDefault();

        document.body.classList.remove('page-entering');
        document.body.classList.add('page-leaving');

        setTimeout(() => {
            window.location.href = link.href;
        }, 220);

    });


    // Xử lý khi bấm Back / Forward trình duyệt
    window.addEventListener('pageshow', () => {
        document.body.classList.remove('page-leaving');
    });
}