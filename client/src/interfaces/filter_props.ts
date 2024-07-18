import FilterOptions from "./filter_options";

export default interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}
