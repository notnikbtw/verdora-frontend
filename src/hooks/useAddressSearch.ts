import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { addressService } from '@api/address/address.service';
import {
  ADDRESS_SEARCH_DELAY_MS,
  ADDRESS_SEARCH_MIN_LENGTH,
} from '@/config/address.config';
import type { AddressSuggestion, Settlement } from '@/schemas/address.schema';

export const useAddressSearch = (
  kind: 'settlement' | 'street',
  value: string,
  open: boolean,
  settlement?: Settlement | null
) => {
  const term = value.trim();
  const debouncedTerm = useDebouncedValue(term, ADDRESS_SEARCH_DELAY_MS);
  const isDebouncing = term !== debouncedTerm;
  const enabled =
    open &&
    !isDebouncing &&
    term.length >= ADDRESS_SEARCH_MIN_LENGTH &&
    (kind === 'settlement' || Boolean(settlement));
  const query = useQuery<Array<Settlement | AddressSuggestion>>({
    queryKey: [
      'address-search',
      kind,
      debouncedTerm,
      kind === 'street' ? settlement : null,
    ],
    queryFn: ({ signal }) =>
      kind === 'settlement'
        ? addressService.searchSettlements(debouncedTerm, signal)
        : addressService.searchStreets(debouncedTerm, settlement!, signal),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return {
    ...query,
    data: enabled ? query.data : undefined,
    isError: enabled && query.isError,
    isSearching:
      open &&
      term.length >= ADDRESS_SEARCH_MIN_LENGTH &&
      (isDebouncing || query.isFetching),
  };
};
