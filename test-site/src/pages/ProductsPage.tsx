import { useSearchActions } from '@yext/search-headless-react';
import {
  AppliedFilters,
  ResultsCount,
  SearchBar,
  StandardCard,
  VerticalResults,
  LocationBias,
  NumericalFacets,
  Pagination,
  // Facets,
} from '@yext/search-ui-react';
import { useLayoutEffect } from 'react';

export function ProductsPage() {
  const searchActions = useSearchActions();
  useLayoutEffect(() => {
    searchActions.setVertical('products');
    searchActions.executeVerticalQuery();
  });

  return (
    <div>
      <SearchBar />
      <div className='flex'>
        <div className='mr-5 w-56 shrink-0'></div>
        {/* <Facets /> */}
        <div className='flex-grow'>
          <div className='flex items-baseline'>
            <ResultsCount />
            <AppliedFilters />
          </div>
          <VerticalResults CardComponent={StandardCard} />
          <Pagination />
          <LocationBias />
        </div>
      </div>
    </div>
  );
}
