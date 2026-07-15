import * as THREE from 'three'

const STAR_COUNT = 2800
const CONSTELLATION_COUNT = 22
const STARS_PER_CONSTELLATION = 7

/** Hand-drawn 2D constellation silhouettes, normalized roughly -1..1 */
const SHAPE_PRESETS: number[][][] = [
  [
    [-1, 0.2],
    [-0.5, 0.7],
    [0, 0.95],
    [0.5, 0.7],
    [1, 0.2],
    [0.3, -0.1],
    [-0.3, -0.1],
  ],
  [
    [-1, 0.6],
    [-0.5, -0.5],
    [0, 0.55],
    [0.5, -0.5],
    [1, 0.45],
  ],
  [
    [0, 1],
    [-0.9, -0.7],
    [0.9, -0.7],
    [0, 1],
    [0, -0.1],
  ],
  [
    [0, 1],
    [0, -1],
    [-1, 0],
    [1, 0],
    [-0.45, 0.45],
    [0.45, -0.45],
  ],
  [
    [-1, 0.1],
    [-0.55, 0.35],
    [-0.1, 0.4],
    [0.35, 0.25],
    [0.55, -0.2],
    [0.85, -0.55],
    [1, -0.1],
  ],
  [
    [0.1, 0],
    [0.35, 0.25],
    [0.2, 0.55],
    [-0.15, 0.6],
    [-0.45, 0.3],
    [-0.35, -0.1],
    [0, -0.35],
    [0.45, -0.4],
  ],
]

/** Unique sky signatures tied to each project */
const PROJECT_CONSTELLATIONS = [
  {
    id: 'northbound',
    color: 0x3dd6c6,
    // Ridgeline / summit traverse
    shape: [
      [-1.1, -0.55],
      [-0.7, 0.1],
      [-0.35, -0.15],
      [0, 0.95],
      [0.35, 0.15],
      [0.65, 0.45],
      [1.1, -0.5],
    ] as number[][],
    centerTheta: 0.45,
    centerPhi: 1.15,
    radius: 26,
    scale: 7.5,
    tilt: 0.15,
  },
  {
    id: 'lumen',
    color: 0xf0c75e,
    // Museum lantern / diamond archive
    shape: [
      [0, 1.1],
      [0.7, 0.25],
      [0.55, -0.7],
      [0, -1.05],
      [-0.55, -0.7],
      [-0.7, 0.25],
      [0, 1.1],
      [0, -0.1],
      [0.7, 0.25],
      [-0.7, 0.25],
    ] as number[][],
    centerTheta: 2.4,
    centerPhi: 1.35,
    radius: 24,
    scale: 7.2,
    tilt: -0.35,
  },
  {
    id: 'signal',
    color: 0xff7a59,
    // Pulse / antenna bars (pairs of base→tip), plus baseline endpoints
    shape: [
      [-1, -0.8],
      [-1, 0.25],
      [-0.5, -0.8],
      [-0.5, 0.6],
      [0, -0.8],
      [0, 1.05],
      [0.5, -0.8],
      [0.5, 0.6],
      [1, -0.8],
      [1, 0.25],
    ] as number[][],
    centerTheta: 4.2,
    centerPhi: 1.05,
    radius: 27,
    scale: 6.8,
    tilt: 0.1,
  },
] as const

export type StarfieldApi = {
  setHighlight: (id: string | null) => void
  dispose: () => void
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pushSegment(
  out: number[],
  ax: number,
  ay: number,
  az: number,
  bx: number,
  by: number,
  bz: number,
) {
  out.push(ax, ay, az, bx, by, bz)
}

function createRidgeMesh(
  peaks: number[],
  color: number,
  opacity: number,
  width = 110,
  yBase = -14,
  renderOrder = 1,
) {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, yBase - 18)
  for (let i = 0; i < peaks.length; i++) {
    const x = -width / 2 + (i / (peaks.length - 1)) * width
    shape.lineTo(x, yBase + peaks[i])
  }
  shape.lineTo(width / 2, yBase - 18)
  shape.closePath()

  const geometry = new THREE.ShapeGeometry(shape)
  // Always transparent so these draw in the same pass as the sky, after
  // stars (via renderOrder). Opaque pass would let stars paint back on top.
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.renderOrder = renderOrder
  return mesh
}

