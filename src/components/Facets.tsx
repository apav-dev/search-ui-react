import { FacetsProvider, RangeInput } from './Filters';
import { FilterGroup, FilterGroupCssClasses } from './FilterGroup';
import {
  DisplayableFacet, LowerNumberRangeLimit, Matcher, NumberRangeValue, UpperNumberRangeLimit,
} from '@yext/search-headless-react';
import { StandardFacetsCssClasses } from './StandardFacets';
import { Fragment, isValidElement } from 'react';
import { FilterDivider } from './FilterDivider';
import { NumericalFacetsCssClasses } from './NumericalFacets';
import { Children } from 'react';
import { isNumericalFacet } from '../utils/filterutils';

/**
 * Standard Facet Props
 *
 * @public
 */
export interface StandardFacetProps {
  /** {@inheritDoc FilterGroupProps.collapsible} */
  collapsible?: boolean,
  /** {@inheritDoc FilterGroupProps.defaultExpanded} */
  defaultExpanded?: boolean,
  /**
   * Whether or not to show the option counts for each filter.
   * Defaults to true.
   */
  showOptionCounts?: boolean,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: StandardFacetsCssClasses,
  /**
   * Limit on the number of options to be displayed.
   * Defaults to 10.
   */
  showMoreLimit?: number,
  facetId: string,
  _facet?: DisplayableFacet,
  transformOptions?: (options: DisplayableFacet['options']) => DisplayableFacet['options']

}

/**
 * Props for the {@link NumericalFacets} component.
 *
 * @public
 */
export interface NumericalFacetProps extends Omit<StandardFacetProps, 'excludedFieldIds'> {
  /**
   * Returns the filter's display name based on the range values which is used when the filter
   * is displayed by other components such as AppliedFilters.
   *
   * @remarks
   * By default, the displayName separates the range with a dash such as '10 - 20'.
   * If the range is unbounded, it will display as 'Up to 20' or 'Over 10'.
   */
  getFilterDisplayName?: (value: NumberRangeValue) => string,
  /**
   * An optional element which renders in front of the input text.
   */
  inputPrefix?: JSX.Element,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: NumericalFacetsCssClasses
}

/**
 * Standard Facet
 *
 * @public
 */
