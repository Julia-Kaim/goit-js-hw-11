import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "./css/styles.css";

import axios from "axios";
import "simplelightbox/dist/simple-lightbox.min.css";

// useful functions
const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelector(s);

// Fetch functions
const JSONtoJS = (response) => response.json();

const searchForm = qs("#search-form");
const gallery = qs(".gallery");
const loadMoreBtn = qs(".btn-load-more");

let query = "";
let page = 1;
let simpleLightBox;
const perPage = 40;

const viewUsers = (images) => {
	const markup = images
		.map((image) => {
			const {
				id,
				largeImageURL,
				webformatURL,
				tags,
				likes,
				views,
				comments,
				downloads,
			} = image;
			return `
        <a class="gallery__element" href="${largeImageURL}">
          <div class="gallery-item" id="${id}">
            <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b class="info-des">Likes</b>${likes}</p>
              <p class="info-item"><b class="info-des">Views</b>${views}</p>
              <p class="info-item"><b class="info-des">Comments</b>${comments}</p>
              <p class="info-item"><b class="info-des"
			  >Downloads</b>${downloads}</p>
            </div>
          </div>
        </a>
      `;
		})
		.join("");

	gallery.insertAdjacentHTML("beforeend", markup);
};

// axios and pixabay
axios.defaults.baseURL = "https://pixabay.com/api/";
const KEY = "34856693-e3065cdefd04353a1725658fc";
async function fetchImages(query, page, perPage) {
	const response = await axios.get(
		`?key=${KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
	);
	return response;
}

const onSearchForm = (e) => {
	e.preventDefault();
	window.scrollTo({ top: 0 });
	page = 1;
	query = e.currentTarget.searchQuery.value.trim();
	gallery.innerHTML = "";
	loadMoreBtn.classList.add("is-hidden");

	if (query === "") {
		alertNoEmptySearch();
		return;
	}

	fetchImages(query, page, perPage)
		.then(({ data }) => {
			if (data.totalHits === 0) {
				alertNoImagesFound();
			} else {
				viewUsers(data.hits);
				simpleLightBox = new SimpleLightbox(".gallery a").refresh();
				alertImagesFound(data);

				if (data.totalHits > perPage) {
					loadMoreBtn.classList.remove("is-hidden");
				}
			}
		})
		.catch((error) => console.log(error))
		.finally(() => {
			searchForm.reset();
		});
};

const onLoadMoreBtn = () => {
	page += 1;
	simpleLightBox.destroy();

	fetchImages(query, page, perPage)
		.then(({ data }) => {
			viewUsers(data.hits);
			simpleLightBox = new SimpleLightbox(".gallery a").refresh();

			const totalPages = Math.ceil(data.totalHits / perPage);

			if (page > totalPages) {
				loadMoreBtn.classList.add("is-hidden");
				alertEndOfSearch();
			}
		})
		.catch((error) => console.log(error));
};

const alertImagesFound = (data) => {
	Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
};

const alertNoEmptySearch = () => {
	Notiflix.Notify.failure(
		"The search string cannot be empty. Please specify your search query.",
	);
};

const alertNoImagesFound = () => {
	Notiflix.Notify.failure(
		"Sorry, there are no images matching your search query. Please try again.",
	);
};

const alertEndOfSearch = () => {
	Notiflix.Notify.failure(
		"We're sorry, but you've reached the end of search results.",
	);
};
const toTopBtn = document.querySelector(".btn-to-top");

const onScroll = () => {
	const scrolled = window.pageYOffset;
	const coords = document.documentElement.clientHeight;

	if (scrolled > coords) {
		toTopBtn.classList.add("btn-to-top--visible");
	}
	if (scrolled < coords) {
		toTopBtn.classList.remove("btn-to-top--visible");
	}
};

const onToTopBtn = () => {
	if (window.pageYOffset > 0) {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
};

window.addEventListener("scroll", onScroll);
toTopBtn.addEventListener("click", onToTopBtn);
onScroll();
onToTopBtn();

searchForm.addEventListener("submit", onSearchForm);
loadMoreBtn.addEventListener("click", onLoadMoreBtn);

