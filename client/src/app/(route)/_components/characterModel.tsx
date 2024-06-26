"use client";

import * as THREE from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { RefObject, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";
import { characterGlb } from "@/app/_constants/constants";
import TextBoard from "./textBoard";

interface ICharacterModel {
  playerStatus: "player" | "otherPlayer" | "create";
  nextAction: string;
  selectCharacter: number;
  characterRef?: RefObject<THREE.Group>;
  position?: number[];
  rotation?: number[];
  name?: string;
}

export default function CharacterModel({ playerStatus, nextAction, selectCharacter, characterRef, position, rotation, name }: ICharacterModel) {
  const sceneRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);

  const nowAction = useRef("Idle");

  const { scene, animations } = useGLTF(`/models/${characterGlb[selectCharacter]}.glb`);
  const { actions } = useAnimations(animations, characterRef ?? sceneRef);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useEffect(() => {
    if (clone && actions) {
      // 모델에 그림자 속성 추가
      clone.traverse((obj) => {
        obj.castShadow = true;
        obj.receiveShadow = true;
      });
      // 첫 애니메이션 재생
      actions["Idle"]?.reset().play();
    }
  }, [clone, actions]);

  useFrame(() => {
    if (nextAction && nextAction !== nowAction.current) {
      if (nextAction === "Jump") actions[nextAction]?.setDuration(0.8);
      actions[nowAction.current]?.fadeOut(0.3);
      actions[nextAction]?.reset().fadeIn(0.2).play();
      nowAction.current = nextAction;
    }
  });

  useFrame(() => {
    if (playerStatus === "player") return;
    if (position && rotation) {
      // 내캐릭터가 아닌 다른 플레이어의 캐릭터 위치 지정
      groupRef.current?.position.set(position[0], position[1], position[2]);
      groupRef.current?.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  });

  return (
    <group ref={groupRef}>
      {playerStatus !== "create" && name && <TextBoard text={name} position={[0, 1.6, 0]} />}
      <primitive ref={characterRef ?? sceneRef} object={clone} />
    </group>
  );
}

useGLTF.preload("/models/characterTypeA.glb");
useGLTF.preload("/models/characterTypeB.glb");
useGLTF.preload("/models/characterTypeC.glb");
useGLTF.preload("/models/characterTypeD.glb");
