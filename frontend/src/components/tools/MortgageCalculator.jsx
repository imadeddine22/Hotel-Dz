'use client';

import { useEffect, useMemo, useState } from 'react';
import { fmt, NumberField, ResultCard, ToolLayout } from './ToolUI';

import { useT } from '@/lib/i18n/useT';
export function monthlyPayment(principal, annualRatePct, years) {
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function MortgageCalculator() {
  const { t } = useT();
  const [price, setPrice] = useState(12000000);
  const [deposit, setDeposit] = useState(2400000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(20);
  const [debtRatio, setDebtRatio] = useState(30);

  // Opened from a property (?price=38000000): start from its price with a 20 % deposit
  useEffect(() => {
    const p = Number(new URLSearchParams(window.location.search).get('price'));
    if (Number.isFinite(p) && p > 0) {
      setPrice(p);
      setDeposit(Math.round(p * 0.2));
    }
  }, []);

  const r = useMemo(() => {
    const principal = Math.max(0, (Number(price) || 0) - (Number(deposit) || 0));
    const monthly = monthlyPayment(principal, Number(rate) || 0, Number(years) || 0);
    const total = monthly * (Number(years) || 0) * 12;
    return {
      principal,
      monthly,
      interest: total - principal,
      total,
      income: debtRatio > 0 ? monthly / (debtRatio / 100) : NaN,
      depositPct: price > 0 ? ((Number(deposit) || 0) / price) * 100 : 0,
    };
  }, [price, deposit, rate, years, debtRatio]);

  return (
    <ToolLayout
      inputs={
        <>
          <NumberField label={t('Prix du bien')} unit="DA" value={price} onChange={setPrice} step={100000} />
          <NumberField
            label={t('Apport personnel')}
            unit="DA"
            value={deposit}
            onChange={setDeposit}
            step={100000}
            help={t('Soit {pct} % du prix du bien.', { pct: r.depositPct.toFixed(0) })}
          />
          <NumberField
            label={t('Taux d\'intérêt annuel')}
            unit="%"
            value={rate}
            onChange={setRate}
            step={0.05}
            max={20}
            help={t('Indicatif : demandez le taux exact à votre banque (CNEP, BNA, CPA, BDL…).')}
          />
          <NumberField label={t('Durée du crédit')} unit={t('ans')} value={years} onChange={setYears} min={1} max={40} />
          <NumberField
            label={t('Taux d\'endettement maximum')}
            unit="%"
            value={debtRatio}
            onChange={setDebtRatio}
            max={100}
            help={t('Part maximale de vos revenus mensuels que la banque accepte de consacrer à la mensualité.')}
          />
        </>
      }
      results={
        <>
          <ResultCard highlight label={t('Mensualité')} value={fmt(r.monthly)} unit={t('DA / mois')} />
          <ResultCard label={t('Montant emprunté')} value={fmt(r.principal)} />
          <ResultCard label={t('Coût total des intérêts')} value={fmt(r.interest)} />
          <ResultCard label={t('Coût total du crédit')} value={fmt(r.total)} />
          <ResultCard label={t('Revenu mensuel net conseillé')} value={fmt(r.income)} unit={t('DA / mois')} />
        </>
      }
    />
  );
}
