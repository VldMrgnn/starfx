import { build, emptyDir } from "./test.ts";

main().then(console.log).catch(console.error);

async function main() {
  await emptyDir("./npm");

  const version = Deno.env.get("NPM_VERSION");
  if (!version) {
    throw new Error("NPM_VERSION is required to build npm package");
  }

  await build({
    entryPoints: [
      {
        name: ".",
        path: "mod.ts",
      },
      {
        name: "./react",
        path: "react.ts",
      },
      {
        name: "./query",
        path: "./query/mod.ts",
      },
      {
        name: "./store",
        path: "./store/mod.ts",
      },
    ],
    mappings: {
      "https://deno.land/x/effection@3.0.0-alpha.9/mod.ts": {
        name: "effection",
        version: "3.0.0-alpha.9",
      },
      "https://esm.sh/react@18.2.0?pin=v122": {
        name: "react",
        version: "^18.2.0",
        peerDependency: true,
      },
      "https://esm.sh/react-redux@8.0.5?pin=v122": {
        name: "react-redux",
        version: "^8.0.5",
        peerDependency: true,
      },
      "https://esm.sh/immer@10.0.2?pin=v122": {
        name: "immer",
        version: "^10.0.2",
      },
    },
    outDir: "./npm",
    shims: {
      deno: false,
    },
    test: false,
    typeCheck: "both",
    compilerOptions: {
      target: "ES2020",
      sourceMap: true,
      lib: ["DOM", "DOM.Iterable", "ESNext"],
    },
    package: {
      name: "starfx",
      version,
      description:
        "Async flow control and state management system for deno, node, and browser",
      license: "MIT",
      author: {
        name: "Eric Bower",
        email: "me@erock.io",
      },
      repository: {
        type: "git",
        url: "git+https://github.com/neurosnap/starfx.git",
      },
      bugs: {
        url: "https://github.com/neurosnap/starfx/issues",
      },
      engines: {
        node: ">= 18",
      },
      sideEffects: false,
    },
    postBuild() {
      Deno.copyFileSync("LICENSE.md", "npm/LICENSE.md");
      Deno.copyFileSync("README.md", "npm/README.md");
    },
  });
}
