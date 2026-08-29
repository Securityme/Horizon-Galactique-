import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { signInWithGoogle } from "../authService";
import { checkCloudSqlConnection, toggleCloudSqlManualConnect, CloudSqlStatus } from "./cloudSqlService";

export interface IntegratedServiceState {
  firebase: {
    status: "connected" | "connecting" | "disconnected" | "error";
    role: "COMMANDER_ADMIN" | "OPERATOR" | "GUEST";
    user: User | null;
    autoConnected: boolean;
    lastChecked: string;
  };
  googleChat: {
    status: "connected" | "auth_required" | "disconnected" | "error";
    role: "CHAT_ADMIN" | "SPACE_MEMBER" | "VISITOR";
    accessToken: string | null;
    spaceCount: number;
    autoConnected: boolean;
    lastChecked: string;
  };
  cloudSql: CloudSqlStatus;
}

export type ServiceListener = (state: IntegratedServiceState) => void;

class IntegratedServicesManager {
  private state: IntegratedServiceState = {
    firebase: {
      status: "connecting",
      role: "GUEST",
      user: null,
      autoConnected: true,
      lastChecked: new Date().toISOString()
    },
    googleChat: {
      status: "auth_required",
      role: "VISITOR",
      accessToken: null,
      spaceCount: 1,
      autoConnected: false,
      lastChecked: new Date().toISOString()
    },
    cloudSql: {
      status: "standby",
      instanceId: "gen-lang-client-0264327066:cloudsql-4x",
      region: "europe-west2",
      database: "colony_db",
      role: "READER",
      latencyMs: 12,
      lastSyncTimestamp: new Date().toISOString()
    }
  };

  private listeners: Set<ServiceListener> = new Set();

  constructor() {
    this.initAutoConnections();
  }

  private initAutoConnections() {
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const isGoogle = currentUser.providerData.some((p) => p.providerId === "google.com");
        this.state.firebase = {
          status: "connected",
          role: isGoogle ? "COMMANDER_ADMIN" : "OPERATOR",
          user: currentUser,
          autoConnected: true,
          lastChecked: new Date().toISOString()
        };

        if (isGoogle) {
          this.state.googleChat = {
            ...this.state.googleChat,
            status: "connected",
            role: "SPACE_MEMBER",
            autoConnected: true,
            lastChecked: new Date().toISOString()
          };
        }
      } else {
        this.state.firebase = {
          status: "disconnected",
          role: "GUEST",
          user: null,
          autoConnected: false,
          lastChecked: new Date().toISOString()
        };
        this.state.googleChat.status = "auth_required";
        this.state.googleChat.role = "VISITOR";
      }
      this.notify();
    });

    checkCloudSqlConnection().then((sqlState) => {
      this.state.cloudSql = sqlState;
      this.notify();
    });
  }

  public subscribe(listener: ServiceListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): IntegratedServiceState {
    return { ...this.state };
  }

  public async connectFirebaseGoogle(): Promise<void> {
    this.state.firebase.status = "connecting";
    this.notify();
    try {
      const user = await signInWithGoogle();
      if (user) {
        this.state.firebase.status = "connected";
        this.state.firebase.user = user;
        this.state.firebase.role = "COMMANDER_ADMIN";
        this.state.googleChat.status = "connected";
        this.state.googleChat.role = "CHAT_ADMIN";
      } else {
        this.state.firebase.status = "disconnected";
      }
    } catch (err: any) {
      console.warn("Firebase connect error:", err);
      this.state.firebase.status = "disconnected";
    } finally {
      this.notify();
    }
  }

  public async disconnectFirebase(): Promise<void> {
    await signOut(auth);
    this.state.firebase = {
      status: "disconnected",
      role: "GUEST",
      user: null,
      autoConnected: false,
      lastChecked: new Date().toISOString()
    };
    this.notify();
  }

  public async connectGoogleChatManual(): Promise<boolean> {
    try {
      if (!this.state.firebase.user) {
        await this.connectFirebaseGoogle();
      }
      this.state.googleChat = {
        status: "connected",
        role: "CHAT_ADMIN",
        accessToken: this.state.googleChat.accessToken || "mock-gchat-token",
        spaceCount: 3,
        autoConnected: false,
        lastChecked: new Date().toISOString()
      };
      this.notify();
      return true;
    } catch (err) {
      this.state.googleChat.status = "error";
      this.notify();
      return false;
    }
  }

  public async toggleCloudSqlManual(connect: boolean): Promise<void> {
    this.state.cloudSql.status = "connecting";
    this.notify();
    const updated = await toggleCloudSqlManualConnect(connect);
    this.state.cloudSql = updated;
    this.notify();
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }
}

export const integratedServicesManager = new IntegratedServicesManager();
