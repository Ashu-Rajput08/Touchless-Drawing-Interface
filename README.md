# Real-Time Hand Gesture Controlled Virtual Drawing Interface

A touchless, interactive digital canvas that allows users to draw, hover, select colors, and erase on-screen objects using only hand gestures. By leveraging advanced Computer Vision and Human-Computer Interaction (HCI) principles.

---

## 🚀 Key Features

* **Real-Time Hand Tracking:** Utilizes highly efficient pre-trained models to localize 21 specific hand-knuckle coordinates instantly.
* **Touchless UI Controls:** A gesture-based navigation layout that lets users select colors or clear the canvas completely on screen.
* **Multi-Gesture Operations:**
  * ☝️ **Drawing Mode:** Keep only the index finger extended to draw smooth, continuous colored strokes on the digital canvas.
  * ✌️ **Hover & Selection Mode:** Extend the index and middle fingers together. This serves two seamless purposes based on screen location:
    1. **Canvas Area:** Functions as a free cursor allowing you to navigate or transition positioning without leaving a trail.
    2. **Top Toolbar Area:** Automatically acts as a "Color Selector" when your 2-finger cursor hovers directly over the Red, Green, or Blue menu elements to switch brush types.
  * 🖐️ **Palm Erasing:** Extend a full open-palm gesture over the screen to dynamically delete drawn paths safely within your hand's proximity.
* **Directional Consistency:** Fully adjusted to ensure your hand movements correlate directly with the screen canvas, eliminating natural camera mirroring confusion.

---

## 🛠️ Technologies Used

* **HTML5 & CSS3:** For the UI composition, layout layering, and canvas structuring.
* **JavaScript (ES6+):** Core application architecture, canvas history management, and custom gesture interpretation logic.
* **MediaPipe Tasks Vision:** Specifically integrating the **Hand Landmarker model bundle** (trained on over 30K real-world and synthetic images) to track high-fidelity 21 3D landmarks via GPU delegation.

---

## 🗺️ Hand Landmarks Mapping Reference

The gesture logic in this application relies on identifying individual joints from the 21 keypoint coordinate pipeline outputted by the model:

* **Landmark 4:** THUMB_TIP
* **Landmark 6:** INDEX_FINGER_PIP (Knuckle)
* **Landmark 8:** INDEX_FINGER_TIP (Drawing Brush / Picker Cursor)
* **Landmark 10:** MIDDLE_FINGER_PIP (Knuckle)
* **Landmark 12:** MIDDLE_FINGER_TIP (Hover Reference)
* **Landmark 14 & 18:** RING & PINKY PIP joints (Palm verification)

---

