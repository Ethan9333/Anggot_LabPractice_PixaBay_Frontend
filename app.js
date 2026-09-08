document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const typeSelect = document.getElementById("type-select");
  const challengeButtons = document.querySelectorAll(".challenge-btn");
  const resultsGrid = document.getElementById("results-grid");
  const loadingIndicator = document.getElementById("loading");
  const errorMessage = document.getElementById("error-message");

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    const type = typeSelect.value;
    if (query) {
      fetchPixabayMedia(query, type);
    }
  });

  challengeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const query = button.getAttribute("data-query");
      const type = button.getAttribute("data-type") || "photo";
      searchInput.value = query;
      fetchPixabayMedia(query, type);
    });
  });

  async function fetchPixabayMedia(query, mediaType) {
    clearUI();
    showLoading(true);

    const apiKey = typeof CONFIG !== "undefined" ? CONFIG.PIXABAY_API_KEY : "";
    if (!apiKey || apiKey === "YOUR_PIXABAY_API_KEY_HERE") {
      showError("API key missing. Please configure config.js or set up deployment environment variables.");
      showLoading(false);
      return;
    }

    const encodedQuery = encodeURIComponent(query);
    const isVideo = mediaType === "video";
    
    const baseUrl = isVideo
      ? `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodedQuery}`
      : `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo`;

    try {
      const response = await fetch(baseUrl);

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      const data = await response.json();
      displayResults(data.hits, isVideo);
    } catch (err) {
      showError(`Failed to fetch results: ${err.message}`);
    } finally {
      showLoading(false);
    }
  }

  function displayResults(hits, isVideo) {
    if (!hits || hits.length === 0) {
      errorMessage.textContent = "No results found for your query.";
      errorMessage.classList.remove("hidden");
      return;
    }

    hits.forEach((item) => {
      const card = document.createElement("div");
      card.className = "media-card";

      if (isVideo) {
        const videoSrc = item.videos?.small?.url || item.videos?.tiny?.url;
        card.innerHTML = `
          <video controls preload="metadata">
            <source src="${videoSrc}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <div class="media-info">
            <p><strong>Tags:</strong> ${item.tags}</p>
            <p><strong>Views:</strong> ${item.views} | <strong>Likes:</strong> ${item.likes}</p>
          </div>
        `;
      } else {
        card.innerHTML = `
          <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
          <div class="media-info">
            <p><strong>Tags:</strong> ${item.tags}</p>
            <p><strong>Likes:</strong> ${item.likes} | <strong>Downloads:</strong> ${item.downloads}</p>
          </div>
        `;
      }

      resultsGrid.appendChild(card);
    });
  }

  function clearUI() {
    resultsGrid.innerHTML = "";
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingIndicator.classList.remove("hidden");
    } else {
      loadingIndicator.classList.add("hidden");
    }
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");
  }
});