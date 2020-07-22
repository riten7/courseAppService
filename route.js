const express = require('express');
const multer  = require('multer');
const cors = require('cors');
require('dotenv').config();

const upload = multer({ dest: 'uploads/' })
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(express.json({limit: '50mb', extended: true}));
router.use(cors());
router.use(express.json());

const database = require('./dbConnect');
let collection = null;

const getCourseId = () => (Math.random().toString(36).replace('0.', ''));

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
  item.id = getCourseId();
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

// router.put("/updateCourse/:id", upload.array('files', 5), (request, response) => {
//   const item = request.body;
//   // const updatedCourse = {
//   //   ...item,
//   //   files: request.files,
//   // }
//   collection.updateOne({ id: request.params.id }, { $set: updatedCourse }, (updateError, updateResult) => {
//     if (updateError) throw updateError;
//     collection.findOne({ id: request.params.id }, (error, result) => {
//       if (error) throw error;
//       response.json(result);
//     });
//   });
// });


router.delete("/deleteCourse/:id", (request, response) => {
  collection.deleteOne({ id: request.params.id }, function (error, result) {
    if (error) throw error;
    response.json(result);
  });
});

module.exports = router;