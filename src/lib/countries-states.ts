// Comprehensive list of countries
export const COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
    "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
    "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
    "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
    "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Predefined states/regions for major countries
export const STATES_BY_COUNTRY: Record<string, string[]> = {
    "Nigeria": [
        "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
        "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
        "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
        "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
    ],
    "United States": [
        "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
        "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
        "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
    ],
    "United Kingdom": [
        "England", "Scotland", "Wales", "Northern Ireland"
    ],
    "Canada": [
        "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan",
        "Northwest Territories", "Nunavut", "Yukon"
    ],
    "Ghana": [
        "Greater Accra", "Ashanti", "Eastern", "Western", "Northern", "Volta", "Brong-Ahafo", "Central", "Upper East", "Upper West",
        "Oti", "Bono East", "Ahafo", "Bono", "North East", "Savannah", "Western North"
    ],
    "South Africa": [
        "Gauteng", "Western Cape", "Eastern Cape", "KwaZulu-Natal", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
    ],
    "Kenya": [
        "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa", "Wajir", "Mandera", "Marsabit",
        "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga",
        "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans-Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo",
        "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
        "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi"
    ],
    "India": [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
    ],
    "Australia": [
        "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"
    ]
};

// Predefined major cities / localities by state (Comprehensive Nigerian cities)
export const CITIES_BY_STATE: Record<string, string[]> = {
    "Lagos": [
        "Ikeja", "Lekki", "Victoria Island", "Yaba", "Ikoyi", "Surulere", "Maryland", 
        "Alimosho", "Agege", "Ikorodu", "Epe", "Oshodi", "Festac Town", "Apapa", 
        "Ajah", "Magodo", "Gbagada", "Ogba", "Ilupeju", "Anthony Village", "Badagry", "Ojota", "Marina"
    ],
    "FCT": [
        "Abuja Central", "Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", 
        "Jabi", "Utako", "Apo", "Lugbe", "Lokogoma", "Karu", "Nyanya", "Mpape", 
        "Dawaki", "Dutse", "Bwari", "Kuje", "Kwali", "Abaji", "Guzape", "Jahi"
    ],
    "Rivers": [
        "Port Harcourt", "Obio-Akpor", "Bonny", "Eleme", "Oyigbo", "Ikwerre", 
        "Okrika", "Ahoada", "Degema", "Omoku", "Rumuokoro", "Trans-Amadi", "Diobu"
    ],
    "Oyo": [
        "Ibadan", "Ogbomoso", "Oyo", "Iseyin", "Saki", "Eruwa", "Igboora", "Bodija", "Dugbe", "Ring Road"
    ],
    "Kano": [
        "Kano Municipal", "Fagge", "Dala", "Nassarawa", "Gwale", "Tarauni", "Kumbotso", "Ungogo", "Wudil", "Bichi", "Sabon Gari"
    ],
    "Kaduna": [
        "Kaduna North", "Kaduna South", "Zaria", "Kafanchan", "Chikun", "Igabi", "Sabon Gari", "Barnawa"
    ],
    "Edo": [
        "Benin City", "Ekpoma", "Auchi", "Uromi", "Egor", "Ikpoba Okha", "Oredo", "Uselu"
    ],
    "Delta": [
        "Warri", "Asaba", "Sapele", "Ughelli", "Agbor", "Uvwie", "Effurun", "Abraka", "Oleh"
    ],
    "Anambra": [
        "Awka", "Onitsha", "Nnewi", "Ekwulobia", "Ihiala", "Aguata", "Ogidi"
    ],
    "Enugu": [
        "Enugu North", "Enugu South", "Enugu East", "Nsukka", "Udi", "Agbani", "Independence Layout", "New Haven"
    ],
    "Ogun": [
        "Abeokuta", "Sagamu", "Ijebu Ode", "Ota", "Ilaro", "Mowe", "Ibafo", "Ogijo", "Arepo"
    ],
    "Akwa Ibom": [
        "Uyo", "Eket", "Ikot Ekpene", "Oron", "Ikot Abasi"
    ],
    "Abia": [
        "Aba", "Umuahia", "Ohafia", "Arochukwu"
    ],
    "Imo": [
        "Owerri", "Orlu", "Okigwe", "Mbaise", "Oguta"
    ],
    "Plateau": [
        "Jos North", "Jos South", "Bukuru", "Pankshin", "Shendam"
    ],
    "Kwara": [
        "Ilorin", "Offa", "Omu-Aran", "Jebba", "Lafiagi"
    ],
    "Benue": [
        "Makurdi", "Gboko", "Otukpo", "Katsina-Ala"
    ],
    "Cross River": [
        "Calabar", "Ikom", "Ogoja", "Ugep", "Obudu"
    ],
    "Ondo": [
        "Akure", "Ondo Town", "Owo", "Ikare", "Ore"
    ],
    "Osun": [
        "Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo"
    ],
    "Ekiti": [
        "Ado-Ekiti", "Ikere-Ekiti", "Ijero-Ekiti", "Oye-Ekiti"
    ],
    "Bayelsa": [
        "Yenagoa", "Brass", "Ogbia", "Sagbama"
    ],
    "Bauchi": [
        "Bauchi", "Azare", "Misau", "Jama'are"
    ],
    "Borno": [
        "Maiduguri", "Jere", "Biu", "Bama"
    ],
    "Adamawa": [
        "Yola", "Mubi", "Jimeta", "Numan"
    ],
    "Gombe": [
        "Gombe", "Kaltungo", "Billiri", "Bajoga"
    ],
    "Nasarawa": [
        "Lafia", "Karu", "Keffi", "Akwanga"
    ],
    "Niger": [
        "Minna", "Suleja", "Bida", "Kontagora"
    ],
    "Kogi": [
        "Lokoja", "Okene", "Kabba", "Anyigba", "Idah"
    ],
    "Sokoto": [
        "Sokoto", "Tambuwal", "Wamakko", "Bodinga"
    ],
    "Kebbi": [
        "Birnin Kebbi", "Argungu", "Yauri", "Zuru"
    ],
    "Katsina": [
        "Katsina", "Daura", "Funtua", "Malumfashi"
    ],
    "Jigawa": [
        "Dutse", "Hadejia", "Gumel", "Kazaure"
    ],
    "Taraba": [
        "Jalingo", "Wukari", "Bali", "Gembu"
    ],
    "Yobe": [
        "Damaturu", "Gashua", "Potiskum", "Nguru"
    ],
    "Zamfara": [
        "Gusau", "Kaura Namoda", "Talata Mafara"
    ],
    "Ebonyi": [
        "Abakaliki", "Afikpo", "Onueke"
    ],
    // Other international major hubs
    "Greater Accra": ["Accra", "Tema", "Madina", "Adenta", "Kasoa"],
    "Ashanti": ["Kumasi", "Obuasi", "Ejisu"],
    "Nairobi": ["Nairobi West", "Westlands", "Kilimani", "Karen", "Upper Hill", "CBD"],
    "Gauteng": ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Midrand"],
    "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds"],
    "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Oakland"],
    "New York": ["New York City", "Brooklyn", "Queens", "Manhattan", "Buffalo"],
    "Texas": ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth"],
};

