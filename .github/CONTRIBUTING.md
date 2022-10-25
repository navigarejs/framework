# Contributing

Thanks for your interest in contributing to Navigare!

## Local development

To make local Navigare development easier, the project has been setup as a monorepo using [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/). To set it up, start by cloning the repository on your system.

```sh
git clone https://github.com/navigarejs/framework.git navigare
cd navigare
```

Next, install the dependencies. Note, Yarn will automatically install all the package dependencies at the project root and will setup the necessary symlinks.

```sh
yarn install
```

If you're making changes to one of the packages that requires a build step (e.g., `core`, `vue` or `vite`), you can setup a watcher to automatically run the build step whenever files are changed.

```sh
yarn dev
```

It's often helpful to develop Navigare within a real application. To do this, you can run use the example application which is based on Laravel. First you need to start the Laravel server:

```sh
cd packages/example
php artisan serve
```

And in a separate terminal you can start the Vite process:

```sh
cd packages/example
yarn dev
```
