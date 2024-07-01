window.onload = async function() {
    await webgazer.setRegression('ridge')
        .setTracker('clmtrackr')
        .begin()
        .showVideoPreview(true)
        .showPredictionPoints(true)
        .applyKalmanFilter(true);

    webgazer.setGazeListener(function(data, elapsedTime) {
        if (data == null) {
            return;
        }
        var xprediction = data.x;
        var yprediction = data.y;
        document.getElementById('gazeData').innerHTML = 'X: ' + xprediction + ' Y: ' + yprediction;

        // Send gaze data to the server
        saveGazeData({ x: xprediction, y: yprediction, time: elapsedTime });
    }).begin();

    // Display images and collect gaze data
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
    const demoImage = document.getElementById('demoImage');

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
};

function saveGazeData(data) {
    fetch('/save-gaze-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}
