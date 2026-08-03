import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

export function initReportSidePanel() {
  const reportBtn = document.getElementById('report-btn');
  const sidePanel = document.getElementById('report-side-panel');
  const closePanelBtn = document.getElementById('close-report-panel-btn');

  reportBtn.addEventListener('click', () => {
    sidePanel.classList.toggle('close');
  });

  closePanelBtn.addEventListener('click', () => {
    sidePanel.classList.add('close');
  });
}

// Function to initialize the date picker
export function initReportDatePicker() {
  const dateInput = document.getElementById('report-date-range');
  const panel = document.getElementById('report-side-panel');

  if (!dateInput) return;

  const fp = flatpickr(dateInput, {
    inline: true,
    mode: 'range', // Enables start date -> end date selection
    showMonths: 1, //displays 1 month's calendar at a time
    dateFormat: 'Y-m-d', // Formats date string as YYYY-MM-DD
    maxDate: 'today', // Restricts users from picking future dates for reports

    // Callback fired when dates are selected
    onChange: function (selectedDates, dateStr, instance) {
      // selectedDates is an array of Date objects [startDate, endDate]
      if (selectedDates.length === 2) {
        const startDate = selectedDates[0];
        const endDate = selectedDates[1];

        // console.log('Start Date:', instance.formatDate(startDate, 'Y-m-d'));
        // console.log('End Date:', instance.formatDate(endDate, 'Y-m-d'));
      }
    },
  });

  return fp; // Returns the Flatpickr instance for further control if needed
}
