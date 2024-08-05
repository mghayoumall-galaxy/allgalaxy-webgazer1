window.onload = function() {
    const demoImage = document.getElementById('demoImage');
    const videoElement = document.getElementById('webcamVideo');
    const gazeDataDiv = document.getElementById('gazeData');
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
            setTimeout(showNextImage, 5000); // Show each image for 5 seconds
        } else {
            console.log('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0; // Optionally restart the cycle
            showNextImage();
        }
    }

    function setupWebGazer() {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x; // x coordinate of the gaze
                const y = data.y; // y coordinate of the gaze
                console.log(`Gaze coordinates: (${x}, ${y})`);
                gazeDataDiv.innerText = `Gaze coordinates: X ${x}, Y ${y}`;
                gazeData.push({ eyeX: x, eyeY: y, timestamp: Date.now() });
            }
        }).begin();

        webgazer.showVideoPreview(true) // Shows the video feed that WebGazer is analyzing
               .showPredictionPoints(true); // Shows where WebGazer is predicting the user is looking
    }

    function setupCamera(deviceId) {
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is now active with the specified device ID.');
                setupWebGazer();
            })
            .catch(error => {
                console.error('Error accessing camera with specified device ID:', error);
                alert('Unable to access the specified camera.');
            });
    }

    function enumerateDevicesAndSetupCamera() {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                devices.forEach(device => {
                    console.log(`${device.kind}: ${device.label} (ID: ${device.deviceId})`);
                });

                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length < 2) {
                    alert('Second camera not found');
                    console.error('Second camera not found');
                    return;
                }

                const cameraDeviceId = '47e134a0cd256eb113dcf62b3f6936b13d741765b2b04ca99d027cb4b588306f'; // Known device ID
                setupCamera(cameraDeviceId);
            })
            .catch(error => {
                console.error('Error enumerating devices:', error);
                alert('Error enumerating devices: ' + error.message);
            });
    }

    window.addEventListener('beforeunload', function() {
        if (gazeData.length > 0) {
            fetch('/save-gaze-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gazeData)
            }).then(response => {
                console.log('Gaze data saved:', response.ok);
            }).catch(error => {
                console.log('Error saving gaze data:', error);
            });
        }
    });

    showNextImage();
    enumerateDevicesAndSetupCamera(); // Enumerate devices and setup the camera
};
