window.onload = async function() {
    const videoElement = document.getElementById('webcamVideo');
    const gazeDataDiv = document.getElementById('gazeData');
    const calibrationDiv = document.getElementById('calibrationDiv');
    const calibrationPoints = document.getElementsByClassName('calibrationPoint');

    let calibrationStep = 0;
    const totalCalibrationSteps = 9;

    // Load face-api models
    async function loadModels() {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    }

    // Start the video stream
    function setupCamera() {
        const constraints = { video: true };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is active.');
                loadModels().then(() => {
                    console.log('Models loaded.');
                    startTracking();
                });
            })
            .catch(error => {
                console.error('Error accessing the camera:', error);
                alert('Unable to access the camera. Please ensure permissions are granted.');
            });
    }

    // Start tracking
    function startTracking() {
        const canvas = faceapi.createCanvasFromMedia(videoElement);
        document.body.append(canvas);
        const displaySize = { width: videoElement.width, height: videoElement.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectSingleFace(videoElement).withFaceLandmarks();
            if (detections) {
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections.landmarks);

                // Calculate eye gaze data
                const { leftEye, rightEye } = resizedDetections.landmarks;
                const leftEyeCenter = leftEye.reduce((acc, point) => ({
                    x: acc.x + point.x / leftEye.length,
                    y: acc.y + point.y / leftEye.length
                }), { x: 0, y: 0 });
                const rightEyeCenter = rightEye.reduce((acc, point) => ({
                    x: acc.x + point.x / rightEye.length,
                    y: acc.y + point.y / rightEye.length
                }), { x: 0, y: 0 });

                gazeDataDiv.innerHTML = `Left Eye Center: x: ${leftEyeCenter.x.toFixed(2)}, y: ${leftEyeCenter.y.toFixed(2)}<br>
                                          Right Eye Center: x: ${rightEyeCenter.x.toFixed(2)}, y: ${rightEyeCenter.y.toFixed(2)}`;
            }
        }, 100);
    }

    // Show calibration points sequentially
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

    // Start the calibration process
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
