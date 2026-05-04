/** Calculate litres from cost and price per litre */
export const calculateLitres = (cost: number, pricePerLitre: number): number =>
  pricePerLitre > 0 ? parseFloat((cost / pricePerLitre).toFixed(3)) : 0;

/** Calculate fuel efficiency in km/L */
export const calculateEfficiency = (
  currentOdometer: number,
  previousOdometer: number,
  litres: number
): number | null => {
  const distance = currentOdometer - previousOdometer;
  if (distance <= 0 || litres <= 0) return null;
  return parseFloat((distance / litres).toFixed(2));
};

/** Calculate cost per km */
export const calculateCostPerKm = (cost: number, distanceKm: number): number =>
  distanceKm > 0 ? parseFloat((cost / distanceKm).toFixed(2)) : 0;

/** Calculate distance between two refuels */
export const calculateDistance = (
  currentOdometer: number,
  previousOdometer: number
): number => {
  const dist = currentOdometer - previousOdometer;
  return dist > 0 ? dist : 0;
};
