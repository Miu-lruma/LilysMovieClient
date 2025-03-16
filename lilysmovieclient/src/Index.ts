// Interface for the Option object
export interface Option
{
    value: number;
    label: string;
}

export interface SelectFieldProps
{
    guessFunction: ((option: ReactSelectOption) => void);
    optionListFetchURL: string;
}

// Type for the React Select option
export type ReactSelectOption = { label: string, value: number; };