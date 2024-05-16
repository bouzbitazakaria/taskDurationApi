import express from 'express';
import bodyParser from 'body-parser';
const app = express();

app.use(bodyParser.json());

function isHoliday(date, holidays) {
  return holidays.some(holiday => holiday.toDateString() === date.toDateString());
}

function isSunday(date) {
  return date.getDay() === 0; 
}

app.post('/api', (req, res) => {
  const startDateTime = req.body.startDateTime; 
  const durationHours = parseInt(req.body.durationHours);
  const holidays = req.body.holidays.map(holiday => new Date(holiday));

  function checkDateFormat(dateString) {
    return dateString.includes('/') ? 'format1' : 'format2';
}
// Convert date string to ISO 8601 format
function convertToISOFormat(dateString) {
    if (checkDateFormat(dateString) === 'format1') {
        const [month, day, yearHourMinute] = dateString.split('/');
        const [year, hourMinute] = yearHourMinute.split(' ');
        const [hour, minute] = hourMinute.split(':');
        return new Date(year, month - 1, day, hour, minute).toISOString();
    } else {
        return new Date(dateString).toISOString();
    }
}

// Convert startDateTime to ISO 8601 format
const startDateTimeISO = convertToISOFormat(startDateTime);

// Parse the start date and time
const startDate = new Date(startDateTimeISO);
  let endDate = new Date(startDate);
  let hoursToAdd = durationHours;
  
  while (hoursToAdd > 0) {
      if (isHoliday(endDate, holidays) || isSunday(endDate)) {
          endDate.setDate(endDate.getDate() + 1); // Move to the next day
          continue;
      }
      
      if (endDate.getHours() >= 8 && endDate.getHours() < 17) {
          endDate.setHours(endDate.getHours() + 1); // Move to the next hour
          hoursToAdd--;
      } else {
          
          endDate.setDate(endDate.getDate() + 1);
          endDate.setHours(8);
      }
  }
  const formattedEndDate = endDate.toLocaleString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true });
  // Send the end date back as a response
  res.json(formattedEndDate );
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
