window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
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
    let gazeData = [];

    function showNextImage() {
        if (currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            setTimeout(showNextImage, 5000);
        } else {
            alert('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0; // Optionally restart the cycle
        }
    }

    function setupCamera(deviceId) {
        const constraints = {
            video: { deviceId: deviceId ? { exact: deviceId } : undefined }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is now active with the specified device ID.');
                setupWebGazer();
            }).catch(error => {
                console.error('Error accessing camera with ID ' + deviceId + ':', error);
                alert('Unable to access the specified camera, attempting to access any camera.');
                setupCamera(); // Retry with no specific device ID
            });
    }

    function setupWebGazer() {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x;
                const y = data.y;
                console.log(`Gaze coordinates: (${x}, ${y})`);
                document.getElementById('gazeData').innerText = `Gaze coordinates: X ${x}, Y ${y}`;
                gazeData.push({ eyeX: x, eyeY: y, timestamp: Date.now() });
            }
        }).begin();
        webgazer.showVideoPreview(true).applyKalmanFilter(true);
    }

    function saveGazeData() {
        if (gazeData.length > 0) {
            fetch('/save-gaze-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gazeData)
            }).then(response => {
                console.log('Gaze data saved:', response.ok);
            }).catch(error => {
                console.log('Error saving gaze data:', error);
            });
        }
    }

    window.addEventListener('beforeunload', saveGazeData);
    showNextImage();
    setupCamera('47e134a0cd256eb113dcf62b3f6936b13d741765b2b04ca99d027cb4b588306f');
};
