const mysql = require("mysql")
require("dotenv").config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    database: process.env.DB_NAME
})

const multer = require("multer");
const path = require("path");

const EventImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/eventimages/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const UserImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/users/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const CollegeImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/colleges/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const EventPdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/eventpdfs/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const StudFIleStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/studfile/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const ImagefileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
}

const PDFfileFilter = (req, file, cb) => {
    // Check if the file is a PDF
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept the file
    } else {
        // Reject the file
        cb(new Error('Only PDF files are allowed'), false);
    }
}

const XLSXFilter = (req, file, cb) => {
    if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.endsWith('.xlsx')
    ) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only XLSX files are allowed'), false);
    }
}


// Multer upload setup
const EventUpload = multer({
    storage: EventImageStorage,
    fileFilter: ImagefileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 20 MB limit
    }
});

const UserUpload = multer({
    storage: UserImageStorage,
    fileFilter: ImagefileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 20 MB limit
    }
});

const EventPdf = multer({
    storage: EventPdfStorage,
    fileFilter: PDFfileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB limit
    }
});

const CollegeUpload = multer({
    storage: CollegeImageStorage,
    fileFilter: ImagefileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    }
});

const StudUpload = multer({
    storage: StudFIleStorage,
    fileFilter: XLSXFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB limit
    }
});

// If you're looking to organize it within an object
const UploadModel = {
    EventImageUpload: EventUpload, // Assign the configured multer instance directly
    UserImageUpload: UserUpload,
    EventPdfupload: EventPdf,
    CollegeImageupload: CollegeUpload,
    StudentFileUpload: StudUpload
};

module.exports = UploadModel;
