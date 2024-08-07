window.onload = async function() {
    const videoElement = document.getElementById('webcamVideo');
    const gazeDataDiv = document.getElementById('gazeData');
    const calibrationDiv = document.getElementById('calibrationDiv');
    const calibrationPoints = document.getElementsByClassName('calibrationPoint');

    let calibrationStep = 0;
    const totalCalibrationSteps = 9;

    // Load face-api.js models from specified URIs
    async function loadModels() {
        const modelPath = '/models'; // Adjust this path as needed
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
            await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
            await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath);
            console.log('Models loaded successfully.');
        } catch (error) {
            console.error('Error loading models:', error);
        }
    }

    // Set up the video stream and handle camera access
    async function setupCamera() {
        const constraints = { video: true };
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = stream;
            videoElement.play();
            console.log('Camera is active.');
            await loadModels();
            startTracking();
        } catch (error) {
            console.error('Error accessing the camera:', error);
            alert('Unable to access the camera. Please ensure permissions are granted.');
        }
    }

    // Start tracking eye movements using face-api.js
    function startTracking() {
        const canvas = faceapi.createCanvasFromMedia(videoElement);
        document.body.append(canvas);
        const displaySize = { width: videoElement.width, height: videoElement.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            if (detections) {
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections.landmarks);
                updateGazeData(resizedDetections.landmarks);
            }
        }, 100);
    }

    // Update gaze data display
    function updateGazeData(landmarks) {
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const leftEyeCenter = calculateCenter(leftEye);
        const rightEyeCenter = calculateCenter(rightEye);

        gazeDataDiv.innerHTML = `Left Eye Center: x: ${leftEyeCenter.x.toFixed(2)}, y: ${leftEyeCenter.y.toFixed(2)}<br>
                                 Right Eye Center: x: ${rightEyeCenter.x.toFixed(2)}, y: ${rightEyeCenter.y.toFixed(2)}`;
    }

    // Calculate the center point of eye landmarks
    function calculateCenter(points) {
        const sum = points.reduce((acc, point) => ({
            x: acc.x + point.x,
            y: acc.y + point.y
        }), { x: 0, y: 0 });
        return {
            x: sum.x / points.length,
            y: sum.y / points.length
        };
    }

    // Sequentially show calibration points
    function showCalibrationPoint() {
        if (calibrationStep < totalCalibrationSteps) {
            const point = calibrationPoints[calibrationStep];
            point.style.visibility = 'visible';
            setTimeout(() => {
                point.style.visibility = 'hidden';
                calibrationStep++;
                showCalibrationPoint();
            }, 2000);
        } else {
            console.log('Calibration complete.');
            calibrationDiv.style.display = 'none';
        }
    }

    // Begin the calibration process
    function startCalibration() {
        calibrationDiv.style.display = 'flex';
        showCalibrationPoint();
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupCamera();
        startCalibration();
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        alert('Your browser does not support the required features. Please update your browser or switch to a compatible one.');
    }
};