function sampleTrailPath(sampleCount = 220) {
  // Control points with berm S-curves, rollers, and a mid-trail climb
  const controls: THREE.Vector3[] = []
  const steps = 28
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = -50 + t * 100
    const berm = Math.sin(t * Math.PI * 4.5) * 1.35
    const roller = Math.sin(t * Math.PI * 12) * 0.28
    const grade = Math.sin(t * Math.PI) * 2.1
    const bench = Math.max(0, Math.sin((t - 0.35) * Math.PI * 2)) * 0.55
    // Sit on the near foothill face, in front of the silhouettes
    const y = -8.2 + grade * 0.85 + berm * 0.5 + roller + bench
    const z = 5.5 + Math.sin(t * Math.PI * 3.2) * 1.2
    controls.push(new THREE.Vector3(x, y, z))
  }

  const curve = new THREE.CatmullRomCurve3(controls, false, 'catmullrom', 0.4)
  return curve.getPoints(sampleCount)
}

function createTrailRibbon(samples: THREE.Vector3[]) {
  const curve = new THREE.CatmullRomCurve3(samples, false, 'catmullrom', 0.35)

  const ghostGeom = new THREE.TubeGeometry(curve, 180, 0.08, 5, false)
  const ghostMat = new THREE.MeshBasicMaterial({
    color: 0x8a6a45,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    depthTest: false,
  })
  const ghost = new THREE.Mesh(ghostGeom, ghostMat)
  ghost.renderOrder = 5

  const activeGeom = new THREE.TubeGeometry(curve, 180, 0.12, 6, false)
  const activeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uProgress: { value: 0.08 },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uProgress;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        // TubeGeometry: uv.x = along path, uv.y = around tube
        float along = vUv.x;
        if (along > uProgress) discard;
        float head = smoothstep(uProgress - 0.1, uProgress, along);
        float body = 0.65 + 0.35 * smoothstep(0.0, 0.15, along);
        float pulse = 0.85 + 0.15 * sin(uTime * 5.0 + along * 40.0);
        vec3 dust = vec3(0.96, 0.8, 0.35);
        vec3 ember = vec3(1.0, 0.55, 0.32);
        vec3 color = mix(dust, ember, head);
        float alpha = (0.55 + head * 0.45) * body * pulse;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  })
  const active = new THREE.Mesh(activeGeom, activeMat)
  active.renderOrder = 6

  const tipGeom = new THREE.BufferGeometry()
  tipGeom.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([samples[0].x, samples[0].y, samples[0].z], 3),
  )
  const tipMat = new THREE.PointsMaterial({
    color: 0xfff1c9,
    size: 1.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  })
  const tip = new THREE.Points(tipGeom, tipMat)
  tip.renderOrder = 7

  const group = new THREE.Group()
  group.add(ghost, active, tip)

  return {
    group,
    setProgress(next: number, time: number) {
      const progress = THREE.MathUtils.clamp(next, 0, 1)
      activeMat.uniforms.uProgress.value = progress
      activeMat.uniforms.uTime.value = time

      const tipPoint = curve.getPoint(progress)
      const tipPos = tipGeom.attributes.position as THREE.BufferAttribute
      tipPos.setXYZ(0, tipPoint.x, tipPoint.y, tipPoint.z)
      tipPos.needsUpdate = true

      const pulse = 0.75 + Math.sin(time * 4.5) * 0.25
      tipMat.size = 0.55 + progress * 0.55 * pulse
      tipMat.opacity = 0.6 + progress * 0.35
      ghostMat.opacity = 0.18 + (1 - progress) * 0.2
    },
    dispose() {
      ghostGeom.dispose()
      ghostMat.dispose()
      activeGeom.dispose()
      activeMat.dispose()
      tipGeom.dispose()
      tipMat.dispose()
    },
  }
}

