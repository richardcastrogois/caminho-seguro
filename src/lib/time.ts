type DayRange = {
  start: Date;
  end: Date;
  dateKey: string;
};

export function getSaoPauloDayRange(referenceDate = new Date()): DayRange {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(referenceDate);

  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const day = dateParts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Não foi possível determinar a data de São Paulo.");
  }

  const dateKey = `${year}-${month}-${day}`;

  return {
    dateKey,
    start: new Date(`${dateKey}T00:00:00-03:00`),
    end: new Date(`${dateKey}T23:59:59.999-03:00`),
  };
}
