import isEmpty from "lodash/isEmpty"

/**
 * Validate the list of countries the user can optionally pass or returns our default list
 * @param countries - Optional list of countries to override default ones
 * @returns List of countries
 */
export function getCountries(countries?: Country[]): Country[] {
  if (
    !isEmpty(countries) &&
    countries?.every((c) => "value" in c && "label" in c)
  ) {
    return countries
  }
  return [...defaultCountries]
}

/**
 * Get the list of states for a given country, if the user pass a list of states we use that one
 * otherwise we use our default list.
 * If no states are found for the given country we return an empty array.
 * @param countryCode - code of selected country (e.g. IT)
 * @param states - Optional list of states to override our default list
 * @returns List of states for the selected country or empty array
 */
export function getStateOfCountry({
  countryCode,
  states,
}: {
  countryCode: string
  states?: States
}): State[] {
  const statesToUse = {
    ...defaultStates,
    ...states,
  }
  return statesToUse[countryCode as CountryCode] ?? []
}

/**
 * Check if the given state is valid for the given country.
 * If the user is overriding our default states list, it must be passed as option.
 * @param stateCode - code of selected state
 * @param countryCode - code of selected country
 * @param states - Optional list of states to override our default list
 * @returns Boolean - true if the state is valid for the given country
 */
export function isValidState({
  stateCode,
  countryCode,
  states,
}: {
  stateCode: string
  countryCode: string
  states?: States
}): boolean {
  const statesToUse = {
    ...defaultStates,
    ...states,
  }
  return Boolean(
    statesToUse[countryCode as CountryCode]?.find(
      (state) => state.value === stateCode,
    ),
  )
}

/**
 * Check if the given country has a pre-defined list of states as select options.
 * If the user is overriding our default states list, it must be specified by passing an array of countries as option.
 */
export function isEmptyStates({
  countryCode,
  countriesWithPredefinedStateOptions,
}: {
  countryCode: string
  countriesWithPredefinedStateOptions?: string[]
}): boolean {
  const countryLock =
    countriesWithPredefinedStateOptions == null ||
    isEmpty(countriesWithPredefinedStateOptions)
      ? Object.keys(defaultStates)
      : countriesWithPredefinedStateOptions
  return !countryLock.includes(countryCode)
}

