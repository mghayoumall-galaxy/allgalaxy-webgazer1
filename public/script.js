window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
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
    const totalCalibrationSteps = 9;

    // Function to show next image
    function showNextImage() {
        if (currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            setTimeout(showNextImage, 5000);
        } else {
            console.log('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0;
            showNextImage();
        }
    }

    // Function to initialize WebGazer
    function setupWebGazer() {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x;
                const y = data.y;
                gazeDataDiv.innerText = `Gaze coordinates: X ${x}, Y ${y}`;
                console.log(`Gaze coordinates: (${x}, ${y})`);
            }
        }).begin()
        .then(() => {
            console.log('WebGazer started');
        })
        .catch((err) => {
            console.error('WebGazer failed to start:', err);
        });

        webgazer.showVideoPreview(true) // Shows the video feed that WebGazer is analyzing
               .showPredictionPoints(true) // Shows where WebGazer is predicting the user is looking
               .applyKalmanFilter(true); // Apply Kalman filter for smoother tracking

        webgazer.setVideoElement(videoElement);

        // Enable face tracking
        webgazer.showFaceOverlay(true);
        webgazer.showFaceFeedbackBox(true);
    }

    // Function to setup the camera
    function setupCamera() {
        const constraints = {
            video: true
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is now active.');
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
            console.log(`Showing calibration point ${calibrationStep + 1}`);
            setTimeout(() => {
                point.style.visibility = 'hidden';
                console.log(`Hiding calibration point ${calibrationStep + 1}`);
                calibrationStep++;
                showCalibrationPoint();
            }, 2000); // Show each calibration point for 2 seconds
        } else {
            console.log('Calibration complete.');
            calibrationDiv.style.display = 'none';
            showNextImage(); // Start showing images after calibration
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
