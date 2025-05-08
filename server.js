const express = require('express');
const multer = require('multer');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database
let database = {
  examinees: [],
  examiners: [],
  clients: [],
  adminData: require('./admin_template.json')
};

// Multer configuration - accept any file with any field name
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all files
  }
}).any(); // Accept any field name

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        error: 'File upload failed',
        details: err.message 
      });
    }

    try {
      // Reset previous data
      database.examinees = [];
      database.examiners = [];
      database.clients = [];

      // Process all uploaded files
      req.files.forEach(file => {
        const workbook = xlsx.read(file.buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        const filename = file.originalname.toLowerCase();
        if (filename.includes('examinee')) {
          database.examinees = data.map(item => ({
            id: item.ExamineeID || item.ID,
            name: item.Name
          }));
        } else if (filename.includes('examiner')) {
          database.examiners = data.map(item => ({
            id: item.ExaminerID || item.ID,
            name: item.Name
          }));
        } else if (filename.includes('client')) {
          database.clients = data.map(item => ({
            id: item.ClientID || item.ID,
            name: item.Name
          }));
        }
      });

      res.json({
        success: true,
        counts: {
          examinees: database.examinees.length,
          examiners: database.examiners.length,
          clients: database.clients.length
        }
      });
    } catch (error) {
      console.error('Processing error:', error);
      res.status(500).json({
        error: 'File processing failed',
        details: error.message
      });
    }
  });
});

// Generate schedule endpoint
app.post('/generate-schedule', (req, res) => {
  try {
    // Validate data
    if (!database.examinees.length || !database.examiners.length || !database.clients.length) {
      const missing = [];
      if (!database.examinees.length) missing.push('examinees');
      if (!database.examiners.length) missing.push('examiners');
      if (!database.clients.length) missing.push('clients');
      return res.status(400).json({ 
        error: 'Missing data', 
        details: `Please upload: ${missing.join(', ')}` 
      });
    }

    // Configuration - make these configurable
    const config = {
      startTime: '08:00',      // Exam start time
      endTime: '17:00',        // Exam end time
      slotDuration: 30,         // Minutes per slot
      breakDuration: 15,        // Minutes between stations
      stationsPerTrack: 3       // From your admin template
    };

    // Calculate time slots
    const timeSlots = generateTimeSlots(config);
    
    // Generate schedule
    const schedule = database.adminData.map(admin => ({
      adminId: admin.adminId,
      tracks: admin.tracks.map((track, trackIndex) => ({
        trackId: track.trackId,
        stations: track.stations.map((station, stationIndex) => {
          // Calculate participant indices with rotation
          const participantIndex = (trackIndex * track.stations.length + stationIndex) % 
            Math.max(database.examinees.length, database.examiners.length, database.clients.length);
          
          // Get time slot based on station rotation
          const timeSlotIndex = stationIndex % timeSlots.length;
          
          return {
            stationId: station,
            examinee: database.examinees[participantIndex % database.examinees.length],
            examiner: database.examiners[participantIndex % database.examiners.length],
            client: database.clients[participantIndex % database.clients.length],
            timeSlot: timeSlots[timeSlotIndex],
            durationMinutes: config.slotDuration
          };
        })
      }))
    }));

    res.json(schedule);
  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({ 
      error: 'Schedule generation failed',
      details: error.message 
    });
  }
});

// Debug endpoint
app.get('/debug-data', (req, res) => {
  res.json({
    status: 'success',
    data: {
      examinees: database.examinees.length,
      examiners: database.examiners.length,
      clients: database.clients.length,
      adminData: database.adminData.length > 0
    }
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
function generateTimeSlots(config) {
  const slots = [];
  let currentTime = new Date(`2000-01-01T${config.startTime}:00`);
  const endTime = new Date(`2000-01-01T${config.endTime}:00`);
  
  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime);
    slotEnd.setMinutes(slotEnd.getMinutes() + config.slotDuration);
    
    if (slotEnd > endTime) break;
    
    slots.push(
      `${formatTime(currentTime)}-${formatTime(slotEnd)}`
    );
    
    currentTime = new Date(slotEnd);
    currentTime.setMinutes(currentTime.getMinutes() + config.breakDuration);
  }
  
  return slots;
}

// Helper function to format time as HH:MM
function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
