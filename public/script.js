window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const gazeDataDiv = document.getElementById('gazeData');
    
    // Function to initialize WebGazer
    function setupWebGazer() {
        console.log('Initializing WebGazer...');
        
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data) {
                const x = data.x;
                const y = data.y;
                gazeDataDiv.innerText = `Gaze coordinates: X ${x.toFixed(2)}, Y ${y.toFixed(2)}`;
                console.log(`Gaze coordinates: (${x.toFixed(2)}, ${y.toFixed(2)})`);
            } else {
                console.log('No gaze data available.');
            }
        }).begin()
        .then(() => {
            console.log('WebGazer started successfully.');
            
            webgazer.showVideoPreview(true) // Shows the video feed that WebGazer is analyzing
                    .showPredictionPoints(true) // Shows where WebGazer is predicting the user is looking
                    .applyKalmanFilter(true); // Apply Kalman filter for smoother tracking

            webgazer.setVideoElement(videoElement);
        })
        .catch((err) => {
            console.error('WebGazer failed to start:', err);
        });
    }

    // Function to setup the camera
    function setupCamera() {
        const constraints = {
            video: true
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is now active.');
                setupWebGazer(); // Initialize WebGazer after the camera is active
            })
            .catch(error => {
                console.error('Error accessing the camera:', error);
                alert('Unable to access the camera. Please ensure permissions are granted.');
            });
    }

    // Ensure the browser supports the required features
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupCamera();
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        alert('Your browser does not support the required features. Try updating or switching browsers.');
    }
};
