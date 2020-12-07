const loader = document.getElementById('loader')
const loaderMessage = document.getElementById('loading_message')
const loaderImage = document.getElementById('loading_image')
const video = document.getElementById('video')

loaderMessage.innerHTML = "Loading Models"

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  loaderMessage.innerHTML = "Loading Camera"
  
  navigator.mediaDevices.getUserMedia({
    video: {}
  }) 
  
  .then(  (stream)  => {
      loader.style.display = 'none';
      video.srcObject = stream;
    }, 
    (err)=> {
      loaderImage.style.display = 'none';
      loaderMessage.innerHTML = "Failed to load camera"
      console.error(err)
    }
  );
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    console.info(detections);
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  
  }, 100)
})