const defaultCountries = [
  {
    label: "Afghanistan",
    value: "AF",
  },
  {
    label: "Aland Islands",
    value: "AX",
  },
  {
    label: "Albania",
    value: "AL",
  },
  {
    label: "Algeria",
    value: "DZ",
  },
  {
    label: "American Samoa",
    value: "AS",
  },
  {
    label: "Andorra",
    value: "AD",
  },
  {
    label: "Angola",
    value: "AO",
  },
  {
    label: "Anguilla",
    value: "AI",
  },
  {
    label: "Antarctica",
    value: "AQ",
  },
  {
    label: "Antigua And Barbuda",
    value: "AG",
  },
  {
    label: "Argentina",
    value: "AR",
  },
  {
    label: "Armenia",
    value: "AM",
  },
  {
    label: "Aruba",
    value: "AW",
  },
  {
    label: "Australia",
    value: "AU",
  },
  {
    label: "Austria",
    value: "AT",
  },
  {
    label: "Azerbaijan",
    value: "AZ",
  },
  {
    label: "Bahamas The",
    value: "BS",
  },
  {
    label: "Bahrain",
    value: "BH",
  },
  {
    label: "Bangladesh",
    value: "BD",
  },
  {
    label: "Barbados",
    value: "BB",
  },
  {
    label: "Belarus",
    value: "BY",
  },
  {
    label: "Belgium",
    value: "BE",
  },
  {
    label: "Belize",
    value: "BZ",
  },
  {
    label: "Benin",
    value: "BJ",
  },
  {
    label: "Bermuda",
    value: "BM",
  },
  {
    label: "Bhutan",
    value: "BT",
  },
  {
    label: "Bolivia",
    value: "BO",
  },
  {
    label: "Bonaire, Sint Eustatius and Saba",
    value: "BQ",
  },
  {
    label: "Bosnia and Herzegovina",
    value: "BA",
  },
  {
    label: "Botswana",
    value: "BW",
  },
  {
    label: "Bouvet Island",
    value: "BV",
  },
  {
    label: "Brazil",
    value: "BR",
  },
  {
    label: "British Indian Ocean Territory",
    value: "IO",
  },
  {
    label: "Brunei",
    value: "BN",
  },
  {
    label: "Bulgaria",
    value: "BG",
  },
  {
    label: "Burkina Faso",
    value: "BF",
  },
  {
    label: "Burundi",
    value: "BI",
  },
  {
    label: "Cambodia",
    value: "KH",
  },
  {
    label: "Cameroon",
    value: "CM",
  },
  {
    label: "Canada",
    value: "CA",
  },
  {
    label: "Cape Verde",
    value: "CV",
  },
  {
    label: "Cayman Islands",
    value: "KY",
  },
  {
    label: "Central African Republic",
    value: "CF",
  },
  {
    label: "Chad",
    value: "TD",
  },
  {
    label: "Chile",
    value: "CL",
  },
  {
    label: "China",
    value: "CN",
  },
  {
    label: "Christmas Island",
    value: "CX",
  },
  {
    label: "Cocos (Keeling) Islands",
    value: "CC",
  },
  {
    label: "Colombia",
    value: "CO",
  },
  {
    label: "Comoros",
    value: "KM",
  },
  {
    label: "Congo",
    value: "CG",
  },
  {
    label: "Cook Islands",
    value: "CK",
  },
  {
    label: "Costa Rica",
    value: "CR",
  },
  {
    label: "Cote D'Ivoire (Ivory Coast)",
    value: "CI",
  },
  {
    label: "Croatia",
    value: "HR",
  },
  {
    label: "Cuba",
    value: "CU",
  },
  {
    label: "Curaçao",
    value: "CW",
  },
  {
    label: "Cyprus",
    value: "CY",
  },
  {
    label: "Czech Republic",
    value: "CZ",
  },
  {
    label: "Democratic Republic of the Congo",
    value: "CD",
  },
  {
    label: "Denmark",
    value: "DK",
  },
  {
    label: "Djibouti",
    value: "DJ",
  },
  {
    label: "Dominica",
    value: "DM",
  },
  {
    label: "Dominican Republic",
    value: "DO",
  },
  {
    label: "East Timor",
    value: "TL",
  },
  {
    label: "Ecuador",
    value: "EC",
  },
  {
    label: "Egypt",
    value: "EG",
  },
  {
    label: "El Salvador",
    value: "SV",
  },
  {
    label: "Equatorial Guinea",
    value: "GQ",
  },
  {
    label: "Eritrea",
    value: "ER",
  },
  {
    label: "Estonia",
    value: "EE",
  },
  {
    label: "Ethiopia",
    value: "ET",
  },
  {
    label: "Falkland Islands",
    value: "FK",
  },
  {
    label: "Faroe Islands",
    value: "FO",
  },
  {
    label: "Fiji Islands",
    value: "FJ",
  },
  {
    label: "Finland",
    value: "FI",
  },
  {
    label: "France",
    value: "FR",
  },
  {
    label: "French Guiana",
    value: "GF",
  },
  {
    label: "French Polynesia",
    value: "PF",
  },
  {
    label: "French Southern Territories",
    value: "TF",
  },
  {
    label: "Gabon",
    value: "GA",
  },
  {
    label: "Gambia The",
    value: "GM",
  },
  {
    label: "Georgia",
    value: "GE",
  },
  {
    label: "Germany",
    value: "DE",
  },
  {
    label: "Ghana",
    value: "GH",
  },
  {
    label: "Gibraltar",
    value: "GI",
  },
  {
    label: "Greece",
    value: "GR",
  },
  {
    label: "Greenland",
    value: "GL",
  },
  {
    label: "Grenada",
    value: "GD",
  },
  {
    label: "Guadeloupe",
    value: "GP",
  },
  {
    label: "Guam",
    value: "GU",
  },
  {
    label: "Guatemala",
    value: "GT",
  },
  {
    label: "Guernsey and Alderney",
    value: "GG",
  },
  {
    label: "Guinea",
    value: "GN",
  },
  {
    label: "Guinea-Bissau",
    value: "GW",
  },
  {
    label: "Guyana",
    value: "GY",
  },
  {
    label: "Haiti",
    value: "HT",
  },
  {
    label: "Heard Island and McDonald Islands",
    value: "HM",
  },
  {
    label: "Honduras",
    value: "HN",
  },
  {
    label: "Hong Kong S.A.R.",
    value: "HK",
  },
  {
    label: "Hungary",
    value: "HU",
  },
  {
    label: "Iceland",
    value: "IS",
  },
  {
    label: "India",
    value: "IN",
  },
  {
    label: "Indonesia",
    value: "ID",
  },
  {
    label: "Iran",
    value: "IR",
  },
  {
    label: "Iraq",
    value: "IQ",
  },
  {
    label: "Ireland",
    value: "IE",
  },
  {
    label: "Israel",
    value: "IL",
  },
  {
    label: "Italy",
    value: "IT",
  },
  {
    label: "Jamaica",
    value: "JM",
  },
  {
    label: "Japan",
    value: "JP",
  },
  {
    label: "Jersey",
    value: "JE",
  },
  {
    label: "Jordan",
    value: "JO",
  },
  {
    label: "Kazakhstan",
    value: "KZ",
  },
  {
    label: "Kenya",
    value: "KE",
  },
  {
    label: "Kiribati",
    value: "KI",
  },
  {
    label: "Kosovo",
    value: "XK",
  },
  {
    label: "Kuwait",
    value: "KW",
  },
  {
    label: "Kyrgyzstan",
    value: "KG",
  },
  {
    label: "Laos",
    value: "LA",
  },
  {
    label: "Latvia",
    value: "LV",
  },
  {
    label: "Lebanon",
    value: "LB",
  },
  {
    label: "Lesotho",
    value: "LS",
  },
  {
    label: "Liberia",
    value: "LR",
  },
  {
    label: "Libya",
    value: "LY",
  },
  {
    label: "Liechtenstein",
    value: "LI",
  },
  {
    label: "Lithuania",
    value: "LT",
  },
  {
    label: "Luxembourg",
    value: "LU",
  },
  {
    label: "Macau S.A.R.",
    value: "MO",
  },
  {
    label: "Macedonia",
    value: "MK",
  },
  {
    label: "Madagascar",
    value: "MG",
  },
  {
    label: "Malawi",
    value: "MW",
  },
  {
    label: "Malaysia",
    value: "MY",
  },
  {
    label: "Maldives",
    value: "MV",
  },
  {
    label: "Mali",
    value: "ML",
  },
  {
    label: "Malta",
    value: "MT",
  },
  {
    label: "Man (Isle of)",
    value: "IM",
  },
  {
    label: "Marshall Islands",
    value: "MH",
  },
  {
    label: "Martinique",
    value: "MQ",
  },
  {
    label: "Mauritania",
    value: "MR",
  },
  {
    label: "Mauritius",
    value: "MU",
  },
  {
    label: "Mayotte",
    value: "YT",
  },
  {
    label: "Mexico",
    value: "MX",
  },
  {
    label: "Micronesia",
    value: "FM",
  },
  {
    label: "Moldova",
    value: "MD",
  },
  {
    label: "Monaco",
    value: "MC",
  },
  {
    label: "Mongolia",
    value: "MN",
  },
  {
    label: "Montenegro",
    value: "ME",
  },
  {
    label: "Montserrat",
    value: "MS",
  },
  {
    label: "Morocco",
    value: "MA",
  },
  {
    label: "Mozambique",
    value: "MZ",
  },
  {
    label: "Myanmar",
    value: "MM",
  },
  {
    label: "Namibia",
    value: "NA",
  },
  {
    label: "Nauru",
    value: "NR",
  },
  {
    label: "Nepal",
    value: "NP",
  },
  {
    label: "Netherlands",
    value: "NL",
  },
  {
    label: "New Caledonia",
    value: "NC",
  },
  {
    label: "New Zealand",
    value: "NZ",
  },
  {
    label: "Nicaragua",
    value: "NI",
  },
  {
    label: "Niger",
    value: "NE",
  },
  {
    label: "Nigeria",
    value: "NG",
  },
  {
    label: "Niue",
    value: "NU",
  },
  {
    label: "Norfolk Island",
    value: "NF",
  },
  {
    label: "North Korea",
    value: "KP",
  },
  {
    label: "Northern Mariana Islands",
    value: "MP",
  },
  {
    label: "Norway",
    value: "NO",
  },
  {
    label: "Oman",
    value: "OM",
  },
  {
    label: "Pakistan",
    value: "PK",
  },
  {
    label: "Palau",
    value: "PW",
  },
  {
    label: "Palestinian Territory Occupied",
    value: "PS",
  },
  {
    label: "Panama",
    value: "PA",
  },
  {
    label: "Papua new Guinea",
    value: "PG",
  },
  {
    label: "Paraguay",
    value: "PY",
  },
  {
    label: "Peru",
    value: "PE",
  },
  {
    label: "Philippines",
    value: "PH",
  },
  {
    label: "Pitcairn Island",
    value: "PN",
  },
  {
    label: "Poland",
    value: "PL",
  },
  {
    label: "Portugal",
    value: "PT",
  },
  {
    label: "Puerto Rico",
    value: "PR",
  },
  {
    label: "Qatar",
    value: "QA",
  },
  {
    label: "Reunion",
    value: "RE",
  },
  {
    label: "Romania",
    value: "RO",
  },
  {
    label: "Russia",
    value: "RU",
  },
  {
    label: "Rwanda",
    value: "RW",
  },
  {
    label: "Saint Helena",
    value: "SH",
  },
  {
    label: "Saint Kitts And Nevis",
    value: "KN",
  },
  {
    label: "Saint Lucia",
    value: "LC",
  },
  {
    label: "Saint Pierre and Miquelon",
    value: "PM",
  },
  {
    label: "Saint Vincent And The Grenadines",
    value: "VC",
  },
  {
    label: "Saint-Barthelemy",
    value: "BL",
  },
  {
    label: "Saint-Martin (French part)",
    value: "MF",
  },
  {
    label: "Samoa",
    value: "WS",
  },
  {
    label: "San Marino",
    value: "SM",
  },
  {
    label: "Sao Tome and Principe",
    value: "ST",
  },
  {
    label: "Saudi Arabia",
    value: "SA",
  },
  {
    label: "Senegal",
    value: "SN",
  },
  {
    label: "Serbia",
    value: "RS",
  },
  {
    label: "Seychelles",
    value: "SC",
  },
  {
    label: "Sierra Leone",
    value: "SL",
  },
  {
    label: "Singapore",
    value: "SG",
  },
  {
    label: "Sint Maarten (Dutch part)",
    value: "SX",
  },
  {
    label: "Slovakia",
    value: "SK",
  },
  {
    label: "Slovenia",
    value: "SI",
  },
  {
    label: "Solomon Islands",
    value: "SB",
  },
  {
    label: "Somalia",
    value: "SO",
  },
  {
    label: "South Africa",
    value: "ZA",
  },
  {
    label: "South Georgia",
    value: "GS",
  },
  {
    label: "South Korea",
    value: "KR",
  },
  {
    label: "South Sudan",
    value: "SS",
  },
  {
    label: "Spain",
    value: "ES",
  },
  {
    label: "Sri Lanka",
    value: "LK",
  },
  {
    label: "Sudan",
    value: "SD",
  },
  {
    label: "Suriname",
    value: "SR",
  },
  {
    label: "Svalbard And Jan Mayen Islands",
    value: "SJ",
  },
  {
    label: "Swaziland",
    value: "SZ",
  },
  {
    label: "Sweden",
    value: "SE",
  },
  {
    label: "Switzerland",
    value: "CH",
  },
  {
    label: "Syria",
    value: "SY",
  },
  {
    label: "Taiwan",
    value: "TW",
  },
  {
    label: "Tajikistan",
    value: "TJ",
  },
  {
    label: "Tanzania",
    value: "TZ",
  },
  {
    label: "Thailand",
    value: "TH",
  },
  {
    label: "Togo",
    value: "TG",
  },
  {
    label: "Tokelau",
    value: "TK",
  },
  {
    label: "Tonga",
    value: "TO",
  },
  {
    label: "Trinidad And Tobago",
    value: "TT",
  },
  {
    label: "Tunisia",
    value: "TN",
  },
  {
    label: "Turkey",
    value: "TR",
  },
  {
    label: "Turkmenistan",
    value: "TM",
  },
  {
    label: "Turks And Caicos Islands",
    value: "TC",
  },
  {
    label: "Tuvalu",
    value: "TV",
  },
  {
    label: "Uganda",
    value: "UG",
  },
  {
    label: "Ukraine",
    value: "UA",
  },
  {
    label: "United Arab Emirates",
    value: "AE",
  },
  {
    label: "United Kingdom",
    value: "GB",
  },
  {
    label: "United States",
    value: "US",
  },
  {
    label: "United States Minor Outlying Islands",
    value: "UM",
  },
  {
    label: "Uruguay",
    value: "UY",
  },
  {
    label: "Uzbekistan",
    value: "UZ",
  },
  {
    label: "Vanuatu",
    value: "VU",
  },
  {
    label: "Vatican City State (Holy See)",
    value: "VA",
  },
  {
    label: "Venezuela",
    value: "VE",
  },
  {
    label: "Vietnam",
    value: "VN",
  },
  {
    label: "Virgin Islands (British)",
    value: "VG",
  },
  {
    label: "Virgin Islands (US)",
    value: "VI",
  },
  {
    label: "Wallis And Futuna Islands",
    value: "WF",
  },
  {
    label: "Western Sahara",
    value: "EH",
  },
  {
    label: "Yemen",
    value: "YE",
  },
  {
    label: "Zambia",
    value: "ZM",
  },
  {
    label: "Zimbabwe",
    value: "ZW",
  },
] as const

