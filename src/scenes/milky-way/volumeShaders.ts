/** Adapted square-root decoding, dust tint and emission from OpenSpace's MIT
 * galaxyraycast.glsl. See public/models/milky-way/LICENSE-OpenSpace.md.
 * Orthographic rays, analytic box bounds and display mapping are this prototype's.
 */
export const volumeVertexShader = /* glsl */ `
  out vec3 localPosition;
  out vec3 viewPosition;
  void main() {
    localPosition = position;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    viewPosition = view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;

export const volumeFragmentShader = /* glsl */ `
  precision highp sampler3D;
  uniform sampler3D volume;
  uniform mat4 inverseModelView;
  uniform float cameraNear;
  uniform float stepSize;
  uniform vec3 volumeAspect;
  uniform float absorptionMultiply;
  uniform float emissionMultiply;
  in vec3 localPosition;
  in vec3 viewPosition;
  out vec4 fragmentColor;

  void main() {
    // Parallel rays start on the actual near plane, including panned/zoomed views.
    vec3 origin = (inverseModelView * vec4(viewPosition.xy, -cameraNear, 1.0)).xyz;
    vec3 dir = normalize(localPosition - origin);
    vec3 safeDir = vec3(
      abs(dir.x) < 1e-6 ? (dir.x < 0.0 ? -1e-6 : 1e-6) : dir.x,
      abs(dir.y) < 1e-6 ? (dir.y < 0.0 ? -1e-6 : 1e-6) : dir.y,
      abs(dir.z) < 1e-6 ? (dir.z < 0.0 ? -1e-6 : 1e-6) : dir.z);
    vec3 a = (-0.5 - origin) / safeDir;
    vec3 b = (0.5 - origin) / safeDir;
    vec3 lower = min(a, b);
    vec3 upper = max(a, b);
    float enter = max(0.0, max(lower.x, max(lower.y, lower.z)));
    float leave = min(upper.x, min(upper.y, upper.z));
    if (leave <= enter) discard;

    // Step length is in units of physical box width, not the thin-axis texel span.
    float metric = length(dir * volumeAspect);
    vec3 physicalDirection = dir * volumeAspect / metric;
    float originDistance = dot(origin * volumeAspect, physicalDirection);
    float nearDistance = originDistance + enter * metric;
    float farDistance = originDistance + leave * metric;
    // Fixed physical lattice centered on the galaxy. Changing the integer count
    // must never redistribute every sample along the ray.
    float lastCell = ceil(farDistance / stepSize) - 1.0;
    vec3 color = vec3(0.0);
    vec3 transmission = vec3(1.0);
    // Back-to-front emission/absorption, matching OpenSpace's accumulation order.
    for (int i = 0; i < MAX_VOLUME_STEPS; i++) {
      float cellHigh = (lastCell - float(i) + 1.0) * stepSize;
      float low = max(nearDistance, cellHigh - stepSize);
      float high = min(farDistance, cellHigh);
      if (high <= nearDistance) break;
      float ds = max(0.0, high - low);
      float t = (0.5 * (low + high) - originDistance) / metric;
      vec3 p = origin + dir * t + 0.5;
      vec2 radial = p.xy * 2.0 - 1.0;
      if (dot(radial, radial) > 0.7) continue;
      vec4 sampleValue = texture(volume, p);
      sampleValue *= sampleValue;
      float dust = pow(clamp(sampleValue.a, 0.0, 1.0), 0.7);
      vec3 opticalDepth = vec3(0.3, 0.54, 0.85) * dust * ds * absorptionMultiply;
      vec3 extinction = exp(-opticalDepth);
      // Integrate constant emission/absorption within each cell analytically.
      vec3 emissionWeight = (vec3(1.0) - extinction) / max(opticalDepth, vec3(1e-6));
      emissionWeight = mix(vec3(1.0), emissionWeight, step(vec3(1e-5), opticalDepth));
      color = color * extinction + sampleValue.rgb * ds * emissionMultiply * emissionWeight;
      transmission *= extinction;
    }
    // Emissive premultiplied layer; a dark dust-only ray can attenuate background.
    float alpha = 1.0 - min(transmission.r, min(transmission.g, transmission.b));
    vec3 displayColor = vec3(1.0) - exp(-color);
    alpha = max(alpha, max(displayColor.r, max(displayColor.g, displayColor.b)));
    if (alpha < 0.001) discard;
    fragmentColor = linearToOutputTexel(vec4(displayColor, alpha));
  }
`;
