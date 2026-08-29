import { useCallback, useEffect, useRef, useState } from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import type { FilterOption } from 'types/enquiry';

/**
 * Reusable State -> City dependent filter.
 *
 * - State is the parent; changing it resets City and re-scopes the city list.
 * - Options come from a backend endpoint (passed in via `fetchOptions`), never
 *   from the currently visible table rows.
 * - Both dropdowns are searchable and show a record count per option.
 */

export interface LocationFilterValue {
  state: string; // '' = All States
  city: string; // '' = All Cities
}

interface LocationFilterOptions {
  states: FilterOption[];
  cities: FilterOption[];
}

interface LocationFilterProps {
  value: LocationFilterValue;
  onChange: (next: LocationFilterValue) => void;
  /** Loads filter options; called again with the selected state to scope cities. */
  fetchOptions: (params: { state?: string }) => Promise<LocationFilterOptions>;
  dark?: boolean;
  /**
   * Disable the City dropdown until a state is chosen (default: false).
   * When false, City shows the full list and can be used on its own; picking a
   * State then narrows it to that state's cities.
   */
  cityRequiresState?: boolean;
}

const optionLabel = (opt: FilterOption | null) =>
  opt ? (opt.count > 0 ? `${opt.name} (${opt.count})` : opt.name) : '';

const LocationFilter = ({
  value,
  onChange,
  fetchOptions,
  dark = false,
  cityRequiresState = false,
}: LocationFilterProps) => {
  const [states, setStates] = useState<FilterOption[]>([]);
  const [cities, setCities] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);
  // Guards against out-of-order responses when the state is changed quickly.
  const requestSeq = useRef(0);

  const load = useCallback(
    async (state: string) => {
      const seq = ++requestSeq.current;
      // Drop any previously loaded cities up front so a stale list is never
      // shown while the newly-selected state's cities are still loading.
      setCities([]);
      setLoading(true);
      try {
        const opts = await fetchOptions(state ? { state } : {});
        if (seq !== requestSeq.current) return; // a newer request superseded this one
        setStates(opts.states || []);
        // Backend returns the full city list when no state is given, or the
        // state-scoped list when one is. Honour whatever it sends.
        setCities(opts.cities || []);
      } catch (err) {
        if (seq === requestSeq.current) {
          console.error('Failed to load location filter options', err);
        }
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [fetchOptions],
  );

  useEffect(() => {
    load(value.state);
  }, [load, value.state]);

  const fieldSx = {
    minWidth: 190,
    bgcolor: dark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
    borderRadius: 1.5,
    '& .MuiInputBase-input': { color: dark ? '#F8FAFC' : '#0F172A' },
    '& .MuiSvgIcon-root': { color: dark ? '#94A3B8' : '#475569' },
  };

  // Fall back to a synthetic option so a filter selected before the option list
  // has loaded (e.g. restored across pagination) still displays.
  const selectedState =
    states.find((s) => s.name === value.state) ||
    (value.state ? { name: value.state, count: 0 } : null);
  const selectedCity =
    cities.find((c) => c.name === value.city) ||
    (value.city ? { name: value.city, count: 0 } : null);
  const cityDisabled = cityRequiresState && !value.state;

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: dark ? '#CBD5E1' : '#475569' }}>
          State:
        </Typography>
        <Autocomplete
          size="small"
          options={states}
          value={selectedState}
          loading={loading}
          getOptionLabel={optionLabel}
          isOptionEqualToValue={(opt, val) => opt.name === val.name}
          noOptionsText="No states in applications yet"
          onChange={(_e, opt) => onChange({ state: opt?.name ?? '', city: '' })}
          sx={fieldSx}
          renderInput={(params) => <TextField {...params} placeholder="All States" />}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: dark ? '#CBD5E1' : '#475569' }}>
          City:
        </Typography>
        <Autocomplete
          size="small"
          options={cities}
          value={selectedCity}
          loading={loading}
          disabled={cityDisabled}
          getOptionLabel={optionLabel}
          isOptionEqualToValue={(opt, val) => opt.name === val.name}
          noOptionsText={value.state ? 'No cities for this state' : 'No cities in applications yet'}
          onChange={(_e, opt) => onChange({ state: value.state, city: opt?.name ?? '' })}
          sx={fieldSx}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={cityDisabled ? 'Select a state first' : 'All Cities'}
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default LocationFilter;
