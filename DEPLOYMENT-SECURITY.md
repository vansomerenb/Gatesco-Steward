# Gatesco Steward Partners — Deployment & Security Checklist

Canonical host: **https://gatescosp.com** (apex)  
Repo: `vansomerenb/Gatesco-Steward` · GitHub Pages from `main` / root  
Registrar (per README): Squarespace Domains  

---

## 1. Code / repo changes (already done in this branch)

| Item | Status |
|------|--------|
| `CNAME` → `gatescosp.com` | Present (apex canonical) |
| `robots.txt` | Added |
| `sitemap.xml` | Added (all main marketing pages) |
| `.nojekyll` | Added (avoids Jekyll processing quirks) |
| Canonical `<link>` on every page | Apex URLs |
| CSP + referrer meta tags | Practical baseline in HTML |
| Contact form spam layers | Honeypot, blacklist, timing, rate limit, Turnstile hook |
| Internal links | Relative (work on apex and www until redirect is solid) |

Push these files to `main` so GitHub Pages deploys them before you re-check SSL.

```bash
cd gatesco-steward-partners
git add CNAME robots.txt sitemap.xml .nojekyll \
  index.html about.html services.html contact.html \
  property-management.html asset-management.html construction.html financial-reporting.html \
  js/main.js css/styles.css README.md DEPLOYMENT-SECURITY.md
git commit -m "Harden site: SEO files, CSP meta, form spam protection, deploy docs"
git push origin main
```

---

## 2. GitHub repo → Settings → Pages (required for SSL)

**Why SSL is broken today:** DNS already points at GitHub Pages, but GitHub is still serving the generic `CN=*.github.io` certificate instead of a Let’s Encrypt cert for `gatescosp.com` / `www.gatescosp.com`. Browsers correctly flag a name mismatch. **Enforce HTTPS** stays disabled or ineffective until domain verification + cert issuance succeed.

### Exact steps

1. Open **https://github.com/vansomerenb/Gatesco-Steward/settings/pages**
2. Confirm:
   - **Source**: Deploy from a branch  
   - **Branch**: `main` / `/ (root)`  
3. Under **Custom domain**:
   - Enter: `gatescosp.com`  
   - Click **Save**  
   - Wait until the DNS check shows a green check for both apex and `www` (can take a few minutes; sometimes up to 24h).  
4. If the domain was already set but cert never issued, **remove** the custom domain → **Save** → re-add `gatescosp.com` → **Save**. This forces GitHub to re-request the Let’s Encrypt certificate.  
5. After DNS check is green, enable **Enforce HTTPS**.  
   - If the checkbox is greyed out, wait and refresh; cert must exist first.  
6. Confirm `CNAME` file in the repo still contains only:
   ```
   gatescosp.com
   ```
   (GitHub rewrites this file when you change the custom domain in the UI.)

### Verify SSL (after GitHub shows HTTPS ready)

```bash
# Subject must include gatescosp.com (not only *.github.io)
echo | openssl s_client -servername gatescosp.com -connect gatescosp.com:443 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates

echo | openssl s_client -servername www.gatescosp.com -connect www.gatescosp.com:443 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

Browser: open `https://gatescosp.com` and `https://www.gatescosp.com` — padlock, no certificate warning.

### If cert still fails after 24–48h

| Check | What to do |
|-------|------------|
| DNS still correct | See section 3 |
| CAA records blocking LE | At DNS host, either remove CAA or allow `letsencrypt.org` |
| Cloudflare proxy (orange cloud) | Temporarily set A/`www` to **DNS only** (grey cloud) so GitHub can complete HTTP-01 validation, then re-enable proxy if desired |
| Old GitHub Pages conflict | Ensure no other repo claims `gatescosp.com` |

