import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { ref } from 'vue'
import { db, isFirebaseConfigured } from '../firebase'

export type NoteStatus = 'Important' | 'Normal'

export interface Note {
  id: string
  title: string
  content: string
  category: string
  dateCreated: Timestamp | null
  status: NoteStatus
}

export interface NoteInput {
  title: string
  content: string
  category: string
  status: NoteStatus
}

const notes = ref<Note[]>([])
const loading = ref(false)
const error = ref('')
let stopListening: (() => void) | undefined

function firebaseErrorMessage(firebaseError: unknown) {
  const message = firebaseError instanceof Error ? firebaseError.message : String(firebaseError)
  if (message.includes('ERR_BLOCKED_BY_CLIENT') || message.includes('network')) {
    return 'The browser blocked Firebase. Disable your ad blocker or browser Shields for localhost, then try again.'
  }
  if (message.includes('Database') && message.includes('not found')) {
    return 'Cloud Firestore is not enabled for this Firebase project. Create the default Firestore database in Firebase Console.'
  }
  return message || 'Firebase could not complete the request.'
}

function withTimeout<T>(operation: Promise<T>) {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('The Firebase request timed out. Disable browser blocking for localhost and try again.')), 10000)),
  ])
}

export function useNotes() {
  function subscribe() {
    if (!db || !isFirebaseConfigured) {
      error.value = 'Firebase is not configured. Add your VITE_FIREBASE_* values to .env.local.'
      return
    }

    loading.value = true
    error.value = ''
    stopListening?.()
    stopListening = onSnapshot(
      query(collection(db, 'notes'), orderBy('dateCreated', 'desc')),
      (snapshot) => {
        notes.value = snapshot.docs.map((note) => ({ id: note.id, ...note.data() } as Note))
        loading.value = false
      },
      (snapshotError) => {
        error.value = firebaseErrorMessage(snapshotError)
        loading.value = false
      },
    )
  }

  async function createNote(input: NoteInput) {
    if (!db) throw new Error('Firebase is not configured.')
    await withTimeout(addDoc(collection(db, 'notes'), { ...input, dateCreated: serverTimestamp() }))
  }

  async function updateNote(id: string, input: NoteInput) {
    if (!db) throw new Error('Firebase is not configured.')
    await withTimeout(updateDoc(doc(db, 'notes', id), { ...input }))
  }

  async function deleteNote(id: string) {
    if (!db) throw new Error('Firebase is not configured.')
    await withTimeout(deleteDoc(doc(db, 'notes', id)))
  }

  return { notes, loading, error, subscribe, createNote, updateNote, deleteNote }
}