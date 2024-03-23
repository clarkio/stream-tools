import { getAllCameraConfigs, type ICameraConfig } from './camera-config';
import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();

const obsConfigValue = localStorage.getItem('obsConfig') || '{}';
let obsConfig = JSON.parse(obsConfigValue);

let isConnected = false;

export function getIsConnected() {
  return isConnected;
}

export async function connect() {
  updateObsConfig();
  try {
    const result = await obs.connect(`ws://${obsConfig.address || "127.0.0.1"}:${obsConfig.port || 4455} `, obsConfig.password);
    isConnected = true;
    return;
  } catch (error) {
    console.error('Failed to connect to OBS WebSocket server:', error);
    isConnected = false;
    alert('Failed to connect to the OBS WebSocket server. Please check the OBS WebSocket settings.');
    throw error;
  }
}

function updateObsConfig() {
  const obsConfigValue = localStorage.getItem('obsConfig') || '{}';
  obsConfig = JSON.parse(obsConfigValue);
  console.log('Successfully retrieved latest OBS config');
}

export async function setObsScene(cameraId: string) {
  console.log('Setting OBS scene for camera', cameraId);
  const cameraConfigs = getAllCameraConfigs();
  const cameraConfig = cameraConfigs.find((c: ICameraConfig) => c.deviceId === cameraId);
  if (cameraConfig && cameraConfig.sceneName) {
    changeScene(cameraConfig.sceneName);
  } else {
    console.warn('No scene name was found for camera', cameraId);
  }
}

export function changeScene(sceneName: string) {
  obs.call('SetCurrentProgramScene', { 'sceneName': sceneName });
}

export async function getAllScenes() {
  try {
    let scenes: any[] = [];
    const sceneList = await obs.call('GetSceneList');
    if (sceneList && sceneList.scenes) {
      scenes = sceneList.scenes.map((scene) => scene.sceneName);
    }
    return scenes;
  } catch (error) {
    throw error;
  }
};
