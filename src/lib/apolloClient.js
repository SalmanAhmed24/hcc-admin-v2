// lib/apolloClient.js
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import useAuthStore from "@/store/store";

// Error handling link
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

// Create HTTP link
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql",
  credentials: "include",
});

// Auth middleware link (correct approach)
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

// Create Apollo Client
const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]), // Correct order: error -> auth -> http
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

// Singleton pattern for Next.js
let apolloClient = null;

export function getApolloClient() {
  const _apolloClient = apolloClient ?? createApolloClient();
  if (typeof window === "undefined") return _apolloClient;
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}

export default createApolloClient;