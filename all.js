'use strict';

const loader = document.getElementById('loader');
const overlay = document.getElementById('overlay');
const showLoader = function () {
  loader.classList.remove('hidden-el');
  overlay.classList.remove('hidden-el');
};

const hideLoader = function () {
  loader.classList.add('hidden-el');
  overlay.classList.add('hidden-el');
};

const pageTitle = document.getElementById('page-title');
const displayError = function (message) {
  const alert = document.createElement('p');
  alert.textContent = `⚠️ ${message}`;
  alert.classList.add('alert', 'alert--error');

  pageTitle.insertAdjacentElement('afterend', alert);
};

const displaySuccess = function (message) {
  const alert = document.createElement('p');
  alert.textContent = `✅ ${message}`;
  alert.classList.add('alert', 'alert--success');

  pageTitle.insertAdjacentElement('afterend', alert);
};

const participantsTable = document.getElementById('participants-table');
const dataTable = new simpleDatatables.DataTable(participantsTable, {
  columns: [
    {
      select: 4,
      type: 'date',
      format: 'MYSQL'
    }
  ],
  perPageSelect: [10, 15, 25, 50, 100, 250, 500, 1000],
  perPage: 10
});

const getAllParticipants = async function () {
  try {
    showLoader();

    const res = await fetch('https://mokshaeats.com/ak/getAllParticipant.php');

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Something went wrong!');
    }

    if (data.length === 0) {
      return;
    }

    const newRows = [];

    data.forEach(participant => {
      const newRow = [
        participant.id,
        participant.registration_number,
        participant.full_name,
        participant.email,
        participant.registered_at,
        `<button data-id="${participant.id}" class="delete-btn">Delete</button>`
      ];

      newRows.push(newRow);
    });

    dataTable.insert({ data: newRows });
  } catch (error) {
    const existingAlerts = document.querySelectorAll('.alert--error');
    existingAlerts.forEach(alert => alert.remove());
    displayError(error?.message || 'Something went wrong!');
    console.error(error);
  } finally {
    hideLoader();
  }
};

getAllParticipants();

const downloadCsvBtn = document.getElementById('download-csv-btn');

const downloadCsv = async function (table) {
  const header = Array.from(table.querySelectorAll('th')).map(
    th => th.textContent
  );
  const rows = Array.from(table.querySelectorAll('tr')).slice(1);

  const csvContent = [
    header.slice(0, -1).join(','),
    ...rows.map(row =>
      Array.from(row.children)
        .slice(0, -1)
        .map(td => td.textContent)
        .join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'participants.csv';
  a.click();
};

downloadCsvBtn.addEventListener('click', function () {
  downloadCsv(participantsTable);
});

participantsTable.addEventListener('click', async function (event) {
  if (!event.target.matches('.delete-btn')) {
    return;
  }

  const deleteBtn = event.target;
  const participantId = deleteBtn.dataset.id;

  if (!confirm('Are you sure you want to delete this participant?')) {
    return;
  }

  try {
    showLoader();

    const res = await fetch(
      `https://mokshaeats.com/ak/deleteParticipant.php?id=${participantId}`,
      {
        method: 'DELETE'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || 'Something went wrong!');
    }

    const correspondingRow = deleteBtn.closest('tr');
    const correspondingRowIndex = +correspondingRow.dataset.index;
    dataTable.rows.remove(correspondingRowIndex);

    const existingAlerts = document.querySelectorAll('.alert--success');
    existingAlerts.forEach(alert => alert.remove());
    displaySuccess('Participant deleted successfully!');
  } catch (error) {
    const existingAlerts = document.querySelectorAll('.alert--error');
    existingAlerts.forEach(alert => alert.remove());
    displayError(error?.message || 'Something went wrong!');
    console.error(error);
  } finally {
    hideLoader();
  }
});
