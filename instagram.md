# How the Instagram endpoints work and flow

This will be used for getting User Posts, then mapping the data to the 'User Posts' table.

End point:

const url = 'https://instagram-scraper-20251.p.rapidapi.com/userreels/?username_or_id=instagram';
const options = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '05190f78f6msh18b5c339652b410p105a0ejsn01a80d032b0b',
		'x-rapidapi-host': 'instagram-scraper-20251.p.rapidapi.com'
	}
};

try {
	const response = await fetch(url, options);
	const result = await response.text();
	console.log(result);
} catch (error) {
	console.error(error);
}

1. Start by doing a test to this endpoint.
2. Take the required parameters based on the table we have from the API output
3. Map each parameter to the table columns and ensure the data displays
4. Ensure that the api keys set in the settings page (for rapidapi) are correctly being saved for this endpoint.


