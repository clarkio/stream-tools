// @ts-ignore
import Human from 'https://cdn.jsdelivr.net/npm/@vladmandic/human/dist/human.esm.js';

import { connect, getIsConnected, setObsScene } from './obs';
import { getCameraConfigByCameraId, type ICameraConfig } from './camera-config';
const CAM_ID_ATTRIBUTE_NAME = 'data-cameraid';

const myConfig = {
  modelBasePath: 'https://cdn.jsdelivr.net/npm/@vladmandic/human/models/',
  backend: 'webgl',
  face: {
    enabled: true,
    detector: { enabled: true, rotation: true },
    mesh: { enabled: true },
    iris: { enabled: true },
    attention: { enabled: true },
    liveness: { enabled: true },
  },
  body: { enabled: false },
  hand: { enabled: false },
  gesture: { enabled: false },
  debug: true,
};
type Camera = {
  cameraId: string,
  human: any,
  faceDetectionFrameCount: number,
  faceDetectionFramesThreshold: number,
  isFaceLooking: boolean,
  timestamp: any,
  fps: any,
  attentionLevel: number;
};
let cameras: Camera[] = [];

async function initializeCameraSettings(cameraId: string) {
  let isFaceLooking = false;
  let attentionLevel = 0;
  let faceDetectionFrameCount = 0;
  const cameraConfig = getCameraConfigByCameraId(cameraId);
  let faceDetectionFramesThreshold = cameraConfig?.faceDetectionFramesThreshold || 0;

  const human = new Human(myConfig);
  human.draw.options.font = 'small-caps 18px "Lato"'; // set font used to draw labels when using draw methods
  human.draw.options.lineHeight = 20;
  human.draw.options.drawPoints = true; // draw points on face mesh

  // warm up without waiting for it to finish
  human.warmup(); // warmup function to initialize backend for future faster detection

  const timestamp = { detect: 0, draw: 0, tensors: 0, start: 0 }; // holds information used to calculate performance and possible memory leaks
  const fps = { detectFPS: 0, drawFPS: 0, frames: 0, averageMs: 0 }; // holds calculated fps information for both detect and screen refresh
  return { cameraId, human, faceDetectionFrameCount, isFaceLooking, timestamp, fps, attentionLevel, faceDetectionFramesThreshold };
}

async function detectionLoop(videoElement: HTMLVideoElement) { // main detection loop
  const cameraId = videoElement.getAttribute(CAM_ID_ATTRIBUTE_NAME) || 'No Video Element for Camera ID';
  const camera = cameras.find(camera => camera.cameraId === cameraId);
  if (!camera) throw new Error(`No camera found for ${cameraId}`);
  if (!videoElement?.paused) {
    if (camera.timestamp.start === 0) camera.timestamp.start = camera.human.now();

    const result = await camera.human.detect(videoElement);
    await printDetectionResults(result, camera);
    const isFaceLooking = await determineIfFaceIsLooking(result, cameraId);
    if (isFaceLooking) {
      camera.faceDetectionFrameCount++;
      if (camera.faceDetectionFrameCount >= camera.faceDetectionFramesThreshold) {
        if (!camera.isFaceLooking) {
          camera.isFaceLooking = true;
          console.log(`Camera ID ${cameraId} IS being looked at!`);
          const message = camera.isFaceLooking ? `Looking` : `Not Looking`;
          const label = document.getElementById(`isLookingLabel-${cameraId}`);
          if (!label) {
            console.warn(`No "looking" label found for camera #${cameraId}`);
            return;
          };
          label.innerText = message;
          label.classList.remove('bg-red-500');
          label.classList.add('bg-green-500');

          setObsScene(cameraId);
        }
      }
    } else {
      if (camera.faceDetectionFrameCount !== 0) {
        camera.faceDetectionFrameCount = 0;
        camera.isFaceLooking = false;
        console.log(`Camera ID ${cameraId} IS NOT being looked at!`);
        const message = camera.isFaceLooking ? `Looking` : `Not Looking`;
        const label = document.getElementById(`isLookingLabel-${cameraId}`);
        if (!label) {
          console.warn(`No "looking" label found for camera ID ${cameraId}`);
          return;
        };
        label.innerText = message;
        label.classList.add('bg-red-500');
        label.classList.remove('bg-green-500');
      }
    }

    const tensors = camera.human.tf.memory().numTensors; // check current tensor usage for memory leaks
    if (tensors - camera.timestamp.tensors !== 0) console.log(`Camera #${cameraId} allocated tensors: ${tensors - camera.timestamp.tensors}`); // printed on start and each time there is a tensor leak
    camera.timestamp.tensors = tensors;
    // fps.detectFPS = Math.round(1000 * 1000 / (camera.human.now() - camera.timestamp.detect)) / 1000;
    // fps.frames++;
    // fps.averageMs = Math.round(1000 * (camera.human.now() - camera.timestamp.start) / fps.frames) / 1000;
    // if (fps.frames % 100 === 0 && !videoElement.paused) console.log('performance', { ...fps, tensors: camera.timestamp.tensors });
  }
  camera.timestamp.detect = camera.human.now();
  requestAnimationFrame(() => detectionLoop(videoElement)); // start new frame immediately
}

