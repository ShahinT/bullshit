import {RefObject, useEffect, useRef} from "react";
import './DiceGame.scss'
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
interface DiceParams {
  numberOfDice: number,
  segments: number,
  edgeRadius: number,
  notchRadius: number,
  notchDepth: number,
}
interface DiceObject {
  mesh: THREE.Group,
  body: CANNON.Body
}
interface CannonEvent {
  target: CANNON.Body;
  type: string;
}
const DiceGame = () => {
  /** INJAS  **/
  const canvasRef : RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);
  const scoreRef : RefObject<HTMLSpanElement>  = useRef<HTMLSpanElement>(null);
  const rollBtnRef : RefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(null);
  useEffect(() : void => {
    const params : DiceParams = {
      numberOfDice: 3,
      segments: 40,
      edgeRadius: .2,
      notchRadius: .12,
      notchDepth: .1,
    };
    const updateSceneSize = () : void => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    const createFloor = (): void =>  {
      const floor: THREE.Mesh<THREE.PlaneGeometry> = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.ShadowMaterial({
          opacity: .3
        })
      )
      floor.receiveShadow = true;
      floor.position.y = -8;
      floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * .5);
      scene.add(floor);

      const floorBody : CANNON.Body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
      });
      floorBody.position.set(floor.position.x, floor.position.y, floor.position.z);
      floorBody.quaternion.set(floor.quaternion.x, floor.quaternion.y, floor.quaternion.z, floor.quaternion.w);
      physicsWorld.addBody(floorBody);


    }
    function createInnerGeometry():  THREE.BufferGeometry<THREE.NormalBufferAttributes> {
      const baseGeometry : THREE.PlaneGeometry = new THREE.PlaneGeometry(1 - 2 * params.edgeRadius, 1 - 2 * params.edgeRadius);
      const offset : number = .48;
      return BufferGeometryUtils.mergeGeometries([
        baseGeometry.clone().translate(0, 0, offset),
        baseGeometry.clone().translate(0, 0, -offset),
        baseGeometry.clone().rotateX(.5 * Math.PI).translate(0, -offset, 0),
        baseGeometry.clone().rotateX(.5 * Math.PI).translate(0, offset, 0),
        baseGeometry.clone().rotateY(.5 * Math.PI).translate(-offset, 0, 0),
        baseGeometry.clone().rotateY(.5 * Math.PI).translate(offset, 0, 0),
      ], false);
    }

    function createBoxGeometry() : THREE.BufferGeometry {

      let boxGeometry : THREE.BufferGeometry = new THREE.BoxGeometry(1, 1, 1, params.segments, params.segments, params.segments);

      const positionAttr : THREE.BufferAttribute | THREE.InterleavedBufferAttribute = boxGeometry.attributes.position;
      const subCubeHalfSize: number = .5 - params.edgeRadius;


      for (let i : number = 0; i < positionAttr.count; i++) {

        let position : THREE.Vector3 = new THREE.Vector3().fromBufferAttribute(positionAttr, i);

        const subCube : THREE.Vector3 = new THREE.Vector3(Math.sign(position.x), Math.sign(position.y), Math.sign(position.z)).multiplyScalar(subCubeHalfSize);
        const addition : THREE.Vector3 = new THREE.Vector3().subVectors(position, subCube);

        if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
          addition.normalize().multiplyScalar(params.edgeRadius);
          position = subCube.add(addition);
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize) {
          addition.z = 0;
          addition.normalize().multiplyScalar(params.edgeRadius);
          position.x = subCube.x + addition.x;
          position.y = subCube.y + addition.y;
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
          addition.y = 0;
          addition.normalize().multiplyScalar(params.edgeRadius);
          position.x = subCube.x + addition.x;
          position.z = subCube.z + addition.z;
        } else if (Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
          addition.x = 0;
          addition.normalize().multiplyScalar(params.edgeRadius);
          position.y = subCube.y + addition.y;
          position.z = subCube.z + addition.z;
        }

        const notchWave = (v: number) => {
          v = (1 / params.notchRadius) * v;
          v = Math.PI * Math.max(-1, Math.min(1, v));
          return params.notchDepth * (Math.cos(v) + 1.);
        }
        const notch = (pos: Array<number>) => notchWave(pos[0]) * notchWave(pos[1]);

        const offset : number = .23;

        if (position.y === .5) {
          position.y -= notch([position.x, position.z]);
        } else if (position.x === .5) {
          position.x -= notch([position.y + offset, position.z + offset]);
          position.x -= notch([position.y - offset, position.z - offset]);
        } else if (position.z === .5) {
          position.z -= notch([position.x - offset, position.y + offset]);
          position.z -= notch([position.x, position.y]);
          position.z -= notch([position.x + offset, position.y - offset]);
        } else if (position.z === -.5) {
          position.z += notch([position.x + offset, position.y + offset]);
          position.z += notch([position.x + offset, position.y - offset]);
          position.z += notch([position.x - offset, position.y + offset]);
          position.z += notch([position.x - offset, position.y - offset]);
        } else if (position.x === -.5) {
          position.x += notch([position.y + offset, position.z + offset]);
          position.x += notch([position.y + offset, position.z - offset]);
          position.x += notch([position.y, position.z]);
          position.x += notch([position.y - offset, position.z + offset]);
          position.x += notch([position.y - offset, position.z - offset]);
        } else if (position.y === -.5) {
          position.y += notch([position.x + offset, position.z + offset]);
          position.y += notch([position.x + offset, position.z]);
          position.y += notch([position.x + offset, position.z - offset]);
          position.y += notch([position.x - offset, position.z + offset]);
          position.y += notch([position.x - offset, position.z]);
          position.y += notch([position.x - offset, position.z - offset]);
        }

        positionAttr.setXYZ(i, position.x, position.y, position.z);
      }


      boxGeometry.deleteAttribute('normal');
      boxGeometry.deleteAttribute('uv');
      boxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);

      boxGeometry.computeVertexNormals();

      return boxGeometry;
    }

    function createDiceMesh() : THREE.Group {
      const boxMaterialOuter : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
      })
      const boxMaterialInner : THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0,
        metalness: 1,
        side: THREE.DoubleSide
      })

      const diceMesh : THREE.Group = new THREE.Group();
      const innerMesh : THREE.Mesh = new THREE.Mesh(createInnerGeometry(), boxMaterialInner);
      const outerMesh : THREE.Mesh = new THREE.Mesh(createBoxGeometry(), boxMaterialOuter);
      outerMesh.castShadow = true;
      diceMesh.add(innerMesh, outerMesh);

      return diceMesh;
    }
    function createDice(diceMesh : THREE.Group) : DiceObject {
      const mesh : THREE.Group = diceMesh.clone();
      scene.add(mesh);

      const body : CANNON.Body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(.5, .5, .5)),
        sleepTimeLimit: .1
      });
      physicsWorld.addBody(body);

      return { mesh, body };
    }



    function showRollResults(score: number) : void {
      if(!scoreRef.current){
        console.log("Score Ref is null - From showRollResults")
        return;
      }
      if (scoreRef.current.innerHTML === '') {
        scoreRef.current.innerHTML += score;
      } else {
        scoreRef.current.innerHTML += ('+' + score);
      }
    }
    function addDiceEvents(dice : DiceObject) : void {
      dice.body.addEventListener('sleep', (e : CannonEvent) : void => {

        dice.body.allowSleep = false;

        const euler : CANNON.Vec3 = new CANNON.Vec3();
        e.target.quaternion.toEuler(euler);

        const eps : number = .1;
        const isZero = (angle : number) : boolean => Math.abs(angle) < eps;
        const isHalfPi = (angle : number) : boolean => Math.abs(angle - .5 * Math.PI) < eps;
        const isMinusHalfPi = (angle : number) : boolean => Math.abs(.5 * Math.PI + angle) < eps;
        const isPiOrMinusPi = (angle : number) : boolean => (Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps);


        if (isZero(euler.z)) {
          if (isZero(euler.x)) {
            showRollResults(1);
          } else if (isHalfPi(euler.x)) {
            showRollResults(4);
          } else if (isMinusHalfPi(euler.x)) {
            showRollResults(3);
          } else if (isPiOrMinusPi(euler.x)) {
            showRollResults(6);
          } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
          }
        } else if (isHalfPi(euler.z)) {
          showRollResults(2);
        } else if (isMinusHalfPi(euler.z)) {
          showRollResults(5);
        } else {
          // landed on edge => wait to fall on side and fire the event again
          dice.body.allowSleep = true;
        }
      });
    }

    function throwDice() : void {
      if(scoreRef.current){
        scoreRef.current.innerHTML = '';
      }

      diceArray.forEach((d, index: number) : void => {

        d.body.velocity.setZero();
        d.body.angularVelocity.setZero();

        d.body.position = new CANNON.Vec3(0, index * 1.5, 0);
        d.mesh.position.copy(d.body.position);

        d.mesh.rotation.set(2 * Math.PI * Math.random(), 0, 2 * Math.PI * Math.random());
        //@ts-expect-error BADAN
        d.body.quaternion.copy(d.mesh.quaternion);

        const force = 3 + 5 * Math.random();
        d.body.applyImpulse(
          new CANNON.Vec3(-force, force, 0),
          new CANNON.Vec3(0, 0, .2)
        );

        d.body.allowSleep = true;
      });
    }

    function render() : void {
      physicsWorld.fixedStep();

      for (const dice of diceArray) {
        dice.mesh.position.copy(dice.body.position)
        dice.mesh.quaternion.copy(dice.body.quaternion)
      }

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }




    if (!canvasRef.current || !scoreRef.current || !rollBtnRef.current) {
      console.log('WHY IT COMES HERE?')
      return;
    }

    const scene : THREE.Scene = new THREE.Scene();
    const camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 300);
    const ambientLight : THREE.AmbientLight = new THREE.AmbientLight(0xffffff);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 1, 1);
    scene.add(ambientLight, directionalLight);

    const topLight : THREE.PointLight = new THREE.PointLight(0xffffff, 1);
    const renderer : THREE.WebGLRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: canvasRef.current
    });
    const physicsWorld : CANNON.World = new CANNON.World({
      allowSleep: true,
      gravity: new CANNON.Vec3(0, -50, 0),
    })

    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 400));

    camera.position.set(0, 20, 10);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    updateSceneSize();

    scene.add(ambientLight);

    topLight.position.set(5, 10, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 5;
    topLight.shadow.camera.far = 400;

    scene.add(topLight);

    physicsWorld.defaultContactMaterial.restitution = .3;

    createFloor();

    const diceMesh : THREE.Group = createDiceMesh();

    const diceArray : DiceObject[] = [];
    for (let i : number = 0; i < params.numberOfDice; i++) {
      diceArray.push(createDice(diceMesh));
      addDiceEvents(diceArray[i]);
    }



    throwDice();
    render();

    /** Badan unmount kon **/
    window.addEventListener('resize', updateSceneSize);
    rollBtnRef.current.addEventListener('click', throwDice);



  }, [])

  return (
    <div>
      <div className="ui-controls">
        <div className="score">Score: <span ref={scoreRef} id="score-result"></span></div>
        <button ref={rollBtnRef} id="roll-btn">Throw the dice</button>
      </div>
        <canvas ref={canvasRef} className="canvas-three" id="canvas"></canvas>

    </div>
  )
}
export default DiceGame;