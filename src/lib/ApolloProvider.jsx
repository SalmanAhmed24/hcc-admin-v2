// lib/ApolloProvider.jsx
"use client";

import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { getApolloClient } from "./apolloClient";

const client = getApolloClient();

export default function Provider({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}