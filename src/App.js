import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { FaCloudUploadAlt } from 'react-icons/fa';
import './App.css';

const SPREADSHEET_ID = '1NpS050jqZD2OFY7-ERdlnXOnLAdqte4916i6KRIvaUI'; // Replace with your Google Sheets ID
const CREDENTIALS_FILE = '/Users/lavanya/dhvanididi/credentials.json';

function App() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const parseResume = (resume) => {
    return new Promise((resolve, reject) => {
      Papa.parse(resume, {
        complete: (results) => {
          const data = results.data;
          // Extract the required fields from the parsed resume data
          // For example, assuming the gender is in the first row, second column:
          const gender = data[0][1];
          // Similarly, extract other fields as needed
          // Resolve with the extracted fields
          resolve({ gender });
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
  
      const { data } = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: {
          spreadsheetId: SPREADSHEET_ID,
          credentials: CREDENTIALS_FILE,
        },
      });
  
      const parsedResume = await parseResume(file);
      console.log('Parsed Resume:', parsedResume);
  
      // Store the parsed resume data in Google Sheets
      const { success } = await axios.post('http://localhost:5000/store-data', {
        data,
      });
  
      if (success) {
        // Handle success and display success message
        console.log('Data stored successfully in Google Sheets');
        alert('Resume parsed and data stored successfully.');
      } else {
        // Handle error and display error message
        console.error('Failed to store data in Google Sheets');
        alert('Error storing data in Google Sheets. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Error parsing resume. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1 className="title">Resume Parser</h1>
      <div
        className="dropzone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        {file ? (
          <p>File selected: {file.name}</p>
        ) : (
          <>
            <FaCloudUploadAlt className="upload-icon" />
            <p>Drag and drop your resume file here, or click to select a file.</p>
          </>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button onClick={handleUpload} disabled={!file} className="upload-button">
        Upload
      </button>
    </div>
  );
}

export default App;
