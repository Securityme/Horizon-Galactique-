import { State4XPayload } from "../../types/state";
import { TurnNarrative } from "../../lib/contracts";

export class DirectorService {
  /**
   * Orchestrates a narrative turn update using Gemini.
   */
  async orchestrateTurn(gameState: State4XPayload, lastActionLabel?: string): Promise<TurnNarrative | null> {
    try {
      const response = await fetch("/api/narrative/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState,
          context: { lastActionLabel }
        }),
      });

      if (!response.ok) throw new Error("Failed to orchestrate narrative");

      const data = await response.json();
      return data as TurnNarrative;
    } catch (error) {
      console.error("Director Service Error:", error);
      return null;
    }
  }
}

export const directorService = new DirectorService();
