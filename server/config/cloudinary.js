const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dk9ivsv7y',
    api_key: '921655857757635',
    api_secret: 'tBwGnMH_YBE1TUrkWX4cmoUUKNU'
});

// Test the configuration
cloudinary.api.ping()
    .then(result => console.log('Cloudinary connection successful:', result))
    .catch(error => console.error('Cloudinary connection failed:', error));

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'medcare/doctors',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
    }
});

const upload = multer({ storage: storage });

// Export only the cloudinary instance
module.exports = cloudinary;
