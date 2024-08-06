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

    function setupWebGazer() {
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
        webgazer.setRegression('ridge'); // Use ridge regression for gaze prediction
        webgazer.begin();
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
                setupWebGazer(); // Initialize WebGazer after the camera is successfully activated
            })
            .catch(error => {
                console.error('Error accessing the specified camera:', error);
                fallbackToDefaultCamera();
            });
    }

    function fallbackToDefaultCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Fallback to default camera successful.');
                setupWebGazer(); // Initialize WebGazer even on fallback
            })
            .catch(error => {
                console.error('Error accessing any camera:', error);
            });
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupCamera('30d91396f3369294a57955172911673cc95475ee2ee751c64520ff65c7a87884'); // Use your specific device ID here
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        fallbackToDefaultCamera();
    }
};
