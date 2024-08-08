window.onload = async function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
    const gazeDataDiv = document.getElementById('gazeData');
    const calibrationDiv = document.getElementById('calibrationDiv');
    const calibrationPoints = document.getElementsByClassName('calibrationPoint');
    const calibrationMessage = document.getElementById('calibrationMessage');
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
    const totalCalibrationSteps = 9;

    function showNextImage() {
        if (currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            demoImage.style.display = 'block';
            setTimeout(showNextImage, 20000);
        } else {
            console.log('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0;
            demoImage.style.display = 'none';
            calibrationMessage.innerText = 'Eye movement tracking complete.';
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
                setupWebGazer();
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
            calibrationMessage.innerText = 'Calibration complete. Starting eye movement tracking in 30 seconds.';
            setTimeout(startEyeTracking, 30000);
        }
    }

    function startCalibration() {
        calibrationDiv.style.display = 'flex';
        showCalibrationPoint();
    }

    function startEyeTracking() {
        calibrationMessage.innerText = '';
        demoImage.style.display = 'block';
        showNextImage();
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
    }

    cameraSelect.addEventListener('change', () => {
        setupCamera(cameraSelect.value);
    });

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        getVideoInputs().then(() => {
            setupCamera(cameraSelect.value);
        });
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        alert('Your browser does not support the required features. Try updating or switching browsers.');
    }

    startCalibration();
};
