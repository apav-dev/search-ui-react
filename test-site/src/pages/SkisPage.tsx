/* eslint-disable @typescript-eslint/quotes */
import { DisplayableFacet, NumberRangeValue, useSearchActions } from '@yext/search-headless-react';
import {
  AppliedFilters,
  ResultsCount,
  SearchBar,
  StandardCard,
  VerticalResults,
  LocationBias,
  Pagination,
  Facets,
  StandardFacet,
  NumericalFacet
} from '@yext/search-ui-react';
import { useLayoutEffect } from 'react';

export function BeveragesPage() {
  const searchActions = useSearchActions();
  useLayoutEffect(() => {
    searchActions.setVertical('skis');
    searchActions.executeVerticalQuery();
  });

  // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
  const transformPriceFacet = (options: DisplayableFacet['options']): DisplayableFacet['options'] => {
    return options.map((option) => {
      const [start, end] = option.displayName.split('-');
      debugger;
      let displayName = '';
      if (start) {
        displayName = `$${start.trim()}`;
      }
      if (end) {
        displayName = displayName + ` - $${end.trim()}`;
      } else {
        displayName = '> ' + displayName;
      }
      return {
        ...option,
        displayName,
      };
    });
  };

  return (
    <div>
      <SearchBar />
      <div className='flex'>
        <div className='mr-5 w-56 shrink-0'>
          {/* Facets uses the Filters context so that you can just pass a
          Facet component with a valid facet Id and the facet component will render */}
          <Facets>
            {/* This facet uses the transformOptions prop to order the options in alphabetical order */}
            <StandardFacet facetId="c_terrain.name"
              // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
              transformOptions={(options: DisplayableFacet['options']) =>
                options.sort((a, b) => a.displayName.localeCompare(b.displayName)
                )}
            />
            {/* This facet won't appear because there is a check to ensure no repeat facet Ids */}
            <StandardFacet facetId="c_terrain.name" />
            {/* No transform on this facet */}
            <StandardFacet facetId="c_abilityLevel.name"/>
            {/* $ added to prices on this facet */}
            <NumericalFacet facetId="c_price"
              transformOptions={transformPriceFacet}
            />
          </Facets>
        </div>
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

