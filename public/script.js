window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const gazeDataDiv = document.getElementById('gazeData');
    const calibrationDiv = document.getElementById('calibrationDiv');
    const calibrationPoints = document.getElementsByClassName('calibrationPoint');
    const images = [
        'images/image1.jpg',
        'images/image2.jpg',
        'images/image3.jpg',
        'images/image4.jpg',
        'images/image5.jpg',
        'images/image6.jpg',
        'images/image7.jpg',
        'images/image8.jpg',
        'images/image9.jpg',
        'images/image10.jpg'
    ];

    let currentImageIndex = 0;
    let calibrationStep = 0;

    function initializeWebGazer() {
        if (typeof webgazer === 'undefined') {
            gazeDataDiv.textContent = "WebGazer library not loaded. Please check the script path or network settings.";
            return;
        }

        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                gazeDataDiv.textContent = `Gaze coordinates: X ${data.x.toFixed(2)}, Y ${data.y.toFixed(2)}`;
            }
        }).begin();

        webgazer.showVideoPreview(true)
            .showPredictionPoints(true)
            .applyKalmanFilter(true)
            .setVideoElement(videoElement);
    }

    function setupCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                initializeWebGazer();
            })
            .catch(error => {
                gazeDataDiv.textContent = "Error accessing the camera: " + error.message;
            });
    }

    function cycleImages() {
        if (currentImageIndex >= images.length) {
            currentImageIndex = 0; // Loop back to the start
        }
        document.getElementById('demoImage').src = images[currentImageIndex++];
        setTimeout(cycleImages, 5000); // Change image every 5 seconds
    }

    function startCalibration() {
        calibrationDiv.style.display = 'flex';
        cycleCalibrationPoints();
    }

    function cycleCalibrationPoints() {
        Array.from(calibrationPoints).forEach((point, index) => {
            setTimeout(() => {
                point.style.visibility = (index === calibrationStep % calibrationPoints.length) ? 'visible' : 'hidden';
            }, 2000 * index);
        });

        calibrationStep++;
        if (calibrationStep / calibrationPoints.length < 3) { // Repeat calibration 3 times
            setTimeout(cycleCalibrationPoints, 2000 * calibrationPoints.length);
        } else {
            calibrationDiv.style.display = 'none';
            cycleImages(); // Start cycling images after calibration
        }
    }

    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        setupCamera();
    } else {
        gazeDataDiv.textContent = 'Your browser does not support the necessary API for video capture.';
    }
};
