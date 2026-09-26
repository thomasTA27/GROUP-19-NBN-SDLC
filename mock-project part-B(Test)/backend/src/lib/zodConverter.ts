import type {
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore'
import type { ZodType } from 'zod'

/**
 * Creates a typed Firestore data converter backed by a Zod schema.
 *
 * Supports lazy migration: if the stored _schemaVersion is behind currentVersion,
 * the migrate function is called before schema validation.
 *
 * Example:
 *   const userSchema = z.object({ uid: z.string(), email: z.string(), _schemaVersion: z.literal(1) })
 *   const userConverter = createZodConverter(userSchema, 1)
 *   const userRef = adminDb.collection('users').doc(uid).withConverter(userConverter)
 */
export function createZodConverter<T extends { _schemaVersion: number }>(
  schema: ZodType<T>,
  currentVersion: number,
  migrate?: (data: Record<string, unknown>, fromVersion: number) => Record<string, unknown>,
): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T): DocumentData {
      return data as DocumentData
    },

    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const raw = snapshot.data() as Record<string, unknown>
      const storedVersion = typeof raw['_schemaVersion'] === 'number' ? raw['_schemaVersion'] : 0

      const migrated =
        storedVersion < currentVersion && migrate ? migrate(raw, storedVersion) : raw

      const result = schema.safeParse(migrated)
      if (!result.success) {
        throw new Error(
          `Firestore schema validation failed at ${snapshot.ref.path}: ${result.error.message}`,
        )
      }
      return result.data
    },
  }
}
