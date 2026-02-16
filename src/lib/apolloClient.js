import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import useAuthStore from "@/store/store";

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL Error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`Network Error: ${networkError}`);
  }
});

const httpLink = new HttpLink({
  uri: "https://hcc-adam-backend.vercel.app" || "http://localhost:8080/graphql",
  credentials: "include",
});

import  { setContext }  from "@apollo/client/link/context";

const authLink = setContext((_, { headers }) => {
  const user = useAuthStore.getState().user;
  // Get token from localStorage if on client side
  let token;
  // if (typeof window !== "undefined") {
  //   token = localStorage.getItem("token");
  // }
  console.log("Auth Link - User:", user);
  
  if (user && user.jwtToken) {
    token = user.user._id;
  }


  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
    
  };
});

const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            contacts: {
              keyArgs: ["filter", "sort"],
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    connectToDevTools: process.env.NODE_ENV === "development",
  });
};

let apolloClient = null;

export function getApolloClient() {
  const _apolloClient = apolloClient ?? createApolloClient();
  if (typeof window === "undefined") return _apolloClient;
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}

export default createApolloClient;