/**
 * Device detection and management for TF-Locoformer
 * Handles CPU fallback and GPU acceleration (when available)
 */

export enum DeviceType {
  CPU = 'cpu',
  GPU = 'gpu',
  WEBGPU = 'webgpu',
}

export interface DeviceInfo {
  type: DeviceType;
  name: string;
  available: boolean;
  memory?: number;  // In MB
  details?: any;
}

/**
 * Detect available compute devices
 */
export async function detectDevices(): Promise<DeviceInfo[]> {
  const devices: DeviceInfo[] = [];

  // CPU is always available
  devices.push({
    type: DeviceType.CPU,
    name: 'CPU',
    available: true,
  });

  // Check for WebGPU support (modern browsers)
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      const gpu = (navigator as any).gpu;
      const adapter = await gpu.requestAdapter();
      
      if (adapter) {
        devices.push({
          type: DeviceType.WEBGPU,
          name: 'WebGPU',
          available: true,
          details: {
            limits: adapter.limits,
            features: Array.from(adapter.features),
          },
        });
      }
    } catch (error) {
      console.warn('WebGPU not available:', error);
    }
  }

  // Check for WebGL (for GPU acceleration)
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : 'Unknown GPU';

        devices.push({
          type: DeviceType.GPU,
          name: renderer,
          available: true,
          details: {
            vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
            version: gl.getParameter(gl.VERSION),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
          },
        });
      }
    } catch (error) {
      console.warn('WebGL not available:', error);
    }
  }

  return devices;
}

/**
 * Select the best available device
 */
export async function selectBestDevice(preferredType?: DeviceType): Promise<DeviceInfo> {
  const devices = await detectDevices();

  if (preferredType) {
    const preferred = devices.find(d => d.type === preferredType && d.available);
    if (preferred) {
      return preferred;
    }
  }

  // Preference order: WebGPU > GPU > CPU
  const webgpu = devices.find(d => d.type === DeviceType.WEBGPU && d.available);
  if (webgpu) return webgpu;

  const gpu = devices.find(d => d.type === DeviceType.GPU && d.available);
  if (gpu) return gpu;

  const cpu = devices.find(d => d.type === DeviceType.CPU);
  if (!cpu) {
    throw new Error('No compute device available');
  }

  return cpu;
}

/**
 * Check if RTX 2080 Super or better is available
 */
export function checkGPUCapability(device: DeviceInfo): {
  isRTX2080OrBetter: boolean;
  estimatedPerformance: 'high' | 'medium' | 'low';
  supportsRealtime: boolean;
} {
  if (device.type === DeviceType.CPU) {
    return {
      isRTX2080OrBetter: false,
      estimatedPerformance: 'low',
      supportsRealtime: false,
    };
  }

  // Check GPU name for RTX series
  const gpuName = device.name.toLowerCase();
  const isRTX = gpuName.includes('rtx') || gpuName.includes('geforce');
  
  // Try to estimate GPU capability
  let estimatedPerformance: 'high' | 'medium' | 'low' = 'medium';
  let isRTX2080OrBetter = false;

  if (isRTX) {
    // Parse RTX model number
    const rtxMatch = gpuName.match(/rtx\s*(\d+)/);
    if (rtxMatch) {
      const modelNum = parseInt(rtxMatch[1]);
      
      // RTX 2080 or better (2080, 2080 Ti, 3000 series, 4000 series)
      if (modelNum >= 2080) {
        isRTX2080OrBetter = true;
        estimatedPerformance = 'high';
      } else if (modelNum >= 2060) {
        estimatedPerformance = 'medium';
      }
    }
  } else if (gpuName.includes('titan')) {
    isRTX2080OrBetter = true;
    estimatedPerformance = 'high';
  } else if (gpuName.includes('quadro')) {
    estimatedPerformance = 'medium';
  }

  return {
    isRTX2080OrBetter,
    estimatedPerformance,
    supportsRealtime: isRTX2080OrBetter || estimatedPerformance === 'high',
  };
}

/**
 * Device manager for model execution
 */
export class DeviceManager {
  private currentDevice: DeviceInfo | null = null;
  private devices: DeviceInfo[] = [];

  async initialize(preferredType?: DeviceType): Promise<void> {
    this.devices = await detectDevices();
    this.currentDevice = await selectBestDevice(preferredType);
    
    console.log('Available devices:', this.devices);
    console.log('Selected device:', this.currentDevice);
  }

  getCurrentDevice(): DeviceInfo | null {
    return this.currentDevice;
  }

  getAllDevices(): DeviceInfo[] {
    return [...this.devices];
  }

  async switchDevice(type: DeviceType): Promise<void> {
    const device = this.devices.find(d => d.type === type && d.available);
    
    if (!device) {
      throw new Error(`Device type ${type} not available`);
    }

    this.currentDevice = device;
    console.log('Switched to device:', this.currentDevice);
  }

  getGPUCapability(): ReturnType<typeof checkGPUCapability> | null {
    if (!this.currentDevice) return null;
    return checkGPUCapability(this.currentDevice);
  }

  /**
   * Check if device supports real-time processing
   */
  supportsRealtime(): boolean {
    if (!this.currentDevice) return false;
    
    const capability = this.getGPUCapability();
    return capability?.supportsRealtime || false;
  }

  /**
   * Get recommended batch size based on device
   */
  getRecommendedBatchSize(): number {
    if (!this.currentDevice) return 1;

    const capability = this.getGPUCapability();
    
    switch (capability?.estimatedPerformance) {
      case 'high':
        return 4;
      case 'medium':
        return 2;
      case 'low':
      default:
        return 1;
    }
  }

  /**
   * Get memory constraints
   */
  getMemoryConstraints(): {
    maxAudioLength: number;  // In seconds
    maxBatchSize: number;
    useStreamProcessing: boolean;
  } {
    const capability = this.getGPUCapability();

    if (capability?.estimatedPerformance === 'high') {
      return {
        maxAudioLength: 300,  // 5 minutes
        maxBatchSize: 4,
        useStreamProcessing: false,
      };
    } else if (capability?.estimatedPerformance === 'medium') {
      return {
        maxAudioLength: 180,  // 3 minutes
        maxBatchSize: 2,
        useStreamProcessing: true,
      };
    } else {
      return {
        maxAudioLength: 60,   // 1 minute
        maxBatchSize: 1,
        useStreamProcessing: true,
      };
    }
  }
}

// Singleton instance
let deviceManager: DeviceManager | null = null;

/**
 * Get or create the global device manager
 */
export function getDeviceManager(): DeviceManager {
  if (!deviceManager) {
    deviceManager = new DeviceManager();
  }
  return deviceManager;
}

/**
 * Initialize device manager (call once at startup)
 */
export async function initializeDeviceManager(preferredType?: DeviceType): Promise<DeviceManager> {
  const manager = getDeviceManager();
  await manager.initialize(preferredType);
  return manager;
}
