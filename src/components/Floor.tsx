import { usePlane } from "@react-three/cannon";
import {Mesh} from "three";
import { Plane } from '@react-three/drei';
const Floor = () => {
  const [ref] = usePlane<Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Rotate the plane to be horizontal
    position: [0, 0, 0], // Position it slightly below the cube's start
    material: {
      restitution: 0.9,
    }, // Bounciness of the floor
  }));
  return (
    <Plane args={[10, 10]} ref={ref} receiveShadow>
      <meshStandardMaterial attach="material" color="lightgrey" />
    </Plane>
  );
};
export default Floor;