# Setup

## GitHub Pages

Upload:
- index.html
- teams.json
- favicon.svg
- .nojekyll
- README.md

Do not upload secrets.

## Cloudflare Worker

Cloudflare Workers can be used even if your website is on GitHub Pages.
The Worker is just a small backend URL that the GitHub Pages site calls.

1. Go to Cloudflare Dashboard.
2. Workers & Pages.
3. Create Worker.
4. Paste `worker.js`.
5. Add environment variables/secrets:
   - GITHUB_TOKEN
   - GITHUB_REPO = username/repo-name
   - GITHUB_BRANCH = main
   - ADMIN_SHARED_SECRET
   - ALLOWED_ORIGIN = your GitHub Pages origin, for example https://username.github.io
6. Deploy Worker.
7. Copy Worker URL.
8. Put that URL in index.html where it says PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE.
9. Put the same ADMIN_SHARED_SECRET in index.html where it says SET_THE_SAME_SECRET_IN_CLOUDFLARE_WORKER.

Warning: if ADMIN_SHARED_SECRET is in frontend code, it is visible. For stronger security, the Worker should handle a proper login instead.
