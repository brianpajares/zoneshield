"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type EngineResult, extractUrl, score } from "@/lib/engine";
import type { Locale, Messages } from "@/lib/i18n/messages";

type Props = { locale: Locale; messages: Messages };
type Plan = "personal" | "family" | "recovery";

function ShieldMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark${small ? " brand-mark--small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 40 44" fill="none" aria-hidden="true">
        <path d="M20 2.5 35 8v11.2c0 10.1-6.1 18.1-15 22.3C11.1 37.3 5 29.3 5 19.2V8l15-5.5Z" fill="currentColor" />
        <path
          d="m13 21.3 4.4 4.4L27.5 15.5"
          stroke="white"
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function MiniIcon({ kind }: { kind: "arrow" | "lock" | "check" | "spark" | "link" | "family" }) {
  const paths = {
    arrow: (
      <>
        <path d="M7 17 17 7M8 7h9v9" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    spark: (
      <>
        <path d="m12 3 1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-2.5L12 3Z" />
        <path d="m19 15 1 2.5 2 1-2 1L19 22l-1-2.5-2-1 2-1 1-2.5Z" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" />
      </>
    ),
    family: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20a6 6 0 0 1 12 0M15 15a5 5 0 0 1 6 5" />
      </>
    ),
  };
  return (
    <svg
      className="mini-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  );
}

function RiskIcon({ band }: { band: EngineResult["band"] }) {
  if (band === "alto") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3 2.9 19a1.4 1.4 0 0 0 1.2 2.1h15.8a1.4 1.4 0 0 0 1.2-2.1L12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 9v5m0 3h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (band === "sospechoso") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v6m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function sampleMessage(locale: Locale, index: number): string {
  const samples: Record<Locale, string[]> = {
    es: [
      "Mamá, cambié de número. Estoy en problemas, yapeame 300 soles urgente y no le digas a nadie.",
      "Tu cuenta será bloqueada. Verifica tus datos ahora: https://bancoandin0-seguro.top/login",
      "¡Ganaste un premio! Ingresa tu clave y paga el envío hoy mismo.",
    ],
    en: [
      "Mom, I changed my number. I'm in trouble. Can you wire money urgently and keep it secret?",
      "Your account is suspended. Enter your password immediately: https://secure-login.click/verify",
      "You won a prize! Enter your password and pay the delivery fee today.",
    ],
    pt: [
      "Mãe, troquei de número. Estou com problemas. Você pode fazer um Pix urgente e não contar a ninguém?",
      "Sua conta será bloqueada. Confirme seus dados agora: https://bancoandin0-seguro.top/login",
      "Você ganhou um prêmio! Informe sua senha e pague a entrega hoje.",
    ],
  };
  return samples[locale][index];
}

export default function ZoneShieldApp({ locale, messages: m }: Props) {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<EngineResult | null>(null);
  const [error, setError] = useState("");
  const [shareState, setShareState] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const actionSteps = useMemo(() => {
    if (!result || result.band === "bajo") return m.actionLow as string[];
    return result.band === "alto" ? (m.actionHigh as string[]) : (m.actionMedium as string[]);
  }, [m, result]);

  function runCheck(value = message) {
    const cleanValue = value.trim();
    setError("");
    setShareState("");
    if (!cleanValue) {
      setResult(null);
      setError(m.errorEmpty as string);
      return;
    }
    const extracted = extractUrl(cleanValue);
    setResult(score({ message: cleanValue, url: extracted, domain_age_days: extracted ? null : undefined }));
    window.setTimeout(
      () => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
      0,
    );
  }

  function chooseExample(index: number) {
    const sample = sampleMessage(locale, index);
    setMessage(sample);
    runCheck(sample);
  }

  function clearCheck() {
    setMessage("");
    setResult(null);
    setError("");
    setShareState("");
  }

  function navigateTo(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function shareAlert() {
    if (!result) return;
    const bandText = result.band === "alto" ? m.bandHigh : result.band === "sospechoso" ? m.bandMedium : m.bandLow;
    const domainText = result.registrable_domain ? ` ${m.domainLabel}: ${result.registrable_domain}.` : "";
    const shareText = `ZoneShield: ${bandText}.${domainText} ${m.disclaimer}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "ZoneShield", text: shareText });
        setShareState(m.copied as string);
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setShareState(m.copied as string);
    } catch {
      setShareState(m.shareError as string);
    }
  }

  function choosePlan(plan: Plan) {
    setSelectedPlan(plan);
    document.getElementById("planes")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const bandTitle = result?.band === "alto" ? m.bandHigh : result?.band === "sospechoso" ? m.bandMedium : m.bandLow;
  const reasons = (m.reasons ?? {}) as Record<string, string>;
  const stepCards = m.howSteps as Array<{ title: string; body: string }>;
  const faqItems = m.faqItems as Array<{ title: string; body: string }>;
  const year = new Date().getFullYear();

  return (
    <>
      <header className="site-header">
        <div className="header-inner wrap">
          <Link className="brand" href={`/${locale}`}>
            <ShieldMark />
            <span className="brand-word">
              Zone<span>Shield</span>
              <small>by Zone Digital</small>
            </span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={m.menuLabel as string}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">{m.menuLabel as string}</span>
            <span />
            <span />
          </button>
          <nav
            id="main-navigation"
            className={`main-nav${menuOpen ? " main-nav--open" : ""}`}
            aria-label={m.navigationLabel as string}
          >
            <button className="nav-link" type="button" onClick={() => navigateTo("como-funciona")}>
              {m.navHow as string}
            </button>
            <button className="nav-link" type="button" onClick={() => navigateTo("planes")}>
              {m.navPlans as string}
            </button>
            <button className="nav-link" type="button" onClick={() => navigateTo("guia")}>
              {m.navGuide as string}
            </button>
            <div className="language-switch">
              {(["es", "en", "pt"] as Locale[]).map((code) => (
                <Link
                  key={code}
                  href={`/${code}`}
                  aria-current={locale === code ? "page" : undefined}
                  className={locale === code ? "language-active" : ""}
                >
                  {code.toUpperCase()}
                </Link>
              ))}
            </div>
            <button className="button button--nav" type="button" onClick={() => navigateTo("verificar")}>
              {m.navStart as string}
              <MiniIcon kind="arrow" />
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section" id="inicio">
          <div className="hero-grid wrap">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                {m.heroEyebrow as string}
              </div>
              <h1>
                {(m.heroTitle as string).split("\n").map((line, index) => (
                  <span key={line}>
                    {index === 1 ? (
                      <>
                        <em>{line.split(" ")[0]}</em>
                        {` ${line.split(" ").slice(1).join(" ")}`}
                      </>
                    ) : (
                      line
                    )}
                    <br />
                  </span>
                ))}
              </h1>
              <p className="hero-intro">{m.heroBody as string}</p>
              <div className="hero-actions">
                <a className="button button--primary" href="#verificar">
                  {m.heroPrimary as string}
                  <MiniIcon kind="arrow" />
                </a>
                <a className="text-link" href="#planes">
                  {m.heroSecondary as string}
                  <MiniIcon kind="arrow" />
                </a>
              </div>
              <div className="trust-row">
                <span>
                  <MiniIcon kind="lock" />
                  {m.trustLocal as string}
                </span>
                <span>
                  <MiniIcon kind="check" />
                  {m.trustNoAccount as string}
                </span>
                <span>
                  <MiniIcon kind="family" />
                  {m.trustFamily as string}
                </span>
              </div>
              <div className="hero-footnote">
                <span className="footnote-star">✳</span>
                <span>{m.checkerEyebrow as string}</span>
              </div>
            </div>

            <section className="checker-card" id="verificar" aria-labelledby="checker-heading">
              <div className="checker-card-top">
                <div>
                  <span className="section-kicker">{m.resultEyebrow as string}</span>
                  <h2 id="checker-heading">{m.checkerTitle as string}</h2>
                </div>
                <div className="checker-shield">
                  <ShieldMark small />
                </div>
              </div>
              <p className="checker-copy">{m.checkerBody as string}</p>
              <label className="input-label" htmlFor="message-input">
                {m.inputLabel as string}
              </label>
              <textarea
                id="message-input"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setError("");
                  setResult(null);
                  setShareState("");
                }}
                placeholder={m.inputPlaceholder as string}
                maxLength={5000}
                rows={5}
                aria-invalid={Boolean(error)}
                aria-describedby={`input-tip privacy-note${error ? " message-error" : ""}`}
              />
              <div className="input-meta">
                <span id="input-tip">{m.inputHint as string}</span>
                <span>{message.length}/5000</span>
              </div>
              <div className="form-actions">
                <button className="button button--primary button--wide" type="button" onClick={() => runCheck()}>
                  <MiniIcon kind="spark" />
                  {m.analyze as string}
                </button>
                <button className="button button--quiet" type="button" onClick={clearCheck}>
                  {m.clear as string}
                </button>
              </div>
              <p className="privacy-note" id="privacy-note">
                <MiniIcon kind="lock" />
                {m.privacyNote as string}
              </p>
              {error && (
                <p className="form-error" id="message-error" role="alert">
                  {error}
                </p>
              )}

              <div className="example-row">
                <span className="example-label">{m.examplesTitle as string}</span>
                {(m.examples as string[]).map((example, index) => (
                  <button key={example} className="example-chip" type="button" onClick={() => chooseExample(index)}>
                    {example}
                    <MiniIcon kind="arrow" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="results-section wrap" id="resultado" aria-live="polite" aria-atomic="true">
          {result ? (
            <div className={`result-card result-card--${result.band}`}>
              <div className="result-main">
                <div className="result-heading-row">
                  <div className={`risk-icon risk-icon--${result.band}`}>
                    <RiskIcon band={result.band} />
                  </div>
                  <div>
                    <span className="section-kicker">{m.resultEyebrow as string}</span>
                    <h2>{bandTitle as string}</h2>
                  </div>
                </div>
                <div className="probability-wrap">
                  <div className="probability-number">
                    {Math.round(result.probability * 100)}
                    <span>%</span>
                  </div>
                  <div>
                    <span className="probability-label">{m.probabilityLabel as string}</span>
                    <meter
                      className="sr-only"
                      min={0}
                      max={100}
                      value={Math.round(result.probability * 100)}
                      aria-label={m.probabilityLabel as string}
                    />
                    <div className="probability-bar" aria-hidden="true">
                      <span style={{ width: `${Math.round(result.probability * 100)}%` }} />
                    </div>
                  </div>
                </div>
                {result.registrable_domain && (
                  <div className="domain-pill">
                    <MiniIcon kind="link" />
                    <span>{m.domainLabel as string}</span>
                    <strong>{result.registrable_domain}</strong>
                  </div>
                )}
                <p className="result-disclaimer">{m.disclaimer as string}</p>
                <button className="button button--outline" type="button" onClick={shareAlert}>
                  <MiniIcon kind="arrow" />
                  {m.shareResult as string}
                </button>
                {shareState && (
                  <p className="share-status" role="status">
                    {shareState}
                  </p>
                )}
              </div>
              <div className="result-details">
                <div className="result-detail-block">
                  <h3>{m.reasonsTitle as string}</h3>
                  {result.top_reasons.length ? (
                    <ul className="reason-list">
                      {result.top_reasons.map((reason) => (
                        <li key={reason}>
                          <span className="reason-point" />
                          {reasons[reason] ?? reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="detail-muted">{m.bandLow as string}</p>
                  )}
                  <p className="external-note">
                    <span aria-hidden="true">i</span>
                    {m.externalUnavailable as string}
                  </p>
                </div>
                <div className="result-detail-block actions-block">
                  <h3>{m.actionsTitle as string}</h3>
                  <ol className="action-list">
                    {actionSteps.map((step, index) => (
                      <li key={step}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="result-empty">
              <div className="empty-sigil">
                <ShieldMark small />
              </div>
              <div>
                <span className="section-kicker">{m.resultEyebrow as string}</span>
                <h2>{m.resultEmptyTitle as string}</h2>
                <p>{m.resultEmptyBody as string}</p>
              </div>
              <div className="empty-arrow" aria-hidden="true">
                <MiniIcon kind="arrow" />
              </div>
            </div>
          )}
        </section>

        <section className="how-section section-pad" id="como-funciona">
          <div className="wrap">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-dot" />
                  {m.howEyebrow as string}
                </span>
                <h2>{m.howTitle as string}</h2>
              </div>
              <p>{m.howBody as string}</p>
            </div>
            <div className="steps-grid">
              {stepCards.map((step, index) => (
                <article className="step-card" key={step.title}>
                  <div className="step-number">0{index + 1}</div>
                  <div className="step-mark">
                    <MiniIcon kind={index === 0 ? "link" : index === 1 ? "spark" : "check"} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="promise-section wrap" aria-label={m.principlesLabel as string}>
          <article className="promise-card promise-card--privacy" id="privacidad">
            <div className="promise-icon">
              <MiniIcon kind="lock" />
            </div>
            <div>
              <span className="section-kicker">{m.privacyTag as string}</span>
              <h2>{m.privacyTitle as string}</h2>
              <p>{m.privacyBody as string}</p>
            </div>
          </article>
          <article className="promise-card promise-card--family">
            <div className="promise-icon">
              <MiniIcon kind="family" />
            </div>
            <div>
              <span className="section-kicker">{m.familyTag as string}</span>
              <h2>{m.familyTitle as string}</h2>
              <p>{m.familyBody as string}</p>
            </div>
            <div className="family-illustration" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </article>
        </section>

        <section className="pricing-section section-pad" id="planes">
          <div className="wrap">
            <div className="pricing-heading">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {m.pricingEyebrow as string}
              </span>
              <h2>{m.pricingTitle as string}</h2>
              <p>{m.pricingBody as string}</p>
            </div>
            <div className="plans-grid">
              <PlanCard
                title={m.freePlan as string}
                price={m.freePrice as string}
                period={m.freePeriod as string}
                features={m.freeFeatures as string[]}
                onSelect={() => document.getElementById("verificar")?.scrollIntoView({ behavior: "smooth" })}
                action={m.navStart as string}
              />
              <PlanCard
                featured
                title={m.familyPlan as string}
                price={m.familyPrice as string}
                period={m.monthly as string}
                annual={m.familyAnnual as string}
                badge={m.popular as string}
                features={m.familyFeatures as string[]}
                action={m.choosePlan as string}
                selected={selectedPlan === "family"}
                onSelect={() => choosePlan("family")}
              />
              <PlanCard
                title={m.personalPlan as string}
                price={m.personalPrice as string}
                period={m.monthly as string}
                features={m.personalFeatures as string[]}
                action={m.choosePlan as string}
                selected={selectedPlan === "personal"}
                onSelect={() => choosePlan("personal")}
              />
              <PlanCard
                title={m.recoveryPlan as string}
                price={m.recoveryPrice as string}
                period={m.once as string}
                features={m.recoveryFeatures as string[]}
                action={m.choosePlan as string}
                selected={selectedPlan === "recovery"}
                onSelect={() => choosePlan("recovery")}
              />
            </div>
            <div
              className={`plan-note${selectedPlan ? " plan-note--active" : ""}`}
              role={selectedPlan ? "status" : undefined}
            >
              <span className="plan-note-icon">
                <MiniIcon kind="lock" />
              </span>
              <div>
                <strong>{m.planReady as string}</strong>
                <p>{m.planNote as string}</p>
              </div>
              <a href="#como-funciona" className="plan-note-link">
                {m.navHow as string}
                <MiniIcon kind="arrow" />
              </a>
            </div>
          </div>
        </section>

        <section className="guide-section wrap" id="guia">
          <div className="guide-card">
            <div className="guide-sun" aria-hidden="true">
              <span>✳</span>
            </div>
            <div className="guide-copy">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {m.guideEyebrow as string}
              </span>
              <h2>{m.guideTitle as string}</h2>
              <p>{m.guideBody as string}</p>
              <a className="button button--light" href="#pasos-guia">
                {m.guideCta as string}
                <MiniIcon kind="arrow" />
              </a>
            </div>
            <ol className="guide-list" id="pasos-guia">
              {(m.guideSteps as string[]).map((step, index) => (
                <li key={step}>
                  <span>0{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="faq-section section-pad" id="preguntas">
          <div className="wrap faq-wrap">
            <div className="faq-intro">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                {m.faqEyebrow as string}
              </span>
              <h2>{m.faqTitle as string}</h2>
              <p>{m.disclaimer as string}</p>
            </div>
            <div className="faq-list">
              {faqItems.map((item, index) => (
                <details className="faq-item" key={item.title} open={index === 0}>
                  <summary>
                    {item.title}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{item.body}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="launch-note wrap" id="contacto" aria-label={m.legalTitle as string}>
          <div className="launch-note-icon">
            <MiniIcon kind="lock" />
          </div>
          <div>
            <h2>{m.legalTitle as string}</h2>
            <p>{m.legalBody as string}</p>
          </div>
          <span className="launch-contact">{m.contactPending as string}</span>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-top">
          <Link className="brand brand--footer" href={`/${locale}`}>
            <ShieldMark small />
            <span className="brand-word">
              Zone<span>Shield</span>
              <small>by Zone Digital</small>
            </span>
          </Link>
          <p>{m.footerTag as string}</p>
          <div className="footer-links">
            <a href="#privacidad">{m.footerPrivacy as string}</a>
            <a href="#contacto">{m.footerTerms as string}</a>
            <a href="#preguntas">{m.footerAi as string}</a>
            <a href="#contacto">
              {m.footerContact as string}
              <MiniIcon kind="arrow" />
            </a>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>{(m.footerRights as string).replace("{year}", String(year))}</span>
          <span className="footer-beta">
            <span />
            {m.previewLabel as string}
          </span>
        </div>
      </footer>
    </>
  );
}

function PlanCard({
  title,
  price,
  period,
  annual,
  features,
  action,
  onSelect,
  featured = false,
  badge,
  selected = false,
}: {
  title: string;
  price: string;
  period: string;
  annual?: string;
  features: string[];
  action: string;
  onSelect: () => void;
  featured?: boolean;
  badge?: string;
  selected?: boolean;
}) {
  return (
    <article className={`plan-card${featured ? " plan-card--featured" : ""}${selected ? " plan-card--selected" : ""}`}>
      {badge && (
        <div className="plan-badge">
          <MiniIcon kind="family" />
          {badge}
        </div>
      )}
      <h3>{title}</h3>
      <div className="plan-price">
        {price}
        <span>{period}</span>
      </div>
      {annual && <p className="plan-annual">{annual}</p>}
      <ul>
        {features.map((feature) => (
          <li key={feature}>
            <MiniIcon kind="check" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        className={`button ${featured ? "button--primary" : "button--outline"} button--plan`}
        type="button"
        onClick={onSelect}
      >
        {action}
        <MiniIcon kind="arrow" />
      </button>
    </article>
  );
}
