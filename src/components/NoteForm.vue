<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ note ? 'Edit note' : 'New note' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Close form" @click="close">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form class="note-form" @submit.prevent="submit">
        <ion-item>
          <ion-input v-model="form.title" label="Title" label-placement="stacked" placeholder="Meeting ideas" required />
        </ion-item>
        <ion-item>
          <ion-textarea v-model="form.content" label="Content" label-placement="stacked" :auto-grow="true" placeholder="Write your note..." required />
        </ion-item>
        <ion-item>
          <ion-input v-model="form.category" label="Category" label-placement="stacked" placeholder="School, work, personal" required />
        </ion-item>
        <ion-item>
          <ion-select v-model="form.status" label="Status" label-placement="stacked">
            <ion-select-option value="Normal">Normal</ion-select-option>
            <ion-select-option value="Important">Important</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-note v-if="error" color="danger" class="form-error">{{ error }}</ion-note>
        <ion-button class="save-button" type="submit" expand="block" :disabled="saving">
          {{ saving ? 'Saving...' : note ? 'Save changes' : 'Create note' }}
        </ion-button>
      </form>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonModal, IonNote, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/vue'
import type { Note, NoteInput } from '../composables/useNotes'

const props = defineProps<{ isOpen: boolean; note: Note | null; saving: boolean; error: string }>()
const emit = defineEmits<{ close: []; save: [input: NoteInput] }>()
const form = reactive<NoteInput>({ title: '', content: '', category: '', status: 'Normal' })

watch(() => props.note, (note) => Object.assign(form, note ? { title: note.title, content: note.content, category: note.category, status: note.status } : { title: '', content: '', category: '', status: 'Normal' }), { immediate: true })

function close() { emit('close') }
function submit() {
  if (form.title.trim() && form.content.trim() && form.category.trim()) emit('save', { ...form, title: form.title.trim(), content: form.content.trim(), category: form.category.trim() })
}
</script>

<style scoped>
.note-form { display: grid; gap: 16px; }
.save-button { margin-top: 8px; }
.form-error { display: block; line-height: 1.4; }
</style>