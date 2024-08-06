window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const gazeDataDiv = document.getElementById('gazeData');
    const calibrationDiv = document.getElementById('calibrationDiv');
    const calibrationPoints = document.getElementsByClassName('calibrationPoint');

    let calibrationStep = 0;
    const totalCalibrationSteps = 9;

    // Function to initialize WebGazer
    function setupWebGazer() {
        if (typeof webgazer === 'undefined') {
            console.error('WebGazer is not loaded.');
            return;
        }

        console.log('Initializing WebGazer...');
        webgazer.begin()
            .then(() => {
                console.log('WebGazer initialized.');
                webgazer.showVideoPreview(true) // Show video preview
                       .showPredictionPoints(true) // Show prediction points
                       .applyKalmanFilter(true) // Apply Kalman filter
                       .setVideoElement(videoElement); // Set video element

                // Set gaze listener
                webgazer.setGazeListener(function(data) {
                    if (data) {
                        const x = data.x;
                        const y = data.y;
                        gazeDataDiv.innerText = `Gaze coordinates: X ${x.toFixed(2)}, Y ${y.toFixed(2)}`;
                        console.log(`Gaze coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})`);
                    }
                });
            })
            .catch(err => {
                console.error('Error initializing WebGazer:', err);
            });
    }

    // Function to setup the camera
    function setupCamera() {
        const constraints = { video: true };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is active.');
                setupWebGazer(); // Initialize WebGazer after the camera is active
            })
            .catch(error => {
                console.error('Error accessing the camera:', error);
                alert('Unable to access the camera. Please ensure permissions are granted.');
            });
    }

    // Function to show calibration points sequentially
    function showCalibrationPoint() {
        if (calibrationStep < totalCalibrationSteps) {
            const point = calibrationPoints[calibrationStep];
            point.style.visibility = 'visible';
            setTimeout(() => {
                point.style.visibility = 'hidden';
                calibrationStep++;
                showCalibrationPoint();
            }, 2000); // Show each calibration point for 2 seconds
        } else {
            console.log('Calibration complete.');
            calibrationDiv.style.display = 'none';
            // Optionally, you can start showing images here
        }
    }

    // Function to start calibration
    function startCalibration() {
        calibrationDiv.style.display = 'flex';
        showCalibrationPoint();
    }

    // Ensure the browser supports the required features
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupCamera();
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        alert('Your browser does not support the required features. Try updating or switching browsers.');
    }

    // Start the calibration process
    startCalibration();
};
