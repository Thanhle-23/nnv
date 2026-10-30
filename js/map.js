document.addEventListener("DOMContentLoaded", () => {
  const mapFrame = document.getElementById("craft-map");
  const openMapLink = document.getElementById("map-open");

  document.querySelectorAll(".map-select").forEach((button) => {
    button.addEventListener("click", () => {
      const latitude = Number(button.dataset.lat);
      const longitude = Number(button.dataset.lon);
      const box = [longitude - 0.06, latitude - 0.05, longitude + 0.06, latitude + 0.05]
        .map((value) => value.toFixed(3))
        .join("%2C");

      mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${latitude}%2C${longitude}`;
      openMapLink.href = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=13/${latitude}/${longitude}`;

      document.querySelectorAll(".place-card").forEach((card) => {
        card.classList.remove("selected");
      });

      button.closest(".place-card")?.classList.add("selected");
    });
  });
});