const statesIt: State[] = [
  {
    label: "Agrigento",
    value: "AG",
  },
  {
    label: "Alessandria",
    value: "AL",
  },
  {
    label: "Ancona",
    value: "AN",
  },
  {
    label: "Aosta",
    value: "AO",
  },
  {
    label: "Arezzo",
    value: "AR",
  },
  {
    label: "Ascoli Piceno",
    value: "AP",
  },
  {
    label: "Asti",
    value: "AT",
  },
  {
    label: "Avellino",
    value: "AV",
  },
  {
    label: "Bari",
    value: "BA",
  },
  {
    label: "Barletta-Andria-Trani",
    value: "BT",
  },
  {
    label: "Belluno",
    value: "BL",
  },
  {
    label: "Benevento",
    value: "BN",
  },
  {
    label: "Bergamo",
    value: "BG",
  },
  {
    label: "Biella",
    value: "BI",
  },
  {
    label: "Bologna",
    value: "BO",
  },
  {
    label: "Bolzano",
    value: "BZ",
  },
  {
    label: "Brescia",
    value: "BS",
  },
  {
    label: "Brindisi",
    value: "BR",
  },
  {
    label: "Cagliari",
    value: "CA",
  },
  {
    label: "Caltanissetta",
    value: "CL",
  },
  {
    label: "Campobasso",
    value: "CB",
  },
  {
    label: "Carbonia-Iglesias",
    value: "CI",
  },
  {
    label: "Caserta",
    value: "CE",
  },
  {
    label: "Catania",
    value: "CT",
  },
  {
    label: "Catanzaro",
    value: "CZ",
  },
  {
    label: "Chieti",
    value: "CH",
  },
  {
    label: "Como",
    value: "CO",
  },
  {
    label: "Cosenza",
    value: "CS",
  },
  {
    label: "Cremona",
    value: "CR",
  },
  {
    label: "Crotone",
    value: "KR",
  },
  {
    label: "Cuneo",
    value: "CN",
  },
  {
    label: "Enna",
    value: "EN",
  },
  {
    label: "Fermo",
    value: "FM",
  },
  {
    label: "Ferrara",
    value: "FE",
  },
  {
    label: "Firenze",
    value: "FI",
  },
  {
    label: "Foggia",
    value: "FG",
  },
  {
    label: "Forlì-Cesena",
    value: "FC",
  },
  {
    label: "Frosinone",
    value: "FR",
  },
  {
    label: "Genova",
    value: "GE",
  },
  {
    label: "Gorizia",
    value: "GO",
  },
  {
    label: "Grosseto",
    value: "GR",
  },
  {
    label: "Imperia",
    value: "IM",
  },
  {
    label: "Isernia",
    value: "IS",
  },
  {
    label: "L'Aquila",
    value: "AQ",
  },
  {
    label: "La Spezia",
    value: "SP",
  },
  {
    label: "Latina",
    value: "LT",
  },
  {
    label: "Lecce",
    value: "LE",
  },
  {
    label: "Lecco",
    value: "LC",
  },
  {
    label: "Livorno",
    value: "LI",
  },
  {
    label: "Lodi",
    value: "LO",
  },
  {
    label: "Lucca",
    value: "LU",
  },
  {
    label: "Macerata",
    value: "MC",
  },
  {
    label: "Mantova",
    value: "MN",
  },
  {
    label: "Massa e Carrara",
    value: "MS",
  },
  {
    label: "Matera",
    value: "MT",
  },
  {
    label: "Medio Campidano",
    value: "VS",
  },
  {
    label: "Messina",
    value: "ME",
  },
  {
    label: "Milano",
    value: "MI",
  },
  {
    label: "Modena",
    value: "MO",
  },
  {
    label: "Monza e Brianza",
    value: "MB",
  },
  {
    label: "Napoli",
    value: "NA",
  },
  {
    label: "Novara",
    value: "NO",
  },
  {
    label: "Nuoro",
    value: "NU",
  },
  {
    label: "Ogliastra",
    value: "OG",
  },
  {
    label: "Olbia-Tempio",
    value: "OT",
  },
  {
    label: "Oristano",
    value: "OR",
  },
  {
    label: "Padova",
    value: "PD",
  },
  {
    label: "Palermo",
    value: "PA",
  },
  {
    label: "Parma",
    value: "PR",
  },
  {
    label: "Pavia",
    value: "PV",
  },
  {
    label: "Perugia",
    value: "PG",
  },
  {
    label: "Pesaro e Urbino",
    value: "PU",
  },
  {
    label: "Pescara",
    value: "PE",
  },
  {
    label: "Piacenza",
    value: "PC",
  },
  {
    label: "Pisa",
    value: "PI",
  },
  {
    label: "Pistoia",
    value: "PT",
  },
  {
    label: "Pordenone",
    value: "PN",
  },
  {
    label: "Potenza",
    value: "PZ",
  },
  {
    label: "Prato",
    value: "PO",
  },
  {
    label: "Ragusa",
    value: "RG",
  },
  {
    label: "Ravenna",
    value: "RA",
  },
  {
    label: "Reggio Calabria",
    value: "RC",
  },
  {
    label: "Reggio Emilia",
    value: "RE",
  },
  {
    label: "Rieti",
    value: "RI",
  },
  {
    label: "Rimini",
    value: "RN",
  },
  {
    label: "Roma",
    value: "RM",
  },
  {
    label: "Rovigo",
    value: "RO",
  },
  {
    label: "Salerno",
    value: "SA",
  },
  {
    label: "Sassari",
    value: "SS",
  },
  {
    label: "Savona",
    value: "SV",
  },
  {
    label: "Siena",
    value: "SI",
  },
  {
    label: "Sondrio",
    value: "SO",
  },
  {
    label: "Sud Sardegna",
    value: "SU",
  },
  {
    label: "Siracusa",
    value: "SR",
  },
  {
    label: "Taranto",
    value: "TA",
  },
  {
    label: "Teramo",
    value: "TE",
  },
  {
    label: "Terni",
    value: "TR",
  },
  {
    label: "Trapani",
    value: "TP",
  },
  {
    label: "Trento",
    value: "TN",
  },
  {
    label: "Treviso",
    value: "TV",
  },
  {
    label: "Trieste",
    value: "TS",
  },
  {
    label: "Torino",
    value: "TO",
  },
  {
    label: "Udine",
    value: "UD",
  },
  {
    label: "Varese",
    value: "VA",
  },
  {
    label: "Venezia",
    value: "VE",
  },
  {
    label: "Verbano-Cusio-Ossola",
    value: "VB",
  },
  {
    label: "Vercelli",
    value: "VC",
  },
  {
    label: "Verona",
    value: "VR",
  },
  {
    label: "Vibo Valentia",
    value: "VV",
  },
  {
    label: "Vicenza",
    value: "VI",
  },
  {
    label: "Viterbo",
    value: "VT",
  },
]

