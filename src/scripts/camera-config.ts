export interface ICameraConfig {
  deviceId: string;
  name: string;
  number: number;
  faceScoreThreshold: number;
  liveThreshold: number;
  pitchThreshold: number;
  yawThreshold: number;
  sceneName: string | null;
  faceDetectionFramesThreshold: number;
}

export function getAllCameraConfigs() {
  const cameraConfigsValue = localStorage.getItem('cameraConfigs') || '[]';
  const cameraConfigs = JSON.parse(cameraConfigsValue);
  return cameraConfigs;
}

export function getCameraConfigByCameraId(cameraId: string): ICameraConfig | undefined {
  const cameraConfigs = getAllCameraConfigs();
  return cameraConfigs.find((config: ICameraConfig) => config.deviceId === cameraId);
}

export function addCameraConfigToStorage(cameraConfig: ICameraConfig) {
  const cameraConfigs = getAllCameraConfigs();
  cameraConfigs.push(cameraConfig);
  localStorage.setItem('cameraConfigs', JSON.stringify(cameraConfigs));
}

export function removeCameraConfig(cameraId: string) {
  const cameraConfigs = getAllCameraConfigs();
  const updatedCameraConfigs = cameraConfigs.filter((config: ICameraConfig) => config.deviceId !== cameraId);
  localStorage.setItem('cameraConfigs', JSON.stringify(updatedCameraConfigs));
}

export function updateCameraConfig(cameraConfig: ICameraConfig) {
  const cameraConfigs = getAllCameraConfigs();
  const updatedCameraConfigs = cameraConfigs.map((config: ICameraConfig) => {
    if (config.deviceId === cameraConfig.deviceId) {
      return cameraConfig;
    }
    return config;
  });
  localStorage.setItem('cameraConfigs', JSON.stringify(updatedCameraConfigs));
}
