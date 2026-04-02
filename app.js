// Global state
let currentImage = null;
let currentExif = null;
let originalFileName = '';

// DOM elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const editorSection = document.getElementById('editorSection');
const imagePreview = document.getElementById('imagePreview');
const rawExif = document.getElementById('rawExif');

// Metadata inputs
const inputs = {
    cameraMake: document.getElementById('cameraMake'),
    cameraModel: document.getElementById('cameraModel'),
    dateTime: document.getElementById('dateTime'),
    latitude: document.getElementById('latitude'),
    longitude: document.getElementById('longitude'),
    copyright: document.getElementById('copyright'),
    artist: document.getElementById('artist'),
    software: document.getElementById('software')
};

// Buttons
const stripBtn = document.getElementById('stripBtn');
const downloadBtn = document.getElementById('downloadBtn');
const applyBtn = document.getElementById('applyBtn');

// Upload zone handlers
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// File handling
function handleFile(file) {
    if (!file.type.match(/^image\/jpe?g$/i)) {
        alert('Please upload a JPEG image (EXIF support limited to JPEG)');
        return;
    }

    originalFileName = file.name;
    const reader = new FileReader();

    reader.onload = (e) => {
        currentImage = e.target.result;
        loadImage(currentImage);
    };

    reader.readAsDataURL(file);
}

function loadImage(dataUrl) {
    // Display preview
    imagePreview.src = dataUrl;
    editorSection.classList.remove('hidden');

    // Extract EXIF data
    try {
        const exifObj = piexif.load(dataUrl);
        currentExif = exifObj;
        populateMetadataFields(exifObj);
        displayRawExif(exifObj);
    } catch (e) {
        console.warn('No EXIF data found or error reading EXIF:', e);
        currentExif = null;
        clearMetadataFields();
        rawExif.textContent = 'No EXIF data found in this image.';
    }
}

function populateMetadataFields(exifObj) {
    // Camera Make
    if (exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.Make]) {
        inputs.cameraMake.value = exifObj['0th'][piexif.ImageIFD.Make];
    }

    // Camera Model
    if (exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.Model]) {
        inputs.cameraModel.value = exifObj['0th'][piexif.ImageIFD.Model];
    }

    // DateTime
    if (exifObj['Exif'] && exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal]) {
        const exifDate = exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal];
        inputs.dateTime.value = convertExifDateToInput(exifDate);
    }

    // GPS Latitude
    if (exifObj['GPS'] && exifObj['GPS'][piexif.GPSIFD.GPSLatitude]) {
        const lat = convertGPSToDecimal(
            exifObj['GPS'][piexif.GPSIFD.GPSLatitude],
            exifObj['GPS'][piexif.GPSIFD.GPSLatitudeRef]
        );
        inputs.latitude.value = lat.toFixed(6);
    }

    // GPS Longitude
    if (exifObj['GPS'] && exifObj['GPS'][piexif.GPSIFD.GPSLongitude]) {
        const lon = convertGPSToDecimal(
            exifObj['GPS'][piexif.GPSIFD.GPSLongitude],
            exifObj['GPS'][piexif.GPSIFD.GPSLongitudeRef]
        );
        inputs.longitude.value = lon.toFixed(6);
    }

    // Copyright
    if (exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.Copyright]) {
        inputs.copyright.value = exifObj['0th'][piexif.ImageIFD.Copyright];
    }

    // Artist
    if (exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.Artist]) {
        inputs.artist.value = exifObj['0th'][piexif.ImageIFD.Artist];
    }

    // Software
    if (exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.Software]) {
        inputs.software.value = exifObj['0th'][piexif.ImageIFD.Software];
    }
}

function clearMetadataFields() {
    Object.values(inputs).forEach(input => input.value = '');
}

function displayRawExif(exifObj) {
    const formatted = JSON.stringify(exifObj, null, 2);
    rawExif.textContent = formatted;
}

function convertExifDateToInput(exifDate) {
    // EXIF format: "2024:03:15 14:30:45"
    // Input format: "2024-03-15T14:30"
    const parts = exifDate.split(' ');
    if (parts.length !== 2) return '';
    
    const datePart = parts[0].replace(/:/g, '-');
    const timePart = parts[1].substring(0, 5); // HH:MM only
    
    return `${datePart}T${timePart}`;
}

