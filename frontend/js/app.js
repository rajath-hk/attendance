const API_URL = 'http://localhost:5000/api';

// --- Auth Functions ---

async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            if (data.role === 'teacher') {
                window.location.href = 'dashboard-teacher.html';
            } else {
                window.location.href = 'dashboard-student.html';
            }
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        showError('Network error. Is the server running?');
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function checkAuth(role) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== role) {
        window.location.href = 'index.html';
    }
    // Update UI with user name
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = `${user.name} (${user.role})`;
}

// --- Teacher Functions (Refactored for Bulk) ---

async function loadStudentsTable() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;

    const dateInput = document.getElementById('attendanceDate');
    const sessionInput = document.getElementById('attendanceSession');
    const selectedDate = dateInput.value;
    const selectedSession = sessionInput ? sessionInput.value : 'Class 1';

    try {
        // 1. Fetch Students
        const responseParam = await fetch(`${API_URL}/attendance/students`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const students = await responseParam.json();

        // 2. Fetch Existing Attendance for this Date/Session
        let existingRecords = [];
        if (selectedDate) {
            const responseSheet = await fetch(`${API_URL}/attendance/sheet?date=${selectedDate}&session=${selectedSession}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (responseSheet.ok) {
                existingRecords = await responseSheet.json();
            }
        }

        // Map existing status: { studentId: 'Present'/'Absent' }
        const statusMap = {};
        existingRecords.forEach(r => statusMap[r.studentId] = r.status);

        tbody.innerHTML = '';

        if (!Array.isArray(students) || students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No students found.</td></tr>';
            return;
        }

        students.forEach(student => {
            const stats = student.stats || { percentage: 0, present: 0, total: 0 };
            const percentageColor = stats.percentage < 75 ? 'red' : 'green';
            const currentStatus = statusMap[student._id] || 'Present';
            const isPresent = currentStatus === 'Present';

            const row = document.createElement('tr');

            // 1. Name Cell
            const cellName = document.createElement('td');
            const b = document.createElement('b');
            b.textContent = student.name;
            const br = document.createElement('br');
            const small = document.createElement('small');
            small.style.color = '#6b7280';
            small.textContent = student.rollNumber || '-';
            cellName.append(b, br, small);
            row.appendChild(cellName);

            // 2. Email Cell
            const cellEmail = document.createElement('td');
            cellEmail.textContent = student.email;
            row.appendChild(cellEmail);

            // 3. Stats Cell
            const cellStats = document.createElement('td');
            const spanStats = document.createElement('span');
            spanStats.className = 'stats-badge';
            spanStats.style.color = percentageColor;
            spanStats.textContent = `${stats.percentage}% (${stats.present}/${stats.total})`;
            cellStats.appendChild(spanStats);
            row.appendChild(cellStats);

            // 4. Status Toggle Cell
            const cellToggle = document.createElement('td');
            cellToggle.innerHTML = `
                <div class="status-toggle" id="toggle-${student._id}" data-student-id="${student._id}" data-status="${currentStatus}">
                    <button type="button" class="toggle-btn present ${isPresent ? 'active' : ''}" onclick="setToggleStatus('${student._id}', 'Present')">Present</button>
                    <button type="button" class="toggle-btn absent ${!isPresent ? 'active' : ''}" onclick="setToggleStatus('${student._id}', 'Absent')">Absent</button>
                </div>
            `;
            row.appendChild(cellToggle);

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading students', error);
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="color:red; text-align:center;">Error loading students.</td></tr>';
    }
}

// Helper to switch toggle state
function setToggleStatus(studentId, status) {
    const container = document.getElementById(`toggle-${studentId}`);
    if (!container) return;

    container.dataset.status = status; // Update data attribute

    const btnPresent = container.querySelector('.present');
    const btnAbsent = container.querySelector('.absent');

    if (status === 'Present') {
        btnPresent.classList.add('active');
        btnAbsent.classList.remove('active');
    } else {
        btnAbsent.classList.add('active');
        btnPresent.classList.remove('active');
    }
}

async function submitBulkAttendance() {
    const user = JSON.parse(localStorage.getItem('user'));
    const dateInput = document.getElementById('attendanceDate');
    const sessionInput = document.getElementById('attendanceSession');
    const msgEl = document.getElementById('mark-msg');

    if (!dateInput || !dateInput.value) {
        alert('Please select a date');
        return;
    }

    const date = dateInput.value;
    const session = sessionInput ? sessionInput.value : 'Class 1';

    // Collect all data from toggles
    const tbody = document.getElementById('studentTableBody');
    const toggles = tbody.querySelectorAll('.status-toggle');
    const records = [];

    toggles.forEach(toggle => {
        const studentId = toggle.dataset.studentId;
        const status = toggle.dataset.status;
        records.push({ studentId, status });
    });

    if (records.length === 0) {
        alert('No students to mark.');
        return;
    }

    msgEl.textContent = 'Saving...';
    msgEl.style.color = 'blue';

    try {
        const response = await fetch(`${API_URL}/attendance/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ date, records, session })
        });

        const data = await response.json();

        if (response.ok) {
            msgEl.textContent = 'Saved Successfully!';
            msgEl.style.color = 'green';
            setTimeout(loadStudentsTable, 1000);
            fetchMarkedDates(); // Refresh calendar dots
        } else {
            msgEl.textContent = data.message || 'Error saving';
            msgEl.style.color = 'red';
        }
    } catch (error) {
        console.error(error);
        msgEl.textContent = 'Network Error';
        msgEl.style.color = 'red';
    }
}

