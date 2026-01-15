// Get DOM elements
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const drawingCanvas = document.getElementById('drawingCanvas');
const loadingScreen = document.getElementById('loadingScreen');
const gestureIndicator = document.getElementById('currentGesture');
const modeIndicator = document.getElementById('currentMode');
const cursor = document.getElementById('cursor');

const canvasCtx = canvasElement.getContext('2d');
const drawingCtx = drawingCanvas.getContext('2d');

// Drawing state
let currentColor = '#FF0000';
let isDrawing = false;
let lastPoint = null;
let currentMode = 'hover';

// Set canvas sizes
function resizeCanvas() {
    const container = document.getElementById('container');
    canvasElement.width = container.offsetWidth;
    canvasElement.height = container.offsetHeight;
    drawingCanvas.width = container.offsetWidth;
    drawingCanvas.height = container.offsetHeight;
    
    drawingCtx.lineCap = 'round';
    drawingCtx.lineJoin = 'round';
    drawingCtx.lineWidth = 5;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Color selection
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        currentColor = option.dataset.color;
    });
});

// Control buttons
document.getElementById('clearBtn').addEventListener('click', () => {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'hand-drawing.png';
    link.href = drawingCanvas.toDataURL();
    link.click();
});

// Detect gesture based on hand landmarks
function detectGesture(landmarks) {
    // Check if finger is extended (tip is above PIP joint)
    function isFingerExtended(tipIdx, pipIdx) {
        return landmarks[tipIdx].y < landmarks[pipIdx].y;
    }

    const indexExtended = isFingerExtended(8, 6);
    const middleExtended = isFingerExtended(12, 10);
    const ringExtended = isFingerExtended(16, 14);
    const pinkyExtended = isFingerExtended(20, 18);
    const thumbExtended = landmarks[4].x < landmarks[3].x;

    // Count extended fingers
    const extendedFingers = [
        indexExtended,
        middleExtended,
        ringExtended,
        pinkyExtended,
        thumbExtended
    ].filter(Boolean).length;

    // Index finger only - Drawing
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return 'draw';
    }
    // Index + Middle - Hover/Select
    else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return 'hover';
    }
    // All fingers extended - Erase
    else if (extendedFingers >= 4) {
        return 'erase';
    }
    
    return 'none';
}

// Check if point is over color palette
function checkColorSelection(x, y) {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        const rect = option.getBoundingClientRect();
        const containerRect = document.getElementById('container').getBoundingClientRect();
        
        // Adjust for container position
        const optionX = rect.left - containerRect.left;
        const optionY = rect.top - containerRect.top;
        const optionWidth = rect.width;
        const optionHeight = rect.height;
        
        if (x >= optionX && x <= optionX + optionWidth &&
            y >= optionY && y <= optionY + optionHeight) {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            currentColor = option.dataset.color;
        }
    });
}

// Process hand tracking results
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Draw hand landmarks
        if (typeof drawConnectors !== 'undefined' && typeof HAND_CONNECTIONS !== 'undefined') {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1, radius: 3});
        }

        // Get index finger tip position (corrected for mirroring)
        const indexTip = landmarks[8];
        // For cursor positioning (mirrored for display)
        const cursorX = (1 - indexTip.x) * canvasElement.width;
        const cursorY = indexTip.y * canvasElement.height;
        
        // For drawing on canvas (canvas is already mirrored, so use original coordinates)
        const drawX = indexTip.x * canvasElement.width;
        const drawY = indexTip.y * canvasElement.height;

        // Update cursor position
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        cursor.style.backgroundColor = currentColor;
        cursor.style.display = 'block';

        // Detect gesture
        const gesture = detectGesture(landmarks);
        gestureIndicator.textContent = gesture.toUpperCase();

        if (gesture === 'draw') {
            currentMode = 'Drawing';
            modeIndicator.textContent = currentMode;
            cursor.style.transform = 'scale(1.5)';
            
            if (lastPoint) {
                drawingCtx.strokeStyle = currentColor;
                drawingCtx.beginPath();
                drawingCtx.moveTo(lastPoint.x, lastPoint.y);
                drawingCtx.lineTo(drawX, drawY);
                drawingCtx.stroke();
            }
            lastPoint = {x: drawX, y: drawY};
        } 
        else if (gesture === 'hover') {
            currentMode = 'Hover/Select';
            modeIndicator.textContent = currentMode;
            cursor.style.transform = 'scale(1.2)';
            lastPoint = null;
            
            // Check color selection using cursor position
            checkColorSelection(cursorX, cursorY);
        } 
        else if (gesture === 'erase') {
            currentMode = 'Erasing';
            modeIndicator.textContent = currentMode;
            cursor.style.transform = 'scale(2)';
            cursor.style.backgroundColor = 'white';
            
            // Erase in circular area using drawing coordinates
            drawingCtx.globalCompositeOperation = 'destination-out';
            drawingCtx.beginPath();
            drawingCtx.arc(drawX, drawY, 30, 0, Math.PI * 2);
            drawingCtx.fill();
            drawingCtx.globalCompositeOperation = 'source-over';
            
            lastPoint = null;
        } 
        else {
            currentMode = 'Hover';
            modeIndicator.textContent = currentMode;
            cursor.style.transform = 'scale(1)';
            lastPoint = null;
        }
    } else {
        cursor.style.display = 'none';
        lastPoint = null;
    }

    canvasCtx.restore();
}

// Initialize MediaPipe and Camera
function initializeApp() {
    // Check if MediaPipe Hands is loaded
    if (typeof Hands === 'undefined') {
        loadingScreen.innerHTML = `
            <h2>Loading Error</h2>
            <p>MediaPipe Hands library failed to load</p>
            <p>Please check your internet connection and refresh the page</p>
        `;
        return;
    }

    // MediaPipe Hands setup
    const hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults(onResults);

    // Camera setup
    if (typeof Camera === 'undefined') {
        loadingScreen.innerHTML = `
            <h2>Loading Error</h2>
            <p>Camera utilities failed to load</p>
            <p>Please check your internet connection and refresh the page</p>
        `;
        return;
    }

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: 1280,
        height: 720
    });

    camera.start()
        .then(() => {
            console.log('Camera started successfully');
            loadingScreen.classList.add('hidden');
        })
        .catch(err => {
            console.error('Camera error:', err);
            loadingScreen.innerHTML = `
                <h2>Camera Error</h2>
                <p>${err.message}</p>
                <p>Please allow camera access and refresh the page</p>
            `;
        });
}

// Wait for libraries to load before initializing
window.addEventListener('load', () => {
    // Give libraries a moment to load
    setTimeout(() => {
        initializeApp();
    }, 1000);
});