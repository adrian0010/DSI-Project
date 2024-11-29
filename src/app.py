from flask import Flask, render_template, request, redirect, url_for
import os
import pandas as pd
import re

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return redirect(url_for('index'))
    file = request.files['file']
    if file.filename == '':
        return redirect(url_for('index'))
    if file:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        return redirect(url_for('view_logs', filename=file.filename))

@app.route('/logs/<filename>')
def view_logs(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    logs = []
    with open(filepath, 'r') as file:
        for line in file:
            # Use a regular expression to split the line into three parts: timestamp, level, and message
            match = re.match(r'(\S+)\s+(\S+)\s+(.*)', line.strip())
            if match:
                logs.append({
                    'timestamp': match.group(1),
                    'level': match.group(2),
                    'message': match.group(3)
                })
    return render_template('logs.html', logs=logs)

if __name__ == '__main__':
    app.run(debug=True, port=8080)