import { useBox } from "@react-three/cannon";
import {Mesh} from "three";
interface WallProps {
  position: [x: number, y: number, z: number],
  rotation: [x: number, y: number, z: number]
}
const Wall = ({position, rotation}: WallProps) => {
  const [ref] = useBox<Mesh>(() => ({
    position: position,  // Adjust the position to place it at the edge of the floor
    rotation: rotation,    // No need to rotate since it's vertical
    args: [0.1, 55, 10],     // Thin, tall, wide wall
    static: true,           // Make it static so it doesn't fall under gravity
    material: {
      restitution: 0.9      // High restitution to bounce back the cubes
    },
  }));

  return (
    <mesh ref={ref} receiveShadow={true}>
      <boxGeometry args={[0.1, 1, 10]} />
      <meshStandardMaterial color="#22272f" />
    </mesh>
  );
};

export default Wall;