
const fetch = require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`
let articleId = '';
let articleText = '';
let setCookie = '';

describe('Validate Article functionality', () => {

	it('should give me eight articles', (done) => {
		myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
		fetch(url('/login'), {
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify({
				username:'xx21',
				password:'asd'
      }),
      // credentials: 'same-origin', // send cookies
      // credentials: 'include',     // send cookies, even in CORS
    })
    .then(res => {
			const setCookie = res.headers._headers['set-cookie'][0];
			// console.log(setCookie)
      return setCookie;
    })
    .then((setCookie) => {
			myHeader = new Headers();
      myHeader.append('Content-Type', 'application/json');
      myHeader.append('cookie', setCookie)
			fetch(url('/articles'), {
				method: 'GET',
				headers: myHeader
			})
			.then(r => r.json())
			.then(r => {
				//
				// Explanation:
				// Because there is a unit test for article post later, and it might be done before this one,
				// so the length of the articles might be 7 or 8. 
				//
				flag = false;
				if (r.articles.length == 7 || r.articles.length == 8) {
					flag = true;
				}
				expect(flag).toBeTruthy();
				articleId = r.articles[0]._id;
				articleText = r.articles[0].text;
				done();
			})		
		})
	});


	it('should give me the article with a valid id', (done) => {
		myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');
		// Login First
		fetch(url('/login'), {
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify({
				username:'xx21',
				password:'asd'
      }),
    })
    .then(res => {
			setCookie = res.headers._headers['set-cookie'][0];
      return setCookie;
    })
    .then((setCookie) => {
			myHeader = new Headers();
      myHeader.append('Content-Type', 'application/json');
			myHeader.append('cookie', setCookie)
			// Get all the articles, then get one of the article's id and textg
			fetch(url('/articles'), {
				method: 'GET',
				headers: myHeader
			})
			.then(r => r.json())
			.then(r => {
				articleId = r.articles[0]._id;
				articleText = r.articles[0].text;
			})
			.then(() => {
				myHeader = new Headers();
				myHeader.append('Content-Type', 'application/json');
				myHeader.append('cookie', setCookie)
				fetch(url('/articles/' + articleId), {
					method: 'GET',
					headers: myHeader
				})
				.then(r => r.json())
				.then(r => {
					expect(r.articles.text).toBe(articleText);
					done();
				})
			})		
		})
	})

	it('should not give me the article with a invalid id', (done) => {
		myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');
		// Login First
		fetch(url('/login'), {
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify({
				username:'xx21',
				password:'asd'
      }),
    })
    .then(res => {
			const setCookie = res.headers._headers['set-cookie'][0];
      return setCookie;
    })
    .then((setCookie) => {
			myHeader = new Headers();
			myHeader.append('Content-Type', 'application/json');
			myHeader.append('cookie', setCookie)
			fetch(url('/articles/' + '5be2597192a67511103f9b5c'), {
				method: 'GET',
				headers: myHeader
			})
			.then(r => r.json())
			.then(r => {
				expect(r.result).toBe('Article Not Found');
				done();
			})
		})
	});

	it('should give me list of articles with new article after post new article', (done) => {
		myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');
		// Login First
		fetch(url('/login'), {
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify({
				username:'xx21',
				password:'asd'
      }),
    })
    .then(res => {
			const setCookie = res.headers._headers['set-cookie'][0];
      return setCookie;
    })
    .then((setCookie) => {
			myHeader = new Headers();
			myHeader.append('Content-Type', 'application/json');
			myHeader.append('cookie', setCookie)
	
			fetch(url('/article'), {
				method: 'POST',
				headers: myHeader,
				body: JSON.stringify({
					text: "This is a new article of xx"
				})
			})
			.then(r => r.json())
			.then(r => {
				expect(r.articles.length).toBe(2);
				flag = false;
				r.articles.forEach(article => {
					if(article.text == "This is a new article of xx") {
						flag = true;
					}
				})
				expect(flag).toBeTruthy();
				done();
			})
		})
	});


});