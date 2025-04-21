import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, useTexture } from '@react-three/drei';

// FootballField component to render the 3D football pitch
const FootballField = ({ onClick, highlightPosition = null, width = 100, length = 150 }) => {
  // Define field dimensions
  const fieldWidth = width;
  const fieldLength = length;
  
  // Create a ground plane for the pitch
  const FieldGround = () => {
    const texture = useTexture({
      map: '/textures/grass.jpg',
    });
    
    // Make the texture repeat for a realistic grass look
    if (texture.map) {
      texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;
      texture.map.repeat.set(8, 12);
    }
    
    return (
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[fieldWidth, fieldLength]} />
        <meshStandardMaterial {...texture} roughness={0.8} />
      </mesh>
    );
  };
  
  // Create pitch markings
  const PitchMarkings = () => {
    return (
      <group>
        {/* Outer boundary - complete rectangular outline as shown in the image */}
        <Line 
          points={[
            [-fieldWidth/2, 0, -fieldLength/2],
            [fieldWidth/2, 0, -fieldLength/2],
            [fieldWidth/2, 0, fieldLength/2],
            [-fieldWidth/2, 0, fieldLength/2],
            [-fieldWidth/2, 0, -fieldLength/2]
          ]} 
          color="white" 
        />
        
        {/* Goal line (top) - highlighted as missing in the image */}
        <Line
          points={[
            [-fieldWidth/2, 0, -fieldLength/2],
            [fieldWidth/2, 0, -fieldLength/2]
          ]}
          color="white"
          lineWidth={0.15}
        />
        
        {/* Goal line (bottom) - ensure it's visible */}
        <Line
          points={[
            [-fieldWidth/2, 0, fieldLength/2],
            [fieldWidth/2, 0, fieldLength/2]
          ]}
          color="white"
          lineWidth={0.15}
        />
        
        {/* Left sideline - highlighted in the image */}
        <Line
          points={[
            [-fieldWidth/2, 0, -fieldLength/2],
            [-fieldWidth/2, 0, fieldLength/2]
          ]}
          color="white"
          lineWidth={0.15}
        />
        
        {/* Right sideline - highlighted in the image */}
        <Line
          points={[
            [fieldWidth/2, 0, -fieldLength/2],
            [fieldWidth/2, 0, fieldLength/2]
          ]}
          color="white"
          lineWidth={0.15}
        />
        
        {/* Center line */}
        <Line 
          points={[
            [-fieldWidth/2, 0, 0],
            [fieldWidth/2, 0, 0]
          ]} 
          color="white" 
        />
        
        {/* Center circle */}
        <CenterCircle position={[0, 0, 0]} radius={9} />
        
        {/* Penalty areas */}
        <PenaltyArea position={[0, 0, fieldLength/2 - 16.5]} />
        <PenaltyArea position={[0, 0, -fieldLength/2 + 16.5]} rotation={[0, Math.PI, 0]} />
        
        {/* Goal areas */}
        <GoalArea position={[0, 0, fieldLength/2 - 5.5]} />
        <GoalArea position={[0, 0, -fieldLength/2 + 5.5]} rotation={[0, Math.PI, 0]} />
        
        {/* Goals */}
        <Goal position={[0, 0, fieldLength/2 + 0.5]} />
        <Goal position={[0, 0, -fieldLength/2 - 0.5]} rotation={[0, Math.PI, 0]} />
        
        {/* Corner arcs with prominent flags as shown in the image */}
        <CornerArc position={[-fieldWidth/2, 0, -fieldLength/2]} rotation={[0, 0, 0]} />
        <CornerArc position={[fieldWidth/2, 0, -fieldLength/2]} rotation={[0, Math.PI/2, 0]} />
        <CornerArc position={[fieldWidth/2, 0, fieldLength/2]} rotation={[0, Math.PI, 0]} />
        <CornerArc position={[-fieldWidth/2, 0, fieldLength/2]} rotation={[0, -Math.PI/2, 0]} />
      </group>
    );
  };
  
  // Create a line component for markings
  const Line = ({ points, color = 'white', lineWidth = 0.1 }) => {
    const ref = useRef();
    
    useEffect(() => {
      if (ref.current) {
        const positions = [];
        points.forEach(point => positions.push(...point));
        ref.current.geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(positions, 3)
        );
        ref.current.geometry.attributes.position.needsUpdate = true;
      }
    }, [points]);
    
    return (
      <line ref={ref}>
        <bufferGeometry />
        <lineBasicMaterial color={color} linewidth={lineWidth} />
      </line>
    );
  };
  
  // Create a center circle component
  const CenterCircle = ({ position, radius }) => {
    const points = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push([
        position[0] + radius * Math.cos(theta),
        position[1],
        position[2] + radius * Math.sin(theta)
      ]);
    }
    
    return <Line points={points} color="white" />;
  };
  
  // Create a penalty area component - Adding missing back horizontal line
  const PenaltyArea = ({ position, rotation = [0, 0, 0] }) => {
    const width = 40.32; // 16.5 * 2 + 7.32 meters
    const depth = 16.5;
    
    return (
      <group position={[position[0], position[1], position[2]]} rotation={rotation}>
        <Line 
          points={[
            [-width/2, 0, 0],
            [-width/2, 0, -depth],
            [width/2, 0, -depth],
            [width/2, 0, 0]
          ]} 
          color="white" 
        />
        
        {/* Add the missing horizontal back line as seen in the image */}
        <Line 
          points={[
            [-width/2, 0, -depth],
            [width/2, 0, -depth]
          ]} 
          color="white" 
        />
        
        {/* Penalty spot */}
        <mesh position={[0, 0.01, -11]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[0.2, 16]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>
    );
  };
  
  // Create a goal area component
  const GoalArea = ({ position, rotation = [0, 0, 0] }) => {
    const width = 18.32; // 5.5 * 2 + 7.32 meters
    const depth = 5.5;
    
    return (
      <group position={[position[0], position[1], position[2]]} rotation={rotation}>
        <Line 
          points={[
            [-width/2, 0, 0],
            [-width/2, 0, -depth],
            [width/2, 0, -depth],
            [width/2, 0, 0]
          ]} 
          color="white" 
        />
      </group>
    );
  };
  
  // Create a corner arc component
  const CornerArc = ({ position, rotation = [0, 0, 0] }) => {
    const points = [];
    const radius = 1;
    const segments = 8;
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI / 2;
      points.push([
        position[0] + radius * Math.cos(theta + rotation[1]),
        position[1],
        position[2] + radius * Math.sin(theta + rotation[1])
      ]);
    }
    
    return (
      <group>
        {/* Corner arc */}
        <Line points={points} color="white" />
        
        {/* Corner flag */}
        <group position={position}>
          {/* Flag pole */}
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
            <meshStandardMaterial color="white" />
          </mesh>
          
          {/* Flag */}
          <mesh position={[0.4, 1.8, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.8, 0.6, 0.02]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </group>
      </group>
    );
  };
  
  // Create a goal component
  const Goal = ({ position, rotation = [0, 0, 0] }) => {
    const width = 7.32;
    const height = 2.44;
    const depth = 1.5;
    
    return (
      <group position={position} rotation={rotation}>
        {/* Goal posts and crossbar */}
        <mesh position={[-width/2, height/2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, height, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        
        <mesh position={[width/2, height/2, 0]}>
          <cylinderGeometry args={[0.06, 0.06, height, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        
        <mesh position={[0, height, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, width, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        
        {/* Goal net */}
        <mesh position={[0, height/2, -depth/2]} castShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial 
            color="white" 
            transparent={true} 
            opacity={0.15} 
            wireframe={true} 
          />
        </mesh>
      </group>
    );
  };
  
  // Create a highlight for the clicked position
  const PositionHighlight = ({ position, playerInfo = null }) => {
    if (!position) return null;
    
    // Transform position to 3D coordinates
    const x = (position.x / 100) * fieldWidth - fieldWidth / 2;
    const z = (position.y / 100) * fieldLength - fieldLength / 2;
    
    return (
      <group>
        {/* Position marker */}
        <mesh position={[x, 0.1, z]}>
          <cylinderGeometry args={[1, 1, 0.1, 32]} />
          <meshStandardMaterial color="red" transparent opacity={0.7} />
        </mesh>
        
        {/* Player info label if provided */}
        {playerInfo && (
          <Text
            position={[x, 2, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={1.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            backgroundColor="#000000"
            backgroundOpacity={0.5}
            padding={0.5}
          >
            {playerInfo.name}
          </Text>
        )}
      </group>
    );
  };
  
  const handleClick = (event) => {
    // Prevent event from propagating
    event.stopPropagation();
    
    // Calculate position in normalized coordinates (0-100)
    const x = ((event.point.x + fieldWidth / 2) / fieldWidth) * 100;
    const y = ((event.point.z + fieldLength / 2) / fieldLength) * 100;
    
    // Invoke the onClick callback with the position
    if (onClick) {
      onClick({ x, y });
    }
  };
  
  return (
    <>
      <FieldGround />
      <PitchMarkings />
      <PositionHighlight position={highlightPosition} />
      
      {/* Invisible plane for click detection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick}>
        <planeGeometry args={[fieldWidth, fieldLength]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  );
};

// Improved PlayerModel component with better visuals and animations
const PlayerModel = ({ playerData, position, role = 'taker', playbackTime = 0, isAnimating = false, ballPosition = { x: 0 } }) => {
  const x = (position.x / 100) * 100 - 50;
  const z = (position.y / 100) * 150 - 75;
  const ref = useRef();
  
  // Get colors based on role - updated to have same colors for taker and target players (same team)
  const getColorsByRole = (role) => {
    switch(role) {
      case 'taker':
      case 'target':
        // Same team colors for both taker and target players
        return { 
          jersey: '#2196F3', 
          shorts: '#1565C0',
          socks: '#2196F3'
        };
      case 'goalkeeper':
        return { 
          jersey: '#FFA000', 
          shorts: '#FF6F00',
          socks: '#FFA000'
        };
      default:
        // Fallback (should not be needed)
        return { 
          jersey: '#2196F3', 
          shorts: '#1565C0',
          socks: '#2196F3'
        };
    }
  };
  
  const colors = getColorsByRole(role);
  
  // Handle animations during set piece simulation - limit goalkeeper movement
  useFrame(() => {
    if (!ref.current || !isAnimating) return;
    
    // For target players, animate heading motion when ball approaches
    if (role === 'target' && playbackTime > 0.8 && playbackTime < 1) {
      // Calculate jump height based on timing
      const jumpProgress = (playbackTime - 0.8) * 5; // 0 to 1 over 0.2 time
      const jumpHeight = Math.sin(jumpProgress * Math.PI) * 1.2;
      
      // Apply jump animation
      ref.current.position.y = jumpHeight;
      
      // Head movement (slight lean forward)
      if (ref.current.children[1]) { // head is the second child
        ref.current.children[1].rotation.x = -jumpProgress * 0.3;
      }
    }
    
    // For goalkeeper, animate diving save - FIXED to stay within goal width
    if (role === 'goalkeeper' && playbackTime > 0.6 && playbackTime < 1) {
      const diveProgress = (playbackTime - 0.6) * 2.5; // 0 to 1 over 0.4 time
      
      // Calculate the dive direction based on ball trajectory
      // If ball is heading towards right side of goal, dive right, else dive left
      // Max dive distance is 3.5 units (about half the goal width of 7.32)
      const diveDirection = ballPosition.x > 0 ? 1 : -1;
      const maxDiveDistance = 3.5;
      
      // Limited diving motion - constrained to goal width
      ref.current.position.x += diveDirection * diveProgress * 0.8;
      
      // Clamp the position to stay within the goal width
      if (Math.abs(ref.current.position.x) > maxDiveDistance) {
        ref.current.position.x = diveDirection * maxDiveDistance;
      }
      
      // Vertical jump for the dive
      ref.current.position.y = Math.sin(diveProgress * Math.PI) * 0.8;
      
      // Body rotation for diving
      ref.current.rotation.z = diveDirection * diveProgress * Math.PI * 0.15;
    }
  });
  
  return (
    <group ref={ref} position={[x, 0, z]} rotation={[0, role === 'goalkeeper' ? Math.PI : 0, 0]}>
      {/* Player legs */}
      <mesh position={[-0.25, 0.6, 0]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color={colors.shorts} />
      </mesh>
      
      <mesh position={[0.25, 0.6, 0]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.2, 0.8, 4, 8]} />
        <meshStandardMaterial color={colors.shorts} />
      </mesh>
      
      {/* Player body */}
      <mesh position={[0, 1.6, 0]}>
        <capsuleGeometry args={[0.4, 0.9, 4, 16]} />
        <meshStandardMaterial color={colors.jersey} />
      </mesh>
      
      {/* Player head */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FFDBAC" />
      </mesh>
      
      {/* Player socks */}
      <mesh position={[-0.25, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.4, 8]} />
        <meshStandardMaterial color={colors.socks} />
      </mesh>
      
      <mesh position={[0.25, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.4, 8]} />
        <meshStandardMaterial color={colors.socks} />
      </mesh>
      
      {/* Player shoes */}
      <mesh position={[-0.25, 0.05, 0.1]}>
        <boxGeometry args={[0.15, 0.1, 0.35]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      <mesh position={[0.25, 0.05, 0.1]}>
        <boxGeometry args={[0.15, 0.1, 0.35]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Player arms */}
      <mesh position={[-0.6, 1.6, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.15, 0.7, 4, 8]} />
        <meshStandardMaterial color={colors.jersey} />
      </mesh>
      
      <mesh position={[0.6, 1.6, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.15, 0.7, 4, 8]} />
        <meshStandardMaterial color={colors.jersey} />
      </mesh>
      
      {/* Player name */}
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        backgroundColor="#000000"
        backgroundOpacity={0.5}
        padding={0.3}
      >
        {playerData.name}
      </Text>
    </group>
  );
};

// Enhanced Ball component that doesn't rely on external texture
const Ball = ({ position, isPlaying, playbackTime, type, targetPosition }) => {
  const ballRef = useRef();
  
  useFrame(() => {
    if (ballRef.current && isPlaying && playbackTime > 0) {
      // Map normalized coordinates to 3D space
      const startX = (position.x / 100) * 100 - 50;
      const startZ = (position.y / 100) * 150 - 75;
      
      // Target position in 3D space
      const targetX = (targetPosition.x / 100) * 100 - 50;
      const targetZ = (targetPosition.y / 100) * 150 - 75;
      
      // Calculate the current position based on animation time
      let currentX, currentZ, height;
      
      if (playbackTime <= 0.8) { // Ball in flight until 80% of animation
        // For an inswinging cross, we want a curve that bends toward the goal
        const t = playbackTime / 0.8; // normalize to 0-1 for the flight portion
        
        if (type === 'corner' || type === 'freeKick') {
          // Inswinging path calculation
          const midX = startX + (targetX - startX) * 0.5;
          const bendFactor = startX < 0 ? 15 : -15; // Bend direction based on which side
          
          // Bezier curve calculation for inswinging cross
          const t1 = 1.0 - t;
          const t2 = t1 * t1;
          const t3 = t * t;
          
          // Calculate a point along a quadratic Bezier curve
          currentX = t2 * startX + 2 * t * t1 * (midX + bendFactor) + t3 * targetX;
          currentZ = t2 * startZ + 2 * t * t1 * (startZ + (targetZ - startZ) * 0.5) + t3 * targetZ;
          
          // Calculate height - higher arc for crosses
          height = 10 * Math.sin(t * Math.PI);
        } else if (type === 'penalty') {
          // Straight path for penalties with lower trajectory
          currentX = startX + (targetX - startX) * t;
          currentZ = startZ + (targetZ - startZ) * t;
          height = 3 * Math.sin(t * Math.PI); // Lower arc for penalties
        } else {
          // Default curved path
          currentX = startX + (targetX - startX) * t;
          currentZ = startZ + (targetZ - startZ) * t;
          height = 6 * Math.sin(t * Math.PI);
        }
        
        // Apply position
        ballRef.current.position.set(currentX, height, currentZ);
        
        // Add spin to the ball
        ballRef.current.rotation.x += 0.15;
        ballRef.current.rotation.z += 0.1;
      } 
      else if (playbackTime <= 0.85) { 
        // Ball gets headed/shot - quick movement toward goal
        const headingT = (playbackTime - 0.8) * 20; // 0-1 over 0.05 time units
        const headingStartX = (targetPosition.x / 100) * 100 - 50;
        const headingStartZ = (targetPosition.y / 100) * 150 - 75;
        
        // Target is the goal
        const goalX = 0;
        const goalZ = -75; // Back of the goal
        
        // Linear motion toward goal with slight height
        currentX = headingStartX + (goalX - headingStartX) * headingT;
        currentZ = headingStartZ + (goalZ - headingStartZ) * headingT;
        height = 2 * Math.sin(headingT * Math.PI);
        
        // Apply position
        ballRef.current.position.set(currentX, height, currentZ);
        
        // Faster spin after being headed
        ballRef.current.rotation.x += 0.3;
        ballRef.current.rotation.z += 0.2;
      }
      else {
        // Ball reaches goal and stops
        const goalX = 0;
        const goalZ = -73; // Just inside the goal
        ballRef.current.position.set(goalX, 0.5, goalZ);
      }
    }
  });
  
  // Create a football pattern using material groups
  const createSoccerBall = () => {
    return (
      <mesh ref={ballRef} position={[(position.x / 100) * 100 - 50, 0.5, (position.y / 100) * 150 - 75]} castShadow>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial 
          color="white" 
          metalness={0.1} 
          roughness={0.2}
        />
        
        {/* Black pentagon patches */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[0.701, 4, 4]} />
            <meshStandardMaterial 
              color="black" 
              metalness={0.1} 
              roughness={0.2}
              opacity={0.7}
              transparent
            />
          </mesh>
        ))}
      </mesh>
    );
  };
  
  return createSoccerBall();
};

// Enhanced SetPieceSimulation component
const SetPieceSimulation = ({ recommendation, isPlaying = false }) => {
  const [playbackTime, setPlaybackTime] = useState(0);
  const [ballFinalPosition, setBallFinalPosition] = useState({ x: 0 });
  const animationRef = useRef(null);
  
  useEffect(() => {
    if (isPlaying) {
      let startTime = null;
      
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const normalizedTime = Math.min(elapsed / 5000, 1); // 5 seconds total animation (slower)
        
        setPlaybackTime(normalizedTime);
        
        if (normalizedTime < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      // Calculate where the ball will end up for goalkeeper animation
      const randomOffset = (Math.random() - 0.5) * 5; // Random value between -2.5 and 2.5
      setBallFinalPosition({ x: randomOffset });
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPlaying]);
  
  if (!recommendation) return null;
  
  const { type, position, taker, targetPlayers } = recommendation;
  const isPenaltyOrDirectFK = type === 'penalty' || (type === 'freeKick' && recommendation.isDirect);
  
  // Define target positions
  let targetPositionBase = { x: 50, y: 10 }; // Default position
  
  if (type === 'corner') {
    targetPositionBase = { x: 50, y: 15 };
  } else if (type === 'freeKick' && !recommendation.isDirect) {
    const isLeftSide = position.x < 50;
    targetPositionBase = isLeftSide ? { x: 60, y: 15 } : { x: 40, y: 15 };
  } else if (type === 'penalty') {
    targetPositionBase = { x: 50, y: 5 };
  }
  
  // Add goalkeeper positioned at the goal
  const goalKeeperData = {
    name: "Goalkeeper",
    id: "goalkeeper-1"
  };
  
  // Get the primary target player (first one or placeholder)
  const primaryTarget = targetPlayers && targetPlayers.length > 0 
    ? targetPlayers[0] 
    : { name: "Target Player", id: "target-1" };
  
  return (
    <group>
      {/* Ball with enhanced trajectory */}
      <Ball 
        position={position}
        isPlaying={isPlaying}
        playbackTime={playbackTime}
        type={type}
        targetPosition={isPenaltyOrDirectFK ? { x: 50, y: 5 } : targetPositionBase}
      />
      
      {/* Set piece taker */}
      <PlayerModel 
        playerData={taker} 
        position={position} 
        role="taker" 
        playbackTime={playbackTime}
        isAnimating={isPlaying}
        ballPosition={ballFinalPosition}
      />
      
      {/* Goalkeeper position */}
      <PlayerModel
        playerData={goalKeeperData}
        position={{ x: 50, y: 5 }}
        role="goalkeeper"
        playbackTime={playbackTime}
        isAnimating={isPlaying}
        ballPosition={ballFinalPosition}
      />
      
      {/* Target players - only for corners and indirect free kicks */}
      {!isPenaltyOrDirectFK && targetPlayers && targetPlayers.map((player, index) => {
        const offset = index - (targetPlayers.length - 1) / 2;
        const playerPos = {
          x: targetPositionBase.x + offset * 5,
          y: targetPositionBase.y + offset * 3
        };
        
        return (
          <PlayerModel 
            key={player.id || index} 
            playerData={player} 
            position={playerPos} 
            role="target" 
            playbackTime={playbackTime}
            isAnimating={isPlaying}
            ballPosition={ballFinalPosition}
          />
        );
      })}
      
      {/* If no target players specified and not a penalty/direct FK, show default one */}
      {!isPenaltyOrDirectFK && (!targetPlayers || targetPlayers.length === 0) && (
        <PlayerModel
          playerData={primaryTarget}
          position={targetPositionBase}
          role="target"
          playbackTime={playbackTime}
          isAnimating={isPlaying}
          ballPosition={ballFinalPosition}
        />
      )}
    </group>
  );
};

// Scene setup with lights and controls - improving camera positioning
const Scene = ({ children }) => {
  const { camera } = useThree();
  
  // Position camera for a better view of set pieces
  useEffect(() => {
    // Position camera behind the kicker, looking toward the goal
    camera.position.set(-10, 25, 50);
    camera.lookAt(0, 0, -20);
  }, [camera]);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2.1}
        // Set better default camera angles
        target={[0, 0, -20]} // Look at the goal area
      />
      {children}
    </>
  );
};

// Main component
const Pitch3D = ({ onLocationSelect, recommendation, initialPosition }) => {
  const [highlightPosition, setHighlightPosition] = useState(initialPosition);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Update highlight position when initialPosition changes
  useEffect(() => {
    setHighlightPosition(initialPosition);
  }, [initialPosition]);
  
  // Update highlight position when recommendation changes
  useEffect(() => {
    if (recommendation && recommendation.position) {
      setHighlightPosition(recommendation.position);
    }
  }, [recommendation]);
  
  const handlePitchClick = (position) => {
    setHighlightPosition(position);
    if (typeof onLocationSelect === 'function') {
      onLocationSelect(position);
    }
  };
  
  const handleSimulateClick = () => {
    setIsPlaying(true);
  };
  
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title">
          <i className="fas fa-futbol"></i> 3D Pitch Visualization
        </h3>
        {recommendation && (
          <button 
            className="btn btn-simulate" 
            onClick={handleSimulateClick}
            disabled={isPlaying}
          >
            {isPlaying ? 'Simulating...' : 'Simulate Set Piece'}
          </button>
        )}
      </div>
      <div className="pitch-container p-0" style={{ height: '500px' }}>
        <Canvas shadows>
          <Scene>
            <FootballField 
              onClick={handlePitchClick} 
              highlightPosition={highlightPosition} 
            />
            {recommendation && (
              <SetPieceSimulation 
                recommendation={recommendation} 
                isPlaying={isPlaying} 
              />
            )}
          </Scene>
        </Canvas>
        {!recommendation && (
          <div className="pitch-instructions">
            Click anywhere on the pitch to select a set piece location
          </div>
        )}
        {/* Add controls hint */}
        <div className="controls-hint">
          ↖ Drag to rotate | Scroll to zoom | Right-click to pan
        </div>
      </div>
    </div>
  );
};

export default Pitch3D;