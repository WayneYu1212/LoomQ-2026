# LoomQ existing competition site: public deployment

## Scope

Ship the competition-period LoomQ Web site as a public, static-safe deployment at `https://loomq.yuyuying.com/`. The source of truth is `3f8d8e65314e6a920a17bc611e8ab1e90aa328d7`, specifically `starter_kit/loomq/web/static/index.html`, `styles.css`, and `app.js`.

The abandoned `post-competition-showcase` branch and its `showcase/` files are out of scope and must not be copied, merged, pushed, or deployed. The original site structure, visual language, learning flow, copy, controls, and responsive behavior remain unchanged except for the smallest public-mode and deployment adaptations.

## Implementation tasks

1. Establish evidence and baseline
   - Verify the public worktree is clean, on `post-competition-public-web`, and rooted at the source SHA above.
   - Run the existing Web asset, Web server, and pedagogy contract tests; record environment-only failures separately from code regressions.
   - Inventory the existing experiment form, Bell response renderer, Agent prompt cards, archived hardware section, anchors, and bilingual hooks.

2. Add public-mode regression tests before implementation
   - Test that the public build copies only the existing static Web source and contains the original Hero/section markers.
   - Test public-mode activation, absence of localhost/private-model/QPU requests, deterministic Bell replay labeling, Agent safe fallback, preserved archived hardware facts, exact X/Y/Z and tomography values, bilingual markers, canonical URL, CSP, and Vercel output configuration.
   - Keep local Python API behavior and existing Web contracts covered.

3. Implement the minimum public adapter
   - Add a build script that copies the existing static site into `dist/`, injects only a public-mode marker and minimal metadata, and never imports or references `showcase/`.
   - Gate runtime health and experiment network calls in public mode so the public page never calls localhost, private model endpoints, SpinQ/OriginQ/Braket services, or secrets.
   - Render a deterministic, clearly labeled Bell replay through the existing result workspace and preserve the existing local API path outside public mode.
   - Give Agent example prompts deterministic archived/demo responses or a safe no-model explanation; free-form public input must not issue a model request.
   - Keep real hardware and tomography as archived evidence with truthful labels; do not run new hardware jobs.

4. Add deployment configuration and verification
   - Add the minimal Vercel build/output configuration, canonical URL, and security headers compatible with the original site’s external assets and dynamic visual updates.
   - Run public tests, original Web contracts, JavaScript syntax validation, secret scans, and the public build.
   - Serve `dist/` locally and inspect 1440×900, 1280×800, 390×844, and 430×932. Verify anchors, Bell replay, Agent fallback, OpenQASM, hardware evidence, X/Y/Z, tomography, language toggle, no overflow, and no console errors.

5. Release only after local gates pass
   - Commit only the public worktree changes on `post-competition-public-web`.
   - If GitHub/Vercel browser authentication is required, pause for the user’s official browser action; never request or paste credentials.
   - Push the public branch, deploy a Vercel Preview, complete Preview QA, then promote to Production, attach/verify `loomq.yuyuying.com`, and perform live HTTP/DOM/asset/network QA.
   - Do not push or deploy the abandoned showcase branch, and do not touch the original dirty checkout.

## Acceptance evidence

The final report must include the exact source SHA/path, public branch/head, abandoned-branch status, public-mode behavior for Bell/Agent/hardware, original-UI preservation, test/build/syntax/secret results, localhost request count, console errors, mobile overflow, Preview URL, production deployment, custom-domain HTTP status, known limitations, and any manual-auth gate.
