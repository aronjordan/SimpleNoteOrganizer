<template>
  <ion-page>
    <ion-header><ion-toolbar><ion-title>My notes</ion-title><ion-buttons slot="end"><ion-button aria-label="Add note" @click="openCreate">Add</ion-button></ion-buttons></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <div class="intro"><p class="eyebrow">Simple Notes Organizer</p><h1>Keep your thoughts in order.</h1><p class="muted">{{ notes.length }} {{ notes.length === 1 ? 'note' : 'notes' }} saved</p></div>
      <ion-note v-if="error" color="danger" class="message">{{ error }}</ion-note>
      <ion-list v-if="notes.length" lines="none">
        <ion-item-sliding v-for="note in notes" :key="note.id">
          <ion-item class="note-item" button detail @click="openEdit(note)">
            <ion-label><div class="note-heading"><h2>{{ note.title }}</h2><ion-badge :color="note.status === 'Important' ? 'warning' : 'medium'">{{ note.status }}</ion-badge></div><p>{{ note.content }}</p><small>{{ note.category }} · {{ formatDate(note.dateCreated) }}</small></ion-label>
          </ion-item>
          <ion-item-options side="end"><ion-item-option color="danger" @click="remove(note.id)">Delete</ion-item-option></ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <div v-else-if="!loading" class="empty"><h2>No notes yet</h2><p>Start with the ideas you want to remember.</p><ion-button @click="openCreate">Create your first note</ion-button></div>
      <ion-spinner v-else name="crescent" />
    </ion-content>
    <NoteForm :is-open="formOpen" :note="editingNote" :saving="saving" :error="error" @close="closeForm" @save="save" />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonNote, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/vue'
import NoteForm from '../components/NoteForm.vue'
import { useNotes, type Note, type NoteInput } from '../composables/useNotes'

const { notes, loading, error, subscribe, createNote, updateNote, deleteNote } = useNotes()
const formOpen = ref(false)
const editingNote = ref<Note | null>(null)
const saving = ref(false)
onMounted(subscribe)
function openCreate() { editingNote.value = null; formOpen.value = true }
function openEdit(note: Note) { editingNote.value = note; formOpen.value = true }
function closeForm() { formOpen.value = false }
async function save(input: NoteInput) { saving.value = true; error.value = ''; try { editingNote.value ? await updateNote(editingNote.value.id, input) : await createNote(input); closeForm() } catch (saveError) { error.value = saveError instanceof Error ? saveError.message : 'Unable to save note.' } finally { saving.value = false } }
async function remove(id: string) { try { await deleteNote(id) } catch (deleteError) { error.value = deleteError instanceof Error ? deleteError.message : 'Unable to delete note.' } }
function formatDate(value: Note['dateCreated']) { return value ? value.toDate().toLocaleDateString() : 'Saving...' }
</script>

<style scoped>
.intro { padding: 20px 4px 24px; }
.eyebrow { color: var(--ion-color-primary); font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
h1 { font-size: 30px; margin: 8px 0; }
.muted, small, .empty p { color: var(--ion-color-medium); }
.message { display: block; margin-bottom: 16px; }
.note-item { --background: var(--ion-color-light); --border-radius: 12px; margin-bottom: 10px; }
.note-heading { align-items: center; display: flex; gap: 10px; justify-content: space-between; }
.note-heading h2 { font-weight: 700; }
.note-item p { margin: 8px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty { padding: 72px 20px; text-align: center; }
.empty h2 { margin-bottom: 8px; }
ion-spinner { display: block; margin: 48px auto; }
</style>
