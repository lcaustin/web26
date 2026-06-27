import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

/**
 * Firebase is used here purely as the cross-platform push notification
 * transport (FCM forwards to both Android and, via APNs, iOS). It is NOT
 * used for auth or data storage — those stay in Payload/Postgres.
 *
 * Requires a Firebase service account JSON. In the Firebase console:
 * Project Settings > Service Accounts > Generate new private key.
 * Set its contents (as a single-line JSON string) to FIREBASE_SERVICE_ACCOUNT_JSON.
 */
function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON is not set. Generate a service account key in the ' +
        'Firebase console (Project Settings > Service Accounts) and set its JSON as this env var.',
    )
  }
  return JSON.parse(raw)
}

function getFirebaseApp() {
  const existing = getApps()
  if (existing.length > 0) return existing[0]
  return initializeApp({ credential: cert(getServiceAccount()) })
}

/** Subscribes a device's FCM registration token to one ministry topic. */
export async function subscribeToTopic(token: string, topic: string) {
  const app = getFirebaseApp()
  await getMessaging(app).subscribeToTopic(token, topic)
}

/** Unsubscribes a device's FCM registration token from one ministry topic. */
export async function unsubscribeFromTopic(token: string, topic: string) {
  const app = getFirebaseApp()
  await getMessaging(app).unsubscribeFromTopic(token, topic)
}

/** Sends a push notification to every device subscribed to a ministry topic. */
export async function sendToTopic(topic: string, title: string, body: string) {
  const app = getFirebaseApp()
  return getMessaging(app).send({
    topic,
    notification: { title, body },
  })
}
