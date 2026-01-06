// "use client"

// import { useRef, useState, useEffect, Suspense, useMemo } from "react"
// import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber"
// import { OrbitControls, Html, useProgress } from "@react-three/drei"
// import { TextureLoader, Vector3 } from "three"
// import { Card } from "@/components/ui/card"

// interface FlightPathData {
//   id: string
//   start: { lat: number; long: number; name: string }
//   end: { lat: number; long: number; name: string }
//   timestamp: number
//   progress?: number
//   color?: string
// }

// const CITIES = [
//   { name: "Tokyo", lat: 35.6762, long: 139.6503 },
//   { name: "Delhi", lat: 28.7041, long: 77.1025 },
//   { name: "Shanghai", lat: 31.2304, long: 121.4737 },
//   { name: "São Paulo", lat: -23.5505, long: -46.6333 },
//   { name: "Mexico City", lat: 19.4326, long: -99.1332 },
//   { name: "Cairo", lat: 30.0444, long: 31.2357 },
//   { name: "Mumbai", lat: 19.076, long: 72.8777 },
//   { name: "Beijing", lat: 39.9042, long: 116.4074 },
//   { name: "Dhaka", lat: 23.8103, long: 90.4125 },
//   { name: "Osaka", lat: 34.6937, long: 135.5023 },
//   { name: "New York", lat: 40.7128, long: -74.006 },
//   { name: "Karachi", lat: 24.8607, long: 67.0011 },
//   { name: "Buenos Aires", lat: -34.6037, long: -58.3816 },
//   { name: "Istanbul", lat: 41.0082, long: 28.9784 },
//   { name: "Kolkata", lat: 22.5726, long: 88.3639 },
//   { name: "Manila", lat: 14.5995, long: 120.9842 },
//   { name: "Lagos", lat: 6.5244, long: 3.3792 },
//   { name: "Rio de Janeiro", lat: -22.9068, long: -43.1729 },
//   { name: "Tianjin", lat: 39.3434, long: 117.3616 },
//   { name: "Kinshasa", lat: -4.4419, long: 15.2663 },
//   { name: "Guangzhou", lat: 23.1291, long: 113.2644 },
//   { name: "Los Angeles", lat: 34.0522, long: -118.2437 },
//   { name: "Moscow", lat: 55.7558, long: 37.6173 },
//   { name: "Shenzhen", lat: 22.5431, long: 114.0579 },
//   { name: "Lahore", lat: 31.5497, long: 74.3436 },
//   { name: "Bangalore", lat: 12.9716, long: 77.5946 },
//   { name: "Paris", lat: 48.8566, long: 2.3522 },
//   { name: "Bogotá", lat: 4.711, long: -74.0721 },
//   { name: "Jakarta", lat: -6.2088, long: 106.8456 },
//   { name: "Chennai", lat: 13.0827, long: 80.2707 },
//   { name: "Lima", lat: -12.0464, long: -77.0428 },
//   { name: "Bangkok", lat: 13.7563, long: 100.5018 },
//   { name: "Seoul", lat: 37.5665, long: 126.978 },
//   { name: "Nagoya", lat: 35.1815, long: 136.9066 },
//   { name: "Hyderabad", lat: 17.385, long: 78.4867 },
//   { name: "London", lat: 51.5074, long: -0.1278 },
//   { name: "Tehran", lat: 35.6892, long: 51.389 },
//   { name: "Chicago", lat: 41.8781, long: -87.6298 },
//   { name: "Chengdu", lat: 30.5728, long: 104.0668 },
//   { name: "Nanjing", lat: 32.0603, long: 118.7969 },
//   { name: "Wuhan", lat: 30.5928, long: 114.3055 },
//   { name: "Ho Chi Minh City", lat: 10.8231, long: 106.6297 },
//   { name: "Luanda", lat: -8.8383, long: 13.2344 },
//   { name: "Ahmedabad", lat: 23.0225, long: 72.5714 },
//   { name: "Kuala Lumpur", lat: 3.139, long: 101.6869 },
//   { name: "Xi'an", lat: 34.3416, long: 108.9398 },
//   { name: "Hong Kong", lat: 22.3193, long: 114.1694 },
//   { name: "Dongguan", lat: 23.0209, long: 113.7518 },
//   { name: "Hangzhou", lat: 30.2741, long: 120.1551 },
//   { name: "Foshan", lat: 23.0218, long: 113.1219 },
//   { name: "Shenyang", lat: 41.8057, long: 123.4328 },
//   { name: "Riyadh", lat: 24.7136, long: 46.6753 },
//   { name: "Baghdad", lat: 33.3152, long: 44.3661 },
//   { name: "Santiago", lat: -33.4489, long: -70.6693 },
//   { name: "Surat", lat: 21.1702, long: 72.8311 },
//   { name: "Madrid", lat: 40.4168, long: -3.7038 },
//   { name: "Suzhou", lat: 31.2989, long: 120.5853 },
//   { name: "Pune", lat: 18.5204, long: 73.8567 },
//   { name: "Harbin", lat: 45.8038, long: 126.535 },
//   { name: "Houston", lat: 29.7604, long: -95.3698 },
//   { name: "Dallas", lat: 32.7767, long: -96.797 },
//   { name: "Toronto", lat: 43.6532, long: -79.3832 },
//   { name: "Dar es Salaam", lat: -6.7924, long: 39.2083 },
//   { name: "Miami", lat: 25.7617, long: -80.1918 },
//   { name: "Belo Horizonte", lat: -19.9167, long: -43.9345 },
//   { name: "Singapore", lat: 1.3521, long: 103.8198 },
//   { name: "Philadelphia", lat: 39.9526, long: -75.1652 },
//   { name: "Atlanta", lat: 33.749, long: -84.388 },
//   { name: "Fukuoka", lat: 33.5904, long: 130.4017 },
//   { name: "Khartoum", lat: 15.5007, long: 32.5599 },
//   { name: "Barcelona", lat: 41.3851, long: 2.1734 },
//   { name: "Johannesburg", lat: -26.2041, long: 28.0473 },
//   { name: "Saint Petersburg", lat: 59.9311, long: 30.3609 },
//   { name: "Qingdao", lat: 36.0671, long: 120.3826 },
//   { name: "Dalian", lat: 38.914, long: 121.6147 },
//   { name: "Washington", lat: 38.9072, long: -77.0369 },
//   { name: "Yangon", lat: 16.8661, long: 96.1951 },
//   { name: "Alexandria", lat: 31.2001, long: 29.9187 },
//   { name: "Jinan", lat: 36.6512, long: 117.1201 },
//   { name: "Guadalajara", lat: 20.6597, long: -103.3496 },
//   { name: "Tel Aviv", lat: 32.0853, long: 34.7818 },
//   { name: "Sydney", lat: -33.8688, long: 151.2093 },
//   { name: "Melbourne", lat: -37.8136, long: 144.9631 },
//   { name: "Cape Town", lat: -33.9249, long: 18.4241 },
//   { name: "Berlin", lat: 52.52, long: 13.405 },
//   { name: "Rome", lat: 41.9028, long: 12.4964 },
//   { name: "Athens", lat: 37.9838, long: 23.7275 },
//   { name: "Vienna", lat: 48.2082, long: 16.3738 },
//   { name: "Dubai", lat: 25.2048, long: 55.2708 },
// ]

