/** Render the locale formatter's scientific notation with a real superscript. */
export function FormattedLength({ value }: { value: string }): React.JSX.Element {
  const match = /^(.*?)E([+−-]?\d+) (.+)$/.exec(value);
  return match ? (
    <span className="formatted-length" aria-label={value}>
      <span aria-hidden="true">
        {match[1]} × 10<sup>{match[2].replace("-", "−").replace(/^\+/, "")}</sup> {match[3]}
      </span>
    </span>
  ) : (
    <span className="formatted-length">{value}</span>
  );
}
