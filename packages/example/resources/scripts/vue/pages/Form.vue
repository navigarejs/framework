<template>
  <div class="shadow bg-white p-4 space-y-4">
    <navigare-form
      :form="form"
      class="space-y-4"
    >
      <div>
        <label for="name"> Enter your name </label>
        <input
          id="name"
          v-model="form.values.name"
        />
        <div
          v-if="form.errors.name"
          class="text-xs text-red-500"
        >
          {{ form.errors.name }}
        </div>
      </div>

      <div class="space-x-2 flex flex-row">
        <button
          type="reset"
          :disabled="form.submitting"
        >
          Reset
        </button>

        <button
          type="submit"
          :disabled="form.submitting"
        >
          Submit
        </button>
      </div>
    </navigare-form>

    <div class="space-x-2 flex flex-row">
      <navigare-link
        as="button"
        :route="route('vue.home')"
        >Navigate to Home but preserve scroll when you click back</navigare-link
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { route } from '@navigare/core'
import { NavigareLink, createForm, NavigareForm } from '@navigare/vue3'

const form = createForm('questionnaire', route('vue.form.submit'), () => {
  return {
    name: 'julian',
  }
})
</script>