// function getRandomCity(): { name: string; lat: number; long: number } {
//   return CITIES[Math.floor(Math.random() * CITIES.length)]
// }

// function Loader() {
//   const { progress } = useProgress()
//   return (
//     <Html center>
//       <div className="flex flex-col items-center space-y-4">
//         <div className="w-32 h-32 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-white text-lg font-medium">Loading Earth... {Math.round(progress)}%</p>
//       </div>
//     </Html>
//   )
// }

// function FuturisticBackground() {
//   return null
// }

// function latLongToVector3(lat: number, long: number, radius = 1): Vector3 {
//   const phi = (90 - lat) * (Math.PI / 180)
//   const theta = (long + 180) * (Math.PI / 180)

//   const x = -(radius * Math.sin(phi) * Math.cos(theta))
//   const z = radius * Math.sin(phi) * Math.sin(theta)
//   const y = radius * Math.cos(phi)

//   return new Vector3(x, y, z)
// }

// function isPointVisibleFromCamera(pointPosition: Vector3, cameraPosition: Vector3): boolean {
//   const normal = pointPosition.clone().normalize()
//   const toCamera = new Vector3().subVectors(cameraPosition, pointPosition).normalize()
//   const dotProduct = normal.dot(toCamera)
//   return dotProduct > -0.15
// }

