import { COUNTRY_CODES, DEFAULT_COUNTRY, ENABLED_COUNTRIES, currencyOf, findRegion } from './countries.js';

/**
 * Adds `country` and `currency` to a listing schema (Hotel, House, HouseForSale).
 * Before validation:
 *   - the currency is always derived from the country (never trusted from the client);
 *   - the region (`wilaya` field) must belong to the country and is stored in its official
 *     spelling. Algeria stays lenient: admins can add wilayas outside the static list.
 */
export function countryPlugin(schema) {
  schema.add({
    country: { type: String, enum: COUNTRY_CODES, default: DEFAULT_COUNTRY, index: true },
    currency: { type: String, default: currencyOf(DEFAULT_COUNTRY) },
  });

  schema.pre('validate', function (next) {
    if (!this.country) this.country = DEFAULT_COUNTRY;
    this.currency = currencyOf(this.country);
    if (this.isModified('country') && !ENABLED_COUNTRIES.includes(this.country)) {
      this.invalidate('country', 'Listings are not open in this country yet');
    }
    if (this.wilaya && (this.isModified('wilaya') || this.isModified('country'))) {
      const region = findRegion(this.country, this.wilaya);
      if (region) this.wilaya = region;
      else if (this.country !== 'DZ') this.invalidate('wilaya', 'This region does not belong to the selected country');
    }
    next();
  });
}
