window.onload = function() {
    const demoImage = document.getElementById('demoImage');

    // Image display logic
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
            demoImage.src = images[currentImageIndex];
            currentImageIndex++;
            setTimeout(showNextImage, 5000); // Show each image for 5 seconds
        } else {
            alert('Image display complete. Gaze data collection finished.');
        }
    }

    showNextImage();

    // Initialize WebGazer for eye tracking
    let gazeData = [];
    webgazer.setGazeListener(function(data, elapsedTime) {
        if (data == null) {
            return;
        }
        const x = data.x; // x coordinate of the gaze
        const y = data.y; // y coordinate of the gaze
        console.log(`Gaze coordinates: (${x}, ${y})`);
        document.getElementById('gazeData').innerText = `Gaze coordinates: X ${x}, Y ${y}`;
        
        // Save gaze data
        const timestamp = Date.now();
        gazeData.push({ eyeX: x, eyeY: y, timestamp: timestamp });
    }).begin();

    // Set up the camera feed for WebGazer
    webgazer.showVideoPreview(true).showPredictionPoints(true).applyKalmanFilter(true);

    // Handle data saving
    window.addEventListener('beforeunload', function() {
        fetch('/save-gaze-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gazeData)
        }).then(response => {
            if (response.ok) {
                console.log('Gaze data saved successfully.');
            } else {
                console.log('Failed to save gaze data.');
            }
        }).catch(error => {
            console.log('Error saving gaze data:', error);
        });
    });
};
