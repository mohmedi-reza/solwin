export function log10(b: bigint) {
  if (b < 0) return NaN;
  const s = b.toString(10);

  return s.length + Math.log10(Number("0." + s.substring(0, 15)));
}

const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"] as const;

const abbreviateNumber = (
  numerator: number | bigint,
  denominator: number | bigint,
  precision: number
) => {
  if (numerator === 0 || numerator === BigInt(0) || numerator === undefined) {
    return "0";
  }
  if (typeof numerator == "number" && isNaN(numerator)) {
    return "0";
  }

  const numeratorAbsValue =
    typeof numerator === "number"
      ? Math.abs(numerator)
      : numerator === undefined
      ? 0
      : numerator < 0
      ? -numerator
      : numerator
      ? numerator
      : 0;

  const tier =
    BigInt(numeratorAbsValue ?? 0) < BigInt(denominator ?? 1)
      ? 0
      : Math.floor(
          typeof numeratorAbsValue === "number"
            ? Math.log10(numeratorAbsValue / Number(denominator)) / 3
            : log10(numeratorAbsValue / BigInt(denominator)) / 3
        );
  // console.log({ numerator, denominator, tier });
  const suffix = SI_SYMBOL[tier];
  const scale = tier > 0 ? 10 ** (tier * 3) : 1;

  const scaled =
    Number(
      typeof numerator === "number"
        ? numerator * 10 ** precision
        : typeof numerator === "bigint"
        ? numerator * BigInt(10 ** precision)
        : 0
    ) / scale;

  return (
    (Number(scaled) / Number(denominator) / Number(10 ** precision)).toFixed(
      precision
    ) + suffix
  );
};

export const formatAmount = (
  nominator: number | bigint,
  denominator: number | bigint = 1,
  precision?: number
) => {
  const t = Math.floor(Number(nominator) / Number(denominator));

  return abbreviateNumber(
    nominator,
    denominator,
    precision ?? (t === 0 ? 4 : 2)
  );
};
