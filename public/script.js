window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
    const gazeDataDiv = document.getElementById('gazeData'); // Ensure this element exists in your HTML
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
            setTimeout(showNextImage, 5000); // Rotate images every 5 seconds
        } else {
            console.log('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0; // Reset index to loop images
            showNextImage(); // Start the cycle again if needed
        }
    }

    showNextImage();

    function setupWebGazer(videoStream) {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x; // X coordinate of the gaze
                const y = data.y; // Y coordinate of the gaze
                gazeDataDiv.innerText = `Gaze coordinates: X ${x}, Y ${y}`;
                console.log(`Gaze coordinates: (${x}, ${y})`);
            }
        }).begin();

        webgazer.showVideoPreview(true) // Shows the video feed that WebGazer is analyzing
               .showPredictionPoints(true); // Shows where WebGazer is predicting the user is looking

        // Explicitly set the video source for WebGazer
        webgazer.setVideoSource(videoElement);
        videoElement.srcObject = videoStream;
        videoElement.play();
    }

    function setupCamera(deviceId) {
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('Camera is now active with the specified device ID.');
                setupWebGazer(stream); // Pass the stream to WebGazer for eye-tracking
            })
            .catch(error => {
                console.error('Error accessing the specified camera:', error);
                alert('Unable to access the specified camera. Please ensure the device ID is correct and that permissions are granted.');
            });
    }

    function enumerateDevicesAndSetupCamera() {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length < 2) {
                    alert('Second camera not found. Ensure the camera is connected and recognized by the system.');
                    return;
                }

                const secondCameraId = videoDevices[1].deviceId;
                console.log('Using second camera with device ID:', secondCameraId);
                setupCamera(secondCameraId);
            })
            .catch(error => {
                console.error('Error enumerating devices:', error);
                alert('Failed to enumerate devices. Check the console for details.');
            });
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        enumerateDevicesAndSetupCamera();
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        alert('Your browser does not support the required features. Try updating or switching browsers.');
    }
};