// function LocationMarker({
//   lat,
//   long,
//   visible,
//   color = "#ffffff",
//   timestamp,
// }: { lat: number; long: number; visible: boolean; color?: string; timestamp: number }) {
//   const [scale, setScale] = useState(1)
//   const [fadeOpacity, setFadeOpacity] = useState(1)
//   const position = useMemo(() => latLongToVector3(lat, long, 1.01), [lat, long])
//   const { camera } = useThree()

//   const pulseStateRef = useRef({ currentScale: 1, growing: true })
//   const ageRef = useRef(0)

//   const isVisibleFromCamera = useMemo(() => {
//     return isPointVisibleFromCamera(position, camera.position)
//   }, [position, camera])

//   const glowIntensity = useMemo(() => {
//     const cameraDirection = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
//     const toMarker = position.clone().sub(camera.position).normalize()
//     const centeredness = cameraDirection.dot(toMarker)
//     const intensity = Math.max(0, Math.min(1, (centeredness - 0.5) / 0.5))
//     return Math.pow(intensity, 2)
//   }, [position, camera])

//   useFrame((state, delta) => {
//     if (!visible) return

//     // Calculate age
//     ageRef.current = Date.now() - timestamp

//     // Update fade opacity based on age
//     const fadeStartTime = 3500
//     const fadeDuration = 1500
//     if (ageRef.current > fadeStartTime) {
//       const fadeProgress = Math.min(1, (ageRef.current - fadeStartTime) / fadeDuration)
//       const easedProgress = 1 - Math.pow(1 - fadeProgress, 3)
//       setFadeOpacity(1 - easedProgress)
//     } else {
//       setFadeOpacity(1)
//     }

//     // Update pulse animation
//     const pulseSpeed = ageRef.current > 3000 ? 0.025 : 0.015
//     const pulseRange = ageRef.current > 3000 ? 1.6 : 1.4

//     if (pulseStateRef.current.growing) {
//       pulseStateRef.current.currentScale += pulseSpeed
//       if (pulseStateRef.current.currentScale >= pulseRange) {
//         pulseStateRef.current.growing = false
//       }
//     } else {
//       pulseStateRef.current.currentScale -= pulseSpeed
//       if (pulseStateRef.current.currentScale <= 1) {
//         pulseStateRef.current.growing = true
//       }
//     }

//     setScale(pulseStateRef.current.currentScale)
//   })

//   if (!visible || !isVisibleFromCamera || fadeOpacity <= 0.01) return null

//   const uniformOpacity = 0.85 * glowIntensity * fadeOpacity

//   return (
//     <>
//       <mesh position={[position.x, position.y, position.z]} scale={scale * 1.15}>
//         <sphereGeometry args={[0.008, 16, 16]} />
//         <meshBasicMaterial color="#b0b0b0" transparent opacity={fadeOpacity * 0.8} toneMapped={false} />
//       </mesh>

//       <mesh position={[position.x, position.y, position.z]}>
//         <sphereGeometry args={[0.006, 16, 16]} />
//         <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={fadeOpacity} />
//       </mesh>

//       <mesh position={[position.x, position.y, position.z]} scale={scale}>
//         <sphereGeometry args={[0.008, 16, 16]} />
//         <meshBasicMaterial color="#ffffff" transparent opacity={uniformOpacity} toneMapped={false} />
//       </mesh>

//       {glowIntensity > 0.5 && (
//         <mesh position={[position.x, position.y, position.z]} scale={scale * 1.2}>
//           <sphereGeometry args={[0.008, 16, 16]} />
//           <meshBasicMaterial color="#c0c0c0" transparent opacity={uniformOpacity * 0.5} toneMapped={false} />
//         </mesh>
//       )}
//     </>
//   )
// }

// function validateCoordinates(lat: number, long: number): boolean {
//   return lat >= -90 && lat <= 90 && long >= -180 && long <= 180
// }

