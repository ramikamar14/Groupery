import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

const bundled = [
  "cors",
  "express",
  "helmet",
  "multer",
  "nanoid",
  "nodemailer",
  "xlsx",
  "zod",
  "@kenjiuno/msgreader",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("Building client...");
  await viteBuild();

  console.log("Building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ];
  const externals = allDeps.filter((d) => !bundled.includes(d));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: { "process.env.NODE_ENV": '"production"' },
    minify: true,
    external: [
      ...externals,
      // Exclude dev-only modules from the production bundle
      "./vite.js",
      "../vite.js",
    ],
    logLevel: "info",
  });

  console.log("Build complete.");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
