<template>
  <div
    class="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <navigare-head>
      <title>{{ breadcrumbs.title }}</title>
    </navigare-head>

    <div class="w-full max-w-md space-y-8">
      <div>
        <img
          class="mx-auto h-12 w-auto"
          src="https://raw.githubusercontent.com/navigarejs/framework/main/assets/logo.svg"
          alt="Navigare"
        />
        <h2
          class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900"
        >
          Sign in to your account
        </h2>
      </div>

      <navigare-form
        class="mt-8 space-y-6"
        :form="form"
      >
        <input
          type="hidden"
          name="remember"
          value="true"
        />
        <div class="-space-y-px rounded-md shadow-sm">
          <div class="my-2">
            Use
            <q
              @click="form.values.email = 'johndoe@example.com'"
              class="cursor-pointer"
              >johndoe@example.com</q
            >
            and
            <q
              @click="form.values.password = 'secretpassword'"
              class="cursor-pointer"
              >secretpassword</q
            >
            to sign in.
          </div>

          <div>
            <label
              :for="form.getInputId('email')"
              class="sr-only"
              >Email address</label
            >
            <navigare-input
              name="email"
              type="email"
              autocomplete="email"
              class="relative block w-full appearance-none rounded-none rounded-t-md"
              placeholder="Email address"
            />
          </div>

          <div>
            <label
              :for="form.getInputId('password')"
              class="sr-only"
              >Password</label
            >
            <navigare-input
              name="password"
              type="password"
              autocomplete="current-password"
              class="transition-all relative block w-full appearance-none rounded-none rounded-b-md"
              placeholder="Password"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <navigare-input
              name="remember"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            <label
              :for="form.getInputId('remember')"
              class="ml-2 block text-sm text-gray-900"
              >Remember me</label
            >
          </div>

          <!--
              <div class="text-sm">
              <a
                href="#"
                class="font-medium text-indigo-600 hover:text-indigo-500"
                >Forgot your password?</a
              >
            </div>
          -->
        </div>

        <div>
          <push-button
            :processing="form.processing"
            :click="form.submit"
            variant="primary"
            class="w-full"
          >
            <template #icon>
              <icon
                name="locked"
                class="h-4 w-4 text-indigo-500 group-hover:text-indigo-400"
              />
            </template>

            Sign in
          </push-button>
        </div>
      </navigare-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '../components/Icon.vue'
import PushButton from '../components/PushButton.vue'
import useBreadcrumbs from '../compositions/useBreadcrumbs'
import { RawRouteParameters, route } from '@navigare/core'
import {
  NavigareHead,
  NavigareInput,
  NavigareForm,
  createForm,
} from '@navigare/vue3'

const breadcrumbs = useBreadcrumbs()

const form = createForm(
  'login',
  route('auth.login.store'),
  {
    email: 'johndoe@example.com',
    password: '',
    remember: true,
  },
  {
    validation: true,
  },
)
</script>
