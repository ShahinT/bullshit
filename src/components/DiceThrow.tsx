import { useLoader } from '@react-three/fiber';
import { MTLLoader, OBJLoader } from 'three-stdlib';
import { useBox } from '@react-three/cannon';
import {useEffect} from "react";

const DiceThrow = () => {
// Load the material and object
  const materials = useLoader(MTLLoader, '/assets/models/dice/obj.mtl');
  const obj = useLoader(OBJLoader, '/assets/models/dice/tinker.obj', loader => {
    materials.preload();
    loader.setMaterials(materials);
  });

  // Create a physics box that encapsulates the model
  const scale = [0.03, 0.03, 0.03];
  const [ref] = useBox(() => ({
    mass: 1,
    position: [0, 15, 0],
    velocity: [0, 0, 0],
    material: {
      restitution: 0.4
    },
    args: [0.1, 0.1, 0.1]
  }));

  useEffect(() => {
    if (obj) {
      obj.position.copy(ref.current!.position);
      obj.quaternion.copy(ref.current!.quaternion);
    }
  }, [obj, ref]);

  return (
    <primitive scale={scale} object={obj} ref={ref} dispose={null} />
  );
}

export default DiceThrow;
// /assets/models/first-one/first.mtl
// /assets/models/first-one/first.obj