async function determineIfFaceIsLooking(result: any, cameraId: string) {
  let isLooking = false;
  if (!result?.face || result?.face.length === 0) return isLooking;

  const { pitchThreshold, yawThreshold, liveThreshold, faceScoreThreshold } = await getCameraThresholds(cameraId);

  const face = result.face[0];

  // @ts-ignore
  const { pitch, roll, yaw } = face.rotation.angle;
  // @ts-ignore
  const { bearing, strength } = face.rotation.gaze;

  if (face.live >= liveThreshold && face.faceScore >= faceScoreThreshold && await isInThresholdRange(pitch, pitchThreshold) && await isInThresholdRange(yaw, yawThreshold)) {
    isLooking = true;
  }

  return isLooking;
}

async function isInThresholdRange(value: number, threshold: number) {
  return Math.abs(value) <= threshold;
}

async function getCameraThresholds(cameraId: string) {
  const { pitchThreshold, faceScoreThreshold, liveThreshold, yawThreshold } = getCameraConfigByCameraId(cameraId) || { pitchThreshold: 0, faceScoreThreshold: 0, liveThreshold: 0, yawThreshold: 0 };

  return { pitchThreshold, yawThreshold, liveThreshold, faceScoreThreshold };
}

async function printDetectionResults(result: any, camera: Camera) {
  if (!result?.face || result?.face.length === 0) return;
  const face = result.face[0];
  // @ts-ignore
  const { pitch, roll, yaw } = face.rotation.angle;
  // @ts-ignore
  const { bearing, strength } = face.rotation.gaze;
  document.getElementById(`pitch-result-${camera.cameraId}`)!.innerText = `${pitch.toFixed(5)}`;
  document.getElementById(`yaw-result-${camera.cameraId}`)!.innerText = `${yaw.toFixed(5)}`;
  document.getElementById(`live-result-${camera.cameraId}`)!.innerText = `${face.live}`;
  document.getElementById(`facescore-result-${camera.cameraId}`)!.innerText = `${face.faceScore}`;
  document.getElementById(`face-detection-frame-count-${camera.cameraId}`)!.innerText = `${camera.faceDetectionFrameCount}`;
}

// @ts-ignore
async function drawLoop(videoElement, canvasElement) { // main screen refresh loop
  const cameraId = videoElement.getAttribute(CAM_ID_ATTRIBUTE_NAME);
  const camera = cameras.find(camera => camera.cameraId === cameraId);
  if (!camera) throw new Error(`No camera found for ${cameraId}`);
  if (!videoElement.paused) {
    const interpolated = camera.human.next(camera.human.result); // smoothen result using last-known results
    const processed = await camera.human.image(videoElement); // get current video frame, but enhanced with camera.human.filters
    camera.human.draw.canvas(processed.canvas, canvasElement);

    const opt = { bodyLabels: `person confidence [score] and ${camera.human.result?.body?.[0]?.keypoints.length} keypoints` };
    await camera.human.draw.all(canvasElement, interpolated, opt); // draw labels, boxes, lines, etc.
    // perf(interpolated.performance); // write performance data
  }
  const now = camera.human.now();
  camera.fps.drawFPS = Math.round(1000 * 1000 / (now - camera.timestamp.draw)) / 1000;
  camera.timestamp.draw = now;
  // console.log(videoElement.paused ? 'paused' : `fps: ${fps.detectFPS.toFixed(1).padStart(5, ' ')} detect | ${fps.drawFPS.toFixed(1).padStart(5, ' ')} draw`); // write status
  setTimeout(() => drawLoop(videoElement, canvasElement), 30); // use to slow down refresh from max refresh rate to target of 30 fps
}

