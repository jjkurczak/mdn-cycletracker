// create constants for the form and the form controls
const newPeriodFormEl = document.getElementsByTagName("form")[0];
const startDateInputEl = document.getElementById("start-date");
const endDateInputEl = document.getElementById("end-date");
const pastPeriodContainer = document.getElementById("past-periods");

// Add the storage key as an app-wide constant
const STORAGE_KEY = "period-tracker";

// Listen to form submissions
newPeriodFormEl.addEventListener("submit", (event) => {
	// Prevent the form from submitting to the server
	// since everything is client-side
	event.preventDefault();

	// Get the start and end data from the form
	const startDate = startDateInputEl.value;
	const endDate = endDateInputEl.value;

	// Check if the dates are invalid
	if ( checkDatesInvalid(startDate, endDate) ) {
		// if the dates are invalid, exit
		return;
	}

	// store the new period in our client-side storage
	storeNewPeriod(startDate, endDate);

	// refresh the UI
	renderPastPeriods();

	// reset the form
	newPeriodFormEl.reset();
});

function checkDatesInvalid(startDate, endDate) {
	// check that the end date is after start date and neither is null
	if (!startDate || !endDate || startDate > endDate) {
		// To make the validation robust we could:
		// 1. add error messaging based on error type
		// 2. Alert assistive technology users about the error
		// 3. move focus to the error location
		// instead, for now, we clear the dates if either
		// or both are invalid
		newPeriodFormEl.reset();
		// as dates are invalid, we return true
		return true;
	}
	// else
	return false;
}

function storeNewPeriod(startDate, endDate) {
	// get data from storage
	const periods = getAllStoredPeriods();

	// add the new period object to the end of the array of period objects
	periods.push( {startDate, endDate} );

	// sort the array so that periods are ordered by start date, from newest to oldest
	periods.sort((a,b) => {
		return new Date(b.startDate) - new Date(a.startDate);
	});

	// store the updated array back in the storage
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
}

function getAllStoredPeriods() {
	// get the string of period data from localStorage
	const data = window.localStorage.getItem(STORAGE_KEY);

	// if no periods were stored, default to an empty array
	// otherwise, return the stored data as parsed JSON
	const periods = data ? JSON.parse(data) : [];

	return periods;
}

function renderPastPeriods() {
	// get the parsed string of periods, or an empty array
	const periods = getAllStoredPeriods();

	// exit if there are no periods
	if ( periods.length === 0 ) {
		return;
	}

	// clear the list of past periods, since we're going to re-render it
	pastPeriodContainer.innerHTML = "";

	const pastPeriodHeader = document.createElement("h2");
	pastPeriodHeader.textContent = "Past periods";

	const pastPeriodList = document.createElement("ul");

	// loop over all periods and render them
	periods.forEach((period) => {
		const periodEl = document.createElement("li");
		periodEl.textContent = `From ${formatDate(
			period.startDate,
		)} to ${formatDate(period.endDate)}`;
		pastPeriodList.appendChild(periodEl);
	});

	pastPeriodContainer.appendChild(pastPeriodHeader);
	pastPeriodContainer.appendChild(pastPeriodList);
}

function formatDate(dateString) {
	// convert the date string to a Date object
	const date = new Date(dateString);

	// format the date into a locale-specific string
	// include your locale for better user experience
	return date.toLocaleDateString("en-US", { timeZone: "UTC"});
}

// Start the app by rendering the past periods.
renderPastPeriods();