const statesUs: State[] = [
  {
    label: "Alabama",
    value: "AL",
  },
  {
    label: "Alaska",
    value: "AK",
  },
  {
    label: "Arizona",
    value: "AZ",
  },
  {
    label: "Arkansas",
    value: "AR",
  },
  {
    label: "California",
    value: "CA",
  },
  {
    label: "Colorado",
    value: "CO",
  },
  {
    label: "Connecticut",
    value: "CT",
  },
  {
    label: "Delaware",
    value: "DE",
  },
  {
    label: "District of Columbia",
    value: "DC",
  },
  {
    label: "Florida",
    value: "FL",
  },
  {
    label: "Georgia",
    value: "GA",
  },
  {
    label: "Hawaii",
    value: "HI",
  },
  {
    label: "Idaho",
    value: "ID",
  },
  {
    label: "Illinois",
    value: "IL",
  },
  {
    label: "Indiana",
    value: "IN",
  },
  {
    label: "Iowa",
    value: "IA",
  },
  {
    label: "Kansas",
    value: "KS",
  },
  {
    label: "Kentucky",
    value: "KY",
  },
  {
    label: "Louisiana",
    value: "LA",
  },
  {
    label: "Maine",
    value: "ME",
  },
  {
    label: "Maryland",
    value: "MD",
  },
  {
    label: "Massachusetts",
    value: "MA",
  },
  {
    label: "Michigan",
    value: "MI",
  },
  {
    label: "Minnesota",
    value: "MN",
  },
  {
    label: "Mississippi",
    value: "MS",
  },
  {
    label: "Missouri",
    value: "MO",
  },
  {
    label: "Montana",
    value: "MT",
  },
  {
    label: "Nebraska",
    value: "NE",
  },
  {
    label: "Nevada",
    value: "NV",
  },
  {
    label: "New Hampshire",
    value: "NH",
  },
  {
    label: "New Jersey",
    value: "NJ",
  },
  {
    label: "New Mexico",
    value: "NM",
  },
  {
    label: "New York",
    value: "NY",
  },
  {
    label: "North Carolina",
    value: "NC",
  },
  {
    label: "North Dakota",
    value: "ND",
  },
  {
    label: "Ohio",
    value: "OH",
  },
  {
    label: "Oklahoma",
    value: "OK",
  },
  {
    label: "Oregon",
    value: "OR",
  },
  {
    label: "Pennsylvania",
    value: "PA",
  },
  {
    label: "Rhode Island",
    value: "RI",
  },
  {
    label: "South Carolina",
    value: "SC",
  },
  {
    label: "South Dakota",
    value: "SD",
  },
  {
    label: "Tennessee",
    value: "TN",
  },
  {
    label: "Texas",
    value: "TX",
  },
  {
    label: "Utah",
    value: "UT",
  },
  {
    label: "Vermont",
    value: "VT",
  },
  {
    label: "Virginia",
    value: "VA",
  },
  {
    label: "Washington",
    value: "WA",
  },
  {
    label: "West Virginia",
    value: "WV",
  },
  {
    label: "Wisconsin",
    value: "WI",
  },
  {
    label: "Wyoming",
    value: "WY",
  },
]

type CountryCode = (typeof defaultCountries)[number]["value"]

export interface Country {
  value: CountryCode
  label: string
}

interface State {
  label: string
  value: string
}

export type States = Partial<Record<CountryCode, State[]>>

const defaultStates: States = {
  US: statesUs,
  IT: statesIt,
}