// @ts-ignore
export async function initializeCamera(deviceId, videoElement, canvasElement) {
  console.log(`Initializing camera in Human AI library for deviceId: ${deviceId}`);
  const cameraId = videoElement.getAttribute(CAM_ID_ATTRIBUTE_NAME);
  if (!cameraId) throw new Error('A camera ID must be provided');

  let camera = cameras.find(camera => camera.cameraId === cameraId);
  if (!camera) {
    camera = await initializeCameraSettings(cameraId);
    cameras.push(camera);
  } else {
    console.warn(`Camera with ID ${cameraId} has already been initialized`);
  }
}

export async function startCamera(cameraId: string, videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
  console.log('Attempting to start camera with ID: ', cameraId);
  const camera = cameras.find(camera => camera.cameraId === cameraId);
  if (!camera) throw new Error(`No camera found with ID ${cameraId}`);
  console.log('WebCam Stream: ', camera.human.webcam);

  if (!camera.human.webcam.stream && !camera.human.webcam.paused) {
    console.log('Camera has not been started with the human AI library yet');
    const webcamStatus = await camera.human.webcam.start({ element: videoElement, crop: false, id: cameraId, debug: true });
    console.log(`Camera ID: ${cameraId}\nStatus: ${webcamStatus}`);
    // canvasElement.width = 480;
    // canvasElement.height = 270;
    // canvasElement.width = camera.human.webcam.width;
    // canvasElement.height = camera.human.webcam.height;
    // canvasElement.onclick = async (event) => { // pause when clicked on screen and resume on next click
    //   console.log('Canvas clicked', event);
    //   console.log(event.target.getAttribute(CAM_ID_ATTRIBUTE_NAME));
    //   if (camera.human.webcam.paused) await camera.human.webcam.play();
    //   else camera.human.webcam.pause();
    // };
  } else if (camera.human.webcam.stream?.active && camera.human.webcam.paused) {
    await camera.human.webcam.play();
  } else {
    console.log('Camera is already active and playing. No need to start it again.');
  }
}

/**
 * @param {string} cameraId
 */
export function pauseCamera(cameraId: string) {
  const camera = cameras.find(camera => camera.cameraId === cameraId);
  if (!camera) throw new Error(`No camera found with ID ${cameraId}`);
  camera.human.webcam.pause();
}

/**
 * @param {string} cameraId
 */
export async function stopCamera(cameraId: string) {
  const camera = cameras.find(camera => camera.cameraId === cameraId);
  if (!camera) throw new Error(`No camera found with ID ${cameraId}`);
  await camera.human.webcam.stop();
}

// @ts-ignore
export async function startTracking(videoElement, canvasElement, cameraId) {
  await connect();
  if (!getIsConnected()) throw new Error('Not connected to OBS');
  const camera = cameras.find(camera => camera.cameraId === cameraId);
  if (!camera) throw new Error(`No camera found with ID ${cameraId}`);

  // Make sure to start the camera before beginning to track
  console.log(`Camera ${cameraId} human version: ${camera.human.version} | tfjs version: ${camera.human.tf.version['tfjs-core']}`);
  console.log(`Camera ${cameraId} platform: ${camera.human.env.platform} | agent: ${camera.human.env.agent}`);
  console.log(`Camera ${cameraId} loading...`);
  await camera.human.load(); // preload all models
  console.log(`Camera ${cameraId} backend: ${camera.human.tf.getBackend()} | available: ${camera.human.env.backends}`);
  console.log(`Camera ${cameraId} models stats: ${camera.human.models.stats()}`);
  console.log(`Camera ${cameraId} models loaded: ${camera.human.models.loaded()}`);
  console.log(`Camera ${cameraId} environment: ${camera.human.env}`);
  console.log(`Camera ${cameraId} initializing...`);
  if (camera.human.webcam.paused) await camera.human.webcam.play();
  await detectionLoop(videoElement); // start detection loop
  // await drawLoop(videoElement, canvasElement); // start draw loop
}