function createMountainRange() {
  const group = new THREE.Group()

  // Far alpine silhouette
  const far = createRidgeMesh(
    [2, 4, 3, 7, 5, 9, 6, 8, 4, 6, 3, 2],
    0x0a1520,
    0.9,
    130,
    -13,
    1,
  )
  far.position.z = -18

  // Mid range with a sharper summit
  const mid = createRidgeMesh(
    [1.5, 3, 6, 4, 10, 7, 5, 8, 3.5, 5, 2],
    0x070d14,
    0.95,
    120,
    -12.5,
    2,
  )
  mid.position.z = -8

  // Near foothills / trail edge
  const near = createRidgeMesh(
    [0.8, 2.2, 1.4, 3.8, 2.5, 4.5, 2, 3.2, 1.2, 2.4, 0.6],
    0x04070b,
    1,
    115,
    -12,
    3,
  )
  near.position.z = 2

  // Faint snow-lit ridge edge on the mid peaks
  const edgePoints: number[] = []
  const edgePeaks = [1.5, 3, 6, 4, 10, 7, 5, 8, 3.5, 5, 2]
  const width = 120
  const yBase = -12.5
  for (let i = 0; i < edgePeaks.length; i++) {
    const x = -width / 2 + (i / (edgePeaks.length - 1)) * width
    edgePoints.push(x, yBase + edgePeaks[i] + 0.08, -7.9)
  }
  const edgeGeom = new THREE.BufferGeometry()
  edgeGeom.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(edgePoints, 3),
  )
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x7a9bb0,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  })
  const edge = new THREE.Line(edgeGeom, edgeMat)
  edge.renderOrder = 4

  const trailSamples = sampleTrailPath(240)
  const trail = createTrailRibbon(trailSamples)

  group.add(far, mid, near, edge, trail.group)

  return {
    group,
    trail,
    dispose() {
      trail.dispose()
      for (const child of group.children) {
        if (child === trail.group) continue
        const obj = child as THREE.Mesh | THREE.Line
        obj.geometry.dispose()
        ;(obj.material as THREE.Material).dispose()
      }
    },
  }
}

function shapeToWorld(
  shape: number[][],
  centerTheta: number,
  centerPhi: number,
  radius: number,
  scale: number,
  tilt: number,
) {
  const cosT = Math.cos(centerTheta)
  const sinT = Math.sin(centerTheta)
  const cosP = Math.cos(centerPhi)
  const sinP = Math.sin(centerPhi)

  const ox = radius * sinP * cosT
  const oy = radius * sinP * sinT
  const oz = radius * cosP - 10

  const tx = -sinT
  const ty = cosT
  const tz = 0
  const bx = cosP * cosT
  const by = cosP * sinT
  const bz = -sinP

  return shape.map(([x, y]) => {
    const localX = x * scale
    const localY = y * scale * Math.cos(tilt) - 0.15 * scale
    const localZ = y * scale * Math.sin(tilt)

    return new THREE.Vector3(
      ox + localX * tx + localY * bx,
      oy + localX * ty + localY * by,
      oz + localX * tz + localY * bz + localZ * 0.15,
    )
  })
}

type FeatureConstellation = {
  id: string
  lines: THREE.LineSegments
  points: THREE.Points
  lineMaterial: THREE.LineBasicMaterial
  pointMaterial: THREE.PointsMaterial
  center: THREE.Vector3
  vertexCount: number
  target: number
  amount: number
  draw: number
}

