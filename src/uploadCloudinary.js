////////////////////////////////
// Upload files to Cloudinary //
////////////////////////////////
const multer = require('multer')
const stream = require('stream')
const cloudinary = require('cloudinary')

if (!process.env.CLOUDINARY_URL) {
    console.error('*******************************************************************************')
    console.error('*******************************************************************************\n')
    console.error('You must set the CLOUDINARY_URL environment variable for Cloudinary to function\n')
    console.error('\texport CLOUDINARY_URL="cloudinary:// get value from heroku"\n')
    console.error('*******************************************************************************')
    console.error('*******************************************************************************')
    process.exit(1)
}

const doUpload = (req, res, next) => {

	const uploadStream = cloudinary.uploader.upload_stream(result => {    	
		// capture the url and public_id and add to the request
		req.fileurl = result.url
		req.fileid = result.public_id
		next()
	});

	// multer can save the file locally if we want
	// instead of saving locally, we keep the file in memory
	// multer provides req.file and within that is the byte buffer

	// we create a passthrough stream to pipe the buffer
	// to the uploadStream function for cloudinary.
	const s = new stream.PassThrough()
	// console.log(req.file);
	s.end(req.file.buffer)
	s.pipe(uploadStream)
	s.on('end', uploadStream.end)

	// and the end of the buffer we tell cloudinary to end the upload.
}

// multer parses multipart form data.  Here we tell
// it to expect a single file upload named 'image'
// Read this function carefully so you understand
// what it is doing!
const uploadImage = (req, res, next) => {
	// console.log(req);
  // console.log(req.file);
  // console.log(req.file)
	
  multer().single('image')(req, res, () => {
    if (req.file) {
      doUpload(req, res, next)
    } else {
      next()
    }
  });   
}

module.exports = uploadImage;
