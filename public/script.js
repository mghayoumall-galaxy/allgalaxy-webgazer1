window.onload = function() {
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

    function showNextImage() {
        if (currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            setTimeout(showNextImage, 5000); // Show each image for 5 seconds
        } else {
            console.log('Image display complete. Gaze data collection finished.');
        }
    }

    showNextImage();

    function getSecondCamera() {
        return navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                console.log('All Devices:', devices); // Log all devices
                console.log('Video Devices:', videoDevices); // Log video devices
                if (videoDevices.length < 2) {
                    throw new Error('Second camera not found');
                }
                return videoDevices[1].deviceId; // Return the device ID of the second camera
            });
    }

    function initializeWebGazer(cameraDeviceId) {
        const constraints = {
            video: {
                deviceId: { exact: cameraDeviceId }
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                const videoElement = document.getElementById('webcamVideo');
                videoElement.srcObject = stream;
                videoElement.play();
                setupWebGazer();
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
            });
    }

    function setupWebGazer() {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data == null) return;

            const x = data.x; // x coordinate of the gaze
            const y = data.y; // y coordinate of the gaze
            console.log(`Gaze coordinates: (${x}, ${y})`);
            document.getElementById('gazeData').innerText = `Gaze coordinates: X ${x}, Y ${y}`;
            
            gazeData.push({
                eyeX: x,
                eyeY: y,
                timestamp: Date.now()
            });
        }).begin();

        webgazer.showVideoPreview(true).applyKalmanFilter(true);
    }

    getSecondCamera().then(deviceId => {
        console.log('Second Camera Device ID:', deviceId); // Log the device ID of the second camera
        initializeWebGazer(deviceId);
    }).catch(console.error);

    let gazeData = [];
    window.addEventListener('beforeunload', function() {
        if (gazeData.length > 0) {
            fetch('/save-gaze-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gazeData)
            })
            .then(response => console.log('Gaze data saved:', response.ok))
            .catch(console.error);
        }
    });
};