GitHub docs: [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

## 3. DNS verification steps (Squarespace Domains)

Target records for **GitHub Pages only** (no Cloudflare yet):

| Type | Host / Name | Value | TTL |
|------|-------------|-------|-----|
| A | `@` (apex) | `185.199.108.153` | 1 hour or default |
| A | `@` | `185.199.109.153` | |
| A | `@` | `185.199.110.153` | |
| A | `@` | `185.199.111.153` | |
| CNAME | `www` | `vansomerenb.github.io` | |

### Steps

1. Squarespace → **Domains** → `gatescosp.com` → **DNS** / Advanced DNS  
2. Remove parking / Squarespace website A or CNAME records for `@` and `www` that conflict  
3. Add the four A records + `www` CNAME above  
4. Do **not** point apex CNAME at GitHub (use A records only for apex)  
5. Optional: leave existing Google SPF TXT if you use Google Workspace email  

### Verify from your machine

```bash
dig +short gatescosp.com A
# Expect the four 185.199.x.x addresses (order may vary)

dig +short www.gatescosp.com CNAME
# Expect: vansomerenb.github.io.

dig +short www.gatescosp.com A
# Expect GitHub Pages IPs via the CNAME
```

**Redirect behavior:** With custom domain set to apex `gatescosp.com`, GitHub Pages redirects `www` → apex (confirmed today on HTTP). After SSL works, the same redirect should apply over HTTPS.

---

## 4. Optional but recommended: Cloudflare in front

GitHub Pages **cannot** set HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` as real HTTP headers. Meta tags in the HTML are a partial fallback only. **Cloudflare free** is the cleanest fix.

### 4A. Put the domain on Cloudflare

1. Create a free Cloudflare account → **Add site** → `gatescosp.com`  
2. Cloudflare scans DNS; keep the GitHub A + `www` CNAME records  
3. At Squarespace, replace nameservers with the two Cloudflare nameservers Cloudflare shows you  
4. Wait until Cloudflare status is **Active**  
5. SSL/TLS mode: **Full** (not Flexible) once GitHub’s own cert works; if GitHub cert is still broken, use Cloudflare **Full** only after origin is trusted, or temporarily use **Flexible** only as a last resort (not ideal)  

**Preferred path for broken origin cert:**  
- Keep DNS grey-cloud (DNS only) until GitHub issues the custom domain cert, **or**  
- Orange-cloud proxy with Cloudflare Universal SSL covering `gatescosp.com` + `www` so visitors see Cloudflare’s cert while origin SSL is repaired  

### 4B. Security headers (Transform Rules → Modify Response Header)

In Cloudflare dashboard → **Rules** → **Transform Rules** → **Modify Response Header** → Create rule:

- **Name:** `GSP security headers`  
- **When:** hostname is `gatescosp.com` OR `www.gatescosp.com`  
- **Then set** (static):

| Header | Value |
|--------|--------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `Content-Security-Policy` | See recommended CSP below |

**Recommended CSP (header version — can match/tighten the meta tag):**

```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' https://formsubmit.co; form-action https://formsubmit.co; frame-src https://challenges.cloudflare.com; upgrade-insecure-requests
```

Notes:
- `frame-ancestors` only works as an **HTTP header** (not meta).  
- After headers work in Cloudflare, you may remove the meta CSP to avoid dual policies (browsers enforce both; the intersection applies).  
- Enable **Always Use HTTPS** and **Automatic HTTPS Rewrites** in Cloudflare SSL/TLS.  
- Optional: HSTS preload only after you are sure you will stay on HTTPS for all subdomains.

### 4C. Bot / form protection on Cloudflare

1. **Security → Bots**: enable Bot Fight Mode (Free)  
2. **Security → WAF** (or custom rule): for URI path contains `contact` or destination is FormSubmit, consider **Managed Challenge** for high threat scores  
3. **Turnstile (optional UX captcha):**  
   - Cloudflare → Turnstile → add widget for `gatescosp.com`  
   - Copy site key  
   - In `contact.html`, set `data-turnstile-sitekey="YOUR_SITE_KEY"` on `#contact-form`  
   - `js/main.js` will load Turnstile automatically  
   - **Limitation:** FormSubmit does not verify Turnstile tokens. Client-side check + Cloudflare edge challenges are still useful; for full server verification, move form handling to a Worker or another backend  

### 4D. Apex vs www on Cloudflare

- Canonical remains **apex** (`gatescosp.com`)  
- Page Rule or Redirect Rule:  
  - `www.gatescosp.com/*` → `https://gatescosp.com/$1` (301)  
- GitHub already redirects www → apex; Cloudflare redirect makes it consistent and works even if Pages misbehaves  

---

## 5. Contact form notes

| Layer | Behavior |
|-------|----------|
| `_honey` honeypot | Empty field; FormSubmit discards if filled |
| `_blacklist` | Common spam phrases ignored by FormSubmit |
| Client timing | Rejects submits faster than ~3s after page load |
| Client rate limit | One real submit every 15s |
| Decoy `company_fax` | Never sent; silent fake success if filled |
| Turnstile | Optional via `data-turnstile-sitekey` |

FormSubmit first-time activation: open `https://formsubmit.co` flow or submit once and confirm the activation email at **info@gatescosp.com**.

AJAX endpoint: `https://formsubmit.co/ajax/info@gatescosp.com`  
FormSubmit’s visual reCAPTCHA does **not** apply cleanly to AJAX; do not set `_captcha` false explicitly unless you intentionally disable their remaining checks on non-AJAX forms.

---

## 6. Post-deploy verification checklist

- [ ] `https://gatescosp.com` loads with valid cert for `gatescosp.com`  
- [ ] `https://www.gatescosp.com` loads / redirects to apex with valid cert  
- [ ] **Enforce HTTPS** enabled in GitHub Pages (or Cloudflare Always HTTPS)  
- [ ] `https://gatescosp.com/robots.txt` and `/sitemap.xml` return 200  
- [ ] Contact form sends to `info@gatescosp.com`  
- [ ] Response headers include HSTS / CSP / etc. (if Cloudflare configured)  
- [ ] Submit sitemap in Google Search Console for `gatescosp.com`  

```bash
curl -sI https://gatescosp.com | head -20
curl -sI https://gatescosp.com/robots.txt | head -10
curl -sI https://gatescosp.com/sitemap.xml | head -10
```

---

## 7. What the repo cannot fix alone

| Issue | Manual action required |
|-------|------------------------|
| Let’s Encrypt cert for custom domain | GitHub Pages UI + correct DNS |
| Enforce HTTPS | GitHub UI (after cert) |
| Real security headers | Cloudflare (or other reverse proxy) |
| Registrar nameservers | Squarespace → Cloudflare if adopting CF |
| FormSubmit inbox activation | Confirm email at info@gatescosp.com |
| Turnstile site key | Create widget; paste into `contact.html` |
