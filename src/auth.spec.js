
const fetch = require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`

describe('Validate Auth functionality', () => {

	it('should log in a valid user', (done) => {
		
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
		}).then(r => r.json())
		.then( res => {
      // console.log(res);
			expect(res.result).toBe('Logged In');
      done();
    });
  });

  it('should log out current user', (done) => {
		
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
      return setCookie;
    })
    .then((setCookie) => {
      myHeader = new Headers();
      myHeader.append('Content-Type', 'application/json');
      myHeader.append('cookie', setCookie)
      fetch(url('/logout'), {
          method: 'PUT',
          headers: myHeader
      })
      .then(res => res.json())
      .then(res => {
          // console.log(res);
          expect(res['result']).toBe('Logged Out');
          done();
      })
    })
  })

  it('should register a new user', (done) => {
		
    myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
		fetch(url('/register'), {
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify({
        userProfile: {
          username:"test",
          displayName:"test",
          email:"test@rice.edu",
          phone:"9999999999",
          birthday:"765954000000",
          zipcode:"12345",
          password:"asd",
          confirm:"asd"
        }
      }),
      // credentials: 'same-origin', // send cookies
      // credentials: 'include',     // send cookies, even in CORS
		}).then(r => r.json())
		.then( res => {
      // console.log(res);
			expect(res.result).toBe('Successfully Registered');
      done();
    });
  });

});