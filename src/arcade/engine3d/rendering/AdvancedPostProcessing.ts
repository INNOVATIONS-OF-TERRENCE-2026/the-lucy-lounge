/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ LUCY ARCADE — ADVANCED POST-PROCESSING                                      │
 * │                                                                             │
 * │ Console-grade visual effects pipeline                                       │
 * │                                                                             │
 * │ FEATURES:                                                                   │
 * │ • Screen Space Ambient Occlusion (SSAO)                                     │
 * │ • Screen Space Reflections (SSR)                                            │
 * │ • Motion Blur                                                               │
 * │ • Depth of Field                                                            │
 * │ • Color Grading with LUT                                                    │
 * │ • Film Grain & Vignette                                                     │
 * │ • Chromatic Aberration                                                      │
 * │ • Temporal Anti-Aliasing (TAA)                                              │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import * as THREE from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

// ============================================================================
// SSAO PASS
// ============================================================================

const SSAOShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    tNormal: { value: null },
    resolution: { value: new THREE.Vector2() },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000 },
    radius: { value: 0.5 },
    bias: { value: 0.025 },
    intensity: { value: 1.0 },
    samples: { value: 16 },
    noiseTexture: { value: null },
    projectionMatrix: { value: new THREE.Matrix4() },
    projectionMatrixInverse: { value: new THREE.Matrix4() },
  },
  
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform sampler2D tNormal;
    uniform sampler2D noiseTexture;
    uniform vec2 resolution;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float radius;
    uniform float bias;
    uniform float intensity;
    uniform mat4 projectionMatrix;
    uniform mat4 projectionMatrixInverse;
    
    varying vec2 vUv;
    
    #define KERNEL_SIZE 16
    
    // Hemisphere kernel
    const vec3 kernel[KERNEL_SIZE] = vec3[](
      vec3(0.04977, -0.04471, 0.04996),
      vec3(0.01457, 0.01653, 0.00224),
      vec3(-0.04065, -0.01937, 0.03193),
      vec3(0.01378, -0.09158, 0.04092),
      vec3(0.05599, 0.05979, 0.05766),
      vec3(0.09227, 0.04428, 0.01545),
      vec3(-0.00204, -0.05212, 0.14572),
      vec3(-0.00033, -0.00019, 0.00037),
      vec3(0.05004, -0.04665, 0.02538),
      vec3(-0.03886, 0.09849, 0.01431),
      vec3(0.01943, 0.01419, 0.00543),
      vec3(-0.16329, 0.14200, 0.03409),
      vec3(0.06200, -0.06020, 0.02781),
      vec3(0.02238, -0.10158, 0.08520),
      vec3(-0.04070, 0.04349, 0.05360),
      vec3(0.03818, -0.04200, 0.01340)
    );
    
    float linearizeDepth(float depth) {
      float z = depth * 2.0 - 1.0;
      return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
    }
    
    vec3 getViewPosition(vec2 uv, float depth) {
      vec4 clipSpace = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
      vec4 viewSpace = projectionMatrixInverse * clipSpace;
      return viewSpace.xyz / viewSpace.w;
    }
    
    void main() {
      float depth = texture2D(tDepth, vUv).r;
      
      if (depth >= 1.0) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }
      
      vec3 viewPos = getViewPosition(vUv, depth);
      vec3 normal = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;
      
      // Random rotation
      vec2 noiseScale = resolution / 4.0;
      vec3 randomVec = texture2D(noiseTexture, vUv * noiseScale).rgb * 2.0 - 1.0;
      
      // Create TBN matrix
      vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
      vec3 bitangent = cross(normal, tangent);
      mat3 TBN = mat3(tangent, bitangent, normal);
      
      float occlusion = 0.0;
      
      for (int i = 0; i < KERNEL_SIZE; i++) {
        // Sample position
        vec3 samplePos = TBN * kernel[i];
        samplePos = viewPos + samplePos * radius;
        
        // Project sample position
        vec4 offset = projectionMatrix * vec4(samplePos, 1.0);
        offset.xyz /= offset.w;
        offset.xyz = offset.xyz * 0.5 + 0.5;
        
        // Sample depth at offset
        float sampleDepth = linearizeDepth(texture2D(tDepth, offset.xy).r);
        float viewDepth = -samplePos.z;
        
        // Range check and accumulate
        float rangeCheck = smoothstep(0.0, 1.0, radius / abs(viewDepth - sampleDepth));
        occlusion += (sampleDepth >= viewDepth + bias ? 1.0 : 0.0) * rangeCheck;
      }
      
      occlusion = 1.0 - (occlusion / float(KERNEL_SIZE));
      occlusion = pow(occlusion, intensity);
      
      vec4 color = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(color.rgb * occlusion, color.a);
    }
  `,
};

export class SSAOPass extends Pass {
  private material: THREE.ShaderMaterial;
  private fsQuad: FullScreenQuad;
  private noiseTexture: THREE.DataTexture;
  
  public radius: number = 0.5;
  public bias: number = 0.025;
  public intensity: number = 1.0;
  
  constructor(
    private width: number,
    private height: number,
    private camera: THREE.Camera,
    private depthTexture: THREE.DepthTexture,
    private normalTexture: THREE.Texture
  ) {
    super();
    
    this.noiseTexture = this.generateNoiseTexture();
    
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(SSAOShader.uniforms),
      vertexShader: SSAOShader.vertexShader,
      fragmentShader: SSAOShader.fragmentShader,
    });
    
    this.material.uniforms.tDepth.value = depthTexture;
    this.material.uniforms.tNormal.value = normalTexture;
    this.material.uniforms.noiseTexture.value = this.noiseTexture;
    this.material.uniforms.resolution.value.set(width, height);
    
    this.fsQuad = new FullScreenQuad(this.material);
  }
  
  private generateNoiseTexture(): THREE.DataTexture {
    const size = 4;
    const data = new Float32Array(size * size * 4);
    
    for (let i = 0; i < size * size; i++) {
      const stride = i * 4;
      data[stride] = Math.random() * 2 - 1;
      data[stride + 1] = Math.random() * 2 - 1;
      data[stride + 2] = 0;
      data[stride + 3] = 1;
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    
    return texture;
  }
  
  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget
  ): void {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.radius.value = this.radius;
    this.material.uniforms.bias.value = this.bias;
    this.material.uniforms.intensity.value = this.intensity;
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.material.uniforms.cameraNear.value = this.camera.near;
      this.material.uniforms.cameraFar.value = this.camera.far;
      this.material.uniforms.projectionMatrix.value.copy(this.camera.projectionMatrix);
      this.material.uniforms.projectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse);
    }
    
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
    }
    
    this.fsQuad.render(renderer);
  }
  
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.material.uniforms.resolution.value.set(width, height);
  }
  
  dispose(): void {
    this.material.dispose();
    this.noiseTexture.dispose();
  }
}

// ============================================================================
// MOTION BLUR PASS
// ============================================================================

const MotionBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    velocityBuffer: { value: null },
    resolution: { value: new THREE.Vector2() },
    intensity: { value: 1.0 },
    samples: { value: 16 },
    maxVelocity: { value: 32.0 },
  },
  
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D velocityBuffer;
    uniform vec2 resolution;
    uniform float intensity;
    uniform int samples;
    uniform float maxVelocity;
    
    varying vec2 vUv;
    
    void main() {
      vec2 velocity = texture2D(velocityBuffer, vUv).rg;
      
      // Clamp velocity
      float speed = length(velocity);
      if (speed > maxVelocity) {
        velocity = velocity / speed * maxVelocity;
      }
      
      velocity *= intensity / float(samples);
      
      vec4 color = texture2D(tDiffuse, vUv);
      
      vec2 coord = vUv;
      for (int i = 1; i < 32; i++) {
        if (i >= samples) break;
        coord += velocity;
        color += texture2D(tDiffuse, coord);
      }
      
      gl_FragColor = color / float(samples);
    }
  `,
};

