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

    function showNextImage() {
        if (currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            setTimeout(showNextImage, 5000);
        } else {
            console.log('Image display cycle complete. Restarting.');
            currentImageIndex = 0;
            showNextImage();
        }
    }

    function setupWebGazer() {
        if (typeof webgazer === 'undefined') {
            console.error("WebGazer library not loaded. Please check the script path or internet connection.");
            return;
        }

        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x.toFixed(2);
                const y = data.y.toFixed(2);
                gazeDataDiv.textContent = `Gaze coordinates: X ${x}, Y ${y}`;
            }
        }).begin();

        webgazer.showVideoPreview(true)
               .showPredictionPoints(true)
               .applyKalmanFilter(true)
               .setVideoElement(videoElement);
    }

    function setupCamera() {
        const constraints = { video: true };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is active. Initializing WebGazer.');
                setupWebGazer();
            })
            .catch(error => {
                console.error('Error accessing the camera:', error);
                alert('Unable to access the camera. Please ensure permissions are granted and the device has a camera.');
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
            console.log('Calibration complete. Starting image display.');
            calibrationDiv.style.display = 'none';
            showNextImage();
        }
    }

    function startCalibration() {
        console.log('Starting calibration process...');
        calibrationDiv.style.display = 'flex';
        showCalibrationPoint();
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupCamera();
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available.');
        alert('Your browser does not support camera access features. Please update your browser or switch to a compatible one.');
    }

    startCalibration();
};
