// Example for CSV generation
const json2csv = require('json2csv').parse; // Install json2csv package

exports.generateCSV = (data) => {
  const { summary, records } = data;
  const csvData = records.map(record => ({
    date: record.date,
    day: record.day,
    check_in_time: record.check_in_time,
    check_out_time: record.check_out_time,
    working_hours: record.working_hours,
    status: record.status,
    location: `${record.location.lat}, ${record.location.lng}`,
  }));

  const csv = json2csv(csvData);
  return csv;
};

// Example for PDF generation
const PDFDocument = require('pdfkit');

exports.generatePDF = (data) => {
  const doc = new PDFDocument();
  doc.fontSize(12);
  doc.text(`Attendance Report - Summary`, { align: 'center' });
  
  doc.text(`Total Days: ${data.summary.total_days}`);
  doc.text(`Present Days: ${data.summary.present_days}`);
  doc.text(`Absent Days: ${data.summary.absent_days}`);
  doc.text(`Late Days: ${data.summary.late_days}`);
  doc.text(`Half Days: ${data.summary.half_days}`);
  doc.text(`Total Working Hours: ${data.summary.working_hours}`);
  
  doc.text('\nDetailed Records:');
  data.records.forEach(record => {
    doc.text(`${record.date} (${record.day}): ${record.status} - Working Hours: ${record.working_hours}`);
  });

  doc.end();
  return doc;
};
