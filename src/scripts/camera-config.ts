
export function getAllCameraConfigs() {
  const cameraConfigsValue = localStorage.getItem('cameraConfigs') || '[]';
  const cameraConfigs = JSON.parse(cameraConfigsValue);
  return cameraConfigs;
}

export function getCameraConfigByCameraId(cameraId: string) {
  const cameraConfigs = getAllCameraConfigs();
  return cameraConfigs.find(config => config.deviceId === cameraId);
}

export function addCameraConfigToStorage(cameraConfig) {
  const cameraConfigs = getAllCameraConfigs();
  cameraConfigs.push(cameraConfig);
  localStorage.setItem('cameraConfigs', JSON.stringify(cameraConfigs));
}

export function removeCameraConfig(cameraId: string) {
  const cameraConfigs = getAllCameraConfigs();
  const updatedCameraConfigs = cameraConfigs.filter(config => config.deviceId !== cameraId);
  localStorage.setItem('cameraConfigs', JSON.stringify(updatedCameraConfigs));
}

export function updateCameraConfig(cameraConfig) {
  const cameraConfigs = getAllCameraConfigs();
  const updatedCameraConfigs = cameraConfigs.map(config => {
    if (config.deviceId === cameraConfig.deviceId) {
      return cameraConfig;
    }
    return config;
  });
  localStorage.setItem('cameraConfigs', JSON.stringify(updatedCameraConfigs));
}
