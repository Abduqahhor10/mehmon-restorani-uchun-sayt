/**
 * Capitalizes the first letter of each word and converts the rest to lowercase.
 * Handles Uzbek special characters (o', g', etc.), Cyrillic, Latin, hyphens, and quotes.
 * 
 * Examples:
 *  "osh" -> "Osh"
 *  "TO'Y OSHI" -> "To'y Oshi"
 *  "iSsiq TaOmLaR" -> "Issiq Taomlar"
 *  "горячие блюда" -> "Горячие Блюда"
 *  "qozon-kabob" -> "Qozon-Kabob"
 */
export function formatTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  
  // Trim and collapse multiple spaces into single space
  const cleaned = str.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  // Lowercase the entire string first
  const lower = cleaned.toLowerCase();

  // Capitalize first character of each word (after start of string, spaces, hyphens, slashes, brackets, quotes)
  // Notice: apostrophes (' ’ ʻ `) are NOT delimiters, preserving Uzbek letters like "O'", "G'", "to'y", "sho'rva"
  return lower.replace(/(^|[\s\-/([{"«“])([^\s\-/([{"«“])/gu, (match, prefix, char) => {
    return prefix + char.toUpperCase();
  });
}