export const StandardFacet = (props: StandardFacetProps) => {
  const {
    _facet: facet,
    // collapsible,
    // defaultExpanded,
    showOptionCounts = true,
    customCssClasses,
    showMoreLimit = 10,
    transformOptions,
    ...filterGroupProps
  } = props;

  if (!facet) {
    return <></>;
  }

  // eslint-disable-next-line react-perf/jsx-no-new-array-as-prop
  let tranformedOptions = facet.options.slice();

  if (transformOptions) {
    tranformedOptions = transformOptions(tranformedOptions);
  }

  return (
    <FilterGroup
      fieldId={facet.fieldId}
      filterOptions={tranformedOptions.map((o) => {
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

/**
 * Numerical Facet
 *
 * @public
 */
export const NumericalFacet = (props: NumericalFacetProps) => {
  const {
    facetId,
    _facet: facet,
    // collapsible,
    // defaultExpanded,
    getFilterDisplayName,
    inputPrefix,
    customCssClasses,
    transformOptions,
    ...filterGroupProps
  } = props;

  if (!facet) {
    return <></>;
  }

  let tranformedOptions = facet.options.slice();

  if (transformOptions) {
    tranformedOptions = tranformedOptions
      .map(item => {
        const value = item.value as NumberRangeValue;
        return {
          ...item,
          value: {
            start: { ...value.start },
            end: { ...value.end }
          }
        };
      }) as DisplayableFacet['options'];
  }

  if (transformOptions) {
    tranformedOptions = transformOptions(tranformedOptions) as {
      value: {
        start?: LowerNumberRangeLimit | undefined,
        end?: UpperNumberRangeLimit | undefined
      },
      displayName: string,
      count: number,
      selected: boolean,
      matcher: Matcher
    }[];
  }
  return (
    <Fragment key={facetId}>
      <FilterGroup
        fieldId={facetId}
        filterOptions={tranformedOptions}
        title={facet.displayName}
        customCssClasses={customCssClasses}
        {...filterGroupProps}
      >
        <RangeInput
          getFilterDisplayName={getFilterDisplayName}
          inputPrefix={inputPrefix}
          customCssClasses={customCssClasses}
        />
      </FilterGroup>
    </Fragment>
  );
};

/**
 * Facets CSS Classes
 *
 * @public
 */
export interface FacetsCssClasses extends FilterGroupCssClasses {
  standardFacetsContainer?: string,
  divider?: string,
  children?: React.ReactNode
}

/**
 * Facets Props
 *
 * @public
 */
export interface FacetsProps {
  // eslint-disable-next-line max-len
  children: React.ReactElement<StandardFacetProps | NumericalFacetProps> | React.ReactElement<StandardFacetProps | NumericalFacetProps>[],
  /**
   * Whether or not a search is automatically run when a filter is selected.
   * Defaults to true.
   */
  searchOnChange?: boolean,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: StandardFacetsCssClasses
}

/**
 * Facets
 *
 * @public
 */
export function Facets(props: FacetsProps) {
  const {
    children,
    searchOnChange,
    customCssClasses = {},
  } = props;

  return (
    <FacetsProvider
      searchOnChange={searchOnChange}
      className={customCssClasses.standardFacetsContainer}
    >
      {(facets) => {
        const arrayChildren = Children.toArray(children);
        const usedFacetIds: string[] = [];
        return Children.map(arrayChildren, (child, i) => {
          if (isValidElement(child) ) {
            const props = child.props as StandardFacetProps | NumericalFacetProps;

            if (!props.facetId) {
              console.error('FacetId is required for Facet component');
              return <></>;
            } else {
              if (usedFacetIds.includes(props.facetId)) {
                console.warn(`Facet with fieldId ${props.facetId} is already used`);
                return <></>;
              } else {
                usedFacetIds.push(props.facetId);
              }
            }

            if (!facets.map((f) => f.fieldId).includes(props.facetId)) {
              console.warn(
                `Facet with fieldId ${props.facetId} does not exist in the search state.`
              );
              return <></>;
            }

            const facet = facets.find(
              (f) => f.fieldId === props.facetId
            ) as DisplayableFacet;

            if (isStringFacet(facet)) {
              return (
                <Fragment key={facet.fieldId}>
                  <StandardFacet {...props} _facet={facet} />
                  {(i < arrayChildren.length - 1) && <FilterDivider className={customCssClasses.divider}/>}
                </Fragment>);
            } else if (isNumericalFacet(facet)) {
              return (
                <Fragment key={facet.fieldId}>
                  <NumericalFacet {...props} _facet={facet} />
                  {(i < arrayChildren.length - 1) && <FilterDivider className={customCssClasses.divider}/>}
                </Fragment>);
            } else {
              console.warn('Invalid Facet Type');
              return <></>;
            }
          } else {
            console.warn('Child passed to Facets');
            return <></>;
          }
        });
      }}
    </FacetsProvider>
  );
}

function isStringFacet(facet: DisplayableFacet): boolean {
  return facet.options.length > 0 && typeof facet.options[0].value === 'string';
}

// const test = () => {
//   return (
//     <Facets>
//       <StandardFacet facetId="a"
//       // use the transformOptions prop to transform the options to place them in alphabetical order
//         // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
//         transformOptions={(options) => options.sort((a, b) => {
//           const aVal = a.value as string;
//           const bVal = b.value as string;
//           return aVal.localeCompare(bVal);
//         })}
//       />
//       <NumericalFacet facetId="b" />
//     </Facets>);
// };
