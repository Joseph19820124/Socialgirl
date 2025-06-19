const url = 'https://instagram-scraper-20251.p.rapidapi.com/searchreels/?keyword=insta&pagination_token=%3Cpagination%20token%3E';
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