export function createStarfield(container: HTMLElement): StarfieldApi {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200,
  )
  camera.position.z = 28

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x02060c, 1)
  container.appendChild(renderer.domElement)

  const root = new THREE.Group()
  scene.add(root)

  const mountains = createMountainRange()
  scene.add(mountains.group)

  const rand = seededRandom(42)
  const positions = new Float32Array(STAR_COUNT * 3)
  const sizes = new Float32Array(STAR_COUNT)
  const phases = new Float32Array(STAR_COUNT)

  for (let i = 0; i < STAR_COUNT; i++) {
    const i3 = i * 3
    const radius = 6 + rand() * 60
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(2 * rand() - 1)

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi) - 10

    sizes[i] = 0.45 + rand() * 2.6
    phases[i] = rand() * Math.PI * 2
  }

  const starGeometry = new THREE.BufferGeometry()
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

  const starMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uDim: { value: 1 },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uDim;
      varying float vAlpha;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase);
        vAlpha = twinkle * uDim;
        gl_PointSize = aSize * uPixelRatio * (180.0 / -mvPosition.z) * mix(0.85, 1.0, uDim);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float glow = smoothstep(0.5, 0.0, d);
        float core = smoothstep(0.18, 0.0, d);
        float alpha = (glow * 0.55 + core * 0.9) * vAlpha;
        vec3 color = mix(vec3(0.72, 0.86, 1.0), vec3(1.0, 0.96, 0.88), core);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  })

  const stars = new THREE.Points(starGeometry, starMaterial)
  stars.renderOrder = 0
  root.add(stars)

  const linePositions: number[] = []
  const used = new Set<number>()

  for (let s = 0; s < SHAPE_PRESETS.length; s++) {
    const shape = SHAPE_PRESETS[s]
    const centerTheta = rand() * Math.PI * 2
    const centerPhi = 0.55 + rand() * 1.9
    const radius = 18 + rand() * 22
    const scale = 3.2 + rand() * 4.5
    const tilt = (rand() - 0.5) * 1.2

    const worldPts = shapeToWorld(shape, centerTheta, centerPhi, radius, scale, tilt)

    for (let i = 0; i < worldPts.length - 1; i++) {
      const a = worldPts[i]
      const b = worldPts[i + 1]
      pushSegment(linePositions, a.x, a.y, a.z, b.x, b.y, b.z)
    }

    for (const pt of worldPts) {
      let best = -1
      let bestDist = Infinity
      for (let i = 0; i < STAR_COUNT; i++) {
        const dx = positions[i * 3] - pt.x
        const dy = positions[i * 3 + 1] - pt.y
        const dz = positions[i * 3 + 2] - pt.z
        const dist = dx * dx + dy * dy + dz * dz
        if (dist < bestDist) {
          bestDist = dist
          best = i
        }
      }
      if (best >= 0) {
        sizes[best] = Math.max(sizes[best], 2.8 + rand() * 1.4)
        used.add(best)
      }
    }
  }

  for (let c = 0; c < CONSTELLATION_COUNT; c++) {
    let anchor = Math.floor(rand() * STAR_COUNT)
    let attempts = 0
    while (used.has(anchor) && attempts < 50) {
      anchor = Math.floor(rand() * STAR_COUNT)
      attempts++
    }

    const cluster: number[] = [anchor]
    used.add(anchor)

    const ax = positions[anchor * 3]
    const ay = positions[anchor * 3 + 1]
    const az = positions[anchor * 3 + 2]

    const neighbors: { index: number; dist: number }[] = []
    for (let i = 0; i < STAR_COUNT; i++) {
      if (used.has(i)) continue
      const dx = positions[i * 3] - ax
      const dy = positions[i * 3 + 1] - ay
      const dz = positions[i * 3 + 2] - az
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < 16) neighbors.push({ index: i, dist })
    }

    neighbors.sort((a, b) => a.dist - b.dist)
    for (let n = 0; n < Math.min(STARS_PER_CONSTELLATION - 1, neighbors.length); n++) {
      cluster.push(neighbors[n].index)
      used.add(neighbors[n].index)
    }

    for (let i = 0; i < cluster.length - 1; i++) {
      const a = cluster[i]
      const b = cluster[i + 1]
      pushSegment(
        linePositions,
        positions[a * 3],
        positions[a * 3 + 1],
        positions[a * 3 + 2],
        positions[b * 3],
        positions[b * 3 + 1],
        positions[b * 3 + 2],
      )
    }

    if (cluster.length >= 4 && rand() > 0.35) {
      const a = cluster[1]
      const b = cluster[cluster.length - 1]
      pushSegment(
        linePositions,
        positions[a * 3],
        positions[a * 3 + 1],
        positions[a * 3 + 2],
        positions[b * 3],
        positions[b * 3 + 1],
        positions[b * 3 + 2],
      )
    }
  }

  starGeometry.attributes.aSize.needsUpdate = true

  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(linePositions, 3),
  )

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x8eb8d8,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
  })

  const constellations = new THREE.LineSegments(lineGeometry, lineMaterial)
  constellations.renderOrder = 0
  root.add(constellations)

  const features: FeatureConstellation[] = PROJECT_CONSTELLATIONS.map((spec) => {
    const worldPts = shapeToWorld(
      spec.shape,
      spec.centerTheta,
      spec.centerPhi,
      spec.radius,
      spec.scale,
      spec.tilt,
    )

    const finalLinePos: number[] = []
    if (spec.id === 'signal') {
      for (let i = 0; i < worldPts.length - 1; i += 2) {
        const a = worldPts[i]
        const b = worldPts[i + 1]
        pushSegment(finalLinePos, a.x, a.y, a.z, b.x, b.y, b.z)
      }
      const first = worldPts[0]
      const last = worldPts[worldPts.length - 2]
      pushSegment(finalLinePos, first.x, first.y, first.z, last.x, last.y, last.z)
    } else {
      for (let i = 0; i < worldPts.length - 1; i++) {
        const a = worldPts[i]
        const b = worldPts[i + 1]
        pushSegment(finalLinePos, a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }

    const featLineGeom = new THREE.BufferGeometry()
    featLineGeom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(finalLinePos, 3),
    )
    const vertexCount = finalLinePos.length / 3
    featLineGeom.setDrawRange(0, 0)

    const featLineMat = new THREE.LineBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    })

    const featLines = new THREE.LineSegments(featLineGeom, featLineMat)
    featLines.renderOrder = 0
    root.add(featLines)

    const pointPos = new Float32Array(worldPts.length * 3)
    worldPts.forEach((p, i) => {
      pointPos[i * 3] = p.x
      pointPos[i * 3 + 1] = p.y
      pointPos[i * 3 + 2] = p.z
    })
    const pointGeom = new THREE.BufferGeometry()
    pointGeom.setAttribute('position', new THREE.BufferAttribute(pointPos, 3))

    const pointMat = new THREE.PointsMaterial({
      color: spec.color,
      size: 0.55,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    })
    const featPoints = new THREE.Points(pointGeom, pointMat)
    featPoints.renderOrder = 0
    root.add(featPoints)

    const center = worldPts
      .reduce((acc, p) => acc.add(p), new THREE.Vector3())
      .multiplyScalar(1 / worldPts.length)

    return {
      id: spec.id,
      lines: featLines,
      points: featPoints,
      lineMaterial: featLineMat,
      pointMaterial: pointMat,
      center,
      vertexCount,
      target: 0,
      amount: 0,
      draw: 0,
    }
  })

  let targetScroll = 0
  let smoothScroll = 0
  let pointerX = 0
  let pointerY = 0
  let smoothPointerX = 0
  let smoothPointerY = 0
  let highlightMix = 0
  let trailProgress = 0.18
  let raf = 0
  const clock = new THREE.Clock()
  const lookTarget = new THREE.Vector3(0, 0, -8)
  const desiredLook = new THREE.Vector3(0, 0, -8)
  const featureWorld = new THREE.Vector3()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onScroll = () => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    )
    targetScroll = window.scrollY / maxScroll
  }

  const onPointerMove = (event: PointerEvent) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1
    pointerY = (event.clientY / window.innerHeight) * 2 - 1
  }

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    starMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
  }

  const animate = () => {
    raf = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()
    smoothScroll += (targetScroll - smoothScroll) * 0.06
    smoothPointerX += (pointerX - smoothPointerX) * 0.045
    smoothPointerY += (pointerY - smoothPointerY) * 0.045

    let maxAmount = 0
    let activeFeature: FeatureConstellation | null = null
    desiredLook.set(smoothPointerX * 0.8, -smoothPointerY * 0.5, -8)

    for (const feature of features) {
      feature.amount += (feature.target - feature.amount) * 0.08
      const drawTarget = feature.target > 0.5 ? 1 : 0
      feature.draw += (drawTarget - feature.draw) * (reducedMotion ? 1 : 0.06)

      const drawnVerts =
        Math.floor(feature.draw * (feature.vertexCount / 2)) * 2
      feature.lines.geometry.setDrawRange(0, Math.max(0, drawnVerts))

      feature.lineMaterial.opacity = feature.amount * 0.95
      feature.pointMaterial.opacity = feature.amount * 0.95
      feature.pointMaterial.size = 0.35 + feature.amount * 0.55
      feature.lines.visible = feature.amount > 0.01
      feature.points.visible = feature.amount > 0.01

      if (feature.amount > maxAmount) {
        maxAmount = feature.amount
        activeFeature = feature
      }
    }

    if (activeFeature) {
      featureWorld.copy(activeFeature.center)
      root.localToWorld(featureWorld)
      desiredLook.lerp(featureWorld, activeFeature.amount * 0.55)
    }

    highlightMix += (maxAmount - highlightMix) * 0.08

    starMaterial.uniforms.uTime.value = reducedMotion ? 0 : t
    starMaterial.uniforms.uDim.value = 1 - highlightMix * 0.35

    const idleY = reducedMotion ? 0 : t * 0.018
    const idleX = reducedMotion ? 0 : Math.sin(t * 0.15) * 0.04
    const highlightDrift = highlightMix * 0.12

    root.rotation.y =
      smoothScroll * Math.PI * 1.35 + idleY + smoothPointerX * 0.22 + highlightDrift
    root.rotation.x =
      smoothScroll * 0.55 + idleX - smoothPointerY * 0.18 - highlightMix * 0.08
    root.rotation.z = Math.sin(smoothScroll * Math.PI) * 0.12 + smoothPointerX * 0.04

    camera.position.x =
      Math.sin(smoothScroll * Math.PI * 2) * 2.5 + smoothPointerX * 1.6
    camera.position.y =
      Math.cos(smoothScroll * Math.PI) * 1.8 - smoothPointerY * 1.2
    camera.position.z = 28 - smoothScroll * 10 - highlightMix * 2.5

    lookTarget.lerp(desiredLook, 0.05)
    camera.lookAt(lookTarget)

    // Keep ridgelines as a grounded horizon with gentle outdoor parallax
    mountains.group.position.x = smoothPointerX * -2.4 + Math.sin(smoothScroll * Math.PI) * 1.8
    mountains.group.position.y =
      -0.6 - smoothPointerY * 0.35 - smoothScroll * 1.8 - highlightMix * 0.4
    mountains.group.position.z = smoothScroll * 2.5

    // Trail draws as you scroll and ride the cursor across the ridgeline
    const pointerRide = smoothPointerX * 0.5 + 0.5
    const trailTarget = THREE.MathUtils.clamp(
      0.16 + smoothScroll * 0.72 + pointerRide * 0.24,
      0.16,
      1,
    )
    trailProgress += (trailTarget - trailProgress) * (reducedMotion ? 1 : 0.055)
    mountains.trail.setProgress(trailProgress, t)

    lineMaterial.opacity =
      (0.16 + Math.sin(t * 0.7) * 0.05 + smoothScroll * 0.1) *
      (1 - highlightMix * 0.7)

    renderer.render(scene, camera)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('resize', onResize)
  onScroll()
  animate()

  return {
    setHighlight(id: string | null) {
      for (const feature of features) {
        feature.target = feature.id === id ? 1 : 0
        if (feature.id === id && feature.amount < 0.05) {
          feature.draw = reducedMotion ? 1 : 0
        }
      }
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      starGeometry.dispose()
      starMaterial.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      for (const feature of features) {
        feature.lines.geometry.dispose()
        feature.lineMaterial.dispose()
        feature.points.geometry.dispose()
        feature.pointMaterial.dispose()
      }
      mountains.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    },
  }
}
