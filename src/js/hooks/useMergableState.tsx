import * as React from "react";

export function useMergableState<T extends {}>(initialState: T) {
    const [state, _setState] = React.useState(initialState);
    const setState = (next: { [k in keyof T]?: T[keyof T] }) => {
        _setState((old) => ({
            ...old,
            ...next,
        }));
    };
    return { state, setState };
}

export default useMergableState;