export function getStatesForCountry(country?: string): string[] {
    if (!country) return [];
    return STATES_BY_COUNTRY[country] || [];
}

export function getCitiesForState(state?: string): string[] {
    if (!state) return [];
    return CITIES_BY_STATE[state] || [];
}

export interface JobLocation {
    country?: string;
    state?: string;
    city?: string;
}

export function formatJobLocation(loc: JobLocation): string {
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    return parts.join(", ") || "Remote / Unspecified";
}

export function embedJobLocation(description: string, loc: JobLocation): string {
    const locMeta = `<!--job_location:${JSON.stringify(loc)}-->`;
    const locPill = loc.city || loc.state || loc.country 
        ? `📍 Location: ${formatJobLocation(loc)}`
        : "";
    
    const cleanDesc = stripJobLocation(description);
    return `${cleanDesc}\n\n${locPill}\n${locMeta}`.trim();
}

export function stripJobLocation(description: string): string {
    if (!description) return "";
    return description
        .replace(/<!--job_location:.*?-->/g, "")
        .replace(/📍 Location:.*$/gm, "")
        .trim();
}

export function parseJobLocation(description?: string, title?: string): JobLocation & { display: string } {
    if (!description) return { display: "Remote / Unspecified" };
    
    // 1. Check for embedded metadata tag
    const metaMatch = description.match(/<!--job_location:(.*?)-->/);
    if (metaMatch && metaMatch[1]) {
        try {
            const parsed = JSON.parse(metaMatch[1]);
            return {
                country: parsed.country || "",
                state: parsed.state || "",
                city: parsed.city || "",
                display: formatJobLocation(parsed),
            };
        } catch {}
    }

    // 2. Check for "📍 Location: City, State, Country"
    const textMatch = description.match(/📍 Location:\s*([^\n\r<]+)/);
    if (textMatch && textMatch[1]) {
        const parts = textMatch[1].split(",").map(s => s.trim());
        if (parts.length >= 3) {
            return { city: parts[0], state: parts[1], country: parts[2], display: textMatch[1].trim() };
        } else if (parts.length === 2) {
            return { state: parts[0], country: parts[1], display: textMatch[1].trim() };
        } else if (parts.length === 1) {
            return { state: parts[0], display: textMatch[1].trim() };
        }
    }

    // 3. Fallback: Search for known state/city in combined description and title
    const combined = `${title || ""} ${description}`.toLowerCase();
    for (const [state, cities] of Object.entries(CITIES_BY_STATE)) {
        for (const city of cities) {
            if (combined.includes(city.toLowerCase())) {
                return {
                    country: "Nigeria",
                    state,
                    city,
                    display: `${city}, ${state}`,
                };
            }
        }
        if (combined.includes(state.toLowerCase())) {
            return {
                country: "Nigeria",
                state,
                display: `${state}, Nigeria`,
            };
        }
    }

    return { display: "Remote / Unspecified" };
}

