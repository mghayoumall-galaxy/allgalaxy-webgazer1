window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
    const gazeDataDiv = document.getElementById('gazeData'); // Ensure this element is in your HTML
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
            currentImageIndex = 0;
            showNextImage(); // Restart the cycle
        }
    }

    showNextImage();

    function setupWebGazer() {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x;
                const y = data.y;
                gazeDataDiv.innerText = `Gaze coordinates: X ${x}, Y ${y}`;
            }
        }).begin();

        webgazer.showVideoPreview(true)
               .showPredictionPoints(true);
    }

    function enumerateAndSetupSecondCamera() {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length < 2) {
                    throw new Error('Second camera not found. Only one camera is available.');
                }
                
                // Selecting the second camera
                const secondCameraId = videoDevices[1].deviceId;
                setupCamera(secondCameraId);
            })
            .catch(error => {
                console.error('Error finding the second camera:', error);
                alert('Failed to find the second camera. Check the console for details.');
            });
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
                console.error('Error accessing the specified camera:', error);
                alert('Unable to access the specified camera. Check device ID and permissions.');
            });
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        enumerateAndSetupSecondCamera();
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        alert('Your browser does not support the required features. Try updating or switching browsers.');
    }
};
