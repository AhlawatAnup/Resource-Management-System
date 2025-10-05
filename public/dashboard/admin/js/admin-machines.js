document.addEventListener('DOMContentLoaded', () => {
  const importBtn = document.getElementById('importCsvBtn');
  const importInput = document.getElementById('importCsvInput');

  importBtn.addEventListener('click', () => importInput.click());

  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic client-side check
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      importBtn.disabled = true;
      importBtn.textContent = 'Uploading...';

      const resp = await fetch('/dashboard/admin/upload-machines', {
        method: 'POST',
        body: formData,
        credentials: 'include' // send cookies for session auth
      });

      const json = await resp.json();
      if (!resp.ok) {
        alert('Import failed: ' + (json.error || resp.statusText));
      } else {
        const msg = `Imported: ${json.imported} / ${json.total}`;
        if (json.skipped && json.skipped.length) {
          alert(msg + '\nSkipped rows: ' + json.skipped.length + '\nCheck console for details');
          console.log('Skipped rows:', json.skipped);
        } else {
          alert(msg);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Upload error: ' + err.message);
    } finally {
      importBtn.disabled = false;
      importBtn.textContent = 'Import CSV';
      importInput.value = '';
    }
  });
});
