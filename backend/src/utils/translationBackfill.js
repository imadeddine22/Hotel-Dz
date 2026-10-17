import Hotel, { TRANSLATED_FIELDS as HOTEL_FIELDS } from '../models/Hotel.js';
import House, { TRANSLATED_FIELDS as HOUSE_FIELDS } from '../models/House.js';
import HouseForSale, { TRANSLATED_FIELDS as SALE_FIELDS } from '../models/HouseForSale.js';
import Room, { TRANSLATED_FIELDS as ROOM_FIELDS } from '../models/Room.js';
import { backfillTranslations } from './autoTranslate.js';

/** Queue translation of listings that have none yet (created before the feature, or while the quota was out). */
export function startTranslationBackfill() {
  backfillTranslations([
    { Model: Hotel, fields: HOTEL_FIELDS },
    { Model: House, fields: HOUSE_FIELDS },
    { Model: HouseForSale, fields: SALE_FIELDS },
    { Model: Room, fields: ROOM_FIELDS },
  ]).catch((err) => console.warn(`[translate] backfill failed: ${err.message}`));
}
