DOMAINE: integrations
STRATE: -2 (Local-First & CRDT I/O)
DESC: Persistance IndexedDB, deltas et outbox pattern.
EXPORTS: CloudSqlStatus, checkCloudSqlConnection, toggleCloudSqlManualConnect, CommunityMessage, subscribeToCommunityChat, sendCommunityMessage, sendGoogleChatMessage, IntegratedServiceState, ServiceListener, integratedServicesManager
DEPS: ../../lib/firebase, ../firebase, ./cloudSqlService, firebase/auth, firebase/firestore
