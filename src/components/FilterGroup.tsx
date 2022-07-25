import { useSearchUtilities } from '@yext/search-headless-react';
import { PropsWithChildren, useMemo, useState } from 'react';
import {
  CheckboxOption,
  CollapsibleLabel,
  CollapsibleSection,
  FilterOptionConfig,
  SearchInput,
  FilterGroupProvider,
  useFilterGroupContext,
  CheckboxCssClasses
} from './Filters';

/**
 * The CSS class interface for FilterGroup.
 *
 * @public
 */
export interface FilterGroupCssClasses {
  searchInput?: string,
  optionsContainer?: string,
  option?: string,
  optionInput?: string,
  optionLabel?: string
}

/**
 * Props for the FilterGroup component.
 *
 * @public
 */
export interface FilterGroupProps {
  /** The fieldId corresponding to the filter group. */
  fieldId: string,
  /** {@inheritDoc FilterOptionConfig} */
  filterOptions: FilterOptionConfig[],
  /** The displayed label for the filter group. */
  title: string,
  /** Whether or not the filter is collapsible. Defaults to true. */
  collapsible?: boolean,
  /**
   * If the filter group is collapsible, whether or not it should start out
   * expanded. Defaults to true.
   */
  defaultExpanded?: boolean,
  /** Whether or not to display a text input to search for filter options. */
  searchable?: boolean,
  /** CSS classes for customizing the component styling. */
  customCssClasses?: FilterGroupCssClasses,
  /** Limit on the number of options to be displayed. */
  showMoreLimit?: number
}

/**
 * Renders a group of selectable filters with support for searching and collapsing.
 */
export function FilterGroup({
  fieldId,
  filterOptions,
  title,
  collapsible = true,
  defaultExpanded = true,
  searchable,
  customCssClasses = {},
  showMoreLimit = filterOptions.length,
  children
}: PropsWithChildren<FilterGroupProps>) {
  const cssClasses = useMemo(() => {
    const { option, optionLabel, optionInput, ...remainingClasses } = customCssClasses;
    return {
      ...remainingClasses,
      ...option && { optionContainer: option },
      ...optionLabel && { label: optionLabel },
      ...optionInput && { input: optionInput }
    };
  }, [customCssClasses]);

  function renderTitle() {
    return collapsible
      ? <CollapsibleLabel label={title} />
      : (title &&
        <div className='text-neutral-dark text-sm font-medium text-left mb-4'>
          {title}
        </div>);
  }

  return (
    <FilterGroupProvider
      fieldId={fieldId}
      defaultExpanded={!collapsible || defaultExpanded}
    >
      {renderTitle()}
      <CollapsibleSection className={cssClasses.optionsContainer}>
        {searchable && <SearchInput className={cssClasses.searchInput} />}
        <CheckboxOptions
          filterOptions={filterOptions}
          showMoreLimit={showMoreLimit}
          cssClasses={cssClasses} />
        {children}
      </CollapsibleSection>
    </FilterGroupProvider>
  );
}

function CheckboxOptions({
  filterOptions,
  showMoreLimit,
  cssClasses
}: {
  filterOptions: FilterOptionConfig[],
  showMoreLimit: number,
  cssClasses: CheckboxCssClasses
}) {
  const searchUtilities = useSearchUtilities();
  const { searchValue } = useFilterGroupContext();

  const shouldRenderOption = (
    option: FilterOptionConfig
  ) => {
    option.displayName = option.displayName || option.value.toString();
    return searchUtilities.isCloseMatch(option.displayName, searchValue);
  };

  let displayedOptions = filterOptions.filter(shouldRenderOption).map(o => {
    return (
      <CheckboxOption
        {...o}
        key={o.displayName}
        customCssClasses={cssClasses}
      />
    );
  });

  const isLimited = displayedOptions.length > showMoreLimit;

  const [showAll, setShowAll] = useState<boolean>(!isLimited);
  displayedOptions = displayedOptions.slice(0, showAll ? displayedOptions.length : showMoreLimit);

  return (
    <>
      {displayedOptions}
      {isLimited &&
        /* eslint-disable-next-line react-perf/jsx-no-new-function-as-prop */
        <button className='text-primary py-1 text-sm' onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      }
    </>
  );
}