const express = require('express');
const multer  = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json({limit: '50mb', extended: true}));
router.use(cors());
router.use(express.json());
router.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const database = require('./dbConnect');
let collection = null;

const getRandomId = () => (Math.random().toString(36).replace('0.', ''));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

database.initialize(function (dbCollection) {
  collection = dbCollection;
}, function (err) {
  throw (err);
});

router.get("/getAllCourses", (request, response) => {
  collection.find().toArray((error, result) => {
    if (error) throw error;
    response.send(result);
  });
});

router.get("/getCourse/:id", (request, response) => {
  collection.findOne({ id: request.params.id }, (error, result) => {
    if (error) throw error;
    response.json(result);
  });
});

router.post("/insertCourse", (request, response) => {
  let item = request.body;
  item.id = getRandomId();
  item.files = [];
  collection.insertOne(item, (insertError, _) => {
    if (insertError) throw insertError;
    collection.find().toArray(function (error, result) {
      if (error) throw error;
      response.json(result);
    });
  });
});

router.put("/updateCourse/:id", (request, response) => {
  const item = request.body;
  collection.updateOne({ id: request.params.id }, { $set: item }, (updateError, _) => {
    if (updateError) throw updateError;
    collection.findOne({ id: request.params.id }, (error, result) => {
      if (error) throw error;
      response.json(result);
    });
  });
});

router.put("/updateCourseFiles/:id", upload.array('file', 5), (request, response) => {
  const item = request.body;
  const fileList = concatFileList(JSON.parse(item.fileList), request);
  const updatedCourse = {
    ...item,
    files: fileList,
  }
  delete updatedCourse.fileList;
  collection.updateOne({ id: request.params.id }, { $set: updatedCourse }, (updateError, updateResult) => {
    if (updateError) throw updateError;
    collection.findOne({ id: request.params.id }, (error, result) => {
      if (error) throw error;
      response.json(result);
    });
  });
});


router.delete("/deleteCourse/:id", (request, response) => {
  collection.deleteOne({ id: request.params.id }, function (error, result) {
    if (error) throw error;
    response.json(result);
  });
});

router.delete("/deleteFile/:courseId/:fileId", (request, response) => {
  collection.findOne({ id: request.params.courseId }, (error, result) => {
      if (error) throw error;
      const data = result.files.filter(item => item.id !== request.params.fileId);
      response.json(data);
    });
});

const concatFileList = (existingFiles, request) => {
  const updtatedFiles = request.files.map(file => {
    return {
      ...file,
      id: getRandomId(),
      path: `${request.protocol}://${request.get("host")}/${file.path}`
    }
  });
  return [...existingFiles, ...updtatedFiles];
}

module.exports = router;