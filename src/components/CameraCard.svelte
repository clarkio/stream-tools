<script lang="ts">
  import {
    getCameraConfigByCameraId,
    removeCameraConfig,
    updateCameraConfig,
    type ICameraConfig,
  } from '../scripts/camera-config';
  import {
    startCamera,
    pauseCamera,
    startTracking,
  } from '../scripts/face-look-detection';

  export let cameraConfig: ICameraConfig;

  async function togglePlayForCamera(event: any) {
    const isPlaying =
      event.target.getAttribute('data-isplaying')?.toLowerCase() === 'true';
    const cameraId = event.target.getAttribute('data-cameraid');
    const config: ICameraConfig = getCameraConfigByCameraId(cameraId) || {};
    console.log('config', config);
    console.log(`Camera ID ${cameraId} isPlaying: ${isPlaying}`);
    const textOverlay = document.getElementById(
      `text-overlay-${cameraConfig.deviceId}`,
    );
    if (textOverlay) {
      textOverlay.style.display = 'none';
    }
    if (isPlaying) {
      event.target.setAttribute('data-isplaying', false);
      event.target.innerText = `Play Camera`;
      pauseCamera(cameraId);
      // await stopCamera(cameraId);
    } else {
      event.target.setAttribute('data-isplaying', true);
      event.target.innerText = `Pause Camera`;
      console.log(`Selected Camera is ${config.deviceId}`);
      await startCamera(
        cameraId,
        document.getElementById(`video-camera-${cameraId}`) as HTMLVideoElement,
        document.getElementById(
          `canvas-camera-${cameraId}`,
        ) as HTMLCanvasElement,
      );
    }
  }

  function removeCameraListener(event: any) {
    const cameraId = event.target!.getAttribute('data-cameraid');
    console.log(`Removing camera ${cameraId}`);
    const cameraDiv = document.getElementById(`camera-container-${cameraId}`);
    cameraDiv?.remove();
    removeCameraConfig(cameraId);
  }

  async function toggleTrackingForCamera(event: any) {
    console.dir(event);
    const isTracking =
      event.target.getAttribute('data-istracking')?.toLowerCase() === 'true';
    const cameraId = event.target.getAttribute('data-cameraid');
    if (isTracking) {
      event.target.setAttribute('data-istracking', false);
      event.target.innerText = `Start Tracking`;
      const canvas = document.getElementById(`canvas-camera-${cameraId}`);
      canvas?.remove();
      pauseCamera(cameraId);
    } else {
      event.target.setAttribute('isTracking', true);
      event.target.innerText = `Stop Tracking`;
      const video = document.getElementById(`video-camera-${cameraId}`);
      const canvas = document.getElementById(`canvas-camera-${cameraId}`);
      startTracking(video, canvas, cameraId);
    }
  }
</script>

<div
  id="camera-container-{cameraConfig.deviceId}"
  class="relative w-max rounded bg-sky-700 px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 m-0"
>
  <div class="overflow-hidden mx-auto">
    <div class="flex justify-between items-center text-center">
      <div id="cameraLabel-{cameraConfig.deviceId}" class="text-lg font-bold">
        {cameraConfig.name}
      </div>
      <div class="text-lg">
        <!-- <span>Status: </span> -->
        <span
          id="isLookingLabel-{cameraConfig.deviceId}"
          class=" bg-red-500 rounded-md px-2 py-0.5"
          >Not Looking
        </span>
      </div>
    </div>
    <div class="divide-y divide-gray-300/50">
      <div class="space-y-6 py-8 text-base leading-7">
        <div class="flex flex-row flex-nowrap gap-4 max-w-lg relative">
          <video
            id="video-camera-{cameraConfig.deviceId}"
            data-cameraid={cameraConfig.deviceId}
            class="max-w-72 max-h-fit"
          >
            <track kind="captions" />
            Your browser does not support the video tag or the video could not be
            loaded.
          </video>
          <div
            id="text-overlay-{cameraConfig.deviceId}"
            class="absolute top-0 left-0 w-72 h-full flex items-center justify-center bg-black bg-opacity-50 text-white"
          >
            Video is not playing
          </div>
          <canvas
            id="canvas-camera-{cameraConfig.deviceId}"
            class="hidden"
            data-cameraid={cameraConfig.deviceId}
          >
          </canvas>
          <div class="grid grid-flow-row">
            <div class="text-lg font-bold">Live Values:</div>
            <div>
              <span>Yaw:</span>
              <span id="yaw-result-{cameraConfig.deviceId}">N/A</span>
            </div>
            <div>
              <span>Pitch:</span>
              <span id="pitch-result-{cameraConfig.deviceId}">N/A</span>
            </div>
            <div>
              <span>Live:</span>
              <span id="live-result-{cameraConfig.deviceId}">N/A</span>
            </div>
            <div>
              <span>Face Score:</span>
              <span id="facescore-result-{cameraConfig.deviceId}">N/A</span>
            </div>
            <div>
              <span>Looking Frame Count:</span>
              <span id="face-detection-frame-count-{cameraConfig.deviceId}"
                >N/A</span
              >
            </div>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="text-lg font-bold">Thresholds:</div>
          <div class="grid grid-flow-row grid-cols-2 gap-0.5">
            <div>
              <div>Yaw:</div>
              <input
                id="yaw-threshold-input-{cameraConfig.deviceId}"
                class="text-black px-2"
                placeholder="Yaw Threshold (0.5)"
                value={cameraConfig.yawThreshold || 0.5}
                type="text"
                data-cameraid={cameraConfig.deviceId}
                on:change={(event) => {
                  // @ts-ignore
                  const cameraId =
                    event.target.getAttribute('data-cameraid') || '';
                  const cameraConfig = getCameraConfigByCameraId(cameraId);
                  // @ts-ignore
                  cameraConfig.yawThreshold = parseFloat(event.target?.value);
                  if (cameraConfig) {
                    updateCameraConfig(cameraConfig);
                  }
                }}
              />
            </div>
            <div>
              <div>Pitch:</div>
              <input
                id="pitch-threshold-input-{cameraConfig.deviceId}"
                class="text-black px-2"
                placeholder="Pitch Threshold (0.5)"
                value={cameraConfig.pitchThreshold || 0.5}
                type="text"
                data-cameraid={cameraConfig.deviceId}
                on:change={(event) => {
                  // @ts-ignore
                  const cameraId =
                    event.target.getAttribute('data-cameraid') || '';
                  const cameraConfig = getCameraConfigByCameraId(cameraId);
                  // @ts-ignore
                  cameraConfig.pitchThreshold = parseFloat(event.target?.value);
                  if (cameraConfig) {
                    updateCameraConfig(cameraConfig);
                  }
                }}
              />
            </div>
            <div>
              <div>Live:</div>
              <input
                id="live-level-input-{cameraConfig.deviceId}"
                class="text-black px-2"
                placeholder="Live Threshold (0.5)"
                value={cameraConfig.liveThreshold || 0.5}
                type="text"
                data-cameraid={cameraConfig.deviceId}
                on:change={(event) => {
                  // @ts-ignore
                  const cameraId =
                    event.target.getAttribute('data-cameraid') || '';
                  const cameraConfig = getCameraConfigByCameraId(cameraId);
                  // @ts-ignore
                  cameraConfig.liveThreshold = parseFloat(event.target?.value);
                  if (cameraConfig) {
                    updateCameraConfig(cameraConfig);
                  }
                }}
              />
            </div>
            <div>
              <div>Face Score:</div>
              <input
                id="facescore-threshold-input-{cameraConfig.deviceId}"
                class="text-black px-2"
                placeholder="Face Score Threshold (0.8)"
                value={cameraConfig.faceScoreThreshold || 0.8}
                type="text"
                data-cameraid={cameraConfig.deviceId}
                on:change={(event) => {
                  // @ts-ignore
                  const cameraId =
                    event.target.getAttribute('data-cameraid') || '';
                  const cameraConfig = getCameraConfigByCameraId(cameraId);
                  // @ts-ignore
                  cameraConfig.faceScoreThreshold = parseFloat(
                    event.target?.value,
                  );
                  if (cameraConfig) {
                    updateCameraConfig(cameraConfig);
                  }
                }}
              />
            </div>
            <div>
              <div>Frame Delay:</div>
              <input
                id="face-frames-delay-threshold-input-{cameraConfig.deviceId}"
                class="text-black px-2"
                placeholder="Frame Delay (0)"
                value={cameraConfig.faceDetectionFramesThreshold || 0}
                type="text"
                data-cameraid={cameraConfig.deviceId}
                on:change={(event) => {
                  console.log('Frame delay changed');
                  console.dir(event);
                  // @ts-ignore
                  const cameraId =
                    event.target.getAttribute('data-cameraid') || '';
                  console.log('Camera ID', cameraId);
                  const cameraConfig = getCameraConfigByCameraId(cameraId);
                  // @ts-ignore
                  cameraConfig.faceDetectionFramesThreshold = parseFloat(
                    event.target?.value,
                  );
                  if (cameraConfig) {
                    updateCameraConfig(cameraConfig);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Not sure why but if the p element gets removed the divider below is gone -->
      <p></p>
    </div>
    <div class="pt-8 text-base font-semibold leading-7">
      <button
        id="togglePlayForCamera-{cameraConfig.deviceId}"
        class="rounded bg-sky-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        data-isplaying="false"
        data-cameraid={cameraConfig.deviceId}
        on:click={togglePlayForCamera}>Play</button
      >
      <button
        id="toggleTrackingForCamera-{cameraConfig.deviceId}"
        class="rounded bg-sky-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        data-istracking="false"
        data-cameraid={cameraConfig.deviceId}
        on:click={toggleTrackingForCamera}>Start Tracking</button
      >
      <button
        id="removeCamera-{cameraConfig.deviceId}"
        class="absolute rounded bg-red-800 px-4 py-2 font-bold text-white hover:bg-red-700 right-10"
        data-cameranumber={cameraConfig.number}
        data-cameraid={cameraConfig.deviceId}
        on:click={removeCameraListener}>Remove</button
      >
    </div>
  </div>
</div>

<style>
</style>
