const countryCodeMap: Record<string, string> = {
  Afghanistan: "AF",
  Albania: "AL",
  Algeria: "DZ",
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Bangladesh: "BD",
  Belgium: "BE",
  Bolivia: "BO",
  Brazil: "BR",
  Canada: "CA",
  Chile: "CL",
  China: "CN",
  Colombia: "CO",
  Croatia: "HR",
  "Czech Republic": "CZ",
  Denmark: "DK",
  Ecuador: "EC",
  Egypt: "EG",
  Ethiopia: "ET",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  Ghana: "GH",
  Greece: "GR",
  Guatemala: "GT",
  Hungary: "HU",
  India: "IN",
  Indonesia: "ID",
  Iran: "IR",
  Iraq: "IQ",
  Ireland: "IE",
  Israel: "IL",
  Italy: "IT",
  Japan: "JP",
  Jordan: "JO",
  Kenya: "KE",
  Malaysia: "MY",
  Mexico: "MX",
  Morocco: "MA",
  Nepal: "NP",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Nigeria: "NG",
  Norway: "NO",
  Pakistan: "PK",
  Peru: "PE",
  Philippines: "PH",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  Russia: "RU",
  "Saudi Arabia": "SA",
  "South Africa": "ZA",
  "South Korea": "KR",
  Spain: "ES",
  "Sri Lanka": "LK",
  Sweden: "SE",
  Switzerland: "CH",
  Taiwan: "TW",
  Thailand: "TH",
  Turkey: "TR",
  Ukraine: "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States": "US",
  Uruguay: "UY",
  Venezuela: "VE",
  Vietnam: "VN",
};

export function getFlagEmoji(countryName: string): string {
  const code = countryCodeMap[countryName];
  if (!code) return "🌍";
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join("");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const ALL_COUNTRIES = Object.keys(countryCodeMap).sort();
