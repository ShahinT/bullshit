import {useBox} from "@react-three/cannon";
import {Mesh} from "three";
interface DiceCubeProps {
  position: [x: number, y: number, z: number]
}
const Dool = ({position} : DiceCubeProps) => {
  const [ref] = useBox<Mesh>(() => ({
    mass: 1, // Set the mass of the box
    position: position, // Start slightly above to see it fall
    velocity: [2, 1, 0], // Initial slow velocity downwards
    angularVelocity: [2, 2, 0],
    material: {
      restitution: 0.4  // High restitution for a bouncy cube
    },
  }));
  return (
    <mesh ref={ref}>
      <boxGeometry args={[.5, .5, .5]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}
export default Dool;