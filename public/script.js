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
            setTimeout(showNextImage, 5000); // Display each image for 5 seconds
        } else {
            console.log('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0; // Optionally restart the cycle
            showNextImage();
        }
    }

    function setupWebGazer() {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x; // X coordinate of the gaze
                const y = data.y; // Y coordinate of the gaze
                console.log(`Gaze coordinates: (${x}, ${y})`);
                gazeDataDiv.innerText = `Gaze coordinates: X ${x}, Y ${y}`;
                gazeData.push({ eyeX: x, eyeY: y, timestamp: Date.now() });
            }
        }).begin();

        webgazer.showVideoPreview(true) // Shows the video feed that WebGazer is analyzing
               .showPredictionPoints(true); // Shows where WebGazer is predicting the user is looking
    }

    function setupCamera() {
        const constraints = {
            video: {
                deviceId: { exact: '30d91396f3369294a57955172911673cc95475ee2ee751c64520ff65c7a87884' } // Your specific device ID here
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is now active.');
                setupWebGazer(); // Initialize WebGazer after confirming camera is active
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                alert('Unable to access the specified camera. Please ensure the device ID is correct and permissions are granted.');
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
    setupCamera(); // Attempt to initialize the camera
};
