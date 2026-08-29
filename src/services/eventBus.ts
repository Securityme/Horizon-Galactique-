/**
 * Global Event Bus (Pub/Sub pattern)
 * Enables decoupled communication between engines (Governance, Chronicle, 4X, UI, Audio)
 */

type EventHandler<T = any> = (data: T) => void;

export enum GameEventType {
  // 4X Engine & Territory Events
  TURN_STARTED = "TURN_STARTED",
  TURN_RESOLVED = "TURN_RESOLVED",
  BUILDING_BUILT = "BUILDING_BUILT",
  RESOURCE_UPDATED = "RESOURCE_UPDATED",
  
  // Governance & NIA Events
  GOVERNANCE_POLICY_CHANGED = "GOVERNANCE_POLICY_CHANGED",
  NIA_CYCLE_EXECUTED = "NIA_CYCLE_EXECUTED",
  CRISIS_DETECTED = "CRISIS_DETECTED",
  
  // Chronicle & Narrative Events
  ERA_ADVANCED = "ERA_ADVANCED",
  CHRONICLE_TURN_ARCHIVED = "CHRONICLE_TURN_ARCHIVED",
  NARRATIVE_GENERATED = "NARRATIVE_GENERATED",
  
  // UI & Audio
  UI_NOTIFICATION = "UI_NOTIFICATION",
  AUDIO_TRIGGER = "AUDIO_TRIGGER",
}

class EventBus {
  private handlers: Map<GameEventType, EventHandler[]> = new Map();
  private history: { type: GameEventType; timestamp: number; data: any }[] = [];
  private maxHistorySize = 50;

  /**
   * Subscribe to a game event. Returns an unsubscribe function.
   */
  on<T>(type: GameEventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
    
    return () => {
      this.off(type, handler);
    };
  }

  /**
   * Unsubscribe a handler from a game event.
   */
  off<T>(type: GameEventType, handler: EventHandler<T>): void {
    const list = this.handlers.get(type);
    if (list) {
      this.handlers.set(type, list.filter(h => h !== handler));
    }
  }

  /**
   * Emit a game event with payload across the decoupled system.
   */
  emit<T>(type: GameEventType, data: T): void {
    // Record history for debugging/telemetry
    this.history.unshift({ type, timestamp: Date.now(), data });
    if (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }

    const list = this.handlers.get(type);
    if (list) {
      // Execute handlers safely
      list.forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[EventBus] Error in handler for ${type}:`, err);
        }
      });
    }
  }

  /**
   * Get recent event history for debugging.
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear all handlers.
   */
  clear(): void {
    this.handlers.clear();
    this.history = [];
  }
}

export const eventBus = new EventBus();
