/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.3 public/models/iris.glb -o src/components/Avatar.jsx -k -r public
*/

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { useChat } from "../hooks/useChat";

type GLTFResult = GLTF & {
  nodes: {
    Hips: THREE.Bone;
    Wolf3D_Body: THREE.SkinnedMesh;
    Wolf3D_Outfit_Bottom: THREE.SkinnedMesh;
    Wolf3D_Outfit_Footwear: THREE.SkinnedMesh;
    Wolf3D_Outfit_Top: THREE.SkinnedMesh;
    Wolf3D_Hair: THREE.SkinnedMesh;
    EyeLeft: THREE.SkinnedMesh & {
      morphTargetDictionary: { [key: string]: number };
      morphTargetInfluences: number[];
    };
    EyeRight: THREE.SkinnedMesh & {
      morphTargetDictionary: { [key: string]: number };
      morphTargetInfluences: number[];
    };
    Wolf3D_Head: THREE.SkinnedMesh & {
      morphTargetDictionary: { [key: string]: number };
      morphTargetInfluences: number[];
    };
    Wolf3D_Teeth: THREE.SkinnedMesh & {
      morphTargetDictionary: { [key: string]: number };
      morphTargetInfluences: number[];
    };
  };
  materials: {
    Wolf3D_Body: THREE.Material;
    Wolf3D_Outfit_Bottom: THREE.Material;
    Wolf3D_Outfit_Footwear: THREE.Material;
    Wolf3D_Outfit_Top: THREE.Material;
    Wolf3D_Hair: THREE.Material;
    Wolf3D_Eye: THREE.Material;
    Wolf3D_Skin: THREE.Material;
    Wolf3D_Teeth: THREE.Material;
  };
};

type ActionName =
  | "Idle"
  | "Talking_0"
  | "Talking_1"
  | "Talking_2"
  | "Crying"
  | "Laughing"
  | "Rumba"
  | "Terrified"
  | "Angry";

interface FacialExpression {
  [key: string]: number;
}

interface FacialExpressions {
  default: FacialExpression;
  smile: FacialExpression;
  funnyFace: FacialExpression;
  sad: FacialExpression;
  surprised: FacialExpression;
  angry: FacialExpression;
  crazy: FacialExpression;
}

const facialExpressions: FacialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.1700000727403593,
    noseSneerRight: 0.14000002836874015,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41000000000000003,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 0.9999924982764238,
    mouthDimpleLeft: 0.414743888682652,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35499733688813034,
    mouthSmileRight: 0.35499733688813034,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78341,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.351,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.5700000000000001,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39435766259644545,
    eyeLookUpRight: 0.4039761421719682,
    eyeLookInLeft: 0.9618479575523053,
    eyeLookInRight: 0.9618479575523053,
    jawOpen: 0.9618479575523053,
    mouthDimpleLeft: 0.9618479575523053,
    mouthDimpleRight: 0.9618479575523053,
    mouthStretchLeft: 0.27893590769016857,
    mouthStretchRight: 0.2885543872656917,
    mouthSmileLeft: 0.5578718153803371,
    mouthSmileRight: 0.38473918302092225,
    tongueOut: 0.9618479575523053,
  },
};

const corresponding: { [key: string]: string } = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

let setupMode = false;

