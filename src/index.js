import "./css/styles.css";
import debounce from "lodash.debounce";
import { Notify } from "notiflix/build/notiflix-notify-aio";
import { fetchCountries } from "./fetchCountries";

const DEBOUNCE_DELAY = 300;

const input = document.querySelector("#search-box");
const list = document.querySelector(".country-list");
const infoAboutCountries = document.querySelector(".country-info");

const cleanMarkup = (ref) => (ref.innerHTML = "");

const inputEvent = (e) => {
	const textInput = e.target.value.trim();

	if (!textInput) {
		cleanMarkup(list);
		cleanMarkup(infoAboutCountries);
		return;
	}
	fetchCountries(textInput)
		.then((data) => {
			console.log(data);
			if (data.length > 10) {
				Notify.info(
					"Too many matches found. Please enter a more specific name",
				);
				return;
			}
			renderMarkup(data);
		})
		.catch((error) => {
			cleanMarkup(list);
			cleanMarkup(infoAboutCountries);
			Notify.failure("Oops, there is no country with that name");
		});
};
const renderMarkup = (data) => {
	if (data.length === 1) {
		cleanMarkup(list);
		const markupInfo = createInfoMarkup(data);
		infoAboutCountries.innerHTML = markupInfo;
	} else {
		cleanMarkup(infoAboutCountries);
		const markupList = createMarkupList(data);
		list.innerHTML = markupList;
	}
};

const createMarkupList = (data) => {
	return data
		.map(
			({ name, flags }) =>
				`<li><img src="${flags.png}" alt="${name.official}" width="60" height="40"> ${name.official}</li>`,
		)
		.join("");
};

const createInfoMarkup = (data) => {
	return data.map(
		({ name, capital, population, flags, languages }) =>
			`<h1><img src="${flags.png}" alt="${
				name.official
			}" width="40" height="40">${name.official}</h1>
      <p>Capital: ${capital}</p>
      <p>Population: ${population}</p>
      <p>Languages: ${Object.values(languages)}</p>`,
	);
};

input.addEventListener("input", debounce(inputEvent, DEBOUNCE_DELAY));