// --- Student Functions ---

async function loadMyAttendance() {
    const user = JSON.parse(localStorage.getItem('user'));
    const tbody = document.getElementById('attendanceTableBody');
    const statsEl = document.getElementById('stats');

    try {
        const response = await fetch(`${API_URL}/attendance/${user._id}`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const records = await response.json();

        // Group by Subject
        const subjectStats = {};
        let totalPresent = 0;
        let totalAbsent = 0;

        tbody.innerHTML = '';
        records.forEach(record => {
            const subject = record.subject || 'General';

            // Init stats for subject
            if (!subjectStats[subject]) {
                subjectStats[subject] = { present: 0, total: 0 };
            }

            subjectStats[subject].total++;
            if (record.status === 'Present') {
                subjectStats[subject].present++;
                totalPresent++;
            } else {
                totalAbsent++;
            }

            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #f3f4f6';

            // Date
            const cellDate = document.createElement('td');
            cellDate.style.padding = '0.75rem';
            cellDate.textContent = new Date(record.date).toLocaleDateString();
            row.appendChild(cellDate);

            // Subject
            const cellSubject = document.createElement('td');
            cellSubject.style.padding = '0.75rem';
            cellSubject.textContent = subject + ' ';
            const small = document.createElement('small');
            small.textContent = `(${record.session || 'Class 1'})`;
            cellSubject.appendChild(small);
            row.appendChild(cellSubject);

            // Status
            const cellStatus = document.createElement('td');
            cellStatus.style.padding = '0.75rem';
            cellStatus.style.color = record.status === 'Present' ? 'green' : 'red';
            cellStatus.textContent = record.status;
            row.appendChild(cellStatus);

            tbody.appendChild(row);
        });

        // Render Stats Bubbles
        let statsHtml = '';
        for (const [subj, stat] of Object.entries(subjectStats)) {
            const pct = Math.round((stat.present / stat.total) * 100);
            const color = pct < 75 ? 'red' : 'green';
            statsHtml += `
                <span style="display:inline-block; margin-right: 1rem; padding: 0.25rem 0.5rem; background: #eee; border-radius: 4px;">
                    <b>${subj}:</b> <span style="color:${color}">${pct}%</span>
                </span>
            `;
        }

        if (Object.keys(subjectStats).length === 0) {
            statsEl.innerHTML = 'No attendance records yet.';
        } else {
            const overallTotal = totalPresent + totalAbsent;
            const overallPct = overallTotal === 0 ? 0 : Math.round((totalPresent / overallTotal) * 100);

            statsEl.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <b>Total:</b> ${overallPct}% (${totalPresent}/${overallTotal})
                </div>
                <div>${statsHtml}</div>
            `;
        }

    } catch (error) {
        console.error('Error loading my attendance', error);
    }
}

// --- Helpers ---
function showError(msg) {
    const el = document.getElementById('error-msg');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}

// --- Modal Functions Refactored ---
function openAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset UI
        document.getElementById('step-check').style.display = 'block';
        document.getElementById('addStudentForm').style.display = 'none';
        document.getElementById('existing-student-info').style.display = 'none';

        document.getElementById('check-roll').value = '';
        document.getElementById('check-msg').textContent = '';
        document.getElementById('addStudentForm').reset();
    }
}

function closeAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if (modal) modal.style.display = 'none';
}

async function checkStudent() {
    const user = JSON.parse(localStorage.getItem('user'));
    const rollNumber = document.getElementById('check-roll').value;
    const msgEl = document.getElementById('check-msg');

    if (!rollNumber) {
        msgEl.textContent = 'Please enter Roll Number';
        msgEl.style.color = 'red';
        return;
    }

    msgEl.textContent = 'Checking...';
    msgEl.style.color = 'blue';

    try {
        const response = await fetch(`${API_URL}/users/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ rollNumber })
        });

        const data = await response.json();

        if (data.exists) {
            msgEl.textContent = '';
            // Show Existing
            document.getElementById('existing-student-info').style.display = 'block';
            document.getElementById('addStudentForm').style.display = 'none';

            document.getElementById('exist-name').textContent = data.student.name;
            document.getElementById('exist-email').textContent = data.student.email;
        } else {
            msgEl.textContent = 'Student not found. Identify as new.';
            msgEl.style.color = 'gray'; // Neutral info

            // Show Create Form
            document.getElementById('existing-student-info').style.display = 'none';
            document.getElementById('addStudentForm').style.display = 'block';

            // Pre-fill roll
            document.getElementById('new-roll').value = rollNumber;
        }
    } catch (error) {
        console.error(error);
        msgEl.textContent = 'Error checking student';
        msgEl.style.color = 'red';
    }
}

