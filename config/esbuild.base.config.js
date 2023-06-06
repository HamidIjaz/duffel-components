module.exports = {
  entryPoints: [
    {
      out: "index",
      in: "src/components/DuffelAncillariesCustomElement.tsx",
    },
    { out: "global", in: "src/styles/global.css" },
  ],
  bundle: true,
  minify: true,
  sourcemap: true,
  treeShaking: true,
  outdir: "dist/ancillaries",
};
