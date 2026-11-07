/**
 * Projects points of the CSS 3D stack onto the screen, mirroring what the browser
 * does with the scene's transforms, so the frame loop never has to read layout.
 *
 * The group is `rotateX(rx) rotateZ(rz)` (rz applied first), hanging from a
 * zero-size scene point that is also the perspective origin. A plate is
 * `translate3d(tx, ty, tz) rotateZ(-rz·face) rotateX(-rx·face)` inside the group:
 * with face = 1 it exactly undoes the group's rotation and faces the viewer.
 */
export type View = {
  /** Degrees, as set on the group this frame */
  rx: number
  rz: number
  perspective: number
  /** Screen position of the scene point, relative to the sticky viewport */
  ox: number
  oy: number
}

export type Point = { x: number; y: number }
export type Vec3 = { x: number; y: number; z: number }
export type PlatePose = { tx: number; ty: number; tz: number; face: number }

const DEG = Math.PI / 180

const rotX = (v: Vec3, a: number): Vec3 => ({
  x: v.x,
  y: v.y * Math.cos(a) - v.z * Math.sin(a),
  z: v.y * Math.sin(a) + v.z * Math.cos(a),
})

// CSS y points down: positive angles turn clockwise on screen
const rotZ = (v: Vec3, a: number): Vec3 => ({
  x: v.x * Math.cos(a) - v.y * Math.sin(a),
  y: v.x * Math.sin(a) + v.y * Math.cos(a),
  z: v.z,
})

/** Group space → camera space (before perspective). */
const toCamera = (view: View, v: Vec3) => rotX(rotZ(v, view.rz * DEG), view.rx * DEG)

/** Camera space → group space: where to put something so it ends up at v in front of the camera. */
export const fromCamera = (view: View, v: Vec3) => rotZ(rotX(v, -view.rx * DEG), -view.rz * DEG)

/** (x, y, z) in group space → screen coordinates relative to the sticky viewport. */
export function project(view: View, x: number, y: number, z: number): Point {
  const c = toCamera(view, { x, y, z })
  const k = view.perspective / (view.perspective - c.z)
  return { x: view.ox + c.x * k, y: view.oy + c.y * k }
}

/** A point on a plate's face, relative to the plate's centre, on screen. */
export function projectOnPlate(view: View, pose: PlatePose, x: number, y: number): Point {
  // The plate's own turn: rotateX first, then rotateZ (CSS applies the rightmost function first)
  const turned = rotZ(rotX({ x, y, z: 0 }, -view.rx * pose.face * DEG), -view.rz * pose.face * DEG)
  return project(view, turned.x + pose.tx, turned.y + pose.ty, turned.z + pose.tz)
}