// function FlightPath({
//   startLat,
//   startLong,
//   endLat,
//   endLong,
//   visible,
//   onProgressUpdate,
//   pathId,
//   color = "#ff0080",
//   timestamp,
// }: {
//   startLat: number
//   startLong: number
//   endLat: number
//   endLong: number
//   visible: boolean
//   onProgressUpdate?: (id: string, progress: number) => void
//   pathId: string
//   color?: string
//   timestamp: number
// }) {
//   const [progress, setProgress] = useState(0)
//   const [opacity, setOpacity] = useState(1)
//   const lineRef = useRef<any>()
//   const glowLineRef = useRef<any>()
//   const borderLineRef = useRef<any>()

//   const progressRef = useRef(0)
//   const ageRef = useRef(0)

//   const isValid = validateCoordinates(startLat, startLong) && validateCoordinates(endLat, endLong)

//   useEffect(() => {
//     if (!visible) {
//       progressRef.current = 0
//       setProgress(0)
//       setOpacity(1)
//       onProgressUpdate?.(pathId, 0)
//     }
//   }, [visible, pathId, onProgressUpdate])

//   useFrame((state, delta) => {
//     if (!visible) return

//     // Calculate age
//     ageRef.current = Date.now() - timestamp

//     // Update progress
//     if (progressRef.current < 1) {
//       progressRef.current += 0.015
//       if (progressRef.current > 1) progressRef.current = 1
//       setProgress(progressRef.current)
//       onProgressUpdate?.(pathId, progressRef.current)
//     }

//     // Update fade opacity based on age
//     const fadeStartTime = 3500
//     const fadeDuration = 1500
//     if (ageRef.current > fadeStartTime) {
//       const fadeProgress = Math.min(1, (ageRef.current - fadeStartTime) / fadeDuration)
//       const easedProgress = 1 - Math.pow(1 - fadeProgress, 3)
//       setOpacity(1 - easedProgress)
//     } else if (progressRef.current >= 1.0) {
//       setOpacity(1)
//     }
//   })

//   const pathPoints = useMemo(() => {
//     if (!isValid) return []

//     const startPos = latLongToVector3(startLat, startLong, 1.02)
//     const endPos = latLongToVector3(endLat, endLong, 1.02)

//     const distance = startPos.distanceTo(endPos)
//     const arcHeight = Math.min(0.15, distance * 0.08)

//     const points: Vector3[] = []
//     const numPoints = 80

//     for (let i = 0; i <= numPoints; i++) {
//       const t = i / numPoints

//       // Spherical linear interpolation (slerp) for smooth curves on sphere surface
//       const angle = startPos.angleTo(endPos)
//       const sinAngle = Math.sin(angle)

//       let interpolated: Vector3

//       if (sinAngle < 0.001) {
//         // Points are very close, use linear interpolation
//         interpolated = new Vector3().lerpVectors(startPos, endPos, t)
//       } else {
//         // Use slerp for smooth spherical interpolation
//         const a = Math.sin((1 - t) * angle) / sinAngle
//         const b = Math.sin(t * angle) / sinAngle
//         interpolated = new Vector3(
//           startPos.x * a + endPos.x * b,
//           startPos.y * a + endPos.y * b,
//           startPos.z * a + endPos.z * b,
//         )
//       }

//       // Parabolic elevation: peaks at t=0.5, zero at t=0 and t=1
//       const elevation = 4 * t * (1 - t) * arcHeight

//       // Normalize to sphere surface and apply elevation
//       const elevated = interpolated.normalize().multiplyScalar(1.02 + elevation)

//       points.push(elevated)
//     }

//     return points
//   }, [startLat, startLong, endLat, endLong, isValid])

//   const visiblePoints = useMemo(() => {
//     if (!visible || pathPoints.length < 2) return []
//     const numPoints = Math.max(2, Math.floor(pathPoints.length * progress))
//     const points = pathPoints.slice(0, numPoints)
//     return points.length >= 2 ? points : []
//   }, [pathPoints, progress, visible])

