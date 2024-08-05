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

    const videoElement = document.getElementById('webcamVideo');
    const cameraDeviceId = '47e134a0cd256eb113dcf62b3f6936b13d741765b2b04ca99d027cb4b588306f'; // Your USB Camera's Device ID

    const constraints = {
        video: {
            deviceId: { exact: cameraDeviceId }
        }
    };

    // Attempt to get the media stream using the specified device ID
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.play();
            console.log('Using USB camera with ID:', cameraDeviceId);
            setupWebGazer();
        })
        .catch(error => {
            console.error('Error accessing USB camera:', error);
        });

    function setupWebGazer() {
        // Assuming webgazer has already been loaded and configured in your project
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (data == null) return;

            const x = data.x;
            const y = data.y;
            console.log(`Gaze coordinates: (${x}, ${y})`);
            document.getElementById('gazeData').innerText = `Gaze coordinates: X ${x}, Y ${y}`;
            
            // Optionally, push this data to an array or handle it as needed
        }).begin();

        webgazer.showVideoPreview(true).applyKalmanFilter(true);
    }

    // Add an event listener to save gaze data when the page is unloaded
    let gazeData = [];
    window.addEventListener('beforeunload', function() {
        if (gazeData.length > 0) {
            fetch('/save-gaze-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gazeData)
            }).then(response => console.log('Gaze data saved:', response.ok))
            .catch(console.error);
        }
    });
};
