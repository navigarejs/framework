<template>
  <div>
    <div class="flex flex-row justify-between">
      <div>
        <breadcrumbs />

        <page-title />
      </div>

      <div class="flex items-center">
        <push-button
          v-if="!user.deleted_at"
          :route="
            route('users.destroy', {
              user,
            })
          "
          variant="danger"
        >
          <template #icon>
            <icon
              name="trash"
              class="w-6 h-6"
            />
          </template>

          Delete
        </push-button>
      </div>
    </div>

    <card>
      <message
        :visible="!!user.deleted_at"
        variant="warning"
      >
        <template #icon>
          <icon
            name="trash"
            class="w-6 h-6"
          />
        </template>

        This user has been deleted.

        <template #action>
          <push-button
            :route="
              route('users.restore', {
                user,
              })
            "
          >
            Restore
          </push-button>
        </template>
      </message>

      <navigare-form
        :form="form"
        class="space-y-2"
      >
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label :for="form.getInputId('first_name')">First Name</label>

            <navigare-input name="first_name" />
          </div>

          <div>
            <label :for="form.getInputId('last_name')">Last Name</label>

            <navigare-input name="last_name" />
          </div>

          <div>
            <label :for="form.getInputId('email')">Email</label>

            <navigare-input
              name="email"
              type="email"
            />
          </div>

          <div>
            <label :for="form.getInputId('password')">Password</label>

            <navigare-input
              name="password"
              type="password"
            />
          </div>

          <div>
            <label :for="form.getInputId('owner')">Owner</label>

            <select-input name="owner">
              <option :value="true">yes</option>
              <option :value="false">no</option>
            </select-input>
          </div>

          <div>
            <label :for="form.getInputId('photo')">Photo</label>

            <file-input
              name="photo"
              accept="image/*"
              #default="{ value, temporaryUrl }"
            >
              <div
                class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 bg-cover"
                :style="{
                  backgroundImage:
                    temporaryUrl || value
                      ? `url(${temporaryUrl || value})`
                      : '',
                }"
              ></div>
            </file-input>
          </div>
        </div>

        <div class="flex justify-end">
          <push-button
            variant="primary"
            :processing="form.processing"
            :click="form.submit"
          >
            Update
          </push-button>
        </div>
      </navigare-form>
    </card>
  </div>
</template>

<script lang="ts" setup>
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import Card from '../../components/Card.vue'
import FileInput from '../../components/FileInput.vue'
import Icon from '../../components/Icon.vue'
import Message from '../../components/Message.vue'
import PageTitle from '../../components/PageTitle.vue'
import PushButton from '../../components/PushButton.vue'
import SelectInput from '../../components/SelectInput.vue'
import { route } from '@navigare/core'
import { createForm, NavigareInput, NavigareForm } from '@navigare/vue3'

const props = defineProps({
  user: Object,
})

const form = createForm(
  'users.create',
  route('users.update', {
    user: props.user,
  }),
  () => ({
    first_name: props.user.first_name,
    last_name: props.user.last_name,
    email: props.user.email,
    password: props.user.password,
    address: props.user.address,
    owner: props.user.owner,
    photo: props.user.photo,
  }),
  {
    onSuccess: () => {
      form.reset()
    },
  },
)
</script>
