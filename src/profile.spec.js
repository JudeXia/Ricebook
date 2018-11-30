
const fetch = require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`
let articleId = '';
let articleText = '';
let setCookie = '';

describe('Validate Headline functionality', () => {

	it('should get headline for current logged in user', (done) => {
		myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
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
			fetch(url('/headlines'), {
				method: 'GET',
				headers: myHeader
			})
			.then(r => r.json())
			.then(r => {
        //
				// Explanation:
				// Because there is a unit test for headline put later, and it might be done before this one,
				// so the headline might be 'I'm Jude. ' or 'Revised Headline'
				//
        flag = false;
        if(r.headlines[0].headline == 'I\'m Jude. ' || r.headlines[0].headline == 'Revised Headline') {
          flag = true;
        }
        expect(flag).toBeTruthy();
				done();
			})		
		})
  });
  
  it('should edit headline for current logged in user', (done) => {
		myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
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
			fetch(url('/headline'), {
				method: 'PUT',
        headers: myHeader,
        body: JSON.stringify({
          headline: "Revised Headline"
        })
			})
			.then(r => r.json())
			.then(r => {
        // console.log(r);
        expect(r.headline).toBe('Revised Headline');
				done();
			})		
		})
	});

});