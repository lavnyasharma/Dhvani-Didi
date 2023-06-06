const express = require('express');
const multer = require('multer');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
const upload = multer({ dest: 'uploads/' });

const SPREADSHEET_ID = '1NpS050jqZD2OFY7-ERdlnXOnLAdqte4916i6KRIvaUI'; // Replace with your Google Sheets ID
const CREDENTIALS_FILE = '/Users/lavanya/dhvanididi/credentials.json';
var cors = require('cors')

app.use(cors())
const parseResume = (resumePath) => {
  return new Promise((resolve, reject) => {
    // Implement your resume parsing logic here
    // Extract the required fields from the parsed resume
    // For example:
    const parsedResume = {
      gender: 'Female',
      experience: '5 years',
      isPHD: true,
      location: 'New York',
    };
    resolve(parsedResume);
  });
};

app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ error: 'No resume file found' });
    }

    const parsedResume = await parseResume(file.path);
    console.log('Parsed Resume:', parsedResume);

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth(require(CREDENTIALS_FILE));
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const rowData = {
      Gender: parsedResume.gender,
      Experience: parsedResume.experience,
      'Is PhD': parsedResume.isPHD,
      Location: parsedResume.location,
    };

    await sheet.addRow(rowData);

    res.json({ success: true, data: parsedResume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error parsing resume' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
