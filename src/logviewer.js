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
        
        document.getElementById('logTable').style.display = 'table';


        logLines.forEach(line => {
            const match = cm4SlogdRegExp.exec(line);
            if (match) {
                const [_, timestamp, context, subContext, level, message] = match;

                const row = document.createElement('tr');

                if (level === 'WARN') {
                    row.style.color = 'blue';
                } else if (level === 'ERROR') {
                    row.style.color = 'red';
                } else if (level === 'FATAL') {
                    row.style.backgroundColor = 'red';
                }

                [timestamp, context, subContext, level, message].forEach(text => {
                    const cell = document.createElement('td');
                    cell.textContent = text;
                    row.appendChild(cell);
                });

                logTableBody.appendChild(row);
            }
        });
    };

    reader.readAsText(file);
}

// Event listener for file input
document.getElementById('logFileInput').addEventListener('change', parseLogs);