//   useEffect(() => {
//     if (lineRef.current && visiblePoints.length >= 2) {
//       lineRef.current.geometry.setFromPoints(visiblePoints)
//       lineRef.current.geometry.computeBoundingSphere()
//     }
//     if (glowLineRef.current && visiblePoints.length >= 2) {
//       glowLineRef.current.geometry.setFromPoints(visiblePoints)
//       glowLineRef.current.geometry.computeBoundingSphere()
//     }
//     if (borderLineRef.current && visiblePoints.length >= 2) {
//       borderLineRef.current.geometry.setFromPoints(visiblePoints)
//       borderLineRef.current.geometry.computeBoundingSphere()
//     }
//   }, [visiblePoints])

//   if (!visible || visiblePoints.length < 2 || opacity <= 0.01) return null

//   return (
//     <>
//       <line ref={borderLineRef}>
//         <bufferGeometry />
//         <lineBasicMaterial color="#b0b0b0" linewidth={4} transparent opacity={opacity * 0.8} toneMapped={false} />
//       </line>

//       <line ref={lineRef}>
//         <bufferGeometry />
//         <lineBasicMaterial color="#ffffff" linewidth={2} transparent opacity={opacity * 0.95} toneMapped={false} />
//       </line>

//       <line ref={glowLineRef}>
//         <bufferGeometry />
//         <lineBasicMaterial color="#c0c0c0" linewidth={5} transparent opacity={opacity * 0.4} toneMapped={false} />
//       </line>
//     </>
//   )
// }

// const NEON_COLORS = ["#00d9ff", "#ff00ff", "#00ffff", "#ff66ff", "#0099ff", "#ff0099", "#00ff99", "#9900ff"]

// function getRandomNeonColor(): string {
//   return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
// }

// export default function Component() {
//   const [autoRotate, setAutoRotate] = useState(true)
//   const [flightPaths, setFlightPaths] = useState<FlightPathData[]>([])
//   const landGlow = 1.2
//   const oceanBrightness = 1.5
//   const emissiveStrength = 2.0
//   const controlsRef = useRef()

//   useEffect(() => {
//     const startCity = getRandomCity()
//     const endCity = getRandomCity()
//     const initialPath: FlightPathData = {
//       id: `flight-${Date.now()}`,
//       start: { lat: startCity.lat, long: startCity.long, name: startCity.name },
//       end: { lat: endCity.lat, long: endCity.long, name: endCity.name },
//       timestamp: Date.now(),
//       progress: 0,
//       color: getRandomNeonColor(),
//     }
//     setFlightPaths([initialPath])

//     const intervalId = setInterval(() => {
//       const startCity = getRandomCity()
//       const endCity = getRandomCity()
//       const newPath: FlightPathData = {
//         id: `flight-${Date.now()}-${Math.random()}`,
//         start: { lat: startCity.lat, long: startCity.long, name: startCity.name },
//         end: { lat: endCity.lat, long: endCity.long, name: endCity.name },
//         timestamp: Date.now(),
//         progress: 0,
//         color: getRandomNeonColor(),
//       }

//       setFlightPaths((prev) => {
//         const updated = [...prev, newPath]
//         const now = Date.now()
//         const filtered = updated.filter((path) => now - path.timestamp < 5000)
//         return filtered.slice(-15)
//       })
//     }, 500)

//     return () => clearInterval(intervalId)
//   }, [])

//   const updateFlightPathProgress = useMemo(
//     () => (id: string, progress: number) => {
//       setFlightPaths((prev) => prev.map((path) => (path.id === id ? { ...path, progress } : path)))
//     },
//     [],
//   )

//   return (
//     <div className="relative w-full h-screen bg-gradient-to-b from-[#0d1b2a] via-[#1b263b] to-[#0d1b2a] overflow-hidden">
//       <FuturisticBackground />

//       <div className="absolute top-6 right-6 z-10 w-96">
//         <Card className="bg-black/80 border-white/20 backdrop-blur-sm">
//           <div className="p-4">
//             <h2 className="text-lg font-semibold text-white mb-3">Latest Transactions</h2>
//             <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
//               <table className="w-full text-sm">
//                 <thead className="sticky top-0 bg-black/90">
//                   <tr className="border-b border-white/10">
//                     <th className="text-left py-2 px-2 text-gray-400 font-medium">From</th>
//                     <th className="text-left py-2 px-2 text-gray-400 font-medium">To</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {flightPaths
//                     .slice()
//                     .reverse()
//                     .map((path) => (
//                       <tr key={path.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
//                         <td className="py-2 px-2 text-white">{path.start.name}</td>
//                         <td className="py-2 px-2 text-white">{path.end.name}</td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </Card>
//       </div>

