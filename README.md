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
- **Contact email**: Replace `institutional@gatescosteward.com` with your real address.
- **Form**: Contact form is client-side demo only; connect to Formspree, Netlify Forms, or your CRM for production.
- **Images**: Stock photos (Pexels/Unsplash) styled for Houston Class B/C garden-style exteriors and modest apartment interiors. Replace with your own property photography for production.

## Deployment

Upload the folder to any static host (Netlify, Vercel, AWS S3, GoDaddy, etc.) or integrate into WordPress/Divi like the parent Gatesco site.