function convertInputDateToExif(inputDate) {
    // Input format: "2024-03-15T14:30"
    // EXIF format: "2024:03:15 14:30:45"
    if (!inputDate) return null;
    
    const parts = inputDate.split('T');
    if (parts.length !== 2) return null;
    
    const datePart = parts[0].replace(/-/g, ':');
    const timePart = parts[1] + ':00'; // Add seconds
    
    return `${datePart} ${timePart}`;
}

function convertGPSToDecimal(gpsArray, ref) {
    // GPS stored as [[degrees, 1], [minutes, 1], [seconds, 100]]
    const degrees = gpsArray[0][0] / gpsArray[0][1];
    const minutes = gpsArray[1][0] / gpsArray[1][1];
    const seconds = gpsArray[2][0] / gpsArray[2][1];
    
    let decimal = degrees + (minutes / 60) + (seconds / 3600);
    
    if (ref === 'S' || ref === 'W') {
        decimal *= -1;
    }
    
    return decimal;
}

function convertDecimalToGPS(decimal) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;
    
    return [
        [degrees, 1],
        [minutes, 1],
        [Math.round(seconds * 100), 100]
    ];
}

// Apply changes button
applyBtn.addEventListener('click', () => {
    if (!currentImage) return;

    let exifObj = currentExif || piexif.load(currentImage);
    
    // Ensure all IFD dictionaries exist
    if (!exifObj['0th']) exifObj['0th'] = {};
    if (!exifObj['Exif']) exifObj['Exif'] = {};
    if (!exifObj['GPS']) exifObj['GPS'] = {};

    // Apply camera make
    if (inputs.cameraMake.value) {
        exifObj['0th'][piexif.ImageIFD.Make] = inputs.cameraMake.value;
    }

    // Apply camera model
    if (inputs.cameraModel.value) {
        exifObj['0th'][piexif.ImageIFD.Model] = inputs.cameraModel.value;
    }

    // Apply datetime
    if (inputs.dateTime.value) {
        const exifDate = convertInputDateToExif(inputs.dateTime.value);
        if (exifDate) {
            exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal] = exifDate;
            exifObj['Exif'][piexif.ExifIFD.DateTimeDigitized] = exifDate;
            exifObj['0th'][piexif.ImageIFD.DateTime] = exifDate;
        }
    }

    // Apply GPS latitude
    if (inputs.latitude.value) {
        const lat = parseFloat(inputs.latitude.value);
        if (!isNaN(lat)) {
            exifObj['GPS'][piexif.GPSIFD.GPSLatitude] = convertDecimalToGPS(lat);
            exifObj['GPS'][piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? 'N' : 'S';
        }
    }

    // Apply GPS longitude
    if (inputs.longitude.value) {
        const lon = parseFloat(inputs.longitude.value);
        if (!isNaN(lon)) {
            exifObj['GPS'][piexif.GPSIFD.GPSLongitude] = convertDecimalToGPS(lon);
            exifObj['GPS'][piexif.GPSIFD.GPSLongitudeRef] = lon >= 0 ? 'E' : 'W';
        }
    }

    // Apply copyright
    if (inputs.copyright.value) {
        exifObj['0th'][piexif.ImageIFD.Copyright] = inputs.copyright.value;
    }

    // Apply artist
    if (inputs.artist.value) {
        exifObj['0th'][piexif.ImageIFD.Artist] = inputs.artist.value;
    }

    // Apply software
    if (inputs.software.value) {
        exifObj['0th'][piexif.ImageIFD.Software] = inputs.software.value;
    }

    try {
        const exifBytes = piexif.dump(exifObj);
        currentImage = piexif.insert(exifBytes, currentImage);
        currentExif = exifObj;
        
        imagePreview.src = currentImage;
        displayRawExif(exifObj);
        
        alert('✅ Metadata updated! Click "Download Image" to save.');
    } catch (e) {
        alert('❌ Error applying metadata: ' + e.message);
        console.error(e);
    }
});

// Strip metadata button
stripBtn.addEventListener('click', () => {
    if (!currentImage) return;

    try {
        currentImage = piexif.remove(currentImage);
        currentExif = null;
        
        imagePreview.src = currentImage;
        clearMetadataFields();
        rawExif.textContent = 'All EXIF data has been stripped from this image.';
        
        alert('✅ All metadata stripped! Click "Download Image" to save.');
    } catch (e) {
        alert('❌ Error stripping metadata: ' + e.message);
        console.error(e);
    }
});

// Download button
downloadBtn.addEventListener('click', () => {
    if (!currentImage) return;

    const link = document.createElement('a');
    link.href = currentImage;
    link.download = 'edited_' + originalFileName;
    link.click();
});
