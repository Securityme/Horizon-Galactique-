import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "../../lib/firebase";

export interface CommunityMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderAvatar: string | null;
  text: string;
  createdAt: string;
  serviceSource: "COMMUNITY" | "GOOGLE_CHAT" | "SYSTEM";
  spaceId?: string;
}

const COMMUNITY_COLLECTION = "community_messages";

export function subscribeToCommunityChat(
  callback: (messages: CommunityMessage[]) => void
): () => void {
  try {
    const q = query(
      collection(db, COMMUNITY_COLLECTION),
      orderBy("createdAt", "asc"),
      limit(50)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: CommunityMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let timeStr = new Date().toLocaleTimeString();
          if (data.createdAt && typeof data.createdAt.toDate === "function") {
            timeStr = data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } else if (typeof data.createdAt === "string") {
            timeStr = new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }

          msgs.push({
            id: docSnap.id,
            senderUid: data.senderUid || "anon",
            senderName: data.senderName || "Commandant",
            senderAvatar: data.senderAvatar || null,
            text: data.text || "",
            createdAt: timeStr,
            serviceSource: data.serviceSource || "COMMUNITY",
            spaceId: data.spaceId
          });
        });
        callback(msgs);
      },
      (error) => {
        console.warn("Firestore Community Chat subscription fallback:", error);
        callback(getFallbackMessages());
      }
    );
  } catch (err) {
    console.warn("Firestore Chat error:", err);
    callback(getFallbackMessages());
    return () => {};
  }
}

export async function sendCommunityMessage(
  user: User | null,
  text: string,
  source: "COMMUNITY" | "GOOGLE_CHAT" = "COMMUNITY"
): Promise<boolean> {
  if (!text.trim()) return false;

  const payload = {
    senderUid: user?.uid || "guest-" + Math.random().toString(36).substring(2, 6),
    senderName: user?.displayName || user?.email?.split("@")[0] || "Commandant Invité",
    senderAvatar: user?.photoURL || null,
    text: text.trim(),
    createdAt: serverTimestamp(),
    serviceSource: source
  };

  try {
    await addDoc(collection(db, COMMUNITY_COLLECTION), payload);
    return true;
  } catch (err) {
    console.error("Error sending community message:", err);
    return false;
  }
}

export async function sendGoogleChatMessage(
  accessToken: string | null,
  spaceName: string,
  messageText: string
): Promise<{ success: boolean; details?: string }> {
  if (!accessToken) {
    return {
      success: false,
      details: "Jeton OAuth Google Chat requis. Reconnectez-vous via Google Auth."
    };
  }

  try {
    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: messageText })
    });

    if (res.ok) {
      return { success: true, details: "Message envoyé dans Google Chat !" };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        details: errData.error?.message || `Erreur HTTP ${res.status}`
      };
    }
  } catch (err: any) {
    return { success: false, details: err.message || "Erreur de connexion Google Chat" };
  }
}

function getFallbackMessages(): CommunityMessage[] {
  return [
    {
      id: "sys-1",
      senderUid: "sys",
      senderName: "IA Conseiller Nexus",
      senderAvatar: null,
      text: "Canal communautaire actif. Bienvenue dans le réseau de colonisation intersidérale.",
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      serviceSource: "SYSTEM"
    },
    {
      id: "sys-2",
      senderUid: "sys-2",
      senderName: "Google Chat Bot",
      senderAvatar: null,
      text: "Google Chat API prêt pour l'intégration des espaces de travail.",
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      serviceSource: "GOOGLE_CHAT"
    }
  ];
}
