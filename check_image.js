import http from 'http';

const url = 'http://localhost:5173/photos/1.JPG';

http.get(url, (res) => {
    console.log(`StatusCode: ${res.statusCode}`);
    console.log(`ContentType: ${res.headers['content-type']}`);
    console.log(`ContentLength: ${res.headers['content-length']}`);

    if (res.statusCode === 200) {
        console.log('SUCCESS: Image is being served.');
    } else {
        console.log('FAILURE: Image not found or error.');
    }
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
