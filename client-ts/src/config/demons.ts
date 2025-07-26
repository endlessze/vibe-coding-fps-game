import { DemonType, DemonConfig } from "@/types/demons";

export const DEMON_CONFIGS: Record<DemonType, DemonConfig> = {
  IMP: {
    name: "Imp",
    emoji: "👹",
    health: 1,
    speed: 20, // units per second - 60% of player speed (100)
    scale: 1.0,
    color: 0x8b4513, // Brown
    headColor: 0x654321, // Dark brown
    eyeColor: 0xff0000, // Red
    detectRange: 60,
    attackRange: 30,
    chaseRange: 8,
    attackDamage: 10,
    spawnWeight: 100,
  },
  DEMON: {
    name: "Demon",
    emoji: "🐺",
    health: 2,
    speed: 30, // units per second - 80% of player speed (faster than Imp)
    scale: 0.9,
    color: 0x4b0000, // Dark red
    headColor: 0x8b0000, // Red
    eyeColor: 0xff4400, // Orange-red
    detectRange: 70,
    attackRange: 40,
    chaseRange: 10,
    attackDamage: 15,
    spawnWeight: 60,
  },
  CACODEMON: {
    name: "Cacodemon",
    emoji: "👁️",
    health: 4,
    speed: 45, // units per second - slower but more tanky
    scale: 1.6,
    color: 0x800080, // Purple
    headColor: 0x4b0082, // Indigo
    eyeColor: 0xff0000, // Red
    detectRange: 80,
    attackRange: 60,
    chaseRange: 12,
    attackDamage: 20,
    spawnWeight: 30,
  },
  BARON: {
    name: "Baron of Hell",
    emoji: "👑",
    health: 8,
    speed: 35, // units per second - slowest but strongest
    scale: 2.2,
    color: 0x006400, // Dark green
    headColor: 0x228b22, // Forest green
    eyeColor: 0xff6600, // Bright orange
    detectRange: 100,
    attackRange: 80,
    chaseRange: 15,
    attackDamage: 35,
    spawnWeight: 5,
  },
};

export const DEMON_COUNT = 10;

// Wave generation function with progressive difficulty
export function getDemonTypesForWave(waveNumber: number): DemonType[] {
  const types: DemonType[] = [];

  // Base count increases with wave number
  const baseCount = Math.min(5 + Math.floor(waveNumber / 2), 15);
  const waveCount = Math.floor(baseCount * (1 + waveNumber * 0.1));

  // Create adjustable weights based on wave number
  const getSpawnWeight = (type: DemonType, wave: number): number => {
    const baseWeight = DEMON_CONFIGS[type].spawnWeight;

    if (wave >= 8) {
      switch (type) {
        case "IMP":
          return 40;
        case "DEMON":
          return 80;
        case "CACODEMON":
          return 70;
        case "BARON":
          return 40;
      }
    } else if (wave >= 5) {
      switch (type) {
        case "IMP":
          return 60;
        case "DEMON":
          return 80;
        case "CACODEMON":
          return 50;
        case "BARON":
          return 20;
      }
    } else if (wave >= 3) {
      switch (type) {
        case "IMP":
          return baseWeight;
        case "DEMON":
          return 80;
        case "CACODEMON":
          return 50;
        case "BARON":
          return baseWeight;
      }
    }

    return baseWeight;
  };

  const adjustedWeights = {
    IMP: getSpawnWeight("IMP", waveNumber),
    DEMON: getSpawnWeight("DEMON", waveNumber),
    CACODEMON: getSpawnWeight("CACODEMON", waveNumber),
    BARON: getSpawnWeight("BARON", waveNumber),
  };

  // Calculate total adjusted weights
  const totalWeight = Object.values(adjustedWeights).reduce(
    (sum, weight) => sum + weight,
    0
  );

  // Generate demons based on adjusted spawn weights
  for (let i = 0; i < waveCount; i++) {
    let random = Math.random() * totalWeight;

    for (const [type, weight] of Object.entries(adjustedWeights) as [
      DemonType,
      number
    ][]) {
      random -= weight;
      if (random <= 0) {
        types.push(type);
        break;
      }
    }
  }

  // Ensure at least one stronger demon per wave after wave 2
  if (waveNumber >= 3) {
    const strongTypes = types.filter(
      (t) => t === "DEMON" || t === "CACODEMON" || t === "BARON"
    );
    if (strongTypes.length === 0) {
      // Replace a random imp with a demon
      const impIndex = types.findIndex((t) => t === "IMP");
      if (impIndex !== -1) {
        types[impIndex] = waveNumber >= 5 ? "CACODEMON" : "DEMON";
      }
    }
  }

  console.log(
    `🌊 Wave ${waveNumber}: ${waveCount} demons (${types.join(", ")})`
  );
  return types;
}
