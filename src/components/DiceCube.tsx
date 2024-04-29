import {Triplet, useBox} from "@react-three/cannon";
import {Euler, Mesh, MeshStandardMaterial, Quaternion, Texture, TextureLoader, Vector3} from "three";
import {useEffect, useState} from "react";
import {useLoader} from "@react-three/fiber";
import * as THREE from 'three';
interface DiceCubeProps {
  position: [x: number, y: number, z: number],
  velocity: [x: number, y: number, z: number],
  onDiceSleep: (topFace: number) => void
}
const DiceCube = ({position, onDiceSleep, velocity} : DiceCubeProps) => {

  const textures = useLoader(TextureLoader, [
    '/assets/dice-sides/5.png',
    '/assets/dice-sides/2.png',
    '/assets/dice-sides/1.png',
    '/assets/dice-sides/6.png',
    '/assets/dice-sides/3.png',
    '/assets/dice-sides/4.png',
  ]);
  // Create a material for each texture
  const materials : MeshStandardMaterial[] = textures.map((texture : Texture) => new MeshStandardMaterial({ map: texture }));

  const [ref, api] = useBox<Mesh>(() => ({
    mass: .5, // Set the mass of the box
    position, // Start slightly above to see it fall
    velocity, // az kenar mirize ag
    angularVelocity: [0, 0, -33], // bazavie mindaze
    material: {
      restitution: 0.4  // High restitution for a bouncy cube
    },
    args:[.5, .5, .5],
  }));

  const [isMoving, setIsMoving] = useState<boolean>(true);
  useEffect(() : void => {
    const unsubscribe = api.velocity.subscribe(([x, y, z]) => {
      if (Math.sqrt(x * x + y * y + z * z) < 0.02) { // Check if velocity is near zero
        setIsMoving(false)
        unsubscribe();
      }
    });
  }, [api.velocity]);

  useEffect(() : void => {
    const diceValues : number[] = [5,2,1,6,3,4];
    const upDirection: Vector3 = new THREE.Vector3(0, 1, 0); // World's up direction
    const faceNormals: Vector3[] = [
      new THREE.Vector3(1, 0, 0),  // Right face (+x)
      new THREE.Vector3(-1, 0, 0), // Left face (-x)
      new THREE.Vector3(0, 1, 0),  // Top face (+y)
      new THREE.Vector3(0, -1, 0), // Bottom face (-y)
      new THREE.Vector3(0, 0, 1),  // Front face (+z)
      new THREE.Vector3(0, 0, -1), // Back face (-z)
    ];

    let maxProjection : number = -Infinity;
    let upwardFaceIndex : number = -1;
    if(!isMoving){
      const unsubscribe = api.rotation.subscribe((eulerValues: Triplet) : void => {
        const quaternion: Quaternion = new THREE.Quaternion();
        const euler: Euler = new THREE.Euler(...eulerValues);
        quaternion.setFromEuler(euler);

        faceNormals.forEach((normal: Vector3, index: number) : void => {
          const worldNormal: Vector3 = normal.clone().applyQuaternion(quaternion);
          const projection: number = worldNormal.dot(upDirection);
          if (projection > maxProjection) {
            maxProjection = projection;
            upwardFaceIndex = index;
          }
        });
        onDiceSleep(diceValues[upwardFaceIndex])
        unsubscribe();
      });
    }

  }, [isMoving,api.rotation]);

  return (
    <mesh ref={ref} castShadow={true} receiveShadow={true}>
      <boxGeometry args={[.5, .5, .5]} />
      {materials.map((material: MeshStandardMaterial, index: number) => (
        <primitive key={index} attach={`material-${index}`} object={material} />
      ))}
    </mesh>
  )
}
export default DiceCube;