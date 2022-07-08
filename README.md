# obviewer - Beatmap viewer for osu! standard
- Web based application to view an osu! standard beatmap

\
This code was migrated from an old repository of mine called `replaytale-core` which is an osu! Replay Utility where you can watch, analyze, or even edit your replay.
\
\
However, since it requires an implementation for the gameplay mechanics/osu! rulesets _(which is honesty really painful to imitate)_, 
it really took a long time to get it right. Since i also don't have a lot of free time, i don't really want to continue it.
\
\
Fast forward 2 months later, i decided to finish it but as a beatmap viewer, since it's a lot simpler\
~~*also i need something to fill my portofolio*~~ :trollface:

## Getting Started

- First, you need to clone this repository using Git

		git clone https://github.com/siveroo/obviewer.git

	if you don't have Git, you may download the repository manually,

- Then, you need to install all the dependencies 

		npm install

#### Development
- To start the demo or development workflow, run the command below

		npm run dev

	It will create a local server with the default url `localhost:3000` where you can see the demo. Every changes in the `/src` folder will cause compilation and if successful, the demo page will refresh automatically.

#### Build
- To start the build process, run the command below

		npm run build

	It will create a folder `build` where it contains the compiled JavaScript code and map files with a single type definition file (`.d.ts`) where you can use it on your own project.
	
	However, i haven't tested the build result in another environtment/projects, for example on a project that uses Vanilla JS, React.js, Svelte, or any other frameworks/library
