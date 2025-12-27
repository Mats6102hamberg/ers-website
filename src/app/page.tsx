'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ERSLandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ett fel uppstod');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod. Försök igen eller kontakta oss direkt på info@smartflowab.se');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-sm">
              ERS
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-400">SmartFlow AB</h1>
              <p className="text-xs text-slate-400">Enterprise Response System</p>
            </div>
          </div>
          <a
            href="tel:070-037 74 59"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all"
          >
            <span className="text-amber-400">📞</span>
            <span className="text-sm font-medium">070-037 74 59</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative">
          {/* NIS2 Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-red-400">NIS2-DIREKTIV – Deadline 17 januari 2025</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Enterprise Response System
            </span>
            <br />
            <span className="text-slate-200">
              Autonomt skydd för samhällsviktig IT
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl leading-relaxed">
            Lokal, fristående lösning som övervakar vitala IT-system kontinuerligt och agerar självständigt vid incidenter –
            <span className="text-amber-400 font-semibold"> utan molnberoende</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="#pricing"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all text-center"
            >
              Se Tidsbegränsat Erbjudande
            </a>
            <a
              href="#contact"
              className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-800 transition-all text-center"
            >
              Boka Genomgång
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-800">
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-1">&lt; 3ms</div>
              <div className="text-sm text-slate-400">Reaktionstid</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-1">99.99%</div>
              <div className="text-sm text-slate-400">Upptid</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-1">Lokal</div>
              <div className="text-sm text-slate-400">Ingen molntrafik</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-1">24/7</div>
              <div className="text-sm text-slate-400">Autonom drift</div>
            </div>
          </div>
        </div>
      </section>

      {/* NIS2 Section */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-200">
              NIS2-efterlevnad inför 17 januari 2025
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Med kommande krav på förstärkt cybersäkerhet inom hälso- och sjukvården erbjuder ERS en
              snabb och lokal lösning som kan införas utan omfattande förändringar i befintlig infrastruktur.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-amber-400">Snabb installation</h3>
                <p className="text-slate-400">
                  Tas i drift inom några timmar. Ingen långdragen integrationprocess.
                </p>
              </div>
              <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-amber-400">Lokal kontroll</h3>
                <p className="text-slate-400">
                  All data förblir inom regionens infrastruktur. GDPR-compliant.
                </p>
              </div>
              <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-amber-400">Kontinuitet</h3>
                <p className="text-slate-400">
                  Fungerar oberoende vid molnavbrott och systemstörningar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-200">
              Hur ERS fungerar
            </h2>
            <p className="text-xl text-slate-400">
              Autonom övervakning och incidenthantering utan manuell intervention
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">👁️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">Kontinuerlig övervakning</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Övervakar utvalda vitala IT-funktioner dygnet runt. Upptäcker avvikelser och riskbeteenden i realtid.
              </p>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Databaser och API-endpoints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Nätverkstrafik och system load</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Kritiska applikationer</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🚨</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">Autonom respons</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Agerar självständigt vid kritiska incidenter utan att vänta på manuell intervention.
              </p>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Isolerar hotfyllda anslutningar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Återställer tjänster automatiskt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Dokumenterar alla händelser</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🖥️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">Lokal installation</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Installeras lokalt i er infrastruktur. Ingen data lämnar er kontroll.
              </p>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Ingen molnberoende drift</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>GDPR-compliant som standard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Full kontroll över systemet</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">Rapportering</h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                Komplett dokumentation för efterlevnad och revision.
              </p>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Detaljerade incidentloggar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Compliance-rapporter</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Realtids-dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-200">
              Säkerhet utan kompromisser
            </h2>
            <p className="text-xl text-slate-400">
              ERS är byggt med säkerhet som grundprincip
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Ruta 1: Tränar inte på kunddata */}
            <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">Tränar inte på kunddata</h3>
              <p className="text-slate-400">
                Era dokument används aldrig för att träna eller förbättra AI-modeller.
              </p>
            </div>

            {/* Ruta 2: Skapar inga profiler */}
            <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">Skapar inga profiler</h3>
              <p className="text-slate-400">
                Ingen profilering eller aggregering av personuppgifter.
              </p>
            </div>

            {/* Ruta 3: Utför inga prediktioner */}
            <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">Utför inga prediktioner</h3>
              <p className="text-slate-400">
                ERS är ett analysverktyg, inte ett beslutssystem.
              </p>
            </div>

            {/* Ruta 4: Minsta möjliga attackyta */}
            <div className="p-6 bg-slate-800/30 border border-slate-700 rounded-xl hover:border-amber-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">Minsta möjliga attackyta</h3>
              <p className="text-slate-400">
                Konfigureras med lägsta möjliga externa exponering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Om SmartFlow AB Section */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-200">
              Om SmartFlow AB
            </h2>
            <p className="text-xl text-slate-400">
              Ett svenskt företag med fokus på säker, lokal IT-drift
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Företaget */}
            <div className="p-8 bg-slate-800/30 border border-slate-700 rounded-xl">
              <div className="w-14 h-14 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">Företaget</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                SmartFlow AB är ett svenskt teknologiföretag specialiserat på säkerhetslösningar för verksamhetskritiska system.
                Bolaget grundades med målet att erbjuda stabila, lokala alternativ till molnbaserade tjänster – särskilt för organisationer
                som hanterar känslig information och har höga krav på integritet och regelefterlevnad.
              </p>
              <p className="text-slate-300 leading-relaxed">
                ERS utvecklades som svar på en tydlig efterfrågan från offentlig sektor: ett system som kan skydda verksamhetskritisk
                infrastruktur utan att kompromissa med datakontroll eller införa molnberoende.
              </p>
            </div>

            {/* Grundaren */}
            <div className="p-8 bg-slate-800/30 border border-slate-700 rounded-xl">
              <div className="w-14 h-14 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-200">Grundare & VD</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                <strong className="text-amber-400">Mats Hamberg</strong> har sedan tidigt 2000-tal arbetat inom offentlig verksamhet,
                med uppdrag som inneburit hantering av sekretessbelagd information och beslutsunderlag med direkta konsekvenser för enskilda individer.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                Med bakgrund inom socialt arbete och flerårig erfarenhet av myndighetsmiljöer där integritet och informationssäkerhet
                är grundläggande krav, har arbetet alltid präglats av ansvar och medvetenhet om vikten av korrekt hantering av känsliga uppgifter.
              </p>
              <p className="text-slate-300 leading-relaxed">
                ERS är resultatet av års erfarenhet av att arbeta nära verksamheter där tekniska lösningar måste vara tillförlitliga,
                spårbara och förutsägbara – inte experimentella.
              </p>
            </div>
          </div>

          {/* Värdegrund */}
          <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-amber-500/30 rounded-xl">
            <div className="max-w-4xl mx-auto">
              <div className="w-14 h-14 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-slate-200 text-center">Värdegrund och arbetssätt</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">Långsiktighet</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    ERS utvecklas för drift under många år, inte för snabba produktcykler.
                    Stabilitet och underhållbarhet prioriteras framför funktionsöverflöd.
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">Ansvar</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Varje funktion i systemet är designad med medvetenhet om att tekniken hanterar verksamheter
                    där fel kan få allvarliga konsekvenser.
                  </p>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-amber-400 mb-2">Transparens</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Systemet är dokumenterat, spårbart och förklarbart. Inga dolda processer,
                    ingen osäkerhet om vad som sker med organisationens data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Utvecklingsteam */}
          <div className="mt-8 p-6 bg-slate-800/20 border border-slate-700/50 rounded-xl">
            <p className="text-slate-300 leading-relaxed text-center">
              ERS utvecklas av ett dedikerat svenskt team med kompetens inom systemarkitektur, informationssäkerhet och verksamhetskritiska system.
              Utvecklingsarbetet pågår kontinuerligt sedan årets början med fokus på stabilitet, regelefterlevnad och drift i känsliga miljöer.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-slate-900/50 border-y border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
              <span className="text-sm font-medium text-amber-400">⏰ Tidsbegränsat erbjudande inför 17 januari</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-200">
              Kommersiella villkor
            </h2>
            <p className="text-xl text-slate-400">
              Snabb installation för att möta kommande säkerhetskrav
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Engångslicens */}
            <div className="relative p-8 bg-gradient-to-br from-amber-500/5 to-orange-600/5 border-2 border-amber-500/30 rounded-2xl">
              <div className="absolute -top-4 left-8 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-sm font-bold">
                -63% RABATT
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-200">Engångslicens ERS</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-amber-400">690 000 kr</span>
                </div>
                <div className="text-slate-500 line-through text-lg">
                  Ordinarie pris: 1 850 000 kr
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Full ERS-installation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Obegränsad användning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Lokal installation inom timmar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Teknisk genomgång ingår</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Komplett dokumentation</span>
                </li>
              </ul>
              <a
                href="#contact"
                className="block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all text-center"
              >
                Kontakta oss
              </a>
            </div>

            {/* Serviceavtal */}
            <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl">
              <h3 className="text-2xl font-bold mb-2 text-slate-200">Service & Uppdateringar</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-slate-200">250 000 kr</span>
                  <span className="text-slate-400">/år</span>
                </div>
                <div className="text-slate-500 text-lg">
                  Årligt serviceavtal
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Säkerhetsuppdateringar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Systemunderhåll</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Teknisk support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Nya funktioner</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl mt-0.5">✓</span>
                  <span className="text-slate-300">Incidentanalys</span>
                </li>
              </ul>
              <a
                href="#contact"
                className="block w-full px-6 py-3 bg-slate-800 border border-slate-700 text-white font-bold rounded-lg hover:bg-slate-700 transition-all text-center"
              >
                Läs mer
              </a>
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl max-w-3xl mx-auto text-center">
            <p className="text-slate-300 leading-relaxed">
              <span className="font-semibold text-blue-400">OBS:</span> Detta erbjudande gäller för regioner och sjukhus
              som behöver snabb installation inför 17 januari 2025. Kontakta oss för skräddarsydda lösningar.
            </p>
          </div>
        </div>
      </section>

      {/* Why ERS Exists Section */}
      <section className="py-20 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-200 text-center">
            Varför ERS finns
          </h2>
          
          <div className="space-y-6">
            <p className="text-xl text-amber-400 font-semibold leading-relaxed text-center">
              ERS är inte skapat ur ett teknikintresse – utan ur ett ansvar.
            </p>
            
            <p className="text-lg text-slate-300 leading-relaxed">
              Jag som står bakom ERS har arbetat inom offentlig verksamhet med uppdrag där människor, beslut och dokumentation haft verkliga konsekvenser. Med bakgrund inom socialt arbete har jag under många år varit verksam nära verksamheter där integritet, sekretess och tillit är grundläggande krav – inte tillval.
            </p>
            
            <p className="text-lg text-slate-300 leading-relaxed">
              Sedan årets början har ett dedikerat utvecklingsteam arbetat fokuserat med att ta fram ERS som en stabil och verksamhetsnära lösning för miljöer med höga krav på informationssäkerhet, spårbarhet och kontroll.
            </p>
            
            <div className="p-6 bg-amber-500/5 border-l-4 border-amber-500 rounded-lg mt-8">
              <p className="text-lg text-slate-200 font-semibold italic text-center">
                Grundprincipen har varit tydlig från början:<br />
                AI får aldrig bli ett riskmoment – den ska vara ett skydd.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-200">
                Kontakta oss
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Vi lämnar gärna kompletterande teknisk dokumentation eller genomför en kort genomgång vid intresse.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 mb-1">Mats Hamberg</div>
                    <div className="text-slate-400">Grundare & VD, SmartFlow AB</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">E-post</div>
                    <a href="mailto:info@smartflowab.se" className="font-bold text-amber-400 hover:text-amber-300">
                      info@smartflowab.se
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Telefon</div>
                    <a href="tel:070-037 74 59" className="font-bold text-amber-400 hover:text-amber-300">
                      070-037 74 59
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Webbplats</div>
                    <a href="https://www.smartflowab.se" className="font-bold text-amber-400 hover:text-amber-300">
                      www.smartflowab.se
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Namn *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Ditt namn"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Organisation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="Region/Sjukhus"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      E-post *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="din.email@region.se"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                      placeholder="070-xxx xx xx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Meddelande
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                      placeholder="Berätta lite om era behov..."
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Skickar...' : 'Skicka förfrågan'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-2">Tack för ditt intresse!</h3>
                  <p className="text-slate-400">
                    Vi återkommer inom 24 timmar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center font-bold text-xs">
                  ERS
                </div>
                <span className="font-bold text-slate-200">SmartFlow AB</span>
              </div>
              <p className="text-sm text-slate-500">
                © 2025 SmartFlow AB. Alla rättigheter förbehållna.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full">
                System Status: OPERATIONAL
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                GDPR Compliant
              </span>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full">
                NIS2 Ready
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
