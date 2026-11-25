require('dotenv').config();
const connectDB = require('../../database/db.js');
const student = require('../../database/studentModel');
const allotments = require('../../database/machineAllotmentModel');
require('../../database/resourceRequestModel.js');

async function AddCummulativeRatingToStudentDocs() {
  connectDB();
  const allStudentDocs = await student.find({});

  let i = 1;
  for (const studentDoc of allStudentDocs) {
    // console.log('studentDoc: ', studentDoc);
    const requests = studentDoc.resourceRequests;
    // console.log('requests: ', requests);
    const studentAllotments = await allotments
      .find({
        resourceRequestId: { $in: requests },
        utilizationScore: { $exists: true },
      })
      .setOptions({ includeInactive: true, includeDeleted: true })
      .populate({
        path: 'resourceRequestId',
      });

    // console.log('allotments: ', studentAllotments);
    let cummulativeRating = 0;
    let totalDuration = 0;
    let j = 1;
    for (const allotment of studentAllotments) {
      //   console.log('allotment: ', allotment);
      const request = allotment.resourceRequestId;
      //   console.log('request: ', request);
      const duration = request.duration;
      console.log('duration: ', duration);
      const rating = allotment.utilizationScore;
      console.log('rating: ', rating);
      cummulativeRating += duration * rating;
      totalDuration += duration;
      console.log('processed allotment ', j, ' of student ', i);
      j += 1;
    }

    if (cummulativeRating && totalDuration) {
      studentDoc.resourceUtilizationScore = cummulativeRating / totalDuration;
      studentDoc.totalAllotmentsDuration = totalDuration;
    }

    await studentDoc.save();
    console.log('student doc ', i, ' of ', allStudentDocs.length, ' saved.');
    i += 1;
  }
  process.exit(0);
}

AddCummulativeRatingToStudentDocs();
