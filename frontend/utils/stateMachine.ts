export type WorkoutState = 'UP' | 'DOWN' | 'TRANSITION';

export interface ExerciseConfig {
  upThreshold: number;
  downThreshold: number;
  joint: 'knee' | 'elbow' | 'hip' | 'shoulder';
}

export const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  squat: {
    upThreshold: 150, // More forgiving standing angle
    downThreshold: 110, // More realistic depth for diverse camera angles
    joint: 'knee',
  },
  bicep_curl: {
    upThreshold: 150,
    downThreshold: 45, // More forgiving bottom angle
    joint: 'elbow',
  },
  pushup: {
    upThreshold: 150,
    downThreshold: 100,
    joint: 'elbow',
  }
};

export class RepCounter {
  state: WorkoutState = 'UP';
  count: number = 0;
  config: ExerciseConfig;
  angleHistory: number[] = [];
  smoothingWindow: number = 5;

  constructor(exercise: string) {
    this.config = EXERCISE_CONFIGS[exercise] || EXERCISE_CONFIGS.squat;
  }

  update(rawAngle: number): number {
    this.angleHistory.push(rawAngle);
    if (this.angleHistory.length > this.smoothingWindow) {
      this.angleHistory.shift();
    }
    
    // Calculate Low-Pass Filter Average
    const smoothedAngle = this.angleHistory.reduce((a, b) => a + b, 0) / this.angleHistory.length;

    // Use Hysteresis Logic with Smooth Data
    if (this.state === 'UP' && smoothedAngle < this.config.downThreshold) {
      this.state = 'DOWN';
    } else if (this.state === 'DOWN' && smoothedAngle > this.config.upThreshold) {
      this.state = 'UP';
      this.count += 1;
    }
    return this.count;
  }

  reset() {
    this.count = 0;
    this.state = 'UP';
  }
}
