'use client';

import { useMemo, useState } from 'react';
import { fmt, NumberField, ResultCard, ToolLayout } from './ToolUI';

export function monthlyPayment(principal, annualRatePct, years) {
  const n = years * 12;
  const r = annualRatePct / 100 / 12;
  if (principal <= 0 || n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export default function MortgageCalculator() {
  const [price, setPrice] = useState(12000000);
  const [deposit, setDeposit] = useState(2400000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(20);
  const [debtRatio, setDebtRatio] = useState(30);

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
          <NumberField label="Prix du bien" unit="DA" value={price} onChange={setPrice} step={100000} />
          <NumberField
            label="Apport personnel"
            unit="DA"
            value={deposit}
            onChange={setDeposit}
            step={100000}
            help={`Soit ${r.depositPct.toFixed(0)} % du prix du bien.`}
          />
          <NumberField
            label="Taux d'intérêt annuel"
            unit="%"
            value={rate}
            onChange={setRate}
            step={0.05}
            max={20}
            help="Indicatif : demandez le taux exact à votre banque (CNEP, BNA, CPA, BDL…)."
          />
          <NumberField label="Durée du crédit" unit="ans" value={years} onChange={setYears} min={1} max={40} />
          <NumberField
            label="Taux d'endettement maximum"
            unit="%"
            value={debtRatio}
            onChange={setDebtRatio}
            max={100}
            help="Part maximale de vos revenus mensuels que la banque accepte de consacrer à la mensualité."
          />
        </>
      }
      results={
        <>
          <ResultCard highlight label="Mensualité" value={fmt(r.monthly)} unit="DA / mois" />
          <ResultCard label="Montant emprunté" value={fmt(r.principal)} />
          <ResultCard label="Coût total des intérêts" value={fmt(r.interest)} />
          <ResultCard label="Coût total du crédit" value={fmt(r.total)} />
          <ResultCard label="Revenu mensuel net conseillé" value={fmt(r.income)} unit="DA / mois" />
        </>
      }
    />
  );
}
