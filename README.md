# Gatesco Steward Partners — Website

Professional marketing website for the Gatesco, Inc. subsidiary focused on multifamily operations property management for lender-owned and foreclosed assets in Greater Houston. Messaging emphasizes Gatesco as a vertically integrated Houston operator of 10,000+ units (PM through full building rehab).

**Live site:** https://gatescosp.com  
**Fallback (GitHub Pages):** https://vansomerenb.github.io/Gatesco-Steward/

## Preview locally

```bash
cd gatesco-steward-partners
python3 -m http.server 8080
```

Open http://localhost:8080

## Pages

- `index.html` — Homepage
- `services.html` — Services overview
- `property-management.html`, `asset-management.html`, `construction.html`, `financial-reporting.html`
- `about.html`, `contact.html`

## Site configuration files

| File | Purpose |
|------|---------|
| `CNAME` | GitHub Pages custom domain (`gatescosp.com`, apex canonical) |
| `robots.txt` | Crawler rules + sitemap pointer |
| `sitemap.xml` | All main marketing URLs |
| `.nojekyll` | Skip Jekyll processing on GitHub Pages |
| `DEPLOYMENT-SECURITY.md` | Full SSL, DNS, and Cloudflare checklist |

## Contact form

Posts via [FormSubmit](https://formsubmit.co) AJAX to `info@gatescosp.com`.

Spam protection layers:

- Honeypot (`_honey`) + FormSubmit phrase blacklist
- Client-side minimum fill time and submit rate limit (`js/main.js`)
- Optional Cloudflare Turnstile via `data-turnstile-sitekey` on the form

On first use, FormSubmit emails that inbox an activation link — confirm it before live submissions arrive.

## Customization

- **Brand name**: Currently "Gatesco Steward Partners" — update across HTML files if you choose a different subsidiary name.
- **Contact email**: `info@gatescosp.com` (used site-wide).
- **Images**: Replace stock photography with property photos for production as needed.

## Deployment

Static site on **GitHub Pages** from this repo (`main` branch, root).

### Custom domain (gatescosp.com)

Canonical host is the **apex** (`gatescosp.com`). `www` should redirect to apex.

DNS at the registrar (Squarespace Domains) must point at GitHub Pages:

| Type | Host | Value |
|------|------|--------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `vansomerenb.github.io` |

1. Squarespace → Domains → `gatescosp.com` → DNS  
2. Remove conflicting parking records for `@` and `www`  
3. Add the records above  
4. GitHub → repo **Settings → Pages → Custom domain** = `gatescosp.com`  
5. When DNS check is green, enable **Enforce HTTPS**  

If browsers show a certificate for `*.github.io` instead of `gatescosp.com`, re-save the custom domain and follow **`DEPLOYMENT-SECURITY.md`** (section 2).

### Security headers

GitHub Pages cannot set HSTS / CSP / frame-options headers. Preferred approach: put **Cloudflare** in front and add response headers there. Full steps are in **`DEPLOYMENT-SECURITY.md`**.
