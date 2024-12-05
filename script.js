let hasSubmitted = false;
let attendanceData = [];

// Password untuk menghapus data
const deletePassword = "082324609822";

// Mendapatkan lokasi perangkat
async function getDeviceLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => resolve(position.coords),
                error => reject(error)
            );
        } else {
            reject("Geolocation tidak tersedia.");
        }
    });
}

// Fungsi untuk mengonversi desimal ke format DMS (Derajat Menit Detik)
function toDMS(deg) {
    const direction = deg < 0 ? (deg === deg.toFixed() ? 'S' : 'W') : (deg === deg.toFixed() ? 'N' : 'E');
    deg = Math.abs(deg);
    const d = Math.floor(deg);
    const minFloat = (deg - d) * 60;
    const m = Math.floor(minFloat);
    const s = ((minFloat - m) * 60).toFixed(1);

    return `${d}°${m < 10 ? '0' + m : m}'${s < 10 ? '0' + s : s}"${direction}`;
}

// Fungsi untuk menampilkan/menghilangkan input Jumlah Hari
function toggleDaysInput() {
    const status = document.getElementById("status").value;
    const daysGroup = document.getElementById("daysGroup");

    // Menampilkan input jumlah hari jika status "CUTI", "IZIN", "SAKIT", "DINAS LUAR"
    if (["CUTI", "IZIN", "SAKIT", "DINAS LUAR"].includes(status)) {
        daysGroup.style.display = "block";
    } else {
        daysGroup.style.display = "none";
    }
}

// Fungsi untuk submit absensi
function submitAbsence() {
    if (hasSubmitted) {
        alert("Anda sudah absen.");
        return;
    }

    const name = document.getElementById("name").value;
    const status = document.getElementById("status").value;
    const days = document.getElementById("days").value;

    if (!name || !status) {
        alert("Harap isi nama dan status.");
        return;
    }

    getDeviceLocation().then(location => {
        const date = new Date();
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        const formattedTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

        const latitude = location.latitude;
        const longitude = location.longitude;
        const formattedLat = toDMS(latitude);
        const formattedLong = toDMS(longitude);

        // Menyimpan data absensi
        attendanceData.push({
            name,
            status,
            days: days || '-',
            date: formattedDate,
            time: formattedTime,
            latitude: formattedLat,
            longitude: formattedLong
        });

        // Menampilkan data ke tabel
        updateAttendanceTable();

        // Menandai absensi sudah dilakukan
        hasSubmitted = true;
        alert("Absensi berhasil!");
    }).catch(error => {
        alert("Lokasi tidak dapat diakses.");
    });
}

// Fungsi untuk memperbarui tabel absensi
function updateAttendanceTable() {
    const tableBody = document.getElementById("attendanceTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // Reset tabel

    attendanceData.forEach(entry => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = entry.name;
        row.insertCell(1).textContent = entry.status;
        row.insertCell(2).textContent = entry.days;
        row.insertCell(3).textContent = entry.date;
        row.insertCell(4).textContent = entry.time;
        row.insertCell(5).textContent = entry.latitude;
        row.insertCell(6).textContent = entry.longitude;
    });
}

// Fungsi untuk mengekspor data absensi ke Excel
function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(attendanceData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");
    XLSX.writeFile(wb, "data_absensi.xlsx");
}

// Fungsi untuk menghapus semua data absensi dengan password
function deleteAllData() {
    const password = document.getElementById("password").value;
    if (password === deletePassword) {
        attendanceData = [];
        updateAttendanceTable(); // Update tabel untuk menampilkan data kosong
        alert("Semua data telah dihapus.");
    } else {
        alert("Password salah!");
    }
}
