window.onload = function() {
    const demoImage = document.getElementById('demoImage');
    const videoElement = document.getElementById('webcamVideo');
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
                setupWebGazer();
            }).catch(error => {
                console.error('Error accessing camera with ID ' + deviceId + ':', error);
                if (deviceId) {
                    console.log('Attempting to access default camera.');
                    setupCamera(); // Attempt without deviceId if specific camera fails
                } else {
                    alert('Unable to access any camera.');
                }
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
    }

    function fetchCameraDevices() {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length > 1) {
                    return videoDevices[1].deviceId; // Try to use the second camera
                } else if (videoDevices.length === 1) {
                    return videoDevices[0].deviceId; // Fallback to the first camera if only one is available
                } else {
                    throw new Error('No cameras found');
                }
            }).then(setupCamera).catch(error => {
                console.error('Failed to get cameras:', error);
                alert('No accessible cameras were found.');
            });
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
    fetchCameraDevices();
};
