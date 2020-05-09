import * as React from "react";

function useFormInputs<T extends { [key: string]: { value: string; error: string } }>(
    initialState: T
) {
    const [formInputs, setFormInputs] = React.useState(initialState);
    const setInputValue = (name: keyof T, value: string) => {
        setFormInputs((old) => ({
            ...old,
            [name]: { ...old[name], value },
        }));
    };
    const setInputError = (name: keyof T, error: string) => {
        setFormInputs((old) => ({
            ...old,
            [name]: { ...old[name], error },
        }));
    };
    return { formInputs, setInputValue, setInputError };
}

export default useFormInputs;