interface AvatarProps {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

export function Avatar(props: AvatarProps) {
  const { nodes, materials, scene } = useGLTF(
    "/models/iris.glb"
  ) as GLTFResult;

  const { message, onMessagePlayed, chat } = useChat();

  const [lipsync, setLipsync] = useState<{
    mouthCues: Array<{
      start: number;
      end: number;
      value: string;
    }>;
  } | null>(null);

  const [facialExpression, setFacialExpression] =
    useState<keyof FacialExpressions>("default");
  const [audio, setAudio] = useState<HTMLAudioElement>();

  useEffect(() => {
    if (!message) {
      setAnimation("Idle");
      return;
    }
    setAnimation(message.animation as ActionName);
    setFacialExpression(message.facialExpression as keyof FacialExpressions);
    setLipsync(message.lipsync);
    const audio = new Audio("data:audio/mp3;base64," + message.audio);
    audio.play();
    setAudio(audio);
    audio.onended = onMessagePlayed;
  }, [message]);

  const { animations } = useGLTF("/models/animations.glb") as GLTF;

  // Filter out problematic tracks that cause console warnings
  animations.forEach((animation) => {
    animation.tracks = animation.tracks.filter((track) => {
      // Filter out tracks for bones that don't exist in our model
      const problematicBones = [
        "LeftToe_End_end",
        "HeadTop_End_end",
        "LeftEye_end",
        "RightEye_end",
        "LeftHandThumb4_end",
        "LeftHandIndex4_end",
        "LeftHandMiddle4_end",
        "LeftHandRing4_end",
        "LeftHandPinky4_end",
        "RightHandThumb4_end",
        "RightHandIndex4_end",
        "RightHandMiddle4_end",
        "RightHandRing4_end",
        "RightHandPinky4_end",
        "RightToe_End_end",
        "Armature",
      ];
      return !problematicBones.some((bone) => track.name.includes(bone));
    });
  });

  const group = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, group);
  const [animation, setAnimation] = useState<ActionName>(
    (animations.find((a: THREE.AnimationClip) => a.name === "Idle")
      ? "Idle"
      : animations[0].name) as ActionName
  );

  useEffect(() => {
    const action = actions[animation];
    if (!action || !mixer) return;

    action.reset().fadeIn(0.5).play();
    return () => {
      action.fadeOut(0.5);
    };
  }, [animation, actions, mixer]);

  const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
    scene.traverse((child: THREE.Object3D) => {
      if (
        (child as THREE.SkinnedMesh).morphTargetDictionary &&
        (child as THREE.SkinnedMesh).morphTargetInfluences
      ) {
        const skinnedMesh = child as THREE.SkinnedMesh & {
          morphTargetDictionary: { [key: string]: number };
          morphTargetInfluences: number[];
        };
        const index = skinnedMesh.morphTargetDictionary[target];
        if (
          index === undefined ||
          skinnedMesh.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        skinnedMesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          skinnedMesh.morphTargetInfluences[index],
          value,
          speed
        );

        // Only try to update Leva controls in setup mode
        if (setupMode) {
          try {
            set({
              [target]: value,
            });
          } catch (e) {}
        }
      }
    });
  };

  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);

  useFrame(() => {
    if (!nodes.EyeLeft) return;

    !setupMode &&
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        const mapping =
          facialExpressions[facialExpression as keyof FacialExpressions];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    // LIPSYNC
    if (setupMode) {
      return;
    }

    const appliedMorphTargets: string[] = [];
    if (message && lipsync && audio) {
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          const morphTarget = corresponding[mouthCue.value];
          if (morphTarget) {
            appliedMorphTargets.push(morphTarget);
            lerpMorphTarget(morphTarget, 1, 0.2);
          }
          break;
        }
      }
    }

    Object.values(corresponding).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.1);
    });
  });

  useControls("FacialExpressions", {
    chat: button(() => chat("")),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animations.map((a: THREE.AnimationClip) => a.name),
      onChange: (value: string) => setAnimation(value as ActionName),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value: string) =>
        setFacialExpression(value as keyof FacialExpressions),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
    logMorphTargetValues: button(() => {
      const emotionValues: { [key: string]: number } = {};
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        const value =
          nodes.EyeLeft.morphTargetInfluences[
            nodes.EyeLeft.morphTargetDictionary[key]
          ];
        if (value > 0.01) {
          emotionValues[key] = value;
        }
      });
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  const [, set] = useControls("MorphTarget", () =>
    Object.assign(
      {},
      ...Object.keys(nodes.EyeLeft.morphTargetDictionary).map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min: nodes.EyeLeft.morphTargetInfluences[
              nodes.EyeLeft.morphTargetDictionary[key]
            ],
            max: 1,
            onChange: (val: number) => {
              if (setupMode) {
                lerpMorphTarget(key, val, 1);
              }
            },
          },
        };
      })
    )
  );

  useEffect(() => {
    let blinkTimeout: number;
    const nextBlink = () => {
      blinkTimeout = window.setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => window.clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

useGLTF.preload("/models/iris.glb");
useGLTF.preload("/models/animations.glb");
