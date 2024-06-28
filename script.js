window.onload = function() {
    webgazer.setRegression('ridge')
        .setTracker('clmtrackr')
        .begin()
        .showVideoPreview(true) // This will append the video element automatically
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

    // Move video element to specific location
    const video = document.querySelector('video');
    const videoContainer = document.getElementById('webcamVideo');
    videoContainer.parentNode.replaceChild(video, videoContainer);
    video.id = 'webcamVideo';
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
