var mongodb = require('mongodb');

module.exports = function(app, db) {

  app.get('/classes', function(req, res) {

    var courses = db.collection('courses');
    courses.find({}).toArray( function(err, results) {
      if(err) {
        console.log(err);
        return res.send({error: "DB error"});
      }
      res.send(results);
    });
  });

  // find a course by call ID
  app.get('/classes/call/:call', function(req, res) {

    var courses = db.collection('courses');
    var call_number = req.param('call');

    courses.find({call: call_number}).toArray(function(err, results) {
      if(err) {
        console.log(err)
        return res.send({err:"DB error"});
      }
      res.send(results);
    });
  });

  app.get('/classes/subject/:subject', function(req, res) {

    var courses = db.collection('courses');
    var subject = req.param('subject');
    courses.find({subject:subject}).toArray(function(err, results) {
      if(err) {
        console.log(err);
        return res.send({error: "DB error"});
      }
      res.send(results);
    });
  });

  app.get('/classes/subject/:subject/course/:course_id', function(req, res) {
    var classes = db.collection('courses');
    var subject = req.param('subject');
    var course_id = req.param('course_id');

    db.collection('courses').find({
      subject: subject,
      course: course_id
    }).toArray(function(err, results) {
      if(err) {
        console.log(err);
        return res.send({error: "DB error"});
      }
      res.send(results);
    });
  });

  app.get('/*', function(req, res) {
    res.send({error: "Invalid Route"}, 404);
  });
}
