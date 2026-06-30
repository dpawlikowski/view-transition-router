'use client';
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { DEFAULT_OUTLET_NAME } from '../constants';
const ReactViewTransition = React.ViewTransition;
export const TransitionView = ({ name = DEFAULT_OUTLET_NAME, children }) => {
    if (!ReactViewTransition)
        return _jsx(_Fragment, { children: children });
    return _jsx(ReactViewTransition, { name: name, children: children });
};
