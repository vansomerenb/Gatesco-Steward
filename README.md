# Gatesco Steward Partners — Website

Professional marketing website for the Gatesco, Inc. subsidiary focused on multifamily operations property management for lender-owned and foreclosed assets in Greater Houston. Messaging emphasizes Gatesco as a vertically integrated Houston operator of 10,000+ units (PM through full building rehab).

## Preview locally

```bash
cd ~/Desktop/gatesco-steward-partners
python3 -m http.server 8080
```

Open http://localhost:8080

## Pages

- `index.html` — Homepage
- `services.html` — Services overview
- `property-management.html`, `asset-management.html`, `construction.html`, `financial-reporting.html`
- `about.html`, `contact.html`

## Customization

- **Brand name**: Currently "Gatesco Steward Partners" — update across HTML files if you choose a different subsidiary name.
- **Contact email**: `info@gatescosp.com` (used site-wide).
- **Form**: Contact form is client-side demo only; connect to Formspree, Netlify Forms, or your CRM for production.
- **Images**: Stock photos (Pexels/Unsplash) styled for Houston Class B/C garden-style exteriors and modest apartment interiors. Replace with your own property photography for production.

## Deployment

**Live site:** https://gatescosp.com  
**Fallback (GitHub Pages):** https://vansomerenb.github.io/Gatesco-Steward/

The site is a static site hosted on **GitHub Pages** from this repo (`main` branch, root).

### Custom domain (gatescosp.com)

Domain is registered at **Squarespace Domains**. DNS must point at GitHub Pages:

| Type | Host | Value |
|------|------|--------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `vansomerenb.github.io` |

1. Squarespace → Domains → `gatescosp.com` → DNS / Advanced settings  
2. Remove default Squarespace parking A/CNAME records for `@` and `www`  
3. Add the records above  
4. In GitHub: repo **Settings → Pages → Custom domain** = `gatescosp.com`, enable **Enforce HTTPS** once DNS verifies  

`CNAME` in the repo root keeps the custom domain wired after deploys.