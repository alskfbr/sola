import type { ItineraryDay, ItineraryItem, Trip, User } from "../../types";

interface MockAccount {
  user: User;
  /** Plain-text only because this is a local mock. Never do this with a real backend. */
  password: string;
}

export const MOCK_USER: User = {
  id: "superuser",
  email: "caoyun880@yahoo.com",
  name: "Caoyun",
};

export const MOCK_ACCOUNTS: MockAccount[] = [
  { user: MOCK_USER, password: "baobeiwoaini" },
];

type ItemSeed = Omit<ItineraryItem, "id">;

function day(
  tripId: string,
  dayNumber: number,
  regionCode: string,
  title: string,
  items: ItemSeed[],
): ItineraryDay {
  return {
    dayNumber,
    regionCode,
    title,
    items: items.map((item, i) => ({
      ...item,
      id: `${tripId}_d${dayNumber}_${i + 1}`,
    })),
  };
}

const SRI_LANKA_ID = "trip_srilanka_2026";
const UZBEKISTAN_ID = "trip_uzbekistan_draft";

export const MOCK_TRIPS: Trip[] = [
  {
    id: SRI_LANKA_ID,
    ownerId: MOCK_USER.id,
    title: "Sri Lanka Highlights",
    startDate: "2026-03-05",
    endDate: "2026-03-14",
    destinations: [
      {
        countryCode: "LKA",
        countryName: "Sri Lanka",
        regionCode: "LK-1",
        regionName: "Western Province",
      },
      {
        countryCode: "LKA",
        countryName: "Sri Lanka",
        regionCode: "LK-2",
        regionName: "Central Province",
      },
      {
        countryCode: "LKA",
        countryName: "Sri Lanka",
        regionCode: "LK-7",
        regionName: "North Central Province",
      },
      {
        countryCode: "LKA",
        countryName: "Sri Lanka",
        regionCode: "LK-8",
        regionName: "Uva Province",
      },
      {
        countryCode: "LKA",
        countryName: "Sri Lanka",
        regionCode: "LK-3",
        regionName: "Southern Province",
      },
    ],
    days: [
      day(SRI_LANKA_ID, 1, "LK-1", "Arrive in Colombo", [
        {
          time: "10:30",
          title: "Land at Bandaranaike International Airport",
          category: "transport",
        },
        {
          time: "15:00",
          title: "Galle Face Green sunset walk",
          category: "sightseeing",
        },
        {
          time: "19:30",
          title: "Dinner at Ministry of Crab",
          category: "food",
        },
      ]),
      day(SRI_LANKA_ID, 2, "LK-2", "Sigiriya & Dambulla", [
        { time: "07:00", title: "Drive to Sigiriya", category: "transport" },
        {
          time: "14:00",
          title: "Climb Sigiriya Lion Rock",
          category: "activity",
        },
        {
          time: "17:00",
          title: "Dambulla Cave Temple",
          category: "sightseeing",
        },
      ]),
      day(SRI_LANKA_ID, 3, "LK-7", "Ancient city of Polonnaruwa", [
        {
          time: "08:00",
          title: "Cycle around Polonnaruwa ruins",
          category: "activity",
        },
        {
          time: "16:00",
          title: "Minneriya National Park elephant safari",
          category: "activity",
        },
      ]),
      day(SRI_LANKA_ID, 4, "LK-2", "Kandy", [
        {
          time: "09:00",
          title: "Drive to Kandy via spice garden",
          category: "transport",
        },
        {
          time: "18:00",
          title: "Temple of the Sacred Tooth Relic",
          category: "sightseeing",
        },
      ]),
      day(SRI_LANKA_ID, 5, "LK-2", "Nuwara Eliya tea country", [
        {
          time: "10:00",
          title: "Pedro Tea Estate tour",
          category: "sightseeing",
        },
        { time: "15:00", title: "Gregory Lake", category: "sightseeing" },
      ]),
      day(SRI_LANKA_ID, 6, "LK-8", "Scenic train to Ella", [
        {
          time: "09:30",
          title: "Nanu Oya → Ella train",
          description: "Reserve 2nd class, right side",
          category: "transport",
        },
        {
          time: "16:30",
          title: "Check in at Ella guesthouse",
          category: "lodging",
        },
      ]),
      day(SRI_LANKA_ID, 7, "LK-8", "Ella hikes", [
        {
          time: "06:00",
          title: "Little Adam's Peak sunrise",
          category: "activity",
        },
        { time: "11:00", title: "Nine Arch Bridge", category: "sightseeing" },
      ]),
      day(SRI_LANKA_ID, 8, "LK-3", "Yala safari", [
        {
          time: "05:30",
          title: "Yala National Park morning safari",
          category: "activity",
        },
        { time: "15:00", title: "Drive to Mirissa", category: "transport" },
      ]),
      day(SRI_LANKA_ID, 9, "LK-3", "Galle & the south coast", [
        {
          time: "07:00",
          title: "Mirissa whale watching",
          category: "activity",
        },
        { time: "15:00", title: "Galle Fort walk", category: "sightseeing" },
      ]),
      day(SRI_LANKA_ID, 10, "LK-1", "Back to Colombo", [
        {
          time: "10:00",
          title: "Expressway to Colombo",
          category: "transport",
        },
        { time: "20:00", title: "Flight home", category: "transport" },
      ]),
    ],
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-03-15T08:00:00.000Z",
  },
  {
    // No title and no dates: UI must fall back to region names and show "Draft".
    id: UZBEKISTAN_ID,
    ownerId: MOCK_USER.id,
    destinations: [
      {
        countryCode: "UZB",
        countryName: "Uzbekistan",
        regionCode: "UZ-TK",
        regionName: "Tashkent",
      },
      {
        countryCode: "UZB",
        countryName: "Uzbekistan",
        regionCode: "UZ-SA",
        regionName: "Samarqand Region",
      },
      {
        countryCode: "UZB",
        countryName: "Uzbekistan",
        regionCode: "UZ-QA",
        regionName: "Qashqadaryo Region",
      },
      {
        countryCode: "UZB",
        countryName: "Uzbekistan",
        regionCode: "UZ-BU",
        regionName: "Bukhara Region",
      },
      {
        countryCode: "UZB",
        countryName: "Uzbekistan",
        regionCode: "UZ-XO",
        regionName: "Xorazm Region",
      },
    ],
    days: [
      day(UZBEKISTAN_ID, 1, "UZ-TK", "Arrive in Tashkent", [
        { title: "Airport transfer & hotel check-in", category: "lodging" },
        { title: "Plov at the Central Asian Plov Centre", category: "food" },
      ]),
      day(UZBEKISTAN_ID, 2, "UZ-TK", "Tashkent old & new", [
        { title: "Chorsu Bazaar", category: "sightseeing" },
        { title: "Metro station tour", category: "sightseeing" },
        { title: "Hazrati Imam Complex", category: "sightseeing" },
      ]),
      day(UZBEKISTAN_ID, 3, "UZ-SA", "Afrosiyob train to Samarkand", [
        {
          title: "High-speed train Tashkent → Samarkand",
          category: "transport",
        },
        { title: "Registan at night", category: "sightseeing" },
      ]),
      day(UZBEKISTAN_ID, 4, "UZ-SA", "Samarkand", [
        { title: "Shah-i-Zinda necropolis", category: "sightseeing" },
        { title: "Gur-e-Amir mausoleum", category: "sightseeing" },
        { title: "Bibi-Khanym Mosque", category: "sightseeing" },
      ]),
      day(UZBEKISTAN_ID, 5, "UZ-QA", "Day trip to Shahrisabz", [
        {
          title: "Ak-Saray Palace ruins (Timur's birthplace)",
          category: "sightseeing",
        },
      ]),
      day(UZBEKISTAN_ID, 6, "UZ-BU", "Train to Bukhara", [
        { title: "Train Samarkand → Bukhara", category: "transport" },
        { title: "Lyabi-Hauz evening", category: "food" },
      ]),
      day(UZBEKISTAN_ID, 7, "UZ-BU", "Bukhara old town", [
        { title: "Po-i-Kalyan complex", category: "sightseeing" },
        { title: "The Ark fortress", category: "sightseeing" },
      ]),
      day(UZBEKISTAN_ID, 8, "UZ-BU", "Bukhara surroundings", [
        { title: "Sitorai Mohi-Xosa summer palace", category: "sightseeing" },
        { title: "Hammam experience", category: "activity" },
      ]),
      day(UZBEKISTAN_ID, 9, "UZ-XO", "Khiva", [
        { title: "Train Bukhara → Khiva", category: "transport" },
        { title: "Itchan Kala at sunset", category: "sightseeing" },
      ]),
      day(UZBEKISTAN_ID, 10, "UZ-XO", "Fly home", [
        {
          title: "Urgench → Tashkent connecting flight",
          category: "transport",
        },
      ]),
    ],
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-20T08:00:00.000Z",
  },
];
