window.onload = async function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
    const gazeDataDiv = document.getElementById('gazeData');
    const calibrationDiv = document.getElementById('calibrationDiv');
    const calibrationPoints = document.getElementsByClassName('calibrationPoint');
    const cameraSelect = document.getElementById('cameraSelect');
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
    const totalCalibrationSteps = calibrationPoints.length;
    let gazeData = [];
    let calibrationData = [];
    let eyeMovementErrors = [];
    let startTime;

    // Function to display the next image in the sequence
    function showNextImage() {
        if (currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            demoImage.style.display = 'block';
            setTimeout(showNextImage, 5000); // Display each image for 5 seconds
        } else {
            endSession(); // End session after the last image
        }
    }

    // Function to initialize WebGazer
    function setupWebGazer() {
        webgazer.setGazeListener((data) => {
            if (data) {
                const { x, y } = data;
                const timestamp = performance.now() - startTime;

                // Store gaze data
                gazeData.push({ eyeX: x, eyeY: y, timestamp });

                // Calculate fixation duration if gaze stays within a threshold area
                const lastGaze = gazeData[gazeData.length - 2];
                if (lastGaze) {
                    const distance = Math.hypot(x - lastGaze.eyeX, y - lastGaze.eyeY);
                    if (distance < 50) { // Threshold for fixation
                        lastGaze.duration = timestamp - lastGaze.timestamp;
                    }
                }

                // Update gaze data display
                gazeDataDiv.innerText = `Gaze coordinates: X ${x}, Y ${y}`;
                console.log(`Gaze coordinates: (${x}, ${y}), Time: ${timestamp}`);
            }
        }).begin();

        webgazer.showVideoPreview(false)  // Disable default video preview
               .showPredictionPoints(true) // Show prediction points on screen
               .applyKalmanFilter(true);    // Apply Kalman filter for smoother tracking

        webgazer.setVideoElement(videoElement);
    }

    // Function to setup the camera
    async function setupCamera(deviceId) {
        // Stop any existing camera stream
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
        }

        try {
            const constraints = {
                video: { deviceId: deviceId ? { exact: deviceId } : undefined }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            videoElement.play();
            console.log('Camera is now active.');
            setupWebGazer(); // Initialize WebGazer after the camera is active
            startTime = performance.now(); // Start timing for data collection
        } catch (error) {
            console.error('Error accessing the camera:', error);
            alert('Unable to access the camera. Please ensure permissions are granted.');
        }
    }

    // Function to display calibration points sequentially
    function showCalibrationPoint() {
        if (calibrationStep < totalCalibrationSteps) {
            const point = calibrationPoints[calibrationStep];
            point.style.visibility = 'visible';

            // Collect gaze data during calibration
            webgazer.setGazeListener((data) => {
                if (data) {
                    calibrationData.push({ 
                        eyeX: data.x, 
                        eyeY: data.y, 
                        targetX: parseFloat(point.style.left), 
                        targetY: parseFloat(point.style.top)
                    });
                }
            });

            setTimeout(() => {
                point.style.visibility = 'hidden';
                calibrationStep++;
                showCalibrationPoint();
            }, 2000); // Show each calibration point for 2 seconds
        } else {
            console.log('Calibration complete.');
            calibrationDiv.style.display = 'none';
            verifyCalibration(calibrationData); // Verify calibration accuracy
            showNextImage(); // Start showing images after calibration
        }
    }

    // Function to verify calibration accuracy
    function verifyCalibration(data) {
        const threshold = 50; // Pixel threshold for accuracy
        let calibrationErrors = [];

        data.forEach(point => {
            const distance = Math.hypot(point.eyeX - point.targetX, point.eyeY - point.targetY);
            calibrationErrors.push(distance);
        });

        const averageError = calibrationErrors.reduce((acc, val) => acc + val, 0) / calibrationErrors.length;
        console.log(`Average calibration error: ${averageError}px`);

        if (averageError > threshold) {
            console.log('Calibration is not accurate enough. Please recalibrate.');
            alert('Calibration accuracy is low. Consider recalibrating.');
        } else {
            console.log('Calibration is accurate.');
        }
    }

    // Function to verify eye movement accuracy during tracking
    function verifyEyeMovement() {
        const threshold = 100; // Example threshold for eye movement verification

        // Assume target positions (for demo purposes, normally would be dynamic)
        const targetPositions = [
            { x: 100, y: 100 },
            { x: 400, y: 300 },
            { x: 600, y: 400 }
        ];

        gazeData.forEach((gaze, index) => {
            if (targetPositions[index]) {
                const distance = Math.hypot(gaze.eyeX - targetPositions[index].x, gaze.eyeY - targetPositions[index].y);
                eyeMovementErrors.push(distance);
            }
        });

        const averageMovementError = eyeMovementErrors.reduce((acc, val) => acc + val, 0) / eyeMovementErrors.length;
        console.log(`Average eye movement error: ${averageMovementError}px`);

        if (averageMovementError > threshold) {
            console.log('Eye movement tracking is not accurate enough.');
            alert('Eye movement accuracy is low. Consider recalibrating.');
        } else {
            console.log('Eye movement tracking is accurate.');
        }
    }

    // Function to start calibration
    function startCalibration() {
        calibrationDiv.style.display = 'flex';
        calibrationStep = 0; // Reset calibration step counter
        calibrationData = []; // Reset calibration data
        showCalibrationPoint();
    }

    // Function to start eye tracking
    function startEyeTracking() {
        console.log('Eye movement tracking started.');
        showNextImage(); // Begin image sequence
    }

    // Function to end session and send data to the server
    function endSession() {
        webgazer.end(); // Stop WebGazer
        demoImage.style.display = 'none'; // Hide the last image
        gazeDataDiv.innerText = 'Thank you! The session has ended.';
        console.log('Eye movement tracking stopped. Session ended.');

        // Verify eye movement accuracy before saving data
        verifyEyeMovement();

        // Send collected data to the server
        fetch('/save-gaze-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gazeData)
        }).then(response => response.text())
          .then(data => console.log(data))
          .catch(error => console.error('Error:', error));
    }

    // Function to populate the camera select dropdown
    async function populateCameraSelect() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter(device => device.kind === 'videoinput');

            cameraSelect.innerHTML = ''; // Clear previous options
            videoInputs.forEach((input, index) => {
                const option = document.createElement('option');
                option.value = input.deviceId;
                option.text = input.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
            });

            // Automatically select the first camera if available
            if (videoInputs.length > 0) {
                setupCamera(videoInputs[0].deviceId);
            }
        } catch (error) {
            console.error('Error fetching video input devices:', error);
        }
    }

    // Event listener for camera selection change
    cameraSelect.addEventListener('change', () => {
        setupCamera(cameraSelect.value);
    });

    // Ensure the browser supports required features and start the process
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await populateCameraSelect();
        startCalibration(); // Start calibration immediately after camera setup
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        alert('Your browser does not support the required features. Try updating or switching browsers.');
    }
};