//       <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
//         <Suspense fallback={<Loader />}>
//           <ambientLight intensity={0.8} color="#ffffff" />
//           <directionalLight
//             position={[5, 3, 5]}
//             intensity={1.8}
//             color="#ffffff"
//             castShadow
//             shadow-mapSize-width={2048}
//             shadow-mapSize-height={2048}
//           />
//           <pointLight position={[-5, -3, -5]} intensity={0.6} color="#ffffff" />

//           <Earth landGlow={landGlow} oceanBrightness={oceanBrightness} emissiveStrength={emissiveStrength} />
//           <Atmosphere />

//           {flightPaths.map((path) => {
//             const age = Date.now() - path.timestamp
//             const isVisible = age < 5000
//             const showDestination = isVisible && (path.progress ?? 0) > 0.95

//             return (
//               <group key={path.id}>
//                 <LocationMarker
//                   lat={path.start.lat}
//                   long={path.start.long}
//                   visible={isVisible}
//                   color={path.color}
//                   timestamp={path.timestamp}
//                 />
//                 <LocationMarker
//                   lat={path.end.lat}
//                   long={path.end.long}
//                   visible={showDestination}
//                   color={path.color}
//                   timestamp={path.timestamp}
//                 />
//                 <FlightPath
//                   startLat={path.start.lat}
//                   startLong={path.start.long}
//                   endLat={path.end.lat}
//                   endLong={path.end.long}
//                   visible={isVisible}
//                   onProgressUpdate={updateFlightPathProgress}
//                   pathId={path.id}
//                   color={path.color}
//                   timestamp={path.timestamp}
//                 />
//               </group>
//             )
//           })}

//           <OrbitControls
//             ref={controlsRef}
//             enableZoom={true}
//             enablePan={true}
//             enableRotate={true}
//             autoRotate={autoRotate}
//             autoRotateSpeed={0.3}
//             minDistance={1.8}
//             maxDistance={8}
//             enableDamping={true}
//             dampingFactor={0.05}
//             rotateSpeed={0.5}
//             zoomSpeed={0.8}
//             panSpeed={0.8}
//           />
//         </Suspense>
//       </Canvas>
//     </div>
//   )
// }

// function Earth({
//   landGlow,
//   oceanBrightness,
//   emissiveStrength,
// }: {
//   landGlow: number
//   oceanBrightness: number
//   emissiveStrength: number
// }) {
//   const meshRef = useRef()
//   const earthTexture = useLoader(TextureLoader, "/assets/3d/texture_earth.jpg")

//   const oceanColor = `rgb(${Math.floor(oceanBrightness * 100)}, ${Math.floor(oceanBrightness * 120)}, ${Math.floor(oceanBrightness * 200)})`

//   return (
//     <mesh ref={meshRef} castShadow receiveShadow>
//       <sphereGeometry args={[1, 128, 128]} />
//       <meshStandardMaterial
//         map={earthTexture}
//         emissiveMap={earthTexture}
//         emissive="#2a2a5e"
//         emissiveIntensity={landGlow}
//         color="#4a4a8e"
//         roughness={1.0}
//         metalness={0.0}
//         toneMapped={false}
//       />
//     </mesh>
//   )
// }

// function Atmosphere() {
//   return (
//     <>
//       <mesh scale={1.018}>
//         <sphereGeometry args={[1, 64, 64]} />
//         <meshBasicMaterial color="#6366f1" transparent opacity={0.25} toneMapped={false} side={2} />
//       </mesh>
//       <mesh scale={1.012}>
//         <sphereGeometry args={[1, 64, 64]} />
//         <meshBasicMaterial color="#8b5cf6" transparent opacity={0.18} toneMapped={false} side={2} />
//       </mesh>
//       <mesh scale={1.008}>
//         <sphereGeometry args={[1, 64, 64]} />
//         <meshBasicMaterial color="#a78bfa" transparent opacity={0.12} toneMapped={false} side={2} />
//       </mesh>
//     </>
//   )
// }
