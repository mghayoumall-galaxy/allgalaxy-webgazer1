window.onload = async function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
    const gazeDataDiv = document.getElementById('gazeData');
    const calibrationDiv = document.getElementById('calibrationDiv');
    const calibrationPoints = document.getElementsByClassName('calibrationPoint');
    const cameraSelect = document.getElementById('cameraSelect');
    const startCalibrationButton = document.getElementById('startCalibrationButton');
    const calibrationCompleteMessage = document.getElementById('calibrationCompleteMessage');
    const trackingInfo = document.getElementById('tracking-info');
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
    let calibrationComplete = false;

    // Diagnostic logs
    console.log('cameraSelect element:', cameraSelect);
    console.log('startCalibrationButton element:', startCalibrationButton);

    function showNextImage() {
        if (calibrationComplete && currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            demoImage.style.display = 'block';
            setTimeout(showNextImage, 5000);
        } else if (calibrationComplete) {
            console.log('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0;
            showNextImage();
        }
    }

    function setupWebGazer() {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x;
                const y = data.y;
                gazeDataDiv.innerText = `Gaze coordinates: X ${x}, Y ${y}`;
                console.log(`Gaze coordinates: (${x}, ${y})`);
            }
        }).begin();

        webgazer.showVideoPreview(false)
               .showPredictionPoints(true)
               .applyKalmanFilter(true);

        webgazer.setVideoElement(videoElement);
    }

    async function setupCamera(deviceId) {
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is now active.');
                videoElement.style.display = 'block';
                trackingInfo.style.display = 'block';
                setupWebGazer();
                detectFace();
            })
            .catch(error => {
                console.error('Error accessing the camera:', error);
                alert('Unable to access the camera. Please ensure permissions are granted.');
            });
    }

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
            calibrationComplete = true;
            calibrationCompleteMessage.style.display = 'block';
            gazeDataDiv.innerText = 'Calibration complete. Starting gaze data collection...';
            setTimeout(() => {
                calibrationCompleteMessage.style.display = 'none';
                showNextImage();
            }, 2000);
        }
    }

    function startCalibration() {
        calibrationDiv.style.display = 'flex';
        showCalibrationPoint();
    }

    async function getVideoInputs() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        videoInputs.forEach((input, index) => {
            const option = document.createElement('option');
            option.value = input.deviceId;
            option.text = input.label || `Camera ${index + 1}`;
            cameraSelect.appendChild(option);
        });

        if (videoInputs.length > 0) {
            cameraSelect.disabled = false;
            startCalibrationButton.disabled = false;
        } else {
            alert('No camera found.');
        }
    }

    cameraSelect.addEventListener('change', () => {
        console.log('Camera selection changed:', cameraSelect.value);
        const selectedDeviceId = cameraSelect.value;
        setupCamera(selectedDeviceId);
    });

    startCalibrationButton.addEventListener('click', () => {
        console.log('Start Calibration button clicked.');
        if (cameraSelect.value) {
            startCalibration();
        } else {
            alert('Please select a camera first.');
        }
    });

    async function detectFace() {
        const model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
        async function detect() {
            const predictions = await model.estimateFaces({
                input: videoElement,
                returnTensors: false,
                flipHorizontal: false,
                predictIrises: true
            });

            if (predictions.length > 0) {
                const landmarks = predictions[0].keypoints.map(point => point.slice(0, 2));
                console.log('Facial Landmarks:', landmarks);
            }

            requestAnimationFrame(detect);
        }
        detect();
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await getVideoInputs();
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        alert('Your browser does not support the required features. Try updating or switching browsers.');
    }
};
