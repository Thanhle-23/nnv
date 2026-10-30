document.addEventListener("DOMContentLoaded", () => {
  const showBookingButton = document.getElementById("show-booking");
  const bookingForm = document.getElementById("booking-form");

  if (showBookingButton && bookingForm) {
    showBookingButton.addEventListener("click", () => {
      bookingForm.classList.add("booking-form-open");
      bookingForm.scrollIntoView({ behavior: "smooth", block: "start" });
      bookingForm.querySelector("input")?.focus();
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(bookingForm);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const date = String(data.get("date") || "");
      const people = Number(data.get("people") || 0);
      const message = bookingForm.querySelector(".form-message");
      const validEmail = /^\S+@\S+\.\S+$/.test(email);

      if (!name || !validEmail || !phone || !date || people < 1) {
        message.textContent = "Vui lòng điền đầy đủ thông tin hợp lệ.";
        message.classList.add("error");
        return;
      }

      const bookings = JSON.parse(localStorage.getItem("nepVietBookings") || "[]");
      bookings.push({
        name,
        email,
        phone,
        date,
        people,
        note: String(data.get("note") || ""),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem("nepVietBookings", JSON.stringify(bookings));

      message.textContent = "Đăng ký trải nghiệm thành công – Đây là dữ liệu demo.";
      message.classList.remove("error");
      bookingForm.reset();
    });
  }
});