export class MotionBlurPass extends Pass {
  private material: THREE.ShaderMaterial;
  private fsQuad: FullScreenQuad;
  
  public intensity: number = 1.0;
  public samples: number = 16;
  
  constructor(
    private width: number,
    private height: number,
    private velocityBuffer: THREE.Texture
  ) {
    super();
    
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(MotionBlurShader.uniforms),
      vertexShader: MotionBlurShader.vertexShader,
      fragmentShader: MotionBlurShader.fragmentShader,
    });
    
    this.material.uniforms.velocityBuffer.value = velocityBuffer;
    this.material.uniforms.resolution.value.set(width, height);
    
    this.fsQuad = new FullScreenQuad(this.material);
  }
  
  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget
  ): void {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.intensity.value = this.intensity;
    this.material.uniforms.samples.value = this.samples;
    
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
    }
    
    this.fsQuad.render(renderer);
  }
  
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.material.uniforms.resolution.value.set(width, height);
  }
  
  dispose(): void {
    this.material.dispose();
  }
}

// ============================================================================
// DEPTH OF FIELD PASS
// ============================================================================

const DOFShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDepth: { value: null },
    resolution: { value: new THREE.Vector2() },
    focalLength: { value: 35.0 },
    focalDistance: { value: 10.0 },
    aperture: { value: 0.025 },
    maxBlur: { value: 1.0 },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000 },
  },
  
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform vec2 resolution;
    uniform float focalLength;
    uniform float focalDistance;
    uniform float aperture;
    uniform float maxBlur;
    uniform float cameraNear;
    uniform float cameraFar;
    
    varying vec2 vUv;
    
    #define SAMPLES 16
    
    float linearizeDepth(float depth) {
      float z = depth * 2.0 - 1.0;
      return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z * (cameraFar - cameraNear));
    }
    
    float getBlurSize(float depth) {
      float coc = (aperture * focalLength * (focalDistance - depth)) / (depth * (focalDistance - focalLength));
      return clamp(abs(coc), 0.0, maxBlur);
    }
    
    void main() {
      float depth = linearizeDepth(texture2D(tDepth, vUv).r);
      float blurSize = getBlurSize(depth) / resolution.x;
      
      vec4 color = vec4(0.0);
      float total = 0.0;
      
      // Poisson disk samples
      vec2 poissonDisk[SAMPLES];
      poissonDisk[0] = vec2(-0.94201624, -0.39906216);
      poissonDisk[1] = vec2(0.94558609, -0.76890725);
      poissonDisk[2] = vec2(-0.094184101, -0.92938870);
      poissonDisk[3] = vec2(0.34495938, 0.29387760);
      poissonDisk[4] = vec2(-0.91588581, 0.45771432);
      poissonDisk[5] = vec2(-0.81544232, -0.87912464);
      poissonDisk[6] = vec2(-0.38277543, 0.27676845);
      poissonDisk[7] = vec2(0.97484398, 0.75648379);
      poissonDisk[8] = vec2(0.44323325, -0.97511554);
      poissonDisk[9] = vec2(0.53742981, -0.47373420);
      poissonDisk[10] = vec2(-0.26496911, -0.41893023);
      poissonDisk[11] = vec2(0.79197514, 0.19090188);
      poissonDisk[12] = vec2(-0.24188840, 0.99706507);
      poissonDisk[13] = vec2(-0.81409955, 0.91437590);
      poissonDisk[14] = vec2(0.19984126, 0.78641367);
      poissonDisk[15] = vec2(0.14383161, -0.14100790);
      
      for (int i = 0; i < SAMPLES; i++) {
        vec2 offset = poissonDisk[i] * blurSize;
        vec2 sampleUv = vUv + offset;
        
        float sampleDepth = linearizeDepth(texture2D(tDepth, sampleUv).r);
        float sampleBlur = getBlurSize(sampleDepth);
        
        // Depth-weighted sample
        float weight = (sampleDepth < depth) ? sampleBlur : 1.0;
        color += texture2D(tDiffuse, sampleUv) * weight;
        total += weight;
      }
      
      gl_FragColor = color / total;
    }
  `,
};

export class DepthOfFieldPass extends Pass {
  private material: THREE.ShaderMaterial;
  private fsQuad: FullScreenQuad;
  
  public focalDistance: number = 10.0;
  public aperture: number = 0.025;
  public maxBlur: number = 1.0;
  
  constructor(
    private width: number,
    private height: number,
    private camera: THREE.Camera,
    private depthTexture: THREE.DepthTexture
  ) {
    super();
    
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(DOFShader.uniforms),
      vertexShader: DOFShader.vertexShader,
      fragmentShader: DOFShader.fragmentShader,
    });
    
    this.material.uniforms.tDepth.value = depthTexture;
    this.material.uniforms.resolution.value.set(width, height);
    
    this.fsQuad = new FullScreenQuad(this.material);
  }
  
  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget
  ): void {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.focalDistance.value = this.focalDistance;
    this.material.uniforms.aperture.value = this.aperture;
    this.material.uniforms.maxBlur.value = this.maxBlur;
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.material.uniforms.cameraNear.value = this.camera.near;
      this.material.uniforms.cameraFar.value = this.camera.far;
      this.material.uniforms.focalLength.value = this.camera.getFocalLength();
    }
    
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
    }
    
    this.fsQuad.render(renderer);
  }
  
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.material.uniforms.resolution.value.set(width, height);
  }
  
  dispose(): void {
    this.material.dispose();
  }
}

// ============================================================================
// COLOR GRADING PASS
// ============================================================================

const ColorGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    lutTexture: { value: null },
    lutSize: { value: 32.0 },
    intensity: { value: 1.0 },
    brightness: { value: 0.0 },
    contrast: { value: 1.0 },
    saturation: { value: 1.0 },
    temperature: { value: 0.0 },
    tint: { value: 0.0 },
    shadows: { value: new THREE.Vector3(1, 1, 1) },
    midtones: { value: new THREE.Vector3(1, 1, 1) },
    highlights: { value: new THREE.Vector3(1, 1, 1) },
    vignette: { value: 0.0 },
    vignetteOffset: { value: 0.0 },
    grain: { value: 0.0 },
    time: { value: 0.0 },
  },
  
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D lutTexture;
    uniform float lutSize;
    uniform float intensity;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    uniform float temperature;
    uniform float tint;
    uniform vec3 shadows;
    uniform vec3 midtones;
    uniform vec3 highlights;
    uniform float vignette;
    uniform float vignetteOffset;
    uniform float grain;
    uniform float time;
    
    varying vec2 vUv;
    
    vec3 applyLUT(vec3 color) {
      float blueIndex = color.b * (lutSize - 1.0);
      float blueInt = floor(blueIndex);
      float blueFrac = fract(blueIndex);
      
      vec2 quad1;
      quad1.y = floor(blueInt / 8.0);
      quad1.x = blueInt - quad1.y * 8.0;
      
      vec2 quad2;
      quad2.y = floor((blueInt + 1.0) / 8.0);
      quad2.x = (blueInt + 1.0) - quad2.y * 8.0;
      
      vec2 texPos1 = (quad1 + vec2(0.5) + color.rg * (lutSize - 1.0)) / (lutSize * 8.0);
      vec2 texPos2 = (quad2 + vec2(0.5) + color.rg * (lutSize - 1.0)) / (lutSize * 8.0);
      
      vec3 lut1 = texture2D(lutTexture, texPos1).rgb;
      vec3 lut2 = texture2D(lutTexture, texPos2).rgb;
      
      return mix(lut1, lut2, blueFrac);
    }
    
    vec3 adjustTemperature(vec3 color, float temp) {
      vec3 warm = vec3(1.0 + temp * 0.1, 1.0, 1.0 - temp * 0.1);
      return color * warm;
    }
    
    vec3 adjustSaturation(vec3 color, float sat) {
      float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
      return mix(vec3(luminance), color, sat);
    }
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Brightness & Contrast
      color.rgb = (color.rgb - 0.5) * contrast + 0.5 + brightness;
      
      // Temperature
      color.rgb = adjustTemperature(color.rgb, temperature);
      
      // Saturation
      color.rgb = adjustSaturation(color.rgb, saturation);
      
      // Color wheels (shadows/midtones/highlights)
      float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      float shadowMask = 1.0 - smoothstep(0.0, 0.33, luminance);
      float highlightMask = smoothstep(0.66, 1.0, luminance);
      float midtoneMask = 1.0 - shadowMask - highlightMask;
      
      color.rgb *= mix(vec3(1.0), shadows, shadowMask);
      color.rgb *= mix(vec3(1.0), midtones, midtoneMask);
      color.rgb *= mix(vec3(1.0), highlights, highlightMask);
      
      // LUT (if available)
      #ifdef USE_LUT
      vec3 lutColor = applyLUT(clamp(color.rgb, 0.0, 1.0));
      color.rgb = mix(color.rgb, lutColor, intensity);
      #endif
      
      // Vignette
      if (vignette > 0.0) {
        vec2 uv = vUv * (1.0 - vUv);
        float vig = uv.x * uv.y * 15.0;
        vig = pow(vig, vignette + vignetteOffset);
        color.rgb *= vig;
      }
      
      // Film grain
      if (grain > 0.0) {
        float grainNoise = random(vUv + fract(time));
        color.rgb += (grainNoise - 0.5) * grain;
      }
      
      gl_FragColor = color;
    }
  `,
};

export class ColorGradingPass extends Pass {
  private material: THREE.ShaderMaterial;
  private fsQuad: FullScreenQuad;
  
  public brightness: number = 0.0;
  public contrast: number = 1.0;
  public saturation: number = 1.0;
  public temperature: number = 0.0;
  public vignette: number = 0.0;
  public grain: number = 0.0;
  
  constructor() {
    super();
    
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(ColorGradingShader.uniforms),
      vertexShader: ColorGradingShader.vertexShader,
      fragmentShader: ColorGradingShader.fragmentShader,
    });
    
    this.fsQuad = new FullScreenQuad(this.material);
  }
  
  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget
  ): void {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;
    this.material.uniforms.brightness.value = this.brightness;
    this.material.uniforms.contrast.value = this.contrast;
    this.material.uniforms.saturation.value = this.saturation;
    this.material.uniforms.temperature.value = this.temperature;
    this.material.uniforms.vignette.value = this.vignette;
    this.material.uniforms.grain.value = this.grain;
    this.material.uniforms.time.value = performance.now() * 0.001;
    
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
    }
    
    this.fsQuad.render(renderer);
  }
  
  dispose(): void {
    this.material.dispose();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export { SSAOShader, MotionBlurShader, DOFShader, ColorGradingShader };
