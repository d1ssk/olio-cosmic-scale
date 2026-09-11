export const cosmicSlabVertexShader = /* glsl */ `
  varying vec3 localPosition;
  void main() {
    localPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function cosmicSlabFragmentShader(textureCoordinate: string): string {
  return /* glsl */ `
    precision highp sampler3D;
    uniform sampler3D densitySlab;
    uniform mat4 inverseModelView;
    uniform float clipMin;
    uniform float clipMax;
    uniform float layerOpacity;
    varying vec3 localPosition;

    void main() {
      vec3 origin = (inverseModelView * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
      vec3 direction = normalize(localPosition - origin);
      vec3 safeDirection = vec3(
        abs(direction.x) < 1e-6 ? (direction.x < 0.0 ? -1e-6 : 1e-6) : direction.x,
        abs(direction.y) < 1e-6 ? (direction.y < 0.0 ? -1e-6 : 1e-6) : direction.y,
        abs(direction.z) < 1e-6 ? (direction.z < 0.0 ? -1e-6 : 1e-6) : direction.z
      );
      vec3 a = (-0.5 - origin) / safeDirection;
      vec3 b = (0.5 - origin) / safeDirection;
      vec3 lower = min(a, b);
      vec3 upper = max(a, b);
      float enter = max(0.0, max(lower.x, max(lower.y, lower.z)));
      float leave = min(upper.x, min(upper.y, upper.z));
      if (leave <= enter || layerOpacity <= 0.001) discard;

      vec4 accumulated = vec4(0.0);
      float segment = leave - enter;
      float stepLength = segment / 96.0;
      float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
      for (int i = 0; i < 96; i++) {
        float distanceAlongRay = enter + (float(i) + jitter) * stepLength;
        vec3 p = origin + direction * distanceAlongRay + 0.5;
        float quantized = texture(densitySlab, ${textureCoordinate}).r;
        float logDensity = mix(clipMin, clipMax, quantized);
        float wall = smoothstep(-0.48, 0.18, logDensity);
        float filament = smoothstep(-0.12, 0.72, logDensity);
        float knot = smoothstep(0.62, 1.45, logDensity);
        vec3 color = mix(vec3(0.08, 0.20, 0.35), vec3(0.28, 0.82, 0.86), filament);
        color = mix(color, vec3(1.0, 0.73, 0.36), knot * 0.78);
        float opticalDepth = mix(0.012, 1.9, wall * mix(0.22, 1.0, filament));
        float alpha = 1.0 - exp(-opticalDepth * stepLength * layerOpacity);
        accumulated.rgb += (1.0 - accumulated.a) * color * alpha;
        accumulated.a += (1.0 - accumulated.a) * alpha;
        if (accumulated.a > 0.96) break;
      }
      if (accumulated.a < 0.003) discard;
      gl_FragColor = linearToOutputTexel(accumulated);
    }
  `;
}
