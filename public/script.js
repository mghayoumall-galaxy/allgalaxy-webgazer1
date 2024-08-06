window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
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
    let secondCameraId = '30d91396f3369294a57955172911673cc95475ee2ee751c64520ff65c7a87884'; // Ensure this ID is correct

    function showNextImage() {
        if (currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            setTimeout(showNextImage, 5000);
        } else {
            console.log('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0;
            showNextImage();
        }
    }

    showNextImage();

    function setupWebGazer(videoStream) {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x;
                const y = data.y;
                gazeDataDiv.innerText = `Gaze coordinates: X ${x}, Y ${y}`;
                console.log(`Gaze coordinates: (${x}, ${y})`);
            }
        }).begin();

        webgazer.showVideoPreview(true)
               .showPredictionPoints(true);
        webgazer.setVideoElement(videoElement);
        webgazer.setStream(videoStream);
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
                setupWebGazer(stream); // Initialize WebGazer with the video stream
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

                secondCameraId = videoDevices[1].deviceId;
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
