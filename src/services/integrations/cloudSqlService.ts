export interface CloudSqlStatus {
  status: "active" | "standby" | "disconnected" | "connecting";
  instanceId: string;
  region: string;
  database: string;
  role: "DB_ADMIN" | "READER" | "UNCONFIGURED";
  latencyMs: number;
  lastSyncTimestamp: string | null;
}

let mockSqlStatus: CloudSqlStatus = {
  status: "standby",
  instanceId: "gen-lang-client-0264327066:cloudsql-4x",
  region: "europe-west2",
  database: "colony_db",
  role: "READER",
  latencyMs: 14,
  lastSyncTimestamp: new Date().toISOString()
};

export async function checkCloudSqlConnection(): Promise<CloudSqlStatus> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockSqlStatus = {
    ...mockSqlStatus,
    status: "active",
    latencyMs: Math.floor(Math.random() * 15) + 10,
    lastSyncTimestamp: new Date().toISOString()
  };
  return mockSqlStatus;
}

export async function toggleCloudSqlManualConnect(connect: boolean): Promise<CloudSqlStatus> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  mockSqlStatus = {
    ...mockSqlStatus,
    status: connect ? "active" : "disconnected",
    lastSyncTimestamp: connect ? new Date().toISOString() : mockSqlStatus.lastSyncTimestamp
  };
  return mockSqlStatus;
}
