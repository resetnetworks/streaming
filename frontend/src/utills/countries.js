// src/utills/countries.js

export const countries = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "NZ", name: "New Zealand" },
  { code: "ZA", name: "South Africa" },
  { code: "NL", name: "Netherlands" },
  { code: "CH", name: "Switzerland" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RU", name: "Russia" },
  { code: "KR", name: "South Korea" },
  { code: "HK", name: "Hong Kong" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "TR", name: "Turkey" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "QA", name: "Qatar" },
  { code: "KW", name: "Kuwait" },
  { code: "EG", name: "Egypt" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "IL", name: "Israel" },
  { code: "UA", name: "Ukraine" },
  { code: "GR", name: "Greece" },
  { code: "CZ", name: "Czech Republic" },
  { code: "HU", name: "Hungary" },
  { code: "RO", name: "Romania" },
  { code: "LU", name: "Luxembourg" }
];

// Helper functions
export const getCountryByCode = (code) => {
  return countries.find(country => country.code === code);
};
export const getCountryName = (code) => {
  const country = getCountryByCode(code);
  return country ? country.name : 'Unknown';
};
export const getCountryList = () => {
  return countries.sort((a, b) => a.name.localeCompare(b.name));
};
// For search/filter functionality
export const searchCountries = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return countries.filter(country => 
    country.name.toLowerCase().includes(term) || 
    country.code.toLowerCase().includes(term)
  );
};