async function addStudent() {
    const user = JSON.parse(localStorage.getItem('user'));
    const name = document.getElementById('new-name').value;
    const rollNumber = document.getElementById('new-roll').value;
    const email = document.getElementById('new-email').value;
    const password = document.getElementById('new-password').value;
    const msgEl = document.getElementById('add-msg');

    msgEl.textContent = 'Creating...';
    msgEl.style.color = 'blue';

    try {
        const response = await fetch(`${API_URL}/users/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ name, rollNumber, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            msgEl.textContent = 'Student Added Successfully!';
            msgEl.style.color = 'green';
            setTimeout(() => {
                closeAddStudentModal();
                loadStudentsTable();
            }, 1000);
        } else {
            msgEl.textContent = data.message || 'Error adding student';
            msgEl.style.color = 'red';
        }
    } catch (error) {
        console.error(error);
        msgEl.textContent = 'Network Error';
        msgEl.style.color = 'red';
    }
}

// Close modal if clicked outside
window.onclick = function (event) {
    const modal = document.getElementById('addStudentModal');
    if (event.target == modal) {
        closeAddStudentModal();
    }
}

// --- Calendar Functions ---
let currentDate = new Date();
let markedDates = new Set();

async function initCalendar() {
    await fetchMarkedDates();
    renderCalendar();
}

async function fetchMarkedDates() {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
        const response = await fetch(`${API_URL}/attendance/dates`, {
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        const dates = await response.json();
        // Convert to YYYY-MM-DD set
        markedDates = new Set(dates.map(d => d.split('T')[0]));
        renderCalendar();
    } catch (error) {
        console.error('Error fetching calendar dates', error);
    }
}

function renderCalendar() {
    const monthYear = document.getElementById('calendar-month-year');
    const calendarDays = document.getElementById('calendar-days');

    if (!monthYear || !calendarDays) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYear.textContent = currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    calendarDays.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty cells for prev month
    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day empty';
        calendarDays.appendChild(div);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const div = document.createElement('div');
        div.className = 'calendar-day';
        div.textContent = i;

        if (markedDates.has(dateStr)) {
            div.classList.add('has-event');
        }

        // Highlight selected
        const selectedDate = document.getElementById('attendanceDate').value;
        if (selectedDate === dateStr) {
            div.classList.add('selected');
        }

        div.onclick = () => {
            document.getElementById('attendanceDate').value = dateStr;
            renderCalendar(); // Redraw to update selection
            loadStudentsTable(); // Refetch data for new date
        };

        calendarDays.appendChild(div);
    }
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            loginUser(email, password);
        });
    }

    // Add Student Form
    const addForm = document.getElementById('addStudentForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addStudent();
        });
    }

    // Init Calendar if on dashboard
    if (document.getElementById('calendar-days')) {
        initCalendar();

        // Update calendar when Date Picker changes manually
        document.getElementById('attendanceDate').addEventListener('change', () => {
            renderCalendar();
            loadStudentsTable();
        });

        // Update when Session changes
        const sessionSelect = document.getElementById('attendanceSession');
        if (sessionSelect) {
            sessionSelect.addEventListener('change', loadStudentsTable);
        }
    }
});
