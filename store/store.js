import { useContext, createContext, useReducer } from 'react'
import React from 'react';
import PropTypes from 'prop-types';
import * as actions from './actions'
import { reducer, initialState } from './reducer'

const GlobalStore = new createContext();

const useStore = () => {
  return useContext(GlobalStore)
}

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <GlobalStore.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStore.Provider>
  )
}

Provider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export { actions, useStore, Provider }
