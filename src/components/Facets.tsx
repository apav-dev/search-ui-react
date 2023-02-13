/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable react-perf/jsx-no-new-object-as-prop */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FacetsProvider } from './Filters';
import { FilterGroup, FilterGroupCssClasses } from './FilterGroup';
import { Fragment } from 'react';
import {
  DisplayableFacet,
  NumberRangeValue,
} from '@yext/search-headless-react';
import { FilterDivider } from './FilterDivider';
import { StandardFacetsCssClasses } from './StandardFacets';
import { NumericalFacetsCssClasses } from './NumericalFacets';

/**
 * Testing a new way of doing Facets with compound components. This is the name space for that
 *
 * @internal
 */
export namespace Facet {
  /**
   * Props for the {@link StandardFacets} component.
   *
   * @public
   */
  export interface Standard {
    /** {@inheritDoc FilterGroupProps.collapsible} */
    collapsible?: boolean;
    /** {@inheritDoc FilterGroupProps.defaultExpanded} */
    defaultExpanded?: boolean;
    /**
     * Whether or not to show the option counts for each filter.
     * Defaults to true.
     */
    showOptionCounts?: boolean;
    /** CSS classes for customizing the component styling. */
    customCssClasses?: StandardFacetsCssClasses;
    /**
     * Limit on the number of options to be displayed.
     * Defaults to 10.
     */
    showMoreLimit?: number;
    facetId: string;
  }

  export interface Numerical extends Standard {
    /**
     * Returns the filter's display name based on the range values which is used when the filter
     * is displayed by other components such as AppliedFilters.
     *
     * @remarks
     * By default, the displayName separates the range with a dash such as '10 - 20'.
     * If the range is unbounded, it will display as 'Up to 20' or 'Over 10'.
     */
    getFilterDisplayName?: (value: NumberRangeValue) => string;
    /**
     * An optional element which renders in front of the input text.
     */
    inputPrefix?: JSX.Element;
    /** CSS classes for customizing the component styling. */
    customCssClasses?: NumericalFacetsCssClasses;
  }

  export const StandardFacet = (
    props: Standard & { facet: DisplayableFacet }
  ) => {
    const {
      facet,
      collapsible,
      defaultExpanded,
      showOptionCounts = true,
      customCssClasses = {},
      showMoreLimit = 10,
      ...filterGroupProps
    } = props;

    return (
      <FilterGroup
        fieldId={facet.fieldId}
        filterOptions={facet.options.map((o) => {
          return showOptionCounts ? { ...o, resultsCount: o.count } : o;
        })}
        title={facet.displayName}
        customCssClasses={customCssClasses}
        showMoreLimit={showMoreLimit}
        searchable={facet.options.length > showMoreLimit}
        {...filterGroupProps}
      />
    );
  };
}

/**
 * The CSS class interface for {@link StandardFacets}.
 *
 * @public
 */
export interface FacetsCssClasses extends FilterGroupCssClasses {
  standardFacetsContainer?: string;
  divider?: string;
  children?: React.ReactNode;
}

/**
 * Props for the {@link StandardFacets} component.
 *
 * @public
 */
export interface FacetsProps {
  children: React.ReactElement<Facet.Standard | Facet.Numerical>[];
  /**
   * Whether or not a search is automatically run when a filter is selected.
   * Defaults to true.
   */
  searchOnChange?: boolean;
  /** CSS classes for customizing the component styling. */
  customCssClasses?: StandardFacetsCssClasses;
}

/**
 * Testing a new way of doing Facets with compound components
 *
 * @internal
 */
export function Facets(props: FacetsProps) {
  const {
    children: facetComponents,
    searchOnChange,
    customCssClasses = {},
  } = props;

  return (
    <FacetsProvider
      searchOnChange={searchOnChange}
      className={customCssClasses.standardFacetsContainer}
    >
      {(facets) =>
        facetComponents.map((fc, i) => {
          const props = fc.props;

          if (!facets.map((f) => f.fieldId).includes(props.facetId)) {
            console.warn(
              `Facet with fieldId ${props.facetId} does not exist in the search state.`
            );
            return <></>;
          }

          const facet = facets.find(
            (f) => f.fieldId === props.facetId
          ) as DisplayableFacet;

          if (props instanceof Facet.StandardFacet) {
            return <Facet.StandardFacet {...props} facet={facet} />;
          } else {
            return <></>;
          }
        })
      }
    </FacetsProvider>
  );
}

function isStringFacet(facet: DisplayableFacet): boolean {
  return facet.options.length > 0 && typeof facet.options[0].value === 'string';
}
