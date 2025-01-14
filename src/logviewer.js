const cm4SlogdRegExp = /^\[(\d{4}-\d{2}-\d{2}-\d{2}:\d{2}:\d{2})\]\[\d+\]\[(\S+) (\S+)\]\[([A-Z]+)\]\s+(.*)/;

// Function to parse logs and display them in the table
function parseLogs(event) {
    const fileInput = document.getElementById('logFileInput');
    const logTableBody = document.getElementById('logTable').querySelector('tbody');

    logTableBody.innerHTML = '';


    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const logLines = reader.result.split(/\r?\n/);
        let bootCycleCount = 0;
        let currentBootCycleRows = [];
        
        document.getElementById('logTable').style.display = 'table';

        logLines.forEach((line, index) => {
            const match = cm4SlogdRegExp.exec(line);
            if (match) {
                const [_, timestamp, context, subContext, level, message] = match;

                // Check for new boot cycle
                if (message.includes('Ignition state: true') && context.includes('DSVI')) {
                    // If we have previous boot cycle data, add it to table
                    if (currentBootCycleRows.length > 0) {
                        addBootCycleToTable(logTableBody, bootCycleCount, currentBootCycleRows);
                    }
                    bootCycleCount++;
                    currentBootCycleRows = [];
                }

                // Create row data
                const rowData = {
                    timestamp,
                    context,
                    subContext,
                    level,
                    message
                };
                
                currentBootCycleRows.push(rowData);
            }
        });
        
        // Add last boot cycle if exists
        if (currentBootCycleRows.length > 0) {
            addBootCycleToTable(logTableBody, bootCycleCount, currentBootCycleRows);
            }
    };

    reader.readAsText(file);
}

function addBootCycleToTable(tableBody, cycleNumber, rows) {
    // Create boot cycle header row
    const headerRow = document.createElement('tr');
    headerRow.className = 'boot-cycle-header';
    headerRow.setAttribute('data-cycle', cycleNumber);
    headerRow.innerHTML = `
        <td class="boot-cycle-cell">
            <span class="toggle-icon">▼</span>
            Boot Cycle #${cycleNumber}
        </td>
        <td colspan="4">${rows[0].timestamp}</td>
    `;
    tableBody.appendChild(headerRow);
    
    // Add all rows for this boot cycle
    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = `cycle-${cycleNumber}-row`;
        tr.innerHTML = `
            <td>${row.timestamp}</td>
            <td>${row.context}</td>
            <td>${row.subContext}</td>
            <td>${row.level}</td>
            <td>${row.message}</td>
        `;
        switch(row.level) {
            case 'WARN':
                tr.style.color = 'blue';
                break;
            case 'ERROR':
                tr.style.color = 'red';
                break;
            case 'FATAL':
                tr.style.backgroundColor = 'red';
                break;
        }
        tableBody.appendChild(tr);
    });
}

// Aply regex filters to the table
function applyFilters() {
    const timestampFilter = new RegExp(document.getElementById('timestampFilter').value, 'i');
    const applicationFilter = new RegExp(document.getElementById('applicationFilter').value, 'i');
    const ContextFilter = new RegExp(document.getElementById('ContextFilter').value, 'i');
    const levelFilter = new RegExp(document.getElementById('levelFilter').value, 'i');
    const messageFilter = new RegExp(document.getElementById('messageFilter').value, 'i');

    const rows = document.querySelectorAll('#logTable tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const [timestamp, application, Context, level, message] = Array.from(cells).map(cell => cell.textContent);

        if (
            timestampFilter.test(timestamp) &&
            applicationFilter.test(application) &&
            ContextFilter.test(Context) &&
            levelFilter.test(level) &&
            messageFilter.test(message)
        ) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
// Event listener for file input
document.getElementById('logFileInput').addEventListener('change', parseLogs);

['timestampFilter', 'applicationFilter', 'ContextFilter', 'levelFilter', 'messageFilter'].forEach(id => {
    document.getElementById(id).addEventListener('input', applyFilters);
});     

// Add boot cycle toggle functionality
document.addEventListener('click', function(e) {
    const header = e.target.closest('.boot-cycle-header');
    if (header) {
        const cycleNumber = header.getAttribute('data-cycle');
        const rows = document.querySelectorAll(`.cycle-${cycleNumber}-row`);
        const icon = header.querySelector('.toggle-icon');
       
        header.classList.toggle('collapsed');
        icon.style.transform = header.classList.contains('collapsed') ? 'rotate(-90deg)' : '';
       
        rows.forEach(row => {
            row.style.display = header.classList.contains('collapsed') ? 'none' : '';
        });
    }
});