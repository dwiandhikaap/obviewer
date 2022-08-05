# obviewer - Beatmap viewer for osu! standard

> Web based application to view an osu! standard beatmap

This repository was forked from old project of mine

## Why?

This project is just for me to learn TypeScript/JavaScript with some OOP stuff with no end-goal. ~~*(also to fill my portfolio :trollface:)*~~

## Getting Started

- First, you need to clone this repository using Git

        git clone https://github.com/siveroo/obviewer.git

    if you don't have Git, you may download the repository manually,

- Then, you need to install all the dependencies

        cd /obviewer
        npm install

### **Development**

- To start the demo or development workflow, run the command below

        npm run dev

    It uses [Vite](https://vitejs.dev/guide/why.html) under the hood both for development and build process.

    It will create a local server with the default url `localhost:3000` where you can see the demo. Every changes in the code will cause compilation and if successful, the demo page will refresh automatically.

### **Build**

- To start the build process, run the command below

        npm run build

    It will create a folder `dist` where it contains the transpiled JavaScript codes and map files with a single type definition file (`.d.ts`) where you can use it on your own TypeScript project.

    However, i haven't tested the build result in another environtment/projects, for example on a project that uses Vanilla JS, React.js, Svelte, or any other frameworks/library

## Credits

- [Danser](https://github.com/Wieku/danser-go) for some number/constants for animation timing
- [McOsu](https://github.com/McKay42/McOsu) for slider rendering stuff
- [osu!](https://github.com/ppy/osu) for